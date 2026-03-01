import React from "react";
import { Animated, StyleSheet, View } from "react-native";
import Colors from "../constants/Colors";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({
  width = "100%",
  height = 20,
  borderRadius = 4,
  style,
}: SkeletonProps) {
  const animatedValue = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    animation.start();
    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[styles.skeleton, { width, height, borderRadius, opacity }, style]}
    />
  );
}

export function ProfileSkeleton() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Skeleton width={100} height={100} borderRadius={50} />
        <View style={styles.headerText}>
          <Skeleton width={150} height={24} />
          <Skeleton width={120} height={16} style={{ marginTop: 8 }} />
        </View>
      </View>
      <View style={styles.content}>
        <Skeleton width="100%" height={60} style={{ marginTop: 16 }} />
        <Skeleton width="100%" height={60} style={{ marginTop: 12 }} />
        <Skeleton width="100%" height={60} style={{ marginTop: 12 }} />
      </View>
    </View>
  );
}

export function SettingsSkeleton() {
  return (
    <View style={styles.container}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} width="100%" height={60} style={{ marginTop: 12 }} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.light.border,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
  },
  headerText: {
    marginLeft: 16,
  },
  content: {
    marginTop: 20,
  },
});
