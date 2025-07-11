import { getAuthErrorMessage } from '@/lib/utils/authErrorMessages';

describe('getAuthErrorMessage', () => {
  test('既存メールアドレスエラーを日本語で返す', () => {
    const errorWithUserExists = new Error('User already registered');
    const errorWithEmailExists = new Error('Email already registered');
    
    expect(getAuthErrorMessage(errorWithUserExists)).toBe('このメールアドレスは既に登録されています。');
    expect(getAuthErrorMessage(errorWithEmailExists)).toBe('このメールアドレスは既に登録されています。');
  });

  test('Supabaseの重複エラーコードを日本語で返す', () => {
    const errorWithUserExistsCode = new Error('user_already_exists');
    
    expect(getAuthErrorMessage(errorWithUserExistsCode)).toBe('このメールアドレスは既に登録されています。');
  });

  test('パスワードエラーを日本語で返す', () => {
    const weakPasswordError = new Error('weak password');
    const passwordLengthError = new Error('password should be at least 6 characters');
    
    expect(getAuthErrorMessage(weakPasswordError)).toBe('パスワードが弱すぎます。より複雑なパスワードを設定してください。');
    expect(getAuthErrorMessage(passwordLengthError)).toBe('パスワードは6文字以上で入力してください。');
  });

  test('メールアドレス形式エラーを日本語で返す', () => {
    const invalidEmailError = new Error('invalid email');
    const invalidEmailCodeError = new Error('invalid_email');
    
    expect(getAuthErrorMessage(invalidEmailError)).toBe('有効なメールアドレスを入力してください。');
    expect(getAuthErrorMessage(invalidEmailCodeError)).toBe('有効なメールアドレスを入力してください。');
  });

  test('認証エラーを日本語で返す', () => {
    const invalidCredentialsError = new Error('invalid login credentials');
    const invalidCredentialsCodeError = new Error('invalid_credentials');
    
    expect(getAuthErrorMessage(invalidCredentialsError)).toBe('メールアドレスまたはパスワードが間違っています。');
    expect(getAuthErrorMessage(invalidCredentialsCodeError)).toBe('メールアドレスまたはパスワードが間違っています。');
  });

  test('ネットワークエラーを日本語で返す', () => {
    const networkError = new Error('network error');
    const fetchError = new Error('fetch failed');
    
    expect(getAuthErrorMessage(networkError)).toBe('ネットワークエラーが発生しました。接続を確認してください。');
    expect(getAuthErrorMessage(fetchError)).toBe('ネットワークエラーが発生しました。接続を確認してください。');
  });

  test('未確認メールエラーを日本語で返す', () => {
    const emailNotConfirmedError = new Error('email not confirmed');
    const emailNotConfirmedCodeError = new Error('email_not_confirmed');
    
    expect(getAuthErrorMessage(emailNotConfirmedError)).toBe('メールアドレスが確認されていません。受信ボックスをご確認ください。');
    expect(getAuthErrorMessage(emailNotConfirmedCodeError)).toBe('メールアドレスが確認されていません。受信ボックスをご確認ください。');
  });

  test('不明なエラーの場合はデフォルトメッセージを返す', () => {
    const unknownError = new Error('Some unknown error');
    
    expect(getAuthErrorMessage(unknownError)).toBe('Some unknown error');
  });

  test('null/undefinedエラーの場合はデフォルトメッセージを返す', () => {
    expect(getAuthErrorMessage(null)).toBe('不明なエラーが発生しました');
    expect(getAuthErrorMessage(undefined)).toBe('不明なエラーが発生しました');
  });

  test('非オブジェクトエラーの場合はデフォルトメッセージを返す', () => {
    expect(getAuthErrorMessage('string error')).toBe('不明なエラーが発生しました');
    expect(getAuthErrorMessage(123)).toBe('不明なエラーが発生しました');
  });
});