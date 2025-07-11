-- アバター画像のpublicアクセスを許可するポリシーを追加

-- すべてのユーザーがアバター画像を閲覧できるポリシー（publicアクセス用）
CREATE POLICY "Anyone can view avatar images"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'users' 
  AND (storage.foldername(name))[1] = 'avatars'
);