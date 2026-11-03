import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Badge,
  BottomSheet,
  BottomTabBar,
  Button,
  Card,
  ConstructoLogo,
  Icon,
  StampChancela,
  Typography,
} from '../components/ui';
import { ConstructoColors, ConstructoRadius } from '../constants/theme';
import { useAuth } from '../context/auth-context';
import {
  Empreendimento,
  Etapa,
  Marco,
  ProgressoEmpreendimento,
} from '../types/obras';
import { PostagemFeedSocial } from '../types/feed';
import { obrasService } from '../services/obras.service';
import { evidenciasService } from '../services/evidencias.service';
import { projetarEvidenciasParaFeed } from '../features/feed/feed.adapter';
import { FeedLista } from '../features/cliente/feed-lista';

type AbaCliente = 'feed' | 'cronograma' | 'unidade';

const UNIDADES_COMPRADOR = [
  { id: '202', rotulo: 'Bloco A • Unidade 202', pavimento: '2º Pavimento', area: '78,40 m²' },
  { id: '201', rotulo: 'Bloco A • Unidade 201', pavimento: '2º Pavimento', area: '78,40 m²' },
];

export default function ClienteScreen() {
  const router = useRouter();
  const { usuario, logout } = useAuth();

  const [abaAtiva, setAbaAtiva] = useState<AbaCliente>('feed');
  const [obra, setObra] = useState<Empreendimento | null>(null);
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [marcos, setMarcos] = useState<Marco[]>([]);
  const [progresso, setProgresso] = useState<ProgressoEmpreendimento | null>(null);
  const [postsFeed, setPostsFeed] = useState<PostagemFeedSocial[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);

  const [unidadeSelecionada, setUnidadeSelecionada] = useState(UNIDADES_COMPRADOR[0]);
  const [modalUnidadeAberto, setModalUnidadeAberto] = useState(false);
  const [notifWhatsapp, setNotifWhatsapp] = useState(true);
  const [notifEmail, setNotifEmail] = useState(true);

  const isGestorPreview =
    usuario?.papel === 'GESTOR' || usuario?.papel === 'ADMIN';

  const carregarFeedCompleto = async () => {
    try {
      setCarregando(true);
      const listaObras = await obrasService.listarEmpreendimentos();
      if (listaObras.length === 0) return;

      const obraAtiva = listaObras[0];
      setObra(obraAtiva);

      const [etapasData, evidencias, progressoData] = await Promise.all([
        obrasService.listarEtapas(obraAtiva.id),
        evidenciasService.listarEvidencias(obraAtiva.id),
        obrasService.obterProgresso(obraAtiva.id).catch(() => null),
      ]);

      setEtapas(etapasData);
      setProgresso(progressoData);

      const marcosPromises = etapasData.map((e) =>
        obrasService.listarMarcos(obraAtiva.id, e.id).catch(() => [])
      );
      const marcosResultados = await Promise.all(marcosPromises);
      const todosMarcos = marcosResultados.flat();
      setMarcos(todosMarcos);

      const feedSocial = projetarEvidenciasParaFeed(
        evidencias,
        etapasData,
        todosMarcos,
        progressoData
      );

      setPostsFeed(feedSocial);
    } catch (erro) {
      console.warn('[ClienteScreen] Erro ao carregar feed social da obra:', erro);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarFeedCompleto();
  }, []);

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Banner de Modo Preview caso o usuário logado seja Gestor ou Admin */}
      {isGestorPreview ? (
        <View style={styles.previewBanner}>
          <View style={styles.previewBannerLeft}>
            <Icon name="eye" size={14} color="#FFFFFF" />
            <Typography variant="caption" color="inverted">
              Modo Preview • Visão do Comprador
            </Typography>
          </View>
          <Button
            label="Voltar para Engenharia"
            iconName="switch-role"
            variant="secondary"
            size="sm"
            onPress={() => router.replace('/empresa')}
          />
        </View>
      ) : null}

      {/* Barra Superior Corporativa */}
      <View style={styles.topBar}>
        <ConstructoLogo
          size="sm"
          subtitle={`PORTAL DO PROPRIETÁRIO • ${usuario?.nome?.toUpperCase() || 'CLIENTE'}`}
        />

        <View style={styles.topActions}>
          <Button
            label={unidadeSelecionada.rotulo}
            iconName="home"
            rightIconName="chevron-down"
            variant="secondary"
            size="sm"
            onPress={() => setModalUnidadeAberto(true)}
          />
          <Button
            label="Sair"
            iconName="logout"
            variant="ghost"
            size="sm"
            onPress={handleLogout}
          />
        </View>
      </View>

      {/* Conteúdo Dinâmico das 3 Abas */}
      <View style={{ flex: 1 }}>
        {abaAtiva === 'feed' ? (
          <FeedLista
            posts={postsFeed}
            nomeObra={obra?.nome || 'Parque das Águas'}
            enderecoObra={obra?.endereco}
            unidadeCliente={unidadeSelecionada.rotulo}
            progressoGlobal={progresso}
            carregando={carregando}
            onRefresh={carregarFeedCompleto}
          />
        ) : null}

        {abaAtiva === 'cronograma' ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.tabScrollContent}
          >
            <Card style={styles.cronogramaHeroCard}>
              <View style={styles.cronogramaHeaderRow}>
                <View style={{ flex: 1, gap: 3 }}>
                  <Typography variant="label" color="primary">
                    CRONOGRAMA FÍSICO DA OBRA
                  </Typography>
                  <Typography variant="titleLarge" color="strong">
                    {obra?.nome || 'Parque das Águas'}
                  </Typography>
                  <Typography variant="caption" color="muted">
                    Acompanhe a evolução detalhada de cada macroetapa e marco construtivo auditado pela engenharia.
                  </Typography>
                </View>
                <Badge
                  label={`${progresso?.percentual ?? 52}% concluído`}
                  variant="primaria"
                  size="md"
                />
              </View>
            </Card>

            {etapas.map((etapa, idx) => {
              const progEtapa = (progresso?.etapas || []).find(
                (p) => p.etapa_id === etapa.id
              );
              const perc = progEtapa?.percentual ?? 0;
              const marcosDaEtapa = marcos.filter((m) => m.etapa_id === etapa.id);
              const fotosDaEtapa = postsFeed.filter(
                (p) => p.etapa.id === etapa.id || p.etapa.nome === etapa.nome
              ).length;

              return (
                <Card key={etapa.id} style={styles.etapaCard}>
                  <View style={styles.etapaTopRow}>
                    <View style={styles.etapaOrderBadge}>
                      <Typography variant="mono" color="primary">
                        0{idx + 1}
                      </Typography>
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <Typography variant="titleMedium" color="strong">
                        {etapa.nome}
                      </Typography>
                      <Typography variant="caption" color="muted">
                        {etapa.descricao_cliente || etapa.descricao_tecnica}
                      </Typography>
                    </View>
                    <Badge
                      label={`${perc}%`}
                      variant={
                        perc >= 100
                          ? 'sucesso'
                          : perc > 0
                            ? 'primariaSuave'
                            : 'neutro'
                      }
                      size="md"
                    />
                  </View>

                  <View style={styles.etapaProgressTrack}>
                    <View
                      style={[
                        styles.etapaProgressFill,
                        {
                          width: `${Math.min(100, perc)}%`,
                          backgroundColor:
                            perc >= 100
                              ? ConstructoColors.sucesso
                              : ConstructoColors.primaria,
                        },
                      ]}
                    />
                  </View>

                  {/* Lista de Marcos Construtivos da Etapa */}
                  <View style={styles.marcosList}>
                    {marcosDaEtapa.map((marco) => {
                      const st = marco.status || (perc >= 100 ? 'CONCLUIDO' : perc > 0 ? 'EM_ANDAMENTO' : 'NAO_INICIADO');
                      return (
                        <View key={marco.id} style={styles.marcoRow}>
                          <Icon
                            name={
                              st === 'CONCLUIDO'
                                ? 'check-circle'
                                : st === 'EM_ANDAMENTO'
                                  ? 'clock'
                                  : 'layers'
                            }
                            size={16}
                            color={
                              st === 'CONCLUIDO'
                                ? ConstructoColors.sucesso
                                : st === 'EM_ANDAMENTO'
                                  ? ConstructoColors.destaque
                                  : ConstructoColors.textoSuave
                            }
                          />
                          <View style={{ flex: 1, gap: 1 }}>
                            <Typography variant="bodyStrong" color="strong">
                              {marco.nome}
                            </Typography>
                            {marco.descricao_cliente ? (
                              <Typography variant="caption" color="muted">
                                {marco.descricao_cliente}
                              </Typography>
                            ) : null}
                          </View>
                          <Badge
                            label={
                              st === 'CONCLUIDO'
                                ? 'Concluído'
                                : st === 'EM_ANDAMENTO'
                                  ? 'Em Execução'
                                  : 'Previsto'
                            }
                            variant={
                              st === 'CONCLUIDO'
                                ? 'sucesso'
                                : st === 'EM_ANDAMENTO'
                                  ? 'destaqueSuave'
                                  : 'neutro'
                            }
                            size="sm"
                          />
                        </View>
                      );
                    })}
                  </View>

                  <View style={styles.etapaFooterRow}>
                    <Typography variant="caption" color="muted">
                      {fotosDaEtapa} evidência(s) fotográfica(s) publicada(s)
                    </Typography>
                    <Button
                      label="Ver no Feed"
                      iconName="feed"
                      variant="ghost"
                      size="sm"
                      onPress={() => setAbaAtiva('feed')}
                    />
                  </View>
                </Card>
              );
            })}
          </ScrollView>
        ) : null}

        {abaAtiva === 'unidade' ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.tabScrollContent}
          >
            {/* Card Principal da Unidade */}
            <Card style={styles.unidadeHeroCard}>
              <View style={styles.unidadeHeaderRow}>
                <View style={styles.unidadeIconBox}>
                  <Icon name="home" size={22} color={ConstructoColors.primaria} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Badge label="CONTRATO ATIVO & ADIMPLENTE" variant="sucesso" size="sm" dot />
                  <Typography variant="titleLarge" color="strong">
                    {unidadeSelecionada.rotulo}
                  </Typography>
                  <Typography variant="caption" color="muted">
                    {obra?.nome || 'Parque das Águas'} • {unidadeSelecionada.pavimento}
                  </Typography>
                </View>
              </View>

              <View style={styles.specsGrid}>
                <View style={styles.specBox}>
                  <Typography variant="label" color="muted">
                    ÁREA PRIVATIVA
                  </Typography>
                  <Typography variant="titleSmall" color="strong" tabular>
                    {unidadeSelecionada.area}
                  </Typography>
                </View>
                <View style={styles.specBox}>
                  <Typography variant="label" color="muted">
                    TIPOLOGIA
                  </Typography>
                  <Typography variant="titleSmall" color="strong">
                    3 Quartos (1 Suíte)
                  </Typography>
                </View>
                <View style={styles.specBox}>
                  <Typography variant="label" color="muted">
                    GARAGEM
                  </Typography>
                  <Typography variant="titleSmall" color="strong">
                    2 Vagas Cobertas
                  </Typography>
                </View>
                <View style={styles.specBox}>
                  <Typography variant="label" color="muted">
                    CHAVES PREVISTAS
                  </Typography>
                  <Typography variant="titleSmall" color="primary">
                    Nov/2027
                  </Typography>
                </View>
              </View>
            </Card>

            {/* Responsabilidade Técnica & Chancela do Empreendimento */}
            <View style={{ gap: 8 }}>
              <Typography variant="label" color="muted">
                RESPONSABILIDADE TÉCNICA & CERTIDÃO DA OBRA
              </Typography>
              <StampChancela
                status="HOMOLOGADO"
                codigoArt="ART-2026/0948120"
                responsavelTecnico="Eng. Rafael Nogueira"
                registroCrea="CREA-TO 506.912/D"
                dataHora="03/NOV/2026 • REG. IMÓVEIS R-3/114.892"
                coordenadasGps="-23.5874, -46.6812 (WGS84)"
              />
            </View>

            {/* Preferências de Notificação de Avanço */}
            <Card style={styles.notifCard}>
              <Typography variant="label" color="muted">
                ALERTAS DE NOVAS FOTOS E AVANÇOS (+%)
              </Typography>
              <View style={styles.switchLine}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Typography variant="bodyStrong" color="strong">
                    Notificações via WhatsApp
                  </Typography>
                  <Typography variant="caption" color="muted">
                    Receber aviso imediato quando uma etapa da Unidade {unidadeSelecionada.id} avançar
                  </Typography>
                </View>
                <Switch
                  value={notifWhatsapp}
                  onValueChange={(v) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setNotifWhatsapp(v);
                  }}
                  trackColor={{
                    false: ConstructoColors.borda,
                    true: ConstructoColors.primaria,
                  }}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.switchLine}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Typography variant="bodyStrong" color="strong">
                    Relatório Quinzenal por E-mail
                  </Typography>
                  <Typography variant="caption" color="muted">
                    Enviado para {usuario?.email || 'comprador@constructo.com.br'}
                  </Typography>
                </View>
                <Switch
                  value={notifEmail}
                  onValueChange={(v) => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setNotifEmail(v);
                  }}
                  trackColor={{
                    false: ConstructoColors.borda,
                    true: ConstructoColors.primaria,
                  }}
                />
              </View>
            </Card>
          </ScrollView>
        ) : null}
      </View>

      {/* Barra de Navegação Inferior (3 Abas do Cliente conforme Blueprint) */}
      <BottomTabBar<AbaCliente>
        tabs={[
          {
            value: 'feed',
            label: 'Feed da Obra',
            iconName: 'feed',
            badgeCount: postsFeed.length,
          },
          {
            value: 'cronograma',
            label: 'Cronograma',
            iconName: 'chart',
          },
          {
            value: 'unidade',
            label: 'Meu Imóvel',
            iconName: 'home',
          },
        ]}
        activeTab={abaAtiva}
        onSelectTab={setAbaAtiva}
      />

      {/* Bottom Sheet Seletor de Unidade */}
      <BottomSheet
        visible={modalUnidadeAberto}
        onClose={() => setModalUnidadeAberto(false)}
        title="Selecionar Unidade"
        subtitle="Alternar entre seus imóveis vinculados no empreendimento"
      >
        <View style={{ gap: 10 }}>
          {UNIDADES_COMPRADOR.map((unid) => {
            const ativo = unid.id === unidadeSelecionada.id;
            return (
              <Card
                key={unid.id}
                selected={ativo}
                onPress={() => {
                  setUnidadeSelecionada(unid);
                  setModalUnidadeAberto(false);
                }}
                style={styles.unidadeOptionCard}
              >
                <Icon
                  name="home"
                  size={18}
                  color={ativo ? ConstructoColors.primaria : ConstructoColors.textoSuave}
                />
                <View style={{ flex: 1, gap: 2 }}>
                  <Typography variant="bodyStrong" color="strong">
                    {unid.rotulo}
                  </Typography>
                  <Typography variant="caption" color="muted">
                    {unid.pavimento} • Área privativa {unid.area}
                  </Typography>
                </View>
                {ativo ? (
                  <Badge label="Ativa" variant="primaria" size="sm" />
                ) : null}
              </Card>
            );
          })}
        </View>
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ConstructoColors.fundoPainel,
  },
  previewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ConstructoColors.primariaHover,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  previewBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: ConstructoColors.borda,
    backgroundColor: ConstructoColors.superficie,
    gap: 8,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tabScrollContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  cronogramaHeroCard: {
    gap: 10,
  },
  cronogramaHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  etapaCard: {
    gap: 12,
  },
  etapaTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  etapaOrderBadge: {
    width: 36,
    height: 36,
    borderRadius: ConstructoRadius.field,
    backgroundColor: ConstructoColors.primariaSuave,
    borderWidth: 1,
    borderColor: ConstructoColors.bordaFoco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  etapaProgressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: ConstructoColors.borda,
    overflow: 'hidden',
  },
  etapaProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  marcosList: {
    gap: 8,
    paddingTop: 4,
  },
  marcoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: ConstructoColors.superficieSutil,
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
    borderRadius: ConstructoRadius.field,
    padding: 10,
  },
  etapaFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: ConstructoColors.borda,
  },
  unidadeHeroCard: {
    gap: 16,
  },
  unidadeHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  unidadeIconBox: {
    width: 48,
    height: 48,
    borderRadius: ConstructoRadius.card,
    backgroundColor: ConstructoColors.primariaSuave,
    borderWidth: 1,
    borderColor: ConstructoColors.bordaFoco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  specBox: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: ConstructoColors.superficieSutil,
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
    borderRadius: ConstructoRadius.field,
    padding: 12,
    gap: 4,
  },
  engCard: {
    gap: 10,
  },
  engRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  engAvatar: {
    width: 44,
    height: 44,
    borderRadius: ConstructoRadius.field,
    backgroundColor: ConstructoColors.primariaSuave,
    borderWidth: 1,
    borderColor: ConstructoColors.bordaFoco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifCard: {
    gap: 12,
  },
  switchLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  divider: {
    height: 1,
    backgroundColor: ConstructoColors.borda,
  },
  unidadeOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
});
