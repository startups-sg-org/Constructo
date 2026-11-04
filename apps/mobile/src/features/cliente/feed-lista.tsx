import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeInDown,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import {
  Badge,
  BottomSheet,
  Button,
  Card,
  FeedCardSkeleton,
  Icon,
  Input,
  Typography,
} from '../../components/ui';
import { ConstructoColors, ConstructoRadius, ConstructoShadows } from '../../constants/theme';
import { PostagemFeedSocial } from '../../types/feed';
import { ProgressoEmpreendimento } from '../../types/obras';
import { CardResumoObra } from './card-resumo-obra';
import { EtapaStories } from './etapa-stories';
import { PostFeedCard } from './post-feed-card';
import { ImageLightbox } from './image-lightbox';

const AnimatedFlatList = Animated.createAnimatedComponent(
  FlatList<PostagemFeedSocial>
);

/** Altura aproximada do cabeçalho (resumo + filtros) a partir da qual o mini-indicador aparece. */
const SCROLL_MINI_INDICADOR = 360;

const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 30 };

export interface FeedListaProps {
  posts: PostagemFeedSocial[];
  nomeObra: string;
  enderecoObra?: string | null;
  unidadeCliente?: string;
  progressoGlobal?: ProgressoEmpreendimento | null;
  etapaFiltroInicial?: string | null;
  carregando: boolean;
  onRefresh: () => Promise<void>;
}

