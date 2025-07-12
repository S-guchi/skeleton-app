import "@/global.css";
import { NAV_THEME } from "@/lib/constants";
import { SessionProvider, useSession } from "@/lib/contexts/SessionContext";
import { UserProvider, useUser } from "@/lib/contexts/UserContext";
import { LocalizationProvider } from "@/lib/contexts/LocalizationContext";
import { NotificationProvider } from "@/lib/contexts/NotificationContext";
import { useColorScheme } from "@/lib/useColorScheme";
import { QueryProvider } from "@/providers/QueryProvider";
import { DarkTheme, DefaultTheme, Theme, ThemeProvider } from "@react-navigation/native";
import { Stack, usePathname, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as React from "react";
import { useEffect } from "react";
import { Platform } from "react-native";

const LIGHT_THEME: Theme = {
  ...DefaultTheme,
  colors: NAV_THEME.light,
};
const DARK_THEME: Theme = {
  ...DarkTheme,
  colors: NAV_THEME.dark,
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from "expo-router";

// 認証状態を監視するコンポーネント
function InitialLayout() {
  const { session, isAuthLoading } = useSession();
  const { user, isUserLoading } = useUser();
  const isLoading = isAuthLoading || isUserLoading;
  const segments = useSegments();
  const router = useRouter();
  const pathname = usePathname();
  const { colorScheme } = useColorScheme();

  useEffect(() => {
    if (isLoading) {
      return;
    }

    // パス判定を明確に分類
    const isAuthFlow = pathname === '/sign-in' || 
                      pathname === '/sign-up' || 
                      pathname === '/forgot-password' || 
                      pathname === '/welcome';
    
    const isMainApp = pathname.startsWith('/(app)/');

    if (__DEV__) console.log('🔄 Route check:', { 
      pathname, 
      session: !!session, 
      user: !!user, 
      hasOnboarding: user?.hasCompletedOnboarding 
    });

    // Early return パターンでシンプルに
    
    // 1. セッションなし → welcome画面へ（認証フロー以外）
    if (!session && !isAuthFlow) {
      router.replace('/welcome');
      return;
    }

    // 2. セッションありだがユーザー情報なし → 何もしない（読み込み中）
    if (session && !user) {
      return;
    }

    // 3. セッション・ユーザーあり
    if (session && user) {
      // オンボーディング未完了 → welcome画面へ（メインアプリ・認証フロー以外）
      if (!user.hasCompletedOnboarding && !isMainApp && !isAuthFlow) {
        router.replace('/welcome');
        return;
      }

      // オンボーディング完了済み → メインアプリへ（認証フローにいる場合）
      if (user.hasCompletedOnboarding && isAuthFlow) {
        router.replace('/(app)/(tabs)');
        return;
      }
    }
  }, [session, user, segments, pathname, isLoading, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colorScheme === "dark" ? "#09090B" : "#FFFFFF",
        },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
      <Stack.Screen name="(app)" options={{ headerShown: false }} />
    </Stack>
  );
}

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
  const hasMounted = React.useRef(false);
  const { isDarkColorScheme } = useColorScheme();
  const [isColorSchemeLoaded, setIsColorSchemeLoaded] = React.useState(false);

  useIsomorphicLayoutEffect(() => {
    if (hasMounted.current) {
      return;
    }
    if (Platform.OS === "web") {
      // Adds the background color to the html element to prevent white background on overscroll.
      document.documentElement.classList.add("bg-background");
    }
    setIsColorSchemeLoaded(true);
    hasMounted.current = true;
  }, []);

  if (!isColorSchemeLoaded) {
    return null;
  }

  return (
    <LocalizationProvider>
      <NotificationProvider>
        <SessionProvider>
          <UserProvider>
              <QueryProvider>
              <ThemeProvider value={isDarkColorScheme ? DARK_THEME : LIGHT_THEME}>
                <StatusBar style={isDarkColorScheme ? "light" : "dark"} />
                <InitialLayout />
              </ThemeProvider>
            </QueryProvider>
          </UserProvider>
        </SessionProvider>
      </NotificationProvider>
    </LocalizationProvider>
  );
}

const useIsomorphicLayoutEffect = Platform.OS === "web" && typeof window === "undefined" ? React.useEffect : React.useLayoutEffect;
