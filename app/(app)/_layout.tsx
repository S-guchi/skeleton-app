import { Redirect, Stack } from 'expo-router';
import { useSession } from '@/lib/contexts/SessionContext';
import { useUser } from '@/lib/contexts/UserContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function AppLayout() {
  const { session, isAuthLoading } = useSession();
  const { user, isUserLoading } = useUser();
  const isLoading = isAuthLoading || isUserLoading;

  // You can keep the splash screen open, or render a loading screen like we do here.
  if (isLoading) {
    return <LoadingSpinner text="読み込み中..." className="flex-1" />;
  }

  // Only require authentication within the (app) group's layout as users
  // need to be able to access the (auth) group and sign in again.
  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  // Check if user needs to complete onboarding
  if (!user?.hasCompletedOnboarding) {
    return <Redirect href="/welcome" />;
  }

  // This layout can be deferred because it's not the root layout.
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="notification-settings" options={{ 
        headerShown: true,
        title: "通知設定",
        headerBackTitle: "戻る",
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerTintColor: '#FF90BB',
      }} />
    </Stack>
  );
}