import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useI18n } from "@/lib/contexts/LocalizationContext";
import { COLORS } from "@/lib/constants";

export default function TabLayout() {
  const { t, isLoading } = useI18n();

  // Show loading state while i18n is initializing
  if (isLoading) {
    return null;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.PRIMARY,
        tabBarInactiveTintColor: COLORS.GRAY_500,
        tabBarStyle: {
          backgroundColor: COLORS.WHITE,
          borderTopColor: COLORS.BORDER_LIGHT,
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: COLORS.PRIMARY,
        },
        headerTintColor: COLORS.WHITE,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('navigation.home'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('navigation.settings'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
          headerTitle: t('settings.title'),
        }}
      />
    </Tabs>
  );
}