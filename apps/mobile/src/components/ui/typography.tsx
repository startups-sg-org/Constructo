import React from 'react';
import { StyleProp, Text, TextProps, TextStyle } from 'react-native';
import { ConstructoColors, Fonts } from '../../constants/theme';

export interface TypographyProps extends TextProps {
  children: React.ReactNode;
  variant?:
    | 'display'
    | 'titleLarge'
    | 'titleMedium'
    | 'titleSmall'
    | 'body'
    | 'bodyStrong'
    | 'caption'
    | 'label'
    | 'mono';
  color?: 'default' | 'strong' | 'muted' | 'primary' | 'accent' | 'inverted' | 'success' | 'danger';
  align?: 'left' | 'center' | 'right';
  tabular?: boolean;
  style?: StyleProp<TextStyle>;
}

export function Typography({
  children,
  variant = 'body',
  color = 'default',
  align = 'left',
  tabular = false,
  style,
  ...rest
}: TypographyProps) {
  const getTextStyle = (): TextStyle => {
    let base: TextStyle = {
      textAlign: align,
      ...(tabular ? { fontVariant: ['tabular-nums'] } : {}),
    };

    switch (variant) {
      case 'display':
        base = {
          ...base,
          fontSize: 28,
          fontWeight: '700',
          lineHeight: 34,
          letterSpacing: -0.6,
          fontVariant: ['tabular-nums'],
        };
        break;
      case 'titleLarge':
        base = {
          ...base,
          fontSize: 21,
          fontWeight: '700',
          lineHeight: 27,
          letterSpacing: -0.35,
        };
        break;
      case 'titleMedium':
        base = {
          ...base,
          fontSize: 17,
          fontWeight: '600',
          lineHeight: 23,
          letterSpacing: -0.2,
        };
        break;
      case 'titleSmall':
        base = {
          ...base,
          fontSize: 15,
          fontWeight: '700',
          lineHeight: 20,
          letterSpacing: -0.1,
        };
        break;
      case 'bodyStrong':
        base = { ...base, fontSize: 14, fontWeight: '600', lineHeight: 20 };
        break;
      case 'body':
        base = { ...base, fontSize: 14, fontWeight: '400', lineHeight: 21 };
        break;
      case 'caption':
        base = { ...base, fontSize: 12, fontWeight: '400', lineHeight: 17 };
        break;
      case 'label':
        base = {
          ...base,
          fontSize: 11,
          fontWeight: '700',
          lineHeight: 15,
          letterSpacing: 0.8,
          textTransform: 'uppercase',
        };
        break;
      case 'mono':
        base = {
          ...base,
          fontSize: 12,
          fontWeight: '600',
          lineHeight: 16,
          fontFamily: Fonts?.mono,
          fontVariant: ['tabular-nums'],
        };
        break;
    }

    switch (color) {
      case 'strong':
        base = { ...base, color: ConstructoColors.textoForte };
        break;
      case 'muted':
        base = { ...base, color: ConstructoColors.textoSuave };
        break;
      case 'primary':
        base = { ...base, color: ConstructoColors.primaria };
        break;
      case 'accent':
        base = { ...base, color: ConstructoColors.destaque };
        break;
      case 'inverted':
        base = { ...base, color: ConstructoColors.textoInvertido };
        break;
      case 'success':
        base = { ...base, color: ConstructoColors.sucesso };
        break;
      case 'danger':
        base = { ...base, color: ConstructoColors.erro };
        break;
      case 'default':
      default:
        base = {
          ...base,
          color:
            variant === 'display' || variant === 'titleLarge'
              ? ConstructoColors.textoForte
              : ConstructoColors.texto,
        };
        break;
    }

    return base;
  };

  return (
    <Text style={[getTextStyle(), style]} {...rest}>
      {children}
    </Text>
  );
}
