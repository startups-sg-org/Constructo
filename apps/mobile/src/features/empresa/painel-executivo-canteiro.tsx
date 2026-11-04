import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { Badge, Card, Icon, Typography } from '../../components/ui';
import { ConstructoColors, ConstructoRadius } from '../../constants/theme';
import { AnimatedNumber } from '../cliente/animated-number';
import { Etapa, ProgressoEmpreendimento } from '../../types/obras';

export interface PainelExecutivoCanteiroProps {
  nomeObra?: string;
  avancoGlobal: number;
  marcosConcluidos: number;
  totalMarcos: number;
  evidenciasValidas: number;
  evidenciasPendentes: number;
  etapas?: Etapa[];
  progresso?: ProgressoEmpreendimento | null;
}

const CORES_ETAPAS = ['#059669', '#0284C7', '#D97706', '#7C3AED'];

export function PainelExecutivoCanteiro({
  nomeObra = 'Residencial Parque das Águas',
  avancoGlobal,
  marcosConcluidos,
  totalMarcos,
  evidenciasValidas,
  evidenciasPendentes,
  etapas = [],
  progresso,
}: PainelExecutivoCanteiroProps) {
  const larguraBarra = useSharedValue(0);
  const brilho = useSharedValue(-1);

  useEffect(() => {
    larguraBarra.value = withTiming(avancoGlobal, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });

    brilho.value = -1;
    brilho.value = withDelay(
      850,
      withTiming(1, { duration: 900, easing: Easing.inOut(Easing.quad) })
    );
  }, [avancoGlobal, larguraBarra, brilho]);

  const barAnimatedStyle = useAnimatedStyle(() => ({
    width: `${Math.min(larguraBarra.value, 100)}%`,
  }));

  const brilhoStyle = useAnimatedStyle(() => ({
    opacity: brilho.value >= 1 ? 0 : 0.5,
    left: `${(brilho.value + 1) * 50 - 30}%`,
  }));

  const etapasProgresso = progresso?.etapas || progresso?.macroetapas || [];

  return (
    <View style={styles.container}>
      {/* 1. Master Card Executivo de Avanço Físico Global */}
      <Animated.View entering={FadeInDown.duration(400)}>
        <Card style={styles.masterCard}>
          <View style={styles.masterTopo}>
            <View style={styles.masterTitulos}>
              <View style={styles.statusLinha}>
                <Badge
                  label="Canteiro em Operação"
                  variant="esmeralda"
                  size="sm"
                  dot
                />
                <Badge
                  label="Medição Vigente"
                  variant="primariaSuave"
                  size="sm"
                  iconName="calendar"
                />
              </View>
              <Typography variant="titleLarge" color="strong" numberOfLines={1}>
                {nomeObra}
              </Typography>
              <Typography variant="caption" color="muted">
                Indicador consolidado de medição física e engenharia de campo
              </Typography>
            </View>

            <View style={styles.percentualContainer}>
              <Typography variant="label" color="muted">
                AVANÇO GLOBAL
              </Typography>
              <AnimatedNumber
                value={avancoGlobal}
                duration={1100}
                suffix="%"
                variant="display"
                color="primary"
                style={styles.numeroPercentual}
              />
            </View>
          </View>

          {/* Trilha da Barra de Progresso com Shimmer */}
          <View style={styles.trilhaBarra}>
            <Animated.View style={[styles.preenchimentoBarra, barAnimatedStyle]}>
              <Animated.View style={[styles.brilho, brilhoStyle]} />
            </Animated.View>
          </View>

          {/* Régua Milimetrada de Precisão Industrial */}
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

          {/* Mini-grid de Macroetapas se houver dados */}
          {etapasProgresso.length > 0 ? (
            <View style={styles.etapasMiniGrid}>
              {etapasProgresso.slice(0, 4).map((et, idx) => {
                const cor = CORES_ETAPAS[idx % CORES_ETAPAS.length];
                return (
                  <View key={et.etapa_id || idx} style={styles.etapaMiniCard}>
                    <View style={styles.etapaMiniTopo}>
                      <Typography variant="caption" color="strong" numberOfLines={1} style={{ flex: 1 }}>
                        {et.nome}
                      </Typography>
                      <Typography variant="mono" style={{ color: cor, fontWeight: '700' }}>
                        {et.percentual}%
                      </Typography>
                    </View>
                    <View style={styles.etapaMiniTrilha}>
                      <View
                        style={[
                          styles.etapaMiniPreenchimento,
                          { width: `${Math.min(100, et.percentual)}%`, backgroundColor: cor },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}
        </Card>
      </Animated.View>

      {/* 2. Grid de 4 KPIs Dinâmicos com Animação Numérica */}
      <View style={styles.kpiGrid}>
        <Animated.View entering={FadeInDown.delay(100).duration(380)} style={styles.kpiCol}>
          <Card style={[styles.kpiCard, { borderTopWidth: 3, borderTopColor: '#059669' }]}>
            <View style={styles.kpiTopRow}>
              <Typography variant="label" color="muted">
                AVANÇO FÍSICO
              </Typography>
              <View style={[styles.kpiIconBox, { backgroundColor: '#D1FAE5' }]}>
                <Icon name="chart" size={14} color="#059669" />
              </View>
            </View>
            <AnimatedNumber
              value={avancoGlobal}
              duration={1000}
              suffix="%"
              variant="titleLarge"
              style={{ color: '#059669', fontWeight: '800' }}
            />
            <Typography variant="caption" color="muted">
              Meta física em dia
            </Typography>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).duration(380)} style={styles.kpiCol}>
          <Card style={[styles.kpiCard, { borderTopWidth: 3, borderTopColor: '#0284C7' }]}>
            <View style={styles.kpiTopRow}>
              <Typography variant="label" color="muted">
                MARCOS
              </Typography>
              <View style={[styles.kpiIconBox, { backgroundColor: '#E0F2FE' }]}>
                <Icon name="check-circle" size={14} color="#0284C7" />
              </View>
            </View>
            <View style={styles.numerosDuplos}>
              <AnimatedNumber
                value={marcosConcluidos}
                duration={900}
                variant="titleLarge"
                style={{ color: '#0284C7', fontWeight: '800' }}
              />
              <Typography variant="titleLarge" style={{ color: '#0284C7', fontWeight: '800' }}>
                /{totalMarcos}
              </Typography>
            </View>
            <Typography variant="caption" color="muted">
              Etapas homologadas
            </Typography>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(220).duration(380)} style={styles.kpiCol}>
          <Card style={[styles.kpiCard, { borderTopWidth: 3, borderTopColor: '#7C3AED' }]}>
            <View style={styles.kpiTopRow}>
              <Typography variant="label" color="muted">
                APROVADAS
              </Typography>
              <View style={[styles.kpiIconBox, { backgroundColor: '#EDE9FE' }]}>
                <Icon name="shield-check" size={14} color="#7C3AED" />
              </View>
            </View>
            <AnimatedNumber
              value={evidenciasValidas}
              duration={900}
              variant="titleLarge"
              style={{ color: '#7C3AED', fontWeight: '800' }}
            />
            <Typography variant="caption" color="muted">
              Laudos no feed
            </Typography>
          </Card>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(280).duration(380)} style={styles.kpiCol}>
          <Card style={[styles.kpiCard, { borderTopWidth: 3, borderTopColor: '#EA580C' }]}>
            <View style={styles.kpiTopRow}>
              <Typography variant="label" color="muted">
                EM AUDITORIA
              </Typography>
              <View style={[styles.kpiIconBox, { backgroundColor: '#FFEDD5' }]}>
                <Icon name="clock" size={14} color="#EA580C" />
              </View>
            </View>
            <AnimatedNumber
              value={evidenciasPendentes}
              duration={900}
              variant="titleLarge"
              style={{ color: '#EA580C', fontWeight: '800' }}
            />
            <Typography variant="caption" color="muted">
              {evidenciasPendentes > 0 ? 'Aguardando validação' : 'Tudo conferido'}
            </Typography>
          </Card>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  masterCard: {
    backgroundColor: ConstructoColors.superficie,
    borderRadius: ConstructoRadius.card,
    padding: 16,
    gap: 12,
  },
  masterTopo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  masterTitulos: {
    flex: 1,
    gap: 4,
  },
  statusLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  percentualContainer: {
    alignItems: 'flex-end',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: ConstructoRadius.field,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  numeroPercentual: {
    fontSize: 28,
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
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: ConstructoColors.bordaSutil,
  },
  etapaMiniCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: ConstructoColors.superficieSutil,
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
    borderRadius: ConstructoRadius.field,
    padding: 8,
    gap: 5,
  },
  etapaMiniTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 4,
  },
  etapaMiniTrilha: {
    height: 4,
    borderRadius: 2,
    backgroundColor: ConstructoColors.borda,
    overflow: 'hidden',
  },
  etapaMiniPreenchimento: {
    height: '100%',
    borderRadius: 2,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiCol: {
    width: '48%',
    flexGrow: 1,
  },
  kpiCard: {
    backgroundColor: ConstructoColors.superficie,
    borderRadius: ConstructoRadius.card,
    padding: 12,
    gap: 4,
  },
  kpiTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kpiIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numerosDuplos: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

