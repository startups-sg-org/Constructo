import React, { useEffect, useRef, useState } from 'react';
import { StyleProp, TextStyle } from 'react-native';
import { Typography, TypographyProps } from '../../components/ui';

export interface AnimatedNumberProps {
  value: number;
  /** Quando false, mantém o valor inicial até ser ativado (ex.: card ainda fora da tela). */
  active?: boolean;
  from?: number;
  decimals?: number;
  suffix?: string;
  duration?: number;
  delay?: number;
  variant?: TypographyProps['variant'];
  color?: TypographyProps['color'];
  style?: StyleProp<TextStyle>;
}

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Contador numérico com easing suave (sem overshoot), usando numerais tabulares
 * para que a largura não oscile durante a contagem.
 */
export function AnimatedNumber({
  value,
  active = true,
  from = 0,
  decimals = 0,
  suffix = '',
  duration = 800,
  delay = 0,
  variant = 'bodyStrong',
  color = 'strong',
  style,
}: AnimatedNumberProps) {
  const [exibido, setExibido] = useState(from);
  const atual = useRef(from);

  useEffect(() => {
    if (!active) return;

    const inicio = atual.current;
    let frame = 0;
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const iniciar = () => {
      const t0 = Date.now();
      const passo = () => {
        const progresso = Math.min(1, (Date.now() - t0) / duration);
        const proximo = inicio + (value - inicio) * easeOutCubic(progresso);
        atual.current = proximo;
        setExibido(proximo);
        if (progresso < 1) frame = requestAnimationFrame(passo);
      };
      frame = requestAnimationFrame(passo);
    };

    if (delay > 0) timeout = setTimeout(iniciar, delay);
    else iniciar();

    return () => {
      if (timeout) clearTimeout(timeout);
      cancelAnimationFrame(frame);
    };
  }, [active, value, duration, delay]);

  return (
    <Typography variant={variant} color={color} tabular style={style}>
      {exibido.toFixed(decimals)}
      {suffix}
    </Typography>
  );
}

