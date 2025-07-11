import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../supabase';

export interface AvatarPickResult {
  uri: string;
  width: number;
  height: number;
  type: string;
}

export interface AvatarUploadResult {
  publicUrl: string;
  path: string;
}

export interface UserAvatarUpdateResult {
  avatar_url: string;
}

class AvatarService {
  /**
   * メディアライブラリへのアクセス権限をリクエストする
   */
  async requestPermissions(): Promise<ImagePicker.MediaLibraryPermissionResponse> {
    return await ImagePicker.requestMediaLibraryPermissionsAsync();
  }

  /**
   * 画像を選択する
   */
  async pickImage(): Promise<AvatarPickResult | null> {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      allowsMultipleSelection: false,
    });

    if (result.canceled || !result.assets?.[0]) {
      return null;
    }

    const asset = result.assets[0];
    return {
      uri: asset.uri,
      width: asset.width || 512,
      height: asset.height || 512,
      type: asset.type || 'image',
    };
  }

  /**
   * 画像をSupabase Storageにアップロードする
   */
  async uploadAvatar(userId: string, imageUri: string): Promise<AvatarUploadResult> {
    // ファイル名の重複対策として、ユーザーIDとタイムスタンプを使用
    const timestamp = Date.now();
    const filename = `avatars/${userId}_${timestamp}.jpg`;

    try {
      // React Nativeでのファイル読み込みとアップロード
      const response = await fetch(imageUri);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      const { data, error } = await supabase.storage
        .from('users')
        .upload(filename, fileData, {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/jpeg',
        });

      if (error) {
        throw new Error(`Storage upload failed: ${error.message}`);
      }
      
      if (!data || !data.path) {
        throw new Error('Upload succeeded but no file path returned');
      }

      // Publicバケットの場合はpublicURLを使用
      const { data: { publicUrl } } = supabase.storage
        .from('users')
        .getPublicUrl(data.path);
      
      return {
        publicUrl,
        path: data.path,
      };
    } catch (fetchError) {
      const errorMessage = fetchError instanceof Error ? fetchError.message : String(fetchError);
      throw new Error(`Failed to process image: ${errorMessage}`);
    }
  }

  /**
   * ユーザーのアバターURLをデータベースに更新する
   */
  async updateUserAvatar(userId: string, avatarUrl: string): Promise<UserAvatarUpdateResult> {
    
    const { data, error } = await supabase
      .from('users')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId)
      .select('avatar_url')
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data;
  }

  /**
   * 古いアバター画像をStorageから削除する
   */
  async deleteOldAvatar(oldAvatarUrl: string): Promise<void> {
    if (!oldAvatarUrl) return;

    // Supabase StorageのURLからファイルパスを抽出
    const urlPattern = /\/storage\/v1\/object\/public\/users\/(.+)$/;
    const match = oldAvatarUrl.match(urlPattern);
    
    if (!match) {
      // 自社のStorageでない場合は何もしない
      return;
    }

    const filePath = match[1];
    const { error } = await supabase.storage
      .from('users')
      .remove([filePath]);

    if (error) {
      // 削除エラーは警告として扱い、処理を継続
      console.warn('Failed to delete old avatar:', error.message);
    }
  }

  /**
   * アバター更新の全体フローを実行する
   */
  async updateUserAvatarFlow(userId: string, oldAvatarUrl?: string): Promise<string> {
    try {
      // 1. 権限確認
      const permission = await this.requestPermissions();
      
      if (!permission.granted) {
        throw new Error('Media library permission is required');
      }

      // 2. 画像選択
      const image = await this.pickImage();
      
      if (!image) {
        throw new Error('No image selected');
      }

      // 3. 画像アップロード
      const uploadResult = await this.uploadAvatar(userId, image.uri);

      // 4. データベース更新
      await this.updateUserAvatar(userId, uploadResult.publicUrl);

      // 5. 古い画像削除（非同期で実行、エラーでも処理継続）
      if (oldAvatarUrl) {
        this.deleteOldAvatar(oldAvatarUrl).catch((error) => {
          console.warn('Failed to delete old avatar:', error);
        });
      }

      return uploadResult.publicUrl;
    } catch (error) {
      console.error('Avatar update failed:', error);
      throw error;
    }
  }
}

export const avatarService = new AvatarService();