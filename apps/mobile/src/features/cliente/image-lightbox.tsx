import React, { useEffect } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import {
  GestureDetector,
  GestureHandlerRootView,
  usePanGesture,
  usePinchGesture,
  useSimultaneousGestures,
  useTapGesture,
} from 'react-native-gesture-handler';
import { Icon, Typography } from '../../components/ui';
import { ConstructoRadius } from '../../constants/theme';

export interface ImageLightboxProps {
  visible: boolean;
  imageUrl: string | null;
  caption?: string;
  onClose: () => void;
}

const ESCALA_MAXIMA = 5;
const ESCALA_DUPLO_TOQUE = 2.5;
const DISTANCIA_PARA_FECHAR = 120;
const VELOCIDADE_PARA_FECHAR = 900;
const SPRING = { damping: 18, stiffness: 220 } as const;

/**
 * Visualizador de evidência em tela cheia com gestos nativos:
 * pinça para ampliar, arrastar quando ampliada, toque duplo para alternar
 * o zoom e arrastar para baixo (sem zoom) para fechar.
 */
export function ImageLightbox({
  visible,
  imageUrl,
  caption,
  onClose,
}: ImageLightboxProps) {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);
  const dismissY = useSharedValue(0);

  useEffect(() => {
    scale.value = 1;
    savedScale.value = 1;
    tx.value = 0;
    ty.value = 0;
    savedTx.value = 0;
    savedTy.value = 0;
    dismissY.value = 0;
  }, [visible, imageUrl, scale, savedScale, tx, ty, savedTx, savedTy, dismissY]);

  const pinch = usePinchGesture({
    onUpdate: (e) => {
      scale.value = Math.min(
        ESCALA_MAXIMA,
        Math.max(1, savedScale.value * e.scale)
      );
    },
    onDeactivate: () => {
      if (scale.value < 1.02) {
        scale.value = withSpring(1, SPRING);
        tx.value = withSpring(0, SPRING);
        ty.value = withSpring(0, SPRING);
        savedScale.value = 1;
        savedTx.value = 0;
        savedTy.value = 0;
      } else {
        savedScale.value = scale.value;
      }
    },
  });

  const pan = usePanGesture({
    onUpdate: (e) => {
      if (scale.value > 1.01) {
        tx.value = savedTx.value + e.translationX;
        ty.value = savedTy.value + e.translationY;
      } else {
        dismissY.value = Math.max(0, e.translationY);
      }
    },
    onDeactivate: (e) => {
      if (scale.value > 1.01) {
        savedTx.value = tx.value;
        savedTy.value = ty.value;
        return;
      }
      if (
        dismissY.value > DISTANCIA_PARA_FECHAR ||
        e.velocityY > VELOCIDADE_PARA_FECHAR
      ) {
        scheduleOnRN(onClose);
      } else {
        dismissY.value = withSpring(0, SPRING);
      }
    },
  });

  const doubleTap = useTapGesture({
    numberOfTaps: 2,
    onDeactivate: () => {
      const ampliar = scale.value < 1.5;
      const alvo = ampliar ? ESCALA_DUPLO_TOQUE : 1;
      scale.value = withSpring(alvo, SPRING);
      savedScale.value = alvo;
      if (!ampliar) {
        tx.value = withSpring(0, SPRING);
        ty.value = withSpring(0, SPRING);
        savedTx.value = 0;
        savedTy.value = 0;
      }
    },
  });

  const gestos = useSimultaneousGestures(pinch, pan, doubleTap);

  const fundoStyle = useAnimatedStyle(() => ({
    opacity: interpolate(dismissY.value, [0, 260], [1, 0.25], 'clamp'),
  }));

  const barrasStyle = useAnimatedStyle(() => ({
    opacity: interpolate(dismissY.value, [0, 90], [1, 0], 'clamp'),
  }));

  const imagemStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: tx.value },
      { translateY: ty.value + dismissY.value },
      { scale: scale.value },
    ],
  }));

  if (!visible || !imageUrl) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <GestureHandlerRootView style={styles.root}>
        <Animated.View style={[StyleSheet.absoluteFill, styles.fundo, fundoStyle]} />

        <SafeAreaView style={styles.safeArea}>
          <Animated.View style={[styles.topBar, barrasStyle]}>
            <View style={styles.tituloBloco}>
              <Typography variant="bodyStrong" color="inverted">
                Inspeção visual de evidência
              </Typography>
              <Typography variant="caption" style={styles.dica}>
                Pinça para ampliar · toque duplo · arraste para baixo para fechar
              </Typography>
            </View>
            <Pressable
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityLabel="Fechar visualizador"
            >
              <Icon name="close" size={18} color="#FFFFFF" />
            </Pressable>
          </Animated.View>

          <GestureDetector gesture={gestos}>
            <Animated.View style={styles.imageWrapper}>
              <Animated.View style={[styles.imageBox, imagemStyle]}>
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.image}
                  contentFit="contain"
                  transition={200}
                />
              </Animated.View>
            </Animated.View>
          </GestureDetector>

          {caption ? (
            <Animated.View style={[styles.footerBar, barrasStyle]}>
              <Typography variant="body" color="inverted">
                {caption}
              </Typography>
            </Animated.View>
          ) : null}
        </SafeAreaView>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  fundo: {
    backgroundColor: '#0E1F1C',
  },
  safeArea: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.12)',
  },
  tituloBloco: {
    flex: 1,
    gap: 4,
    paddingRight: 16,
  },
  dica: {
    color: 'rgba(255,255,255,0.64)',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: ConstructoRadius.field,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageBox: {
    width: '100%',
    height: '100%',
    padding: 8,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  footerBar: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'rgba(14, 31, 28, 0.92)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.12)',
  },
});
