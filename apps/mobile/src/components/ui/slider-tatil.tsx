import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { ConstructoColors, ConstructoRadius } from '../../constants/theme';
import { Icon } from './icon';
import { Typography } from './typography';

export interface SliderTatilProps {
  valor: number; // Ex: 4.5
  aoMudarValor: (novoValor: number) => void;
  opcoesPredefinidas?: number[];
  rotulo?: string;
  style?: StyleProp<ViewStyle>;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SliderTatil({
  valor,
  aoMudarValor,
  opcoesPredefinidas = [1, 2.5, 4.5, 5, 10, 20],
  rotulo = 'Impacto estimado no cronograma global',
  style,
}: SliderTatilProps) {
  const handleSelecionarPredefinido = (opcao: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    aoMudarValor(opcao);
  };

  const handleIncrementar = (passo: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const novo = Math.max(0.5, Math.min(100, Number((valor + passo).toFixed(1))));
    aoMudarValor(novo);
  };

  const percentualVisual = Math.min(100, Math.max(4, (valor / 25) * 100));

  return (
    <View style={[styles.container, style]}>
      {rotulo ? (
        <Typography variant="label" color="muted">
          {rotulo}
        </Typography>
      ) : null}

      {/* Painel Numérico e Barra com Notches */}
      <View style={styles.displayCard}>
        <View style={styles.topRow}>
          <View style={styles.valorLinha}>
            <Typography variant="display" color="accent" tabular style={styles.numeroDestaque}>
              +{valor}%
            </Typography>
            <Typography variant="caption" color="muted">
              Incremento ponderado sobre os marcos da obra
            </Typography>
          </View>

          <View style={styles.ajusteManual}>
            <Pressable
              style={styles.btnAjuste}
              onPress={() => handleIncrementar(-0.5)}
              hitSlop={8}
            >
              <Icon name="minus" size={15} color={ConstructoColors.textoForte} />
            </Pressable>
            <Pressable
              style={styles.btnAjuste}
              onPress={() => handleIncrementar(+0.5)}
              hitSlop={8}
            >
              <Icon name="plus" size={15} color={ConstructoColors.textoForte} />
            </Pressable>
          </View>
        </View>

        {/* Trilha Tátil com Marcas (Notches) */}
        <View style={styles.trackWrapper}>
          <View style={styles.trackBackground}>
            <View style={[styles.trackFill, { width: `${percentualVisual}%` }]} />
          </View>
          <View style={styles.notchesRow}>
            {[0, 25, 50, 75, 100].map((notch) => (
              <View key={notch} style={styles.notchDot} />
            ))}
          </View>
        </View>
      </View>

      {/* Pílulas de Atalho Rápido */}
      <View style={styles.pilulasContainer}>
        {opcoesPredefinidas.map((opcao) => {
          const selecionado = valor === opcao;
          return (
            <BotaoPilula
              key={opcao}
              label={`+${opcao}%`}
              selecionado={selecionado}
              onPress={() => handleSelecionarPredefinido(opcao)}
            />
          );
        })}
      </View>
    </View>
  );
}

function BotaoPilula({
  label,
  selecionado,
  onPress,
}: {
  label: string;
  selecionado: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <AnimatedPressable
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      style={[
        styles.pilula,
        selecionado ? styles.pilulaSelecionada : styles.pilulaInativa,
        animStyle,
      ]}
    >
      <Text
        style={[
          styles.pilulaTexto,
          selecionado ? styles.pilulaTextoSelecionado : styles.pilulaTextoInativo,
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
  },
  displayCard: {
    backgroundColor: ConstructoColors.superficieSutil,
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
    borderRadius: ConstructoRadius.card,
    padding: 14,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  valorLinha: {
    gap: 2,
    flex: 1,
  },
  numeroDestaque: {
    fontSize: 28,
    fontWeight: '800',
    color: ConstructoColors.destaque,
  },
  ajusteManual: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  btnAjuste: {
    width: 38,
    height: 38,
    borderRadius: ConstructoRadius.field,
    backgroundColor: ConstructoColors.superficie,
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  trackBackground: {
    height: 8,
    borderRadius: 4,
    backgroundColor: ConstructoColors.borda,
    overflow: 'hidden',
  },
  trackFill: {
    height: '100%',
    backgroundColor: ConstructoColors.destaque,
    borderRadius: 4,
  },
  notchesRow: {
    position: 'absolute',
    left: 6,
    right: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notchDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ConstructoColors.superficie,
    opacity: 0.7,
  },
  pilulasContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  pilula: {
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: ConstructoRadius.field,
    borderWidth: 1,
  },
  pilulaSelecionada: {
    backgroundColor: ConstructoColors.primaria,
    borderColor: ConstructoColors.primariaHover,
  },
  pilulaInativa: {
    backgroundColor: ConstructoColors.superficie,
    borderColor: ConstructoColors.borda,
  },
  pilulaTexto: {
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  pilulaTextoSelecionado: {
    color: ConstructoColors.textoInvertido,
  },
  pilulaTextoInativo: {
    color: ConstructoColors.texto,
  },
});
