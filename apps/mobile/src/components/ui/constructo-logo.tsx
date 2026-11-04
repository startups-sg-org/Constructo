import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ConstructoColors } from '../../constants/theme';
import { Typography } from './typography';

export interface ConstructoLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
  subtitle?: string;
  /** Versão para fundos escuros: emblema branco e texto claro. */
  inverted?: boolean;
}

/**
 * Identidade visual arquitetônica do Constructo.
 * Emblema estrutural geométrico inspirado em corte de engenharia civil.
 */
export function ConstructoLogo({
  size = 'md',
  showWordmark = true,
  subtitle,
  inverted = false,
}: ConstructoLogoProps) {
  const dimensions = size === 'sm' ? 34 : size === 'lg' ? 54 : 42;
  const innerSize = Math.round(dimensions * 0.52);
  const borderRadius = Math.round(dimensions * 0.26);

  return (
    <View style={styles.row}>
      <View
        style={[
          styles.emblemOuter,
          {
            width: dimensions,
            height: dimensions,
            borderRadius,
          },
          inverted && styles.emblemOuterInverted,
        ]}
      >
        {/* Monograma Arquitetônico em C estrutural */}
        <View
          style={[
            styles.emblemC,
            {
              width: innerSize,
              height: innerSize,
              borderRadius: Math.round(innerSize * 0.28),
              borderWidth: size === 'sm' ? 2.5 : 3.5,
            },
            inverted && styles.emblemCInverted,
          ]}
        />
        <View
          style={[
            styles.accentNode,
            {
              width: size === 'sm' ? 5 : 7,
              height: size === 'sm' ? 5 : 7,
              borderRadius: 4,
            },
            inverted && styles.accentNodeInverted,
          ]}
        />
      </View>

      {showWordmark ? (
        <View style={styles.wordmarkCol}>
          <Typography
            variant={size === 'lg' ? 'titleLarge' : 'titleMedium'}
            color={inverted ? 'inverted' : 'strong'}
            style={styles.brandTitle}
          >
            Constructo
          </Typography>
          {subtitle ? (
            <Typography
              variant="label"
              color={inverted ? 'inverted' : 'muted'}
              style={[styles.subtitle, inverted && styles.subtitleInverted]}
            >
              {subtitle}
            </Typography>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  emblemOuterInverted: {
    backgroundColor: '#FFFFFF',
    borderColor: '#FFFFFF',
  },
  emblemCInverted: {
    borderColor: ConstructoColors.primaria,
    borderRightColor: 'transparent',
  },
  accentNodeInverted: {
    backgroundColor: ConstructoColors.destaque,
  },
  subtitleInverted: {
    opacity: 0.75,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  emblemOuter: {
    backgroundColor: ConstructoColors.primaria,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ConstructoColors.primariaHover,
    position: 'relative',
  },
  emblemC: {
    borderColor: '#FFFFFF',
    borderRightColor: 'transparent',
  },
  accentNode: {
    position: 'absolute',
    right: '24%',
    backgroundColor: ConstructoColors.destaqueSuave,
  },
  wordmarkCol: {
    gap: 1,
  },
  brandTitle: {
    letterSpacing: -0.4,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 10,
    letterSpacing: 0.8,
  },
});

