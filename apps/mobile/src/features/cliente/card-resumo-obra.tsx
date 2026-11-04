import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Badge, Card, Icon, Typography } from '../../components/ui';
import { ConstructoColors, ConstructoRadius } from '../../constants/theme';
import { ProgressoEmpreendimento } from '../../types/obras';
import { AnimatedNumber } from './animated-number';

export interface CardResumoObraProps {
  nomeObra: string;
  enderecoObra?: string | null;
  unidadeCliente?: string;
  progressoGlobal?: ProgressoEmpreendimento | null;
  totalEvidencias?: number;
  diasEmObra?: number;
  previsaoTermino?: string;
}

const CORES_ETAPAS = ['#D97706', '#059669', '#0284C7', '#7C3AED'];

export function CardResumoObra({
  nomeObra,
  enderecoObra = 'Rua das Acácias, 450 — Araguaína/TO',
  unidadeCliente = 'Bloco A • Unidade 202',
  progressoGlobal,
  totalEvidencias = 5,
  diasEmObra = 214,
  previsaoTermino = 'Nov/2027',
}: CardResumoObraProps) {
  const percentual = progressoGlobal?.percentual ?? 52;
  const etapasResumo = progressoGlobal?.etapas || progressoGlobal?.macroetapas || [];
  const larguraAnimada = useSharedValue(0);
  const brilho = useSharedValue(-1);

  useEffect(() => {
    larguraAnimada.value = withTiming(percentual, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });
    // Reflexo único que percorre a barra ao concluir o preenchimento.
    brilho.value = -1;
    brilho.value = withDelay(
      900,
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) })
    );
  }, [percentual, larguraAnimada, brilho]);

  const barAnimatedStyle = useAnimatedStyle(() => ({
    width: `${Math.min(larguraAnimada.value, 100)}%`,
  }));

  const brilhoStyle = useAnimatedStyle(() => ({
    opacity: brilho.value >= 1 ? 0 : 0.55,
    left: `${(brilho.value + 1) * 50 - 30}%`,
  }));

  return (
    <Card style={styles.card}>
      {/* Linha Superior: Identificação do Imóvel e Percentual Consolidado */}
      <View style={styles.topo}>
        <View style={{ flex: 1, gap: 4 }}>
          <View style={styles.badgesTopo}>
            <Badge
              label={unidadeCliente}
              variant="primariaSuave"
              size="sm"
              iconName="home"
            />
            <Badge
              label="Cronograma em Dia"
              variant="esmeralda"
              size="sm"
              dot
            />
          </View>
          <Typography variant="titleLarge" color="strong" numberOfLines={1}>
            {nomeObra}
          </Typography>
          {enderecoObra ? (
            <View style={styles.enderecoRow}>
              <Icon name="location" size={13} color={ConstructoColors.textoSuave} />
              <Typography variant="caption" color="muted" numberOfLines={1}>
                {enderecoObra}
              </Typography>
            </View>
          ) : null}
        </View>

        <View style={styles.percentualContainer}>
          <Typography variant="label" color="muted">
            AVANÇO GLOBAL
          </Typography>
          <AnimatedNumber
            value={percentual}
            suffix="%"
            duration={1000}
            variant="display"
            color="primary"
            style={styles.numeroPercentual}
          />
        </View>
      </View>

      {/* Trilha da Barra de Progresso Global */}
      <View style={styles.trilhaBarra}>
        <Animated.View style={[styles.preenchimentoBarra, barAnimatedStyle]}>
          <Animated.View style={[styles.brilho, brilhoStyle]} />
        </Animated.View>
      </View>

      {/* Régua de Precisão de Engenharia */}
      <View style={styles.reguaTicks}>
        <View style={styles.tickCol}>
          <View style={styles.tickMarkMajor} />
          <Typography variant="mono" color="muted" style={styles.tickLabel}>0%</Typography>
        </View>
        <View style={styles.tickCol}>
          <View style={styles.tickMarkMinor} />
          <Typography variant="mono" color="muted" style={styles.tickLabel}>25%</Typography>
        </View>
        <View style={styles.tickCol}>
          <View style={styles.tickMarkMajor} />
          <Typography variant="mono" color="muted" style={styles.tickLabel}>50%</Typography>
        </View>
        <View style={styles.tickCol}>
          <View style={styles.tickMarkMinor} />
          <Typography variant="mono" color="muted" style={styles.tickLabel}>75%</Typography>
        </View>
        <View style={[styles.tickCol, { alignItems: 'flex-end' }]}>
          <View style={styles.tickMarkMajor} />
          <Typography variant="mono" color="muted" style={styles.tickLabel}>100%</Typography>
        </View>
      </View>

      {/* Mini Grid das Macroetapas da Obra com Cores Vivas */}
      {etapasResumo.length > 0 ? (
        <View style={styles.etapasMiniGrid}>
          {etapasResumo.slice(0, 4).map((etapa, idx) => {
            const corEtapa = CORES_ETAPAS[idx % CORES_ETAPAS.length];
            return (
              <View key={etapa.etapa_id} style={styles.etapaMiniItem}>
                <View style={styles.etapaMiniHeader}>
                  <Typography variant="caption" color="strong" numberOfLines={1} style={{ flex: 1 }}>
                    {etapa.nome}
                  </Typography>
                  <Typography variant="mono" style={{ color: corEtapa, fontWeight: '700' }}>
                    {etapa.percentual}%
                  </Typography>
                </View>
                <View style={styles.etapaMiniTrack}>
                  <View
                    style={[
                      styles.etapaMiniFill,
                      {
                        width: `${Math.min(100, etapa.percentual)}%`,
                        backgroundColor: corEtapa,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </View>
      ) : null}

      {/* Metadados de Prazo e Execução */}
      <View style={styles.rodape}>
        <View style={styles.metaItem}>
          <Typography variant="label" color="muted">
            EXECUÇÃO
          </Typography>
          <Typography variant="bodyStrong" color="strong" tabular>
            {diasEmObra} dias
          </Typography>
        </View>

        <View style={styles.divisorVertical} />

        <View style={styles.metaItem}>
          <Typography variant="label" color="muted">
            LAUDOS / FOTOS
          </Typography>
          <Typography variant="bodyStrong" color="strong" tabular>
            {totalEvidencias} registros
          </Typography>
        </View>

        <View style={styles.divisorVertical} />

        <View style={styles.metaItem}>
          <Typography variant="label" color="muted">
            ENTREGA PREVISTA
          </Typography>
          <Typography variant="bodyStrong" color="primary" tabular>
            {previsaoTermino}
          </Typography>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: ConstructoColors.superficie,
    borderRadius: ConstructoRadius.card,
    gap: 14,
    marginBottom: 14,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  badgesTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  enderecoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  percentualContainer: {
    alignItems: 'flex-end',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: ConstructoRadius.field,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  numeroPercentual: {
    fontSize: 30,
    fontWeight: '800',
    color: '#059669',
  },
  trilhaBarra: {
    height: 10,
    borderRadius: 5,
    backgroundColor: ConstructoColors.borda,
    overflow: 'hidden',
  },
  preenchimentoBarra: {
    height: '100%',
    backgroundColor: '#059669',
    borderRadius: 5,
    overflow: 'hidden',
  },
  brilho: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '30%',
    backgroundColor: '#FFFFFF',
  },
  reguaTicks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
    marginTop: -4,
    marginBottom: 4,
  },
  tickCol: {
    alignItems: 'flex-start',
    gap: 2,
  },
  tickMarkMajor: {
    width: 1,
    height: 5,
    backgroundColor: ConstructoColors.borda,
  },
  tickMarkMinor: {
    width: 1,
    height: 3,
    backgroundColor: ConstructoColors.bordaSutil,
  },
  tickLabel: {
    fontSize: 9,
    letterSpacing: 0.2,
  },
  etapasMiniGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingTop: 2,
  },
  etapaMiniItem: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: ConstructoColors.superficieSutil,
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
    borderRadius: ConstructoRadius.field,
    padding: 9,
    gap: 5,
  },
  etapaMiniHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
  },
  etapaMiniTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: ConstructoColors.borda,
    overflow: 'hidden',
  },
  etapaMiniFill: {
    height: '100%',
    borderRadius: 2,
  },
  rodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: ConstructoColors.borda,
  },
  metaItem: {
    flex: 1,
    gap: 2,
  },
  divisorVertical: {
    width: 1,
    height: 26,
    backgroundColor: ConstructoColors.borda,
    marginHorizontal: 10,
  },
});
