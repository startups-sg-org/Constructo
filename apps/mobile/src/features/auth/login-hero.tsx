import React, { useEffect } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { ConstructoLogo, Icon, IconName, Typography } from '../../components/ui';

const FUNDO_HERO = '#153B36';
const LINHA_GRID = 'rgba(255, 255, 255, 0.06)';
const AMBAR_JANELA = '#F2B544';
const PASSO_GRID = 24;
const ALTURA_HERO = 330;

const ANDARES = 6;
const JANELAS_POR_ANDAR = 3;
// Janelas acesas (andar de baixo para cima, índice da janela) — representa avanço de obra.
const ACESAS = new Set(['0-0', '0-1', '0-2', '1-0', '1-2', '2-1', '2-2', '3-0', '4-1']);

const DIFERENCIAIS: { icone: IconName; titulo: string; detalhe: string }[] = [
  { icone: 'camera', titulo: 'Fotografe', detalhe: 'Evidência com local e marco' },
  { icone: 'shield-check', titulo: 'Homologue', detalhe: 'Laudo com ART do responsável' },
  { icone: 'home', titulo: 'Compartilhe', detalhe: 'O comprador acompanha a obra' },
];

/** Grade milimetrada sutil de projeto (linhas de 1px a 6% de opacidade). */
function GradeTecnica({ largura }: { largura: number }) {
  const colunas = Math.ceil(largura / PASSO_GRID);
  const linhas = Math.ceil(ALTURA_HERO / PASSO_GRID);
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {Array.from({ length: colunas }).map((_, i) => (
        <View key={`v${i}`} style={[styles.linhaV, { left: i * PASSO_GRID }]} />
      ))}
      {Array.from({ length: linhas }).map((_, i) => (
        <View key={`h${i}`} style={[styles.linhaH, { top: i * PASSO_GRID }]} />
      ))}
    </View>
  );
}

/** Andar do edifício que "sobe" em sequência, como uma obra sendo erguida. */
function Andar({ indice }: { indice: number }) {
  const progresso = useSharedValue(0);

  useEffect(() => {
    progresso.value = withDelay(
      500 + indice * 220,
      withTiming(1, { duration: 420, easing: Easing.out(Easing.cubic) })
    );
  }, [indice, progresso]);

  const estilo = useAnimatedStyle(() => ({
    opacity: progresso.value,
    transform: [{ translateY: (1 - progresso.value) * 14 }],
  }));

  return (
    <Animated.View style={[styles.andar, estilo]}>
      {Array.from({ length: JANELAS_POR_ANDAR }).map((_, j) => (
        <View
          key={j}
          style={[
            styles.janela,
            ACESAS.has(`${indice}-${j}`) && styles.janelaAcesa,
          ]}
        />
      ))}
    </Animated.View>
  );
}

function Edificio() {
  return (
    <View style={styles.edificioBox}>
      {/* Grua: mastro, lança e cabo (estáticos, sem balanço) */}
      <View style={styles.gruaMastro} />
      <View style={styles.gruaLanca} />
      <View style={styles.gruaCabo} />
      <View style={styles.gruaCarga} />

      <View style={styles.edificio}>
        {Array.from({ length: ANDARES }).map((_, i) => (
          // Renderiza de cima para baixo, mas anima de baixo para cima.
          <Andar key={i} indice={ANDARES - 1 - i} />
        ))}
      </View>
      <View style={styles.solo} />
    </View>
  );
}

export function LoginHero() {
  const { width } = useWindowDimensions();

  return (
    <View style={styles.hero}>
      <GradeTecnica largura={width} />

      <Animated.View entering={FadeInDown.duration(420)} style={styles.topo}>
        <ConstructoLogo size="md" inverted />
        <View style={styles.versao}>
          <Typography variant="label" color="inverted" style={styles.versaoTexto}>
            v1.0.0
          </Typography>
        </View>
      </Animated.View>

      <View style={styles.centro}>
        <Animated.View
          entering={FadeInDown.delay(120).duration(460)}
          style={styles.textos}
        >
          <Typography variant="label" color="inverted" style={styles.eyebrow}>
            Gestão de obras & transparência
          </Typography>
          <Typography variant="titleLarge" color="inverted" style={styles.titulo}>
            Cada etapa da obra, comprovada.
          </Typography>
          <Typography variant="body" color="inverted" style={styles.descricao}>
            Foto, local e responsável técnico em cada registro. O comprador acompanha o avanço do próprio imóvel.
          </Typography>
        </Animated.View>

        <Edificio />
      </View>

      <View style={styles.passos}>
        {DIFERENCIAIS.map((item, i) => (
          <Animated.View
            key={item.titulo}
            entering={FadeInDown.delay(700 + i * 110).duration(420)}
            style={styles.passo}
          >
            <View style={styles.passoIcone}>
              <Icon name={item.icone} size={15} color={AMBAR_JANELA} />
            </View>
            <Typography variant="bodyStrong" color="inverted" numberOfLines={1} style={styles.passoTitulo}>
              {item.titulo}
            </Typography>
            <Typography variant="caption" color="inverted" numberOfLines={2} style={styles.passoDetalhe}>
              {item.detalhe}
            </Typography>
          </Animated.View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: FUNDO_HERO,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 56,
    gap: 18,
    overflow: 'hidden',
  },
  linhaV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    backgroundColor: LINHA_GRID,
  },
  linhaH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: LINHA_GRID,
  },
  topo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  versao: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  versaoTexto: {
    fontSize: 10,
    letterSpacing: 0.8,
    opacity: 0.85,
  },
  centro: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  textos: {
    flex: 1,
    gap: 10,
    paddingBottom: 6,
  },
  eyebrow: {
    color: AMBAR_JANELA,
  },
  titulo: {
    fontSize: 27,
    lineHeight: 33,
    letterSpacing: -0.6,
    fontWeight: '800',
  },
  descricao: {
    fontSize: 13,
    lineHeight: 19,
    opacity: 0.8,
  },
  edificioBox: {
    width: 104,
    alignItems: 'center',
  },
  gruaMastro: {
    position: 'absolute',
    top: -34,
    right: 18,
    width: 3,
    height: 40,
    backgroundColor: AMBAR_JANELA,
  },
  gruaLanca: {
    position: 'absolute',
    top: -34,
    right: -4,
    width: 70,
    height: 3,
    backgroundColor: AMBAR_JANELA,
  },
  gruaCabo: {
    position: 'absolute',
    top: -31,
    right: 0,
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255,255,255,0.6)',
  },
  gruaCarga: {
    position: 'absolute',
    top: -13,
    right: -3,
    width: 7,
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
  edificio: {
    width: 84,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.55)',
    borderBottomWidth: 0,
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 4,
    gap: 4,
  },
  andar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 4,
  },
  janela: {
    width: 16,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 2,
  },
  janelaAcesa: {
    backgroundColor: AMBAR_JANELA,
  },
  solo: {
    width: 104,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.55)',
  },
  passos: {
    flexDirection: 'row',
    gap: 10,
  },
  passo: {
    flex: 1,
    gap: 4,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  passoIcone: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(242,181,68,0.14)',
    marginBottom: 2,
  },
  passoTitulo: {
    fontSize: 13,
  },
  passoDetalhe: {
    fontSize: 11,
    lineHeight: 14,
    opacity: 0.72,
  },
});

export const LOGIN_HERO_COR_FUNDO = FUNDO_HERO;
