import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import AvatarPicker from '../../../components/ui/AvatarPicker';
import { avatarService } from '../../../lib/services/avatarService';

// expo-image をモック
jest.mock('expo-image', () => {
  const { Image } = require('react-native');
  return {
    Image: Image,
  };
});

// Alert をモック
jest.spyOn(Alert, 'alert');

// avatarService をモック
jest.mock('../../../lib/services/avatarService', () => ({
  avatarService: {
    updateUserAvatarFlow: jest.fn(),
  },
}));

describe('AvatarPicker', () => {
  const mockUserId = 'test-user-id';
  const mockCurrentAvatarUrl = 'https://example.com/current-avatar.jpg';
  const mockNewAvatarUrl = 'https://example.com/new-avatar.jpg';
  const mockOnUpdate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('現在のアバター画像を表示する', () => {
    const { getByTestId } = render(
      <AvatarPicker
        userId={mockUserId}
        currentAvatarUrl={mockCurrentAvatarUrl}
        onUpdate={mockOnUpdate}
      />
    );

    const avatar = getByTestId('avatar-display');
    expect(avatar.props.source).toEqual({ uri: mockCurrentAvatarUrl });
  });

  it('アバター画像がない場合はデフォルトアイコンを表示する', () => {
    const { getByTestId } = render(
      <AvatarPicker
        userId={mockUserId}
        currentAvatarUrl={undefined}
        onUpdate={mockOnUpdate}
      />
    );

    const defaultIcon = getByTestId('default-avatar-icon');
    expect(defaultIcon).toBeTruthy();
  });

  it('ボタンタップでアバター更新フローが実行される', async () => {
    const mockUpdateUserAvatarFlow = jest.mocked(avatarService.updateUserAvatarFlow);
    mockUpdateUserAvatarFlow.mockResolvedValue(mockNewAvatarUrl);

    const { getByTestId } = render(
      <AvatarPicker
        userId={mockUserId}
        currentAvatarUrl={mockCurrentAvatarUrl}
        onUpdate={mockOnUpdate}
      />
    );

    const button = getByTestId('avatar-picker-button');
    fireEvent.press(button);

    await waitFor(() => {
      expect(mockUpdateUserAvatarFlow).toHaveBeenCalledWith(mockUserId, mockCurrentAvatarUrl);
      expect(mockOnUpdate).toHaveBeenCalledWith(mockNewAvatarUrl);
    });
  });

  it('アップロード中は読み込み状態を表示する', async () => {
    const mockUpdateUserAvatarFlow = jest.mocked(avatarService.updateUserAvatarFlow);
    mockUpdateUserAvatarFlow.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    const { getByTestId } = render(
      <AvatarPicker
        userId={mockUserId}
        currentAvatarUrl={mockCurrentAvatarUrl}
        onUpdate={mockOnUpdate}
      />
    );

    const button = getByTestId('avatar-picker-button');
    fireEvent.press(button);

    const loadingIndicator = getByTestId('loading-indicator');
    expect(loadingIndicator).toBeTruthy();
  });

  it('エラー時にアラートを表示する', async () => {
    const mockUpdateUserAvatarFlow = jest.mocked(avatarService.updateUserAvatarFlow);
    const errorMessage = 'Upload failed';
    mockUpdateUserAvatarFlow.mockRejectedValue(new Error(errorMessage));

    const { getByTestId } = render(
      <AvatarPicker
        userId={mockUserId}
        currentAvatarUrl={mockCurrentAvatarUrl}
        onUpdate={mockOnUpdate}
      />
    );

    const button = getByTestId('avatar-picker-button');
    fireEvent.press(button);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'エラー',
        `アイコンの更新に失敗しました。もう一度お試しください。\n\nエラー詳細: ${errorMessage}`,
        [{ text: 'OK' }]
      );
    });

    expect(mockOnUpdate).not.toHaveBeenCalled();
  });

  it('画像選択がキャンセルされた場合は何もしない', async () => {
    const mockUpdateUserAvatarFlow = jest.mocked(avatarService.updateUserAvatarFlow);
    mockUpdateUserAvatarFlow.mockRejectedValue(new Error('No image selected'));

    const { getByTestId } = render(
      <AvatarPicker
        userId={mockUserId}
        currentAvatarUrl={mockCurrentAvatarUrl}
        onUpdate={mockOnUpdate}
      />
    );

    const button = getByTestId('avatar-picker-button');
    fireEvent.press(button);

    await waitFor(() => {
      expect(Alert.alert).not.toHaveBeenCalled();
      expect(mockOnUpdate).not.toHaveBeenCalled();
    });
  });
});