export function FeedLista({
  posts,
  nomeObra,
  enderecoObra,
  unidadeCliente,
  progressoGlobal,
  etapaFiltroInicial = null,
  carregando,
  onRefresh,
}: FeedListaProps) {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<{ url: string; caption?: string } | null>(null);
  const [postDetalhe, setPostDetalhe] = useState<PostagemFeedSocial | null>(null);
  const [etapaSelecionada, setEtapaSelecionada] = useState<string>(etapaFiltroInicial || 'TODAS');
  const [busca, setBusca] = useState<string>('');
  const [revelados, setRevelados] = useState<Set<number>>(() => new Set([]));
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler((evento) => {
    scrollY.value = evento.contentOffset.y;
  });

  const aoMudarVisiveis = useCallback(
    ({ viewableItems }: { viewableItems: { item?: PostagemFeedSocial }[] }) => {
      const novos = viewableItems
        .map((v) => v.item?.id)
        .filter((id): id is number => typeof id === 'number');
      if (novos.length === 0) return;
      setRevelados((anterior) => {
        if (novos.every((id) => anterior.has(id))) return anterior;
        const proximo = new Set(anterior);
        novos.forEach((id) => proximo.add(id));
        return proximo;
      });
    },
    []
  );

  const percentualGlobal = progressoGlobal?.percentual ?? 52;

  const miniIndicadorStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      scrollY.value,
      [SCROLL_MINI_INDICADOR, SCROLL_MINI_INDICADOR + 60],
      [0, 1],
      'clamp'
    ),
    transform: [
      {
        translateY: interpolate(
          scrollY.value,
          [SCROLL_MINI_INDICADOR, SCROLL_MINI_INDICADOR + 60],
          [-12, 0],
          'clamp'
        ),
      },
    ],
  }));

  const renderItem = useCallback(
    ({ item, index }: { item: PostagemFeedSocial; index: number }) => (
      <Animated.View
        entering={FadeInDown.delay(Math.min(index, 3) * 70)
          .duration(380)
          .easing(Easing.out(Easing.cubic))}
      >
        <PostFeedCard
          post={item}
          index={index}
          revelado={revelados.has(item.id)}
          onImagePress={(url) =>
            setSelectedImage({ url, caption: `${item.marcoNome} — ${item.legenda}` })
          }
          onDetalhesPress={(p) => setPostDetalhe(p)}
        />
      </Animated.View>
    ),
    [revelados]
  );

  const postsFiltrados = useMemo(() => {
    return posts.filter((post) => {
      const matchEtapa =
        etapaSelecionada === 'TODAS' || post.etapa.nome === etapaSelecionada;
      const termo = busca.trim().toLowerCase();
      const matchBusca =
        !termo ||
        post.legenda.toLowerCase().includes(termo) ||
        post.marcoNome.toLowerCase().includes(termo) ||
        post.localNome.toLowerCase().includes(termo) ||
        post.autorNome.toLowerCase().includes(termo);
      return matchEtapa && matchBusca;
    });
  }, [posts, etapaSelecionada, busca]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  if (carregando && posts.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <FeedCardSkeleton />
        <FeedCardSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <AnimatedFlatList
        data={postsFiltrados}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onViewableItemsChanged={aoMudarVisiveis}
        viewabilityConfig={VIEWABILITY_CONFIG}
        initialNumToRender={3}
        windowSize={7}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={ConstructoColors.primaria}
            colors={[ConstructoColors.primaria]}
          />
        }
        ListHeaderComponent={
          <View style={styles.headerWrapper}>
            <CardResumoObra
              nomeObra={nomeObra}
              enderecoObra={enderecoObra}
              unidadeCliente={unidadeCliente}
              progressoGlobal={progressoGlobal}
              totalEvidencias={posts.length}
            />

            {/* Etapas com foto de capa (filtro rápido) e busca */}
            <View style={styles.filtros}>
              <EtapaStories
                posts={posts}
                selecionada={etapaSelecionada}
                onSelect={setEtapaSelecionada}
              />
              <Input
                leftIcon="search"
                placeholder="Buscar por etapa, laje ou engenheiro..."
                value={busca}
                onChangeText={setBusca}
                rightIcon={busca ? 'close' : undefined}
                onRightIconPress={() => setBusca('')}
              />
            </View>

            <View style={styles.feedSectionTitle}>
              <Typography variant="titleSmall" color="strong">
                Diário Técnico da Minha Obra
              </Typography>
              <Badge
                label={`${postsFiltrados.length} atualizações`}
                variant="neutro"
                size="sm"
              />
            </View>
          </View>
        }

        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Icon name="layers" size={28} color={ConstructoColors.primaria} />
            <Typography variant="titleMedium" color="strong">
              Nenhuma evidência para este filtro
            </Typography>
            <Typography variant="body" color="muted">
              Limpe a busca ou selecione &quot;Todas&quot; para visualizar todos os avanços registrados pela engenharia.
            </Typography>
            {(etapaSelecionada !== 'TODAS' || busca) ? (
              <Button
                label="Limpar Filtros"
                variant="outline"
                size="sm"
                onPress={() => {
                  setEtapaSelecionada('TODAS');
                  setBusca('');
                }}
              />
            ) : null}
          </Card>
        }
        renderItem={renderItem}
      />

      {/* Mini indicador de avanço: surge ao rolar além do cabeçalho */}
      <Animated.View pointerEvents="none" style={[styles.miniIndicador, miniIndicadorStyle]}>
        <Icon name="building" size={14} color="#FFFFFF" />
        <Typography variant="caption" color="inverted" numberOfLines={1} style={styles.miniIndicadorTexto}>
          {unidadeCliente || nomeObra}
        </Typography>
        <View style={styles.miniIndicadorDivisor} />
        <Typography variant="bodyStrong" color="inverted" tabular>
          {percentualGlobal}%
        </Typography>
      </Animated.View>

      {/* Lightbox Imersivo em Tela Cheia */}
      <ImageLightbox
        visible={Boolean(selectedImage)}
        imageUrl={selectedImage?.url || null}
        caption={selectedImage?.caption}
        onClose={() => setSelectedImage(null)}
      />

      {/* Bottom Sheet de Ficha Técnica do Marco */}
      <BottomSheet
        visible={Boolean(postDetalhe)}
        onClose={() => setPostDetalhe(null)}
        title={postDetalhe?.marcoNome || 'Ficha Técnica do Marco'}
        subtitle={`Registro #${postDetalhe?.evidenciaId || ''} • Protocolo de Qualidade Constructo`}
      >
        {postDetalhe ? (
          <View style={styles.sheetDetailBody}>
            <View style={styles.sheetBadgeRow}>
              <Badge
                label={postDetalhe.badge.texto}
                variant="destaque"
                size="md"
                iconName="bolt"
              />
              <Badge
                label="Protocolo Cumprido"
                variant="sucesso"
                size="md"
                iconName="check-circle"
              />
            </View>

            <Card subtle padding={14} style={{ gap: 10 }}>
              <View style={styles.sheetMetaRow}>
                <Typography variant="label" color="muted">
                  MACROETAPA
                </Typography>
                <Typography variant="bodyStrong" color="strong">
                  {postDetalhe.etapa.nome}
                </Typography>
              </View>
              <View style={styles.sheetMetaRow}>
                <Typography variant="label" color="muted">
                  LOCALIZAÇÃO FÍSICA
                </Typography>
                <Typography variant="bodyStrong" color="strong">
                  {postDetalhe.localNome}
                </Typography>
              </View>
              <View style={styles.sheetMetaRow}>
                <Typography variant="label" color="muted">
                  ENGENHEIRO RESPONSÁVEL
                </Typography>
                <Typography variant="bodyStrong" color="primary">
                  {postDetalhe.autorNome} ({postDetalhe.autorCrea})
                </Typography>
              </View>
              <View style={styles.sheetMetaRow}>
                <Typography variant="label" color="muted">
                  PROGRESSO ACUMULADO APÓS ENTREGA
                </Typography>
                <Typography variant="mono" color="strong">
                  {postDetalhe.impactoProgresso.progressoAnterior}% → {postDetalhe.impactoProgresso.progressoAcumuladoAteAqui}%
                </Typography>
              </View>
            </Card>

            <View style={{ gap: 6 }}>
              <Typography variant="label" color="muted">
                PARECER TÉCNICO DA VISTORIA
              </Typography>
              <Typography variant="body" color="default">
                {postDetalhe.legenda}
              </Typography>
            </View>

            <View style={{ gap: 6 }}>
              <Typography variant="label" color="muted">
                CHECKLIST DE AUDITORIA ATENDIDO
              </Typography>
              <Card subtle padding={12} style={{ gap: 8 }}>
                <View style={styles.checkItemRow}>
                  <Icon name="check-circle" size={15} color={ConstructoColors.sucesso} />
                  <Typography variant="caption" color="strong">
                    Conformidade geométrica e locação conferida em projeto executivo
                  </Typography>
                </View>
                <View style={styles.checkItemRow}>
                  <Icon name="check-circle" size={15} color={ConstructoColors.sucesso} />
                  <Typography variant="caption" color="strong">
                    Registro fotográfico georreferenciado e validado pela supervisão
                  </Typography>
                </View>
              </Card>
            </View>

            <Button
              label="Fechar Ficha Técnica"
              variant="primary"
              size="md"
              fullWidth
              onPress={() => setPostDetalhe(null)}
            />
          </View>
        ) : null}
      </BottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  miniIndicador: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    maxWidth: '88%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: ConstructoRadius.full,
    backgroundColor: ConstructoColors.primaria,
    ...ConstructoShadows.card,
  },
  miniIndicadorTexto: {
    flexShrink: 1,
    fontWeight: '600',
  },
  miniIndicadorDivisor: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  filtros: {
    gap: 12,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    padding: 16,
  },
  headerWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  feedSectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  emptyCard: {
    gap: 10,
    alignItems: 'flex-start',
    paddingVertical: 24,
    marginTop: 8,
  },
  sheetDetailBody: {
    gap: 14,
    paddingBottom: 12,
  },
  sheetBadgeRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  sheetMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  checkItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
