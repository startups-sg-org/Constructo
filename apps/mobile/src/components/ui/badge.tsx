import React from 'react';
import { StyleProp, Text, TextStyle, View, ViewStyle } from 'react-native';
import { ConstructoColors, ConstructoRadius } from '../../constants/theme';
import { Icon, IconName } from './icon';

export interface BadgeProps {
  label: string;
  variant?:
    | 'destaque'
    | 'destaqueSuave'
    | 'primaria'
    | 'primariaSuave'
    | 'sucesso'
    | 'erro'
    | 'azul'
    | 'roxo'
    | 'laranja'
    | 'esmeralda'
    | 'neutro';
  size?: 'sm' | 'md';
  dot?: boolean;
  icon?: React.ReactNode;
  iconName?: IconName;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export function Badge({
  label,
  variant = 'destaque',
  size = 'md',
  dot = false,
  icon,
  iconName,
  style,
  textStyle,
}: BadgeProps) {
  const getContainerStyle = (): ViewStyle => {
    let base: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: ConstructoRadius.full,
      alignSelf: 'flex-start',
      gap: 5,
    };

    if (size === 'sm') {
      base = { ...base, paddingHorizontal: 8, paddingVertical: 3.5 };
    } else {
      base = { ...base, paddingHorizontal: 11, paddingVertical: 5 };
    }

    switch (variant) {
      case 'destaque':
        base = { ...base, backgroundColor: ConstructoColors.destaque };
        break;
      case 'destaqueSuave':
        base = {
          ...base,
          backgroundColor: ConstructoColors.destaqueSuave,
          borderWidth: 1,
          borderColor: '#F3D28C',
        };
        break;
      case 'primaria':
        base = { ...base, backgroundColor: ConstructoColors.primaria };
        break;
      case 'primariaSuave':
        base = {
          ...base,
          backgroundColor: ConstructoColors.primariaSuave,
          borderWidth: 1,
          borderColor: ConstructoColors.bordaFoco,
        };
        break;
      case 'sucesso':
        base = {
          ...base,
          backgroundColor: ConstructoColors.sucessoSuave,
          borderWidth: 1,
          borderColor: '#A7DFC5',
        };
        break;
      case 'erro':
        base = {
          ...base,
          backgroundColor: ConstructoColors.erroSuave,
          borderWidth: 1,
          borderColor: '#EAB8B3',
        };
        break;
      case 'azul':
        base = {
          ...base,
          backgroundColor: ConstructoColors.azulSuave,
          borderWidth: 1,
          borderColor: '#BAE6FD',
        };
        break;
      case 'roxo':
        base = {
          ...base,
          backgroundColor: ConstructoColors.roxoSuave,
          borderWidth: 1,
          borderColor: '#DDD6FE',
        };
        break;
      case 'laranja':
        base = {
          ...base,
          backgroundColor: ConstructoColors.laranjaSuave,
          borderWidth: 1,
          borderColor: '#FED7AA',
        };
        break;
      case 'esmeralda':
        base = {
          ...base,
          backgroundColor: ConstructoColors.esmeraldaSuave,
          borderWidth: 1,
          borderColor: '#A7F3D0',
        };
        break;
      case 'neutro':
      default:
        base = {
          ...base,
          backgroundColor: ConstructoColors.superficieSutil,
          borderWidth: 1,
          borderColor: ConstructoColors.borda,
        };
        break;
    }

    return base;
  };

  const getTextColor = (): string => {
    switch (variant) {
      case 'destaque':
      case 'primaria':
        return ConstructoColors.textoInvertido;
      case 'destaqueSuave':
        return ConstructoColors.destaque;
      case 'primariaSuave':
        return ConstructoColors.primaria;
      case 'sucesso':
        return ConstructoColors.sucesso;
      case 'erro':
        return ConstructoColors.erro;
      case 'azul':
        return ConstructoColors.azulTecnico;
      case 'roxo':
        return ConstructoColors.roxoContrato;
      case 'laranja':
        return ConstructoColors.laranjaObra;
      case 'esmeralda':
        return ConstructoColors.esmeralda;
      case 'neutro':
      default:
        return ConstructoColors.textoForte;
    }
  };

  const getTextStyle = (): TextStyle => ({
    fontWeight: '600',
    fontSize: size === 'sm' ? 11 : 12,
    letterSpacing: 0.2,
    color: getTextColor(),
    fontVariant: ['tabular-nums'],
  });

  const textColor = getTextColor();

  return (
    <View style={[getContainerStyle(), style]}>
      {dot ? (
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: textColor,
          }}
        />
      ) : null}
      {icon}
      {iconName ? <Icon name={iconName} size={size === 'sm' ? 11 : 13} color={textColor} /> : null}
      <Text style={[getTextStyle(), textStyle]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}
