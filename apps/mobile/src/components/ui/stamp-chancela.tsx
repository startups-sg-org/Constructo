import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { ConstructoColors } from '../../constants/theme';
import { Icon } from './icon';

export type StatusChancela = 'HOMOLOGADO' | 'PENDENTE' | 'RESSALVA' | 'CONCLUIDO';

export interface StampChancelaProps {
  status: StatusChancela;
  codigoArt?: string;
  responsavelTecnico?: string;
  registroCrea?: string;
  dataHora?: string;
  coordenadasGps?: string;
  compact?: boolean;
  style?: ViewStyle;
}

export function StampChancela({
  status,
  codigoArt = 'ART-2026/8841-SP',
  responsavelTecnico = 'Eng. Rafael Nogueira',
  registroCrea = 'CREA-SP 5062491-D',
  dataHora = '03/NOV/2026 14:32',
  coordenadasGps = '-23.5874, -46.6812',
  compact = false,
  style,
}: StampChancelaProps) {
  const isAprovado = status === 'HOMOLOGADO' || status === 'CONCLUIDO';
  const isPendente = status === 'PENDENTE';

  const corTema = isAprovado
    ? ConstructoColors.primaria
    : isPendente
      ? ConstructoColors.destaque
      : ConstructoColors.erro;

  const corFundo = isAprovado
    ? 'rgba(35, 101, 87, 0.06)'
    : isPendente
      ? 'rgba(185, 114, 0, 0.06)'
      : 'rgba(180, 40, 40, 0.06)';

  const rotuloStatus = isAprovado
    ? 'LAUDO HOMOLOGADO'
    : isPendente
      ? 'EM AUDITORIA TÉCNICA'
      : 'RESSALVA DE CAMPO';

  if (compact) {
    return (
      <View style={[styles.compactBadge, { borderColor: corTema, backgroundColor: corFundo }, style]}>
        <View style={[styles.compactPillDot, { backgroundColor: corTema }]} />
        <Text style={[styles.compactText, { color: corTema }]}>
          {rotuloStatus} • {codigoArt}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { borderColor: corTema, backgroundColor: corFundo }, style]}>
      {/* Moldura dupla técnica */}
      <View style={[styles.innerBorder, { borderColor: corTema }]}>
        <View style={styles.topRow}>
          <View style={styles.headerLeft}>
            <Icon
              name={isAprovado ? 'shield-check' : isPendente ? 'clock' : 'alert-circle'}
              size={13}
              color={corTema}
            />
            <Text style={[styles.chancelaTitulo, { color: corTema }]}>
              {rotuloStatus}
            </Text>
          </View>
          <Text style={[styles.monoCode, { color: corTema }]}>{codigoArt}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.dadosGrid}>
          <View style={styles.dadoCol}>
            <Text style={styles.dadoLabel}>RESP. TÉCNICO</Text>
            <Text style={styles.dadoValor} numberOfLines={1}>
              {responsavelTecnico}
            </Text>
          </View>

          <View style={styles.dadoCol}>
            <Text style={styles.dadoLabel}>REGISTRO PROFISSIONAL</Text>
            <Text style={styles.dadoValor} numberOfLines={1}>
              {registroCrea}
            </Text>
          </View>
        </View>

        <View style={styles.footerRow}>
          <Text style={styles.metaMono}>COORD: {coordenadasGps}</Text>
          <Text style={styles.metaMono}>{dataHora}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 3,
  },
  innerBorder: {
    borderWidth: 1,
    borderRadius: 5,
    paddingVertical: 7,
    paddingHorizontal: 10,
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  chancelaTitulo: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
    fontFamily: 'monospace',
  },
  monoCode: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(35, 101, 87, 0.15)',
    marginVertical: 1,
  },
  dadosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  dadoCol: {
    flex: 1,
  },
  dadoLabel: {
    fontSize: 8.5,
    fontWeight: '700',
    color: ConstructoColors.textoSuave,
    letterSpacing: 0.6,
    fontFamily: 'monospace',
    marginBottom: 1,
  },
  dadoValor: {
    fontSize: 10,
    fontWeight: '600',
    color: ConstructoColors.textoForte,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  metaMono: {
    fontSize: 8.5,
    color: ConstructoColors.textoSuave,
    fontFamily: 'monospace',
  },
  compactBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderWidth: 1,
    borderRadius: 4,
    gap: 5,
  },
  compactPillDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  compactText: {
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.6,
    fontFamily: 'monospace',
  },
});
