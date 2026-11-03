import React, { useEffect } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { ConstructoColors, ConstructoRadius } from '../../constants/theme';

export interface SkeletonProps {
  width?: number | `${number}%` | 'auto';
  height?: number;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}

export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonProps) {
  const opacity = useSharedValue(0.4);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 800 }),
        withTiming(0.4, { duration: 800 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width: width as any,
          height,
          borderRadius,
          backgroundColor: '#DFE5E3',
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

/**
 * Esqueleto exato do Card do Feed para evitar salto de layout (zero CLS).
 */
export function FeedCardSkeleton() {
  return (
    <View style={styles.cardSkeleton}>
      {/* Header do Autor */}
      <View style={styles.headerLinha}>
        <SkeletonLoader width={40} height={40} borderRadius={20} />
        <View style={{ gap: 6, flex: 1 }}>
          <SkeletonLoader width="60%" height={16} />
          <SkeletonLoader width="35%" height={12} />
        </View>
      </View>

      {/* Mídia Hero */}
      <SkeletonLoader width="100%" height={260} borderRadius={ConstructoRadius.card} />

      {/* Barra de Progresso Placeholder */}
      <SkeletonLoader width="100%" height={8} borderRadius={4} />

      {/* Legenda */}
      <View style={{ gap: 8, marginTop: 4 }}>
        <SkeletonLoader width="85%" height={16} />
        <SkeletonLoader width="70%" height={14} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardSkeleton: {
    backgroundColor: ConstructoColors.superficie,
    borderRadius: ConstructoRadius.card,
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
    padding: 16,
    gap: 14,
    marginBottom: 16,
  },
  headerLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
