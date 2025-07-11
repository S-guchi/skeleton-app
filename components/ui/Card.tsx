import { View, ViewProps } from "react-native";
import { cn } from "@/lib/utils";

interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: "default" | "outlined" | "elevated";
}

export function Card({ children, className, variant = "default", ...props }: CardProps) {
  return (
    <View
      className={cn(
        "rounded-lg",
        {
          "bg-white dark:bg-gray-800": variant === "default",
          "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700": variant === "outlined",
          "bg-white dark:bg-gray-800 shadow-lg": variant === "elevated",
        },
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}

export function CardHeader({ children, className, ...props }: ViewProps & { children: React.ReactNode }) {
  return (
    <View className={cn("p-4 pb-2", className)} {...props}>
      {children}
    </View>
  );
}

export function CardContent({ children, className, ...props }: ViewProps & { children: React.ReactNode }) {
  return (
    <View className={cn("p-4 pt-0", className)} {...props}>
      {children}
    </View>
  );
}

export function CardFooter({ children, className, ...props }: ViewProps & { children: React.ReactNode }) {
  return (
    <View className={cn("p-4 pt-2", className)} {...props}>
      {children}
    </View>
  );
}