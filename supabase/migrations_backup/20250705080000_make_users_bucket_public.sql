-- usersバケットをpublicに変更
UPDATE storage.buckets 
SET public = true 
WHERE id = 'users';