import { t } from '@/lib/i18n';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

/**
 * アプリ全体のエラーをキャッチするErrorBoundaryコンポーネント
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // エラーが発生した場合の状態更新
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // エラーログの記録
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // 本番環境では外部ログサービスに送信
    if (process.env.NODE_ENV === 'production') {
      // 外部ログサービスへの送信
      this.logErrorToService(error, errorInfo);
    }
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // 実際のログサービス連携はここに実装
    console.log('Sending error to logging service:', { error, errorInfo });
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // カスタムフォールバックUIが指定されている場合
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // デフォルトのエラーUI
      return (
        <View className="flex-1 items-center justify-center bg-gray-50 dark:bg-gray-900 px-6">
          <View className="items-center">
            <View className="flex-row items-center mb-4">
              <Text className="text-6xl">⚠️</Text>
            </View>
            <Text className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
              {t('errors.errorOccurred')}
            </Text>
            <Text className="text-base text-gray-600 dark:text-gray-400 mb-6 text-center">
              {t('errors.errorDescription')}
            </Text>

            {/* エラー詳細（開発時のみ） */}
            {__DEV__ && this.state.error && (
              <View className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg mb-6 w-full">
                <Text className="text-sm font-mono text-red-800 dark:text-red-300">
                  {this.state.error.message}
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={this.handleRetry}
              className="bg-blue-500 dark:bg-blue-600 px-6 py-3 rounded-lg"
            >
              <Text className="text-white font-semibold text-center">
                {t('common.retry')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

/**
 * 関数コンポーネント版のErrorBoundaryラッパー
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}
