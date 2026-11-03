import React from 'react';
import {
  Pressable,
  StyleProp,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  ConstructoColors,
  ConstructoRadius,
  ConstructoShadows,
} from '../../constants/theme';

export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  selected?: boolean;
  padding?: number;
  elevated?: boolean;
  subtle?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Card({
  children,
  onPress,
  style,
  selected = false,
  padding = 16,
  elevated = true,
  subtle = false,
}: CardProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!onPress) return;
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    if (!onPress) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    if (!onPress) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const containerStyle: ViewStyle = {
    backgroundColor: subtle
      ? ConstructoColors.superficieSutil
      : ConstructoColors.superficie,
    borderRadius: ConstructoRadius.card,
    borderWidth: 1,
    borderColor: selected ? ConstructoColors.primaria : ConstructoColors.borda,
    padding,
    ...(elevated && !subtle ? ConstructoShadows.card : {}),
  };

  if (onPress) {
    return (
      <AnimatedPressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={handlePress}
        style={[containerStyle, animatedStyle, style]}
      >
        {children}
      </AnimatedPressable>
    );
  }

  return <View style={[containerStyle, style]}>{children}</View>;
}
