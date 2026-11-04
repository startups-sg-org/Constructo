import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Badge, Card, Icon, StampChancela, Typography } from '../../components/ui';
import { ConstructoColors, ConstructoRadius } from '../../constants/theme';
import { PostagemFeedSocial } from '../../types/feed';
import { AnimatedNumber } from './animated-number';

export interface PostFeedCardProps {
  post: PostagemFeedSocial;
  onImagePress: (url: string) => void;
  onDetalhesPress?: (post: PostagemFeedSocial) => void;
  index: number;
  /** Vira true quando o card entra na área visível; dispara as animações de entrada. */
  revelado?: boolean;
}

const JANELA_DUPLO_TOQUE_MS = 260;
const EASE_OUT = Easing.out(Easing.cubic);

export function PostFeedCard({
  post,
  onImagePress,
  onDetalhesPress,
  revelado = true,
}: PostFeedCardProps) {
  const progressoAlvo = post.impactoProgresso.progressoAcumuladoAteAqui;
  const progressoAnterior = Math.max(
    0,
    post.impactoProgresso.progressoAnterior ??
      progressoAlvo - post.impactoProgresso.deltaPercentual
  );
  const delta = Math.max(0, progressoAlvo - progressoAnterior);

  const [conferido, setConferido] = useState(false);
  const [legendaAberta, setLegendaAberta] = useState(false);
  const [detalhesAbertos, setDetalhesAbertos] = useState(false);

  // --- Animações de entrada (disparadas quando o card fica visível) ---
  const baseBarra = useSharedValue(0);
  const deltaBarra = useSharedValue(0);
  const badgeEntrada = useSharedValue(0);

  useEffect(() => {
    if (!revelado) return;
    baseBarra.value = withTiming(progressoAnterior, { duration: 650, easing: EASE_OUT });
    deltaBarra.value = withDelay(
      450,
      withTiming(delta, { duration: 700, easing: EASE_OUT })
    );
    badgeEntrada.value = withDelay(250, withTiming(1, { duration: 380, easing: EASE_OUT }));
  }, [revelado, progressoAnterior, delta, baseBarra, deltaBarra, badgeEntrada]);

  const baseStyle = useAnimatedStyle(() => ({
    width: `${Math.min(baseBarra.value, 100)}%`,
  }));
  const deltaStyle = useAnimatedStyle(() => ({
    left: `${Math.min(progressoAnterior, 100)}%`,
    width: `${Math.min(deltaBarra.value, 100 - progressoAnterior)}%`,
  }));
  const badgeStyle = useAnimatedStyle(() => ({
    opacity: badgeEntrada.value,
    transform: [{ translateY: (1 - badgeEntrada.value) * -8 }],
  }));

  // --- Foto: toque simples abre o lightbox, duplo toque confere (estilo "curtir") ---
  const escalaFoto = useSharedValue(1);
  const selo = useSharedValue(0);
  const ultimoToque = useRef(0);
  const timerToque = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerToque.current) clearTimeout(timerToque.current);
    };
  }, []);

  const mostrarSelo = useCallback(() => {
    selo.value = withSequence(
      withTiming(1, { duration: 180, easing: EASE_OUT }),
      withDelay(420, withTiming(0, { duration: 260 }))
    );
  }, [selo]);

  const alternarConferido = useCallback(
    (forcarConferir = false) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setConferido((atual) => (forcarConferir ? true : !atual));
    },
    []
  );

  const aoTocarFoto = () => {
    const agora = Date.now();
    if (agora - ultimoToque.current < JANELA_DUPLO_TOQUE_MS) {
      ultimoToque.current = 0;
      if (timerToque.current) clearTimeout(timerToque.current);
      alternarConferido(true);
      mostrarSelo();
      return;
    }
    ultimoToque.current = agora;
    timerToque.current = setTimeout(() => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onImagePress(post.imagemUrl);
    }, JANELA_DUPLO_TOQUE_MS);
  };

  const fotoStyle = useAnimatedStyle(() => ({
    transform: [{ scale: escalaFoto.value }],
  }));
  const seloStyle = useAnimatedStyle(() => ({
    opacity: selo.value,
    transform: [{ scale: 0.7 + selo.value * 0.3 }],
  }));

  // --- Botão "Conferir" com micro-pop ---
  const popConferir = useSharedValue(1);
  const aoConferir = () => {
    alternarConferido();
    popConferir.value = withSequence(
      withTiming(1.12, { duration: 110 }),
      withTiming(1, { duration: 160 })
    );
  };
  const conferirStyle = useAnimatedStyle(() => ({
    transform: [{ scale: popConferir.value }],
  }));

  // --- Chevron dos detalhes ---
  const giroChevron = useSharedValue(0);
  useEffect(() => {
    giroChevron.value = withTiming(detalhesAbertos ? 1 : 0, { duration: 200 });
  }, [detalhesAbertos, giroChevron]);
  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${giroChevron.value * 180}deg` }],
  }));

  const iniciais = post.autorNome
    .replace(/^Eng\.\s*/i, '')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  const homologado = post.statusValidacao === 'VALIDA';
  const legendaLonga = post.legenda.length > 130;

  return (
    <Card padding={0} style={styles.card}>
      {/* Cabeçalho do autor */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Typography variant="bodyStrong" color="primary">
            {iniciais || 'EN'}
          </Typography>
        </View>
        <View style={styles.autorInfo}>
          <View style={styles.autorLinha}>
            <Typography variant="bodyStrong" color="strong" numberOfLines={1} style={styles.autorNome}>
              {post.autorNome}
            </Typography>
            <Icon name="shield-check" size={14} color={ConstructoColors.primaria} />
          </View>
          <Typography variant="caption" color="muted" numberOfLines={1}>
            {post.autorCrea || post.autorCargo} • {post.dataExibicao}
          </Typography>
        </View>
        <Badge label={post.etapa.nome} variant="primariaSuave" size="sm" />
      </View>

      {/* Foto hero com selo de impacto e legenda sobreposta */}
      <Pressable
        onPress={aoTocarFoto}
        onPressIn={() => {
          escalaFoto.value = withTiming(0.985, { duration: 120 });
        }}
        onPressOut={() => {
          escalaFoto.value = withTiming(1, { duration: 180 });
        }}
        accessibilityRole="imagebutton"
        accessibilityLabel={`Foto de ${post.marcoNome}. Toque para ampliar, toque duplo para conferir.`}
      >
        <Animated.View style={[styles.fotoContainer, fotoStyle]}>
          <Image
            source={{ uri: post.imagemUrl }}
            style={styles.foto}
            contentFit="cover"
            transition={300}
          />

          <Animated.View style={[styles.badgeImpacto, badgeStyle]}>
            <Badge
              label={post.badge.texto}
              variant={post.badge.variante === 'destaque' ? 'destaque' : 'primaria'}
              size="md"
              iconName="bolt"
            />
          </Animated.View>

          <View style={styles.faixaInferior}>
            <View style={styles.faixaTextos}>
              <Typography variant="titleSmall" color="inverted" numberOfLines={2}>
                {post.marcoNome || `Avanço em ${post.etapa.nome}`}
              </Typography>
              <View style={styles.faixaLocal}>
                <Icon name="location" size={12} color="#FFFFFF" />
                <Typography variant="caption" color="inverted" numberOfLines={1} style={styles.faixaLocalTexto}>
                  {post.localNome || 'Canteiro central'}
                </Typography>
              </View>
            </View>
            <View style={[styles.statusPill, homologado ? styles.statusOk : styles.statusPendente]}>
              <Icon
                name={homologado ? 'check-circle' : 'clock'}
                size={12}
                color="#FFFFFF"
              />
              <Typography variant="caption" color="inverted" style={styles.statusTexto}>
                {homologado ? 'Homologada' : 'Em auditoria'}
              </Typography>
            </View>
          </View>

          {/* Selo de confirmação por duplo toque */}
          <Animated.View pointerEvents="none" style={[styles.seloCentro, seloStyle]}>
            <Icon name="check" size={34} color="#FFFFFF" />
          </Animated.View>
        </Animated.View>
      </Pressable>

      {/* Ações */}
      <View style={styles.acoes}>
        <Pressable onPress={aoConferir} accessibilityRole="button" accessibilityState={{ selected: conferido }}>
          <Animated.View
            style={[styles.botaoAcao, conferido && styles.botaoAcaoAtivo, conferirStyle]}
          >
            <Icon
              name={conferido ? 'check-circle' : 'check'}
              size={16}
              color={conferido ? '#FFFFFF' : ConstructoColors.primaria}
            />
            <Typography
              variant="bodyStrong"
              color={conferido ? 'inverted' : 'primary'}
            >
              {conferido ? 'Conferido' : 'Conferir avanço'}
            </Typography>
          </Animated.View>
        </Pressable>

        {onDetalhesPress ? (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onDetalhesPress(post);
            }}
            accessibilityRole="button"
            style={({ pressed }) => [styles.botaoAcao, pressed && styles.botaoPressionado]}
          >
            <Icon name="document" size={16} color={ConstructoColors.textoForte} />
            <Typography variant="bodyStrong" color="strong">
              Ficha técnica
            </Typography>
          </Pressable>
        ) : null}
      </View>

      {/* Progresso com destaque do avanço deste registro */}
      <View style={styles.progressoBloco}>
        <View style={styles.progressoTopo}>
          <Typography variant="label" color="muted">
            Avanço da obra
          </Typography>
          <View style={styles.progressoNumeros}>
            <Typography variant="caption" color="muted" tabular>
              {Math.round(progressoAnterior)}% →
            </Typography>
            <AnimatedNumber
              value={progressoAlvo}
              from={progressoAnterior}
              active={revelado}
              delay={450}
              suffix="%"
              variant="titleSmall"
              color="primary"
            />
          </View>
        </View>
        <View style={styles.trilha}>
          <Animated.View style={[styles.preenchimentoBase, baseStyle]} />
          <Animated.View style={[styles.preenchimentoDelta, deltaStyle]} />
        </View>
        {delta > 0 ? (
          <View style={styles.legendaBarra}>
            <View style={[styles.legendaPonto, { backgroundColor: ConstructoColors.sucesso }]} />
            <Typography variant="caption" color="muted">Antes</Typography>
            <View style={[styles.legendaPonto, { backgroundColor: ConstructoColors.destaque }]} />
            <Typography variant="caption" color="muted" tabular>
              +{delta.toFixed(1)} p.p. neste registro
            </Typography>
          </View>
        ) : null}
      </View>

      {/* Texto */}
      <View style={styles.corpoTexto}>
        <Typography variant="body" color="default" numberOfLines={legendaAberta ? undefined : 3}>
          {post.legenda}
        </Typography>
        {legendaLonga ? (
          <Pressable onPress={() => setLegendaAberta((v) => !v)} hitSlop={8}>
            <Typography variant="bodyStrong" color="primary">
              {legendaAberta ? 'Ler menos' : 'Ler mais'}
            </Typography>
          </Pressable>
        ) : null}
      </View>

      {/* Detalhes técnicos recolhíveis */}
      <Pressable
        onPress={() => {
          Haptics.selectionAsync();
          setDetalhesAbertos((v) => !v);
        }}
        style={styles.detalhesToggle}
        accessibilityRole="button"
        accessibilityState={{ expanded: detalhesAbertos }}
      >
        <Typography variant="label" color="muted">
          Dados técnicos da vistoria
        </Typography>
        <Animated.View style={chevronStyle}>
          <Icon name="chevron-down" size={16} color={ConstructoColors.textoSuave} />
        </Animated.View>
      </Pressable>

      {detalhesAbertos ? (
        <Animated.View
          entering={FadeIn.duration(220)}
          exiting={FadeOut.duration(140)}
          style={styles.detalhes}
        >
          <View style={styles.proximoPasso}>
            <View style={styles.proximoPassoTopo}>
              <Icon name="arrow-up-right" size={14} color={ConstructoColors.primaria} />
              <Typography variant="label" color="primary">
                Próxima frente de serviço
              </Typography>
            </View>
            <Typography variant="caption" color="default">
              {post.proximoPasso ||
                'A equipe de engenharia dará sequência à etapa seguinte conforme o cronograma executivo.'}
            </Typography>
          </View>

          <StampChancela
            status={homologado ? 'HOMOLOGADO' : 'PENDENTE'}
            codigoArt={`ART-2026/${post.id * 137 + 3200}`}
            responsavelTecnico={post.autorNome}
            registroCrea={post.autorCrea || 'CREA-SP 5062491-D'}
            dataHora={`${post.dataExibicao} • CANTEIRO CENTRAL`}
            coordenadasGps="-23.5874, -46.6812"
            compact
          />
        </Animated.View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: 'hidden',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: ConstructoRadius.field,
    backgroundColor: ConstructoColors.primariaSuave,
    borderWidth: 1,
    borderColor: ConstructoColors.bordaFoco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autorInfo: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  autorLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  autorNome: {
    flexShrink: 1,
  },
  fotoContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: ConstructoColors.fundoPainel,
  },
  foto: {
    width: '100%',
    height: '100%',
  },
  badgeImpacto: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  faixaInferior: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: 'rgba(11, 26, 23, 0.68)',
  },
  faixaTextos: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  faixaLocal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  faixaLocalTexto: {
    flexShrink: 1,
    opacity: 0.9,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: ConstructoRadius.full,
  },
  statusOk: {
    backgroundColor: ConstructoColors.sucesso,
  },
  statusPendente: {
    backgroundColor: ConstructoColors.laranjaObra,
  },
  statusTexto: {
    fontWeight: '700',
    fontSize: 11,
  },
  seloCentro: {
    position: 'absolute',
    alignSelf: 'center',
    top: '50%',
    marginTop: -42,
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(35, 101, 87, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acoes: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  botaoAcao: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 14,
    height: 40,
    borderRadius: ConstructoRadius.field,
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
    backgroundColor: ConstructoColors.superficieSutil,
  },
  botaoAcaoAtivo: {
    backgroundColor: ConstructoColors.primaria,
    borderColor: ConstructoColors.primaria,
  },
  botaoPressionado: {
    backgroundColor: ConstructoColors.superficiePressionada,
  },
  progressoBloco: {
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 16,
  },
  progressoTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressoNumeros: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trilha: {
    height: 8,
    borderRadius: 4,
    backgroundColor: ConstructoColors.borda,
    overflow: 'hidden',
  },
  preenchimentoBase: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: ConstructoColors.sucesso,
  },
  preenchimentoDelta: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    backgroundColor: ConstructoColors.destaque,
  },
  legendaBarra: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendaPonto: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  corpoTexto: {
    gap: 6,
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  detalhesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingHorizontal: 14,
    height: 44,
    borderTopWidth: 1,
    borderTopColor: ConstructoColors.borda,
  },
  detalhes: {
    gap: 12,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  proximoPasso: {
    backgroundColor: ConstructoColors.azulSuave,
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: ConstructoRadius.field,
    padding: 12,
    gap: 4,
  },
  proximoPassoTopo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
});
