import React from 'react';
import { View, Alert } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

// Validation schema
const profileSchema = z.object({
  name: z.string().min(2, '名前は2文字以上で入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  bio: z.string().max(200, '自己紹介は200文字以内で入力してください').optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: 'デモユーザー',
      email: 'demo@example.com',
      bio: '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('Form submitted with data:', data);
      Alert.alert('成功', 'プロフィールを更新しました！');
    } catch (error) {
      console.error('Form submission error:', error);
      Alert.alert('エラー', 'プロフィールの更新に失敗しました。もう一度お試しください。');
    }
  };

  return (
    <View className="space-y-4">
      <Controller
        control={control}
        name="name"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="名前"
            placeholder="お名前を入力してください"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.name?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="メールアドレス"
            placeholder="メールアドレスを入力してください"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="bio"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="自己紹介（任意）"
            placeholder="あなたについて教えてください"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            error={errors.bio?.message}
            className="min-h-[100px]"
          />
        )}
      />

      <View className="mt-6">
        <Button
          title={isSubmitting ? '保存中...' : '変更を保存'}
          onPress={handleSubmit(onSubmit)}
          isLoading={isSubmitting}
          disabled={isSubmitting}
        />
      </View>
    </View>
  );
}