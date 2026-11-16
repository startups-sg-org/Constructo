import React, { useState } from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ConstructoColors, ConstructoRadius } from '../../constants/theme';
import { Icon, IconName } from './icon';
import { Typography } from './typography';

export interface InputProps extends TextInputProps {
  label?: string;
  helperText?: string;
  error?: string | null;
  leftIcon?: IconName;
  rightIcon?: IconName;
  onRightIconPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
}

/**
 * Componente Primitivo Input oficial do Constructo (conforme SKILL.md).
 * Borda nítida de 1px (#DFE5E3 -> #236557 no foco), radiusField: 10px, alinhamento à esquerda.
 */
export function Input({
  label,
  helperText,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  secureTextEntry,
  multiline,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...rest
}: InputProps) {
  const [focado, setFocado] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const isPasswordField = Boolean(secureTextEntry);
  const ocultandoTexto = isPasswordField && !mostrarSenha;

  const handleTogglePassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setMostrarSenha((prev) => !prev);
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label ? (
        <Typography variant="label" color={error ? 'danger' : focado ? 'primary' : 'muted'}>
          {label}
        </Typography>
      ) : null}

      <View
        style={[
          styles.fieldWrapper,
          multiline ? styles.fieldMultiline : styles.fieldSingle,
          focado ? styles.fieldFocused : null,
          error ? styles.fieldError : null,
        ]}
      >
        {leftIcon ? (
          <View style={styles.iconLeft}>
            <Icon
              name={leftIcon}
              size={16}
              color={focado ? ConstructoColors.primaria : ConstructoColors.textoSuave}
            />
          </View>
        ) : null}

        <TextInput
          style={[
            styles.input,
            multiline ? styles.inputMultiline : null,
            style,
          ]}
          placeholderTextColor={ConstructoColors.textoSuave}
          secureTextEntry={ocultandoTexto}
          multiline={multiline}
          onFocus={(e) => {
            setFocado(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocado(false);
            onBlur?.(e);
          }}
          {...rest}
        />

        {isPasswordField ? (
          <Pressable
            onPress={handleTogglePassword}
            hitSlop={10}
            style={styles.iconRight}
          >
            <Icon
              name={mostrarSenha ? 'eye-off' : 'eye'}
              size={17}
              color={ConstructoColors.textoSuave}
            />
          </Pressable>
        ) : rightIcon ? (
          <Pressable
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            hitSlop={10}
            style={styles.iconRight}
          >
            <Icon name={rightIcon} size={16} color={ConstructoColors.textoSuave} />
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <View style={styles.feedbackRow}>
          <Icon name="alert-circle" size={13} color={ConstructoColors.erro} />
          <Typography variant="caption" color="danger">
            {error}
          </Typography>
        </View>
      ) : helperText ? (
        <Typography variant="caption" color="muted">
          {helperText}
        </Typography>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  fieldWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ConstructoColors.superficie,
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
    borderRadius: ConstructoRadius.field,
    paddingHorizontal: 13,
  },
  fieldSingle: {
    minHeight: 46,
  },
  fieldMultiline: {
    minHeight: 88,
    alignItems: 'flex-start',
    paddingVertical: 10,
  },
  fieldFocused: {
    borderColor: ConstructoColors.primaria,
    backgroundColor: ConstructoColors.superficie,
  },
  fieldError: {
    borderColor: ConstructoColors.erro,
    backgroundColor: ConstructoColors.erroSuave,
  },
  iconLeft: {
    marginRight: 10,
  },
  iconRight: {
    marginLeft: 8,
    padding: 4,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: ConstructoColors.textoForte,
    paddingVertical: 10,
  },
  inputMultiline: {
    textAlignVertical: 'top',
    minHeight: 68,
    paddingTop: 2,
  },
  feedbackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
});

