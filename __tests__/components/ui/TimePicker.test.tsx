import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { TimePicker } from '@/components/ui/TimePicker';

// モック
jest.mock('@react-native-community/datetimepicker', () => 'DateTimePicker');
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons'
}));

describe('TimePicker', () => {
  const mockOnTimeChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('レンダリング', () => {
    it('デフォルト時刻で正しく表示される', () => {
      const { getByTestId } = render(
        <TimePicker
          testID="time-picker"
          value={{ hour: 20, minute: 0 }}
          onTimeChange={mockOnTimeChange}
        />
      );

      expect(getByTestId('time-picker')).toBeTruthy();
      expect(getByTestId('time-display')).toHaveTextContent('20:00');
    });

    it('12時間表示形式で正しく表示される', () => {
      const { getByTestId } = render(
        <TimePicker
          testID="time-picker"
          value={{ hour: 14, minute: 30 }}
          onTimeChange={mockOnTimeChange}
          format="12"
        />
      );

      expect(getByTestId('time-display')).toHaveTextContent('2:30 PM');
    });

    it('24時間表示形式で正しく表示される', () => {
      const { getByTestId } = render(
        <TimePicker
          testID="time-picker"
          value={{ hour: 14, minute: 30 }}
          onTimeChange={mockOnTimeChange}
          format="24"
        />
      );

      expect(getByTestId('time-display')).toHaveTextContent('14:30');
    });
  });

  describe('インタラクション', () => {
    it('時間表示をタップするとピッカーが開く', () => {
      const { getByTestId } = render(
        <TimePicker
          testID="time-picker"
          value={{ hour: 20, minute: 0 }}
          onTimeChange={mockOnTimeChange}
        />
      );

      fireEvent.press(getByTestId('time-display'));
      expect(getByTestId('time-picker-modal')).toBeTruthy();
    });

    it('時間を変更するとコールバックが呼ばれる', () => {
      const { getByTestId } = render(
        <TimePicker
          testID="time-picker"
          value={{ hour: 20, minute: 0 }}
          onTimeChange={mockOnTimeChange}
        />
      );

      fireEvent.press(getByTestId('time-display'));
      
      // 確定ボタンを押すとvalue（初期値）がコールバックに渡される
      fireEvent.press(getByTestId('confirm-button'));

      expect(mockOnTimeChange).toHaveBeenCalledWith({ hour: 20, minute: 0 });
    });

    it('キャンセルボタンを押すとピッカーが閉じる', () => {
      const { getByTestId, queryByTestId } = render(
        <TimePicker
          testID="time-picker"
          value={{ hour: 20, minute: 0 }}
          onTimeChange={mockOnTimeChange}
        />
      );

      fireEvent.press(getByTestId('time-display'));
      expect(getByTestId('time-picker-modal')).toBeTruthy();

      fireEvent.press(getByTestId('cancel-button'));
      expect(queryByTestId('time-picker-modal')).toBeNull();
    });
  });

  describe('プロパティ', () => {
    it('disabled状態で正しく動作する', () => {
      const { getByTestId } = render(
        <TimePicker
          testID="time-picker"
          value={{ hour: 20, minute: 0 }}
          onTimeChange={mockOnTimeChange}
          disabled={true}
        />
      );

      fireEvent.press(getByTestId('time-display'));
      expect(mockOnTimeChange).not.toHaveBeenCalled();
    });

    it('カスタムラベルが表示される', () => {
      const { getByText } = render(
        <TimePicker
          testID="time-picker"
          value={{ hour: 20, minute: 0 }}
          onTimeChange={mockOnTimeChange}
          label="リマインダー時刻"
        />
      );

      expect(getByText('リマインダー時刻')).toBeTruthy();
    });
  });

  describe('時刻フォーマット', () => {
    it('0時台が正しく表示される', () => {
      const { getByTestId } = render(
        <TimePicker
          testID="time-picker"
          value={{ hour: 0, minute: 30 }}
          onTimeChange={mockOnTimeChange}
          format="24"
        />
      );

      expect(getByTestId('time-display')).toHaveTextContent('00:30');
    });

    it('12時間表示でAM/PM表示が正しく動作する', () => {
      const { getByTestId, rerender } = render(
        <TimePicker
          testID="time-picker"
          value={{ hour: 0, minute: 30 }}
          onTimeChange={mockOnTimeChange}
          format="12"
        />
      );

      expect(getByTestId('time-display')).toHaveTextContent('12:30 AM');

      rerender(
        <TimePicker
          testID="time-picker"
          value={{ hour: 12, minute: 30 }}
          onTimeChange={mockOnTimeChange}
          format="12"
        />
      );

      expect(getByTestId('time-display')).toHaveTextContent('12:30 PM');
    });
  });
});