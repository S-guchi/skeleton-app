-- Storage用のRLSポリシーを設定

-- ユーザーが自分のファイルをアップロードできるポリシー
CREATE POLICY "Users can upload their own avatars"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'users' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = (regexp_split_to_array((storage.filename(name)), '_'))[1]
);

-- ユーザーが自分のファイルを更新できるポリシー
CREATE POLICY "Users can update their own avatars"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'users' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = (regexp_split_to_array((storage.filename(name)), '_'))[1]
);

-- ユーザーが自分のファイルを削除できるポリシー  
CREATE POLICY "Users can delete their own avatars"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'users' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = (regexp_split_to_array((storage.filename(name)), '_'))[1]
);

-- 認証されたユーザーが自分のファイルを閲覧できるポリシー
CREATE POLICY "Users can view their own avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'users' 
  AND (storage.foldername(name))[1] = 'avatars'
  AND auth.uid()::text = (regexp_split_to_array((storage.filename(name)), '_'))[1]
);

-- 認証されたユーザーが他のユーザーのアバターを閲覧できるポリシー（メンバー表示用）
CREATE POLICY "Authenticated users can view avatars"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'users' 
  AND (storage.foldername(name))[1] = 'avatars'
);

-- すべてのユーザーがアバター画像を閲覧できるポリシー（publicアクセス用）
CREATE POLICY "Anyone can view avatar images"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'users' 
  AND (storage.foldername(name))[1] = 'avatars'
);