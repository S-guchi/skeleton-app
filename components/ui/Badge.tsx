import { View, Text, ViewProps } from "react-native";
import { cn } from "@/lib/utils";

interface BadgeProps extends ViewProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
}

export function Badge({ 
  children, 
  className, 
  variant = "default", 
  size = "md",
  ...props 
}: BadgeProps) {
  return (
    <View
      className={cn(
        "rounded-full items-center justify-center",
        {
          // Size variants
          "px-2 py-1": size === "sm",
          "px-3 py-1.5": size === "md", 
          "px-4 py-2": size === "lg",
          // Color variants
          "bg-gray-100 dark:bg-gray-700": variant === "default",
          "bg-green-100 dark:bg-green-900": variant === "success",
          "bg-yellow-100 dark:bg-yellow-900": variant === "warning",
          "bg-red-100 dark:bg-red-900": variant === "error",
          "bg-blue-100 dark:bg-blue-900": variant === "info",
        },
        className
      )}
      {...props}
    >
      <Text
        className={cn(
          "font-medium",
          {
            // Size variants
            "text-xs": size === "sm",
            "text-sm": size === "md",
            "text-base": size === "lg",
            // Color variants
            "text-gray-700 dark:text-gray-300": variant === "default",
            "text-green-700 dark:text-green-300": variant === "success",
            "text-yellow-700 dark:text-yellow-300": variant === "warning",
            "text-red-700 dark:text-red-300": variant === "error",
            "text-blue-700 dark:text-blue-300": variant === "info",
          }
        )}
      >
        {children}
      </Text>
    </View>
  );
}