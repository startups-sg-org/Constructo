import React, { useEffect } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import {
  ConstructoColors,
  ConstructoRadius,
  ConstructoShadows,
} from '../../constants/theme';
import { Icon } from './icon';
import { Typography } from './typography';

export interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  maxHeight?: `${number}%` | number;
  style?: StyleProp<ViewStyle>;
}

export function BottomSheet({
  visible,
  onClose,
  children,
  title,
  subtitle,
  style,
}: BottomSheetProps) {
  const translateY = useSharedValue(600);
  const backdropOpacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      backdropOpacity.value = withTiming(0.45, { duration: 200 });
      translateY.value = withTiming(0, {
        duration: 240,
        easing: Easing.out(Easing.cubic),
      });
    } else {
      backdropOpacity.value = withTiming(0, { duration: 160 });
      translateY.value = withTiming(600, {
        duration: 180,
        easing: Easing.in(Easing.cubic),
      });
    }
  }, [visible, backdropOpacity, translateY]);

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <Animated.View style={[styles.backdrop, backdropAnimatedStyle]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        <Animated.View style={[styles.sheet, sheetAnimatedStyle, style]}>
          <View style={styles.handleContainer}>
            <View style={styles.handleBar} />
          </View>

          {title ? (
            <View style={styles.sheetHeader}>
              <View style={{ flex: 1, gap: 2 }}>
                <Typography variant="titleMedium" color="strong">
                  {title}
                </Typography>
                {subtitle ? (
                  <Typography variant="caption" color="muted">
                    {subtitle}
                  </Typography>
                ) : null}
              </View>
              <Pressable onPress={onClose} hitSlop={10} style={styles.closeButton}>
                <Icon name="close" size={16} color={ConstructoColors.textoSuave} />
              </Pressable>
            </View>
          ) : null}

          {children}
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F172A',
  },
  sheet: {
    backgroundColor: ConstructoColors.superficie,
    borderTopLeftRadius: ConstructoRadius.sheet,
    borderTopRightRadius: ConstructoRadius.sheet,
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 10,
    maxHeight: '90%',
    ...ConstructoShadows.sheet,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 6,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: ConstructoColors.bordaFoco,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: ConstructoColors.borda,
    gap: 12,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: ConstructoRadius.field,
    backgroundColor: ConstructoColors.superficieSutil,
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
