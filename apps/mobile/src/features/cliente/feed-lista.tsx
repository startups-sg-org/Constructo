import React, { useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
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
import { ConstructoColors } from '../../constants/theme';
import { PostagemFeedSocial } from '../../types/feed';
import { ProgressoEmpreendimento } from '../../types/obras';
import { CardResumoObra } from './card-resumo-obra';
import { PostFeedCard } from './post-feed-card';
import { ImageLightbox } from './image-lightbox';

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

  const etapasUnicas = useMemo(() => {
    const nomes = Array.from(new Set(posts.map((p) => p.etapa.nome)));
    return ['TODAS', ...nomes];
  }, [posts]);

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
    <>
      <FlatList
        data={postsFiltrados}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
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

            {/* Barra de Busca e Filtro por Etapa */}
            <Card padding={12} style={styles.filterCard}>
              <Input
                leftIcon="search"
                placeholder="Buscar por etapa, unidade, laje ou engenheiro..."
                value={busca}
                onChangeText={setBusca}
                rightIcon={busca ? 'close' : undefined}
                onRightIconPress={() => setBusca('')}
              />

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.pillsRow}
              >
                {etapasUnicas.map((nomeEtapa) => {
                  const ativo = etapaSelecionada === nomeEtapa;
                  return (
                    <Button
                      key={nomeEtapa}
                      label={nomeEtapa === 'TODAS' ? `Todas (${posts.length})` : nomeEtapa}
                      variant={ativo ? 'primary' : 'secondary'}
                      size="sm"
                      onPress={() => setEtapaSelecionada(nomeEtapa)}
                    />
                  );
                })}
              </ScrollView>
            </Card>

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
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(index * 45).springify().damping(16)}
          >
            <PostFeedCard
              post={item}
              index={index}
              onImagePress={(url) =>
                setSelectedImage({ url, caption: `${item.marcoNome} — ${item.legenda}` })
              }
              onDetalhesPress={(p) => setPostDetalhe(p)}
            />
          </Animated.View>
        )}
      />

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
    </>
  );
}

const styles = StyleSheet.create({
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
  filterCard: {
    gap: 10,
  },
  pillsRow: {
    gap: 8,
    paddingTop: 2,
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
