import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  Text,
  TextStyle,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ConstructoColors, ConstructoRadius } from '../../constants/theme';
import { Icon, IconName } from './icon';

export interface ButtonProps {
  label: string;
  onPress: () => void | Promise<void>;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destaque' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  iconName?: IconName;
  rightIconName?: IconName;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconName,
  rightIconName,
  fullWidth = false,
  style,
  textStyle,
}: ButtonProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (disabled || loading) return;
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    if (disabled || loading) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const handlePress = () => {
    if (disabled || loading) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const getContainerStyle = (): ViewStyle => {
    let base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: ConstructoRadius.field,
      gap: 7,
      ...(fullWidth ? { width: '100%' } : {}),
    };

    if (size === 'sm') {
      base = { ...base, height: 36, paddingHorizontal: 12 };
    } else if (size === 'lg') {
      base = { ...base, height: 52, paddingHorizontal: 20 };
    } else {
      base = { ...base, height: 44, paddingHorizontal: 16 };
    }

    switch (variant) {
      case 'primary':
        base = {
          ...base,
          backgroundColor: disabled ? ConstructoColors.borda : ConstructoColors.primaria,
          borderWidth: 1,
          borderColor: disabled ? ConstructoColors.borda : ConstructoColors.primariaHover,
        };
        break;
      case 'destaque':
        base = {
          ...base,
          backgroundColor: disabled ? ConstructoColors.borda : ConstructoColors.destaque,
          borderWidth: 1,
          borderColor: disabled ? ConstructoColors.borda : ConstructoColors.destaque,
        };
        break;
      case 'danger':
        base = {
          ...base,
          backgroundColor: ConstructoColors.erroSuave,
          borderWidth: 1,
          borderColor: ConstructoColors.erro,
        };
        break;
      case 'secondary':
        base = {
          ...base,
          backgroundColor: ConstructoColors.superficie,
          borderWidth: 1,
          borderColor: ConstructoColors.borda,
        };
        break;
      case 'outline':
        base = {
          ...base,
          backgroundColor: ConstructoColors.primariaSuave,
          borderWidth: 1,
          borderColor: disabled ? ConstructoColors.borda : ConstructoColors.bordaFoco,
        };
        break;
      case 'ghost':
        base = {
          ...base,
          backgroundColor: 'transparent',
        };
        break;
    }

    return base;
  };

  const getTextColor = (): string => {
    if (disabled) return ConstructoColors.textoSuave;
    switch (variant) {
      case 'primary':
      case 'destaque':
        return ConstructoColors.textoInvertido;
      case 'danger':
        return ConstructoColors.erro;
      case 'outline':
        return ConstructoColors.primaria;
      case 'secondary':
      case 'ghost':
        return ConstructoColors.textoForte;
    }
  };

  const getTextStyle = (): TextStyle => ({
    fontWeight: '600',
    fontSize: size === 'sm' ? 13 : size === 'lg' ? 15 : 14,
    letterSpacing: 0.1,
    color: getTextColor(),
  });

  const iconSize = size === 'sm' ? 14 : size === 'lg' ? 18 : 16;
  const iconColor = getTextColor();

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      disabled={disabled || loading}
      style={[animatedStyle, getContainerStyle(), style]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <>
          {icon}
          {iconName ? <Icon name={iconName} size={iconSize} color={iconColor} /> : null}
          <Text style={[getTextStyle(), textStyle]} numberOfLines={1}>
            {label}
          </Text>
          {rightIconName ? (
            <Icon name={rightIconName} size={iconSize} color={iconColor} />
          ) : null}
        </>
      )}
    </AnimatedPressable>
  );
}
