import { Link, Stack } from "expo-router";
import React from "react";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <View className="flex-1 items-center justify-center bg-background p-5">
        <Text className="text-2xl font-bold">{"This screen doesn't exist."}</Text>

        <Link href="/" className="m-4 py-4">
          <Text>Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}
