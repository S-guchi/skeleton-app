import { View, Text, Image, ImageProps } from "react-native";
import { cn } from "@/lib/utils";

interface AvatarProps {
  src?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  imageProps?: Partial<ImageProps>;
}

export function Avatar({ 
  src, 
  name, 
  size = "md", 
  className,
  imageProps 
}: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-base",
    lg: "text-xl", 
    xl: "text-3xl",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <View
      className={cn(
        "rounded-full items-center justify-center bg-gray-100 dark:bg-gray-700",
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <Image
          source={{ uri: src }}
          className={cn("rounded-full", sizeClasses[size])}
          {...imageProps}
        />
      ) : (
        <Text
          className={cn(
            "font-medium text-gray-600 dark:text-gray-300",
            textSizeClasses[size]
          )}
        >
          {name ? getInitials(name) : "👤"}
        </Text>
      )}
    </View>
  );
}