import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useSession } from "@/lib/contexts/SessionContext";
import { useUser } from "@/lib/contexts/UserContext";
import { Redirect } from "expo-router";

export default function Index() {
  const { session, isAuthLoading } = useSession();
  const { user, isUserLoading } = useUser();
  const isLoading = isAuthLoading || isUserLoading;

  if (isLoading) {
    return <LoadingSpinner text="アプリを起動中..." className="flex-1" />;
  }

  if (!session) {
    return <Redirect href="/welcome" />;
  }

  if (!user?.hasCompletedOnboarding) {
    return <Redirect href="/welcome" />;
  }

  return <Redirect href="/(app)/(tabs)" />;
}
