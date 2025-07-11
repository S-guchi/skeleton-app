import { avatarService } from '../../../lib/services/avatarService';
import { supabase } from '../../../lib/supabase';
import * as ImagePicker from 'expo-image-picker';

jest.mock('../../../lib/supabase', () => ({
  supabase: {
    storage: {
      from: jest.fn(),
    },
    from: jest.fn(),
  },
}));

jest.mock('expo-image-picker');

// グローバルfetchのモック
global.fetch = jest.fn();

describe('avatarService', () => {
  const mockUserId = 'test-user-id';
  const mockImageUri = 'file:///test/image.jpg';
  const mockPublicUrl = 'https://test.com/image.jpg';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestPermissions', () => {
    it('ライブラリの権限を正常にリクエストできる', async () => {
      const mockRequestPermissions = jest.mocked(ImagePicker.requestMediaLibraryPermissionsAsync);
      mockRequestPermissions.mockResolvedValue({
        status: ImagePicker.PermissionStatus.GRANTED,
        granted: true,
        canAskAgain: true,
        expires: 'never',
      });

      const result = await avatarService.requestPermissions();

      expect(result.granted).toBe(true);
      expect(mockRequestPermissions).toHaveBeenCalled();
    });

    it('権限が拒否された場合はfalseを返す', async () => {
      const mockRequestPermissions = jest.mocked(ImagePicker.requestMediaLibraryPermissionsAsync);
      mockRequestPermissions.mockResolvedValue({
        status: ImagePicker.PermissionStatus.DENIED,
        granted: false,
        canAskAgain: true,
        expires: 'never',
      });

      const result = await avatarService.requestPermissions();

      expect(result.granted).toBe(false);
    });
  });

  describe('pickImage', () => {
    it('画像を正常に選択できる', async () => {
      const mockLaunchImageLibrary = jest.mocked(ImagePicker.launchImageLibraryAsync);
      mockLaunchImageLibrary.mockResolvedValue({
        canceled: false,
        assets: [
          {
            uri: mockImageUri,
            width: 512,
            height: 512,
            type: 'image',
          },
        ],
      });

      const result = await avatarService.pickImage();

      expect(result?.uri).toBe(mockImageUri);
      expect(mockLaunchImageLibrary).toHaveBeenCalledWith({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        allowsMultipleSelection: false,
      });
    });

    it('キャンセルされた場合はnullを返す', async () => {
      const mockLaunchImageLibrary = jest.mocked(ImagePicker.launchImageLibraryAsync);
      mockLaunchImageLibrary.mockResolvedValue({
        canceled: true,
        assets: [],
      });

      const result = await avatarService.pickImage();

      expect(result).toBeNull();
    });
  });

  describe('uploadAvatar', () => {
    it('アバター画像を正常にアップロードできる', async () => {
      // fetchのモック
      const mockFetch = jest.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
      } as any);

      const mockBucket = {
        upload: jest.fn().mockResolvedValue({
          data: { path: 'avatars/test-user-id_123456789.jpg' },
          error: null,
        }),
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: mockPublicUrl },
        }),
      };

      const mockFrom = jest.mocked(supabase.storage.from);
      mockFrom.mockReturnValue(mockBucket as any);

      const result = await avatarService.uploadAvatar(mockUserId, mockImageUri);

      expect(result.publicUrl).toBe(mockPublicUrl);
      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockBucket.upload).toHaveBeenCalledWith(
        expect.stringMatching(/^avatars\/test-user-id_\d+\.jpg$/),
        expect.any(Uint8Array),
        {
          cacheControl: '3600',
          upsert: true,
          contentType: 'image/jpeg',
        }
      );
    });

    it('アップロードエラーの場合は例外を投げる', async () => {
      // fetchのモック
      const mockFetch = jest.mocked(global.fetch);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(new ArrayBuffer(8)),
      } as any);

      const mockBucket = {
        upload: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Upload failed' },
        }),
      };

      const mockFrom = jest.mocked(supabase.storage.from);
      mockFrom.mockReturnValue(mockBucket as any);

      await expect(avatarService.uploadAvatar(mockUserId, mockImageUri)).rejects.toThrow('Storage upload failed: Upload failed');
    });
  });

  describe('updateUserAvatar', () => {
    it('ユーザーのアバターURLを正常に更新できる', async () => {
      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { avatar_url: mockPublicUrl },
          error: null,
        }),
      };

      const mockFrom = jest.mocked(supabase.from);
      mockFrom.mockReturnValue(mockChain as any);

      const result = await avatarService.updateUserAvatar(mockUserId, mockPublicUrl);

      expect(result.avatar_url).toBe(mockPublicUrl);
      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockChain.update).toHaveBeenCalledWith({ avatar_url: mockPublicUrl });
      expect(mockChain.eq).toHaveBeenCalledWith('id', mockUserId);
    });

    it('更新エラーの場合は例外を投げる', async () => {
      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Update failed' },
        }),
      };

      const mockFrom = jest.mocked(supabase.from);
      mockFrom.mockReturnValue(mockChain as any);

      await expect(avatarService.updateUserAvatar(mockUserId, mockPublicUrl)).rejects.toThrow('Update failed');
    });
  });

  describe('deleteOldAvatar', () => {
    it('古いアバター画像を正常に削除できる', async () => {
      const oldUrl = 'https://test.supabase.co/storage/v1/object/public/users/avatars/old-image.jpg';
      const mockBucket = {
        remove: jest.fn().mockResolvedValue({
          data: null,
          error: null,
        }),
      };

      const mockFrom = jest.mocked(supabase.storage.from);
      mockFrom.mockReturnValue(mockBucket as any);

      await avatarService.deleteOldAvatar(oldUrl);

      expect(mockFrom).toHaveBeenCalledWith('users');
      expect(mockBucket.remove).toHaveBeenCalledWith(['avatars/old-image.jpg']);
    });

    it('無効なURLの場合は何もしない', async () => {
      const oldUrl = 'https://example.com/invalid-url.jpg';
      const mockFrom = jest.mocked(supabase.storage.from);

      await avatarService.deleteOldAvatar(oldUrl);

      expect(mockFrom).not.toHaveBeenCalled();
    });
  });
});