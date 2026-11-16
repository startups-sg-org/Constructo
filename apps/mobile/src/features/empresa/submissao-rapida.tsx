import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import {
  Badge,
  BottomSheet,
  Button,
  Input,
  SliderTatil,
  Typography,
} from '../../components/ui';
import { ConstructoColors, ConstructoRadius } from '../../constants/theme';
import { Etapa, LocalObra, Marco } from '../../types/obras';
import { imageService } from '../../services/image.service';
import { evidenciasService } from '../../services/evidencias.service';
import { offlineService } from '../../services/offline.service';

export interface SubmissaoRapidaProps {
  visible: boolean;
  onClose: () => void;
  fotoUri: string | null;
  empreendimentoId: number;
  etapas: Etapa[];
  marcos: Marco[];
  locais?: LocalObra[];
  localObraIdPadrao: number;
  marcoIdInicial?: number | null;
  localIdInicial?: number | null;
  autorNome?: string;
  onSucesso: (mensagem: string, isOffline: boolean) => void;
}

const SUGESTOES_LAUDO_TECNICO = [
  'Concretagem finalizada com Slump Test e corpos de prova aprovados.',
  'Armadura conferida e espaçadores posicionados conforme projeto estrutural.',
  'Impermeabilização executada em dupla demão cruzada e testada.',
  'Alvenaria de vedação concluída com prumo e esquadro homologados.',
];

export function SubmissaoRapidaModal({
  visible,
  onClose,
  fotoUri,
  empreendimentoId,
  etapas,
  marcos,
  locais = [],
  localObraIdPadrao,
  marcoIdInicial,
  localIdInicial,
  autorNome,
  onSucesso,
}: SubmissaoRapidaProps) {
  const [etapaSelecionadaId, setEtapaSelecionadaId] = useState<number | null>(null);
  const [marcoSelecionadoId, setMarcoSelecionadoId] = useState<number | null>(null);
  const [localSelecionadoId, setLocalSelecionadoId] = useState<number>(localObraIdPadrao);
  const [deltaProgresso, setDeltaProgresso] = useState<number>(4.5);
  const [legenda, setLegenda] = useState<string>('');
  const [publicarFeedCliente, setPublicarFeedCliente] = useState<boolean>(true);
  const [enviando, setEnviando] = useState<boolean>(false);

  // Sincroniza automaticamente a etapa, o marco e o local quando os dados carregam ou o modal abre
  useEffect(() => {
    if (!visible) return;

    if (marcoIdInicial) {
      const marcoAlvo = marcos.find((m) => m.id === marcoIdInicial);
      if (marcoAlvo) {
        setEtapaSelecionadaId(marcoAlvo.etapa_id);
        setMarcoSelecionadoId(marcoAlvo.id);
      }
    } else if (etapas.length > 0) {
      setEtapaSelecionadaId((atual) => {
        if (atual && etapas.some((e) => e.id === atual)) return atual;
        const primeiraEtapa = etapas[0].id;
        const primeiroMarco =
          marcos.find((m) => m.etapa_id === primeiraEtapa) || marcos[0];
        if (primeiroMarco) setMarcoSelecionadoId(primeiroMarco.id);
        return primeiraEtapa;
      });
    }

    if (localIdInicial) {
      setLocalSelecionadoId(localIdInicial);
    } else if (locais.length > 0) {
      setLocalSelecionadoId((atual) =>
        locais.some((l) => l.id === atual) ? atual : locais[0].id
      );
    } else if (localObraIdPadrao) {
      setLocalSelecionadoId(localObraIdPadrao);
    }
  }, [visible, etapas, marcos, locais, marcoIdInicial, localIdInicial, localObraIdPadrao]);

  const marcosDaEtapa = marcos.filter((m) => m.etapa_id === etapaSelecionadaId);
  const marcoResolvido =
    marcos.find((m) => m.id === marcoSelecionadoId) ||
    marcosDaEtapa[0] ||
    marcos[0];

  const handleSelecionarEtapa = (id: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEtapaSelecionadaId(id);
    const primeiroMarcoDaEtapa = marcos.find((m) => m.etapa_id === id);
    if (primeiroMarcoDaEtapa) {
      setMarcoSelecionadoId(primeiroMarcoDaEtapa.id);
    }
  };

  const handlePublicar = async () => {
    if (!fotoUri) return;

    const etapaAtiva =
      etapas.find((e) => e.id === etapaSelecionadaId) || etapas[0];
    const marcoIdFinal = marcoResolvido?.id || 1;
    const localIdFinal = localSelecionadoId || locais[0]?.id || localObraIdPadrao || 1;

    setEnviando(true);

    try {
      const fotoOtimizada = await imageService.otimizarFoto(fotoUri);

      const payload = {
        arquivoUri: fotoOtimizada.uri,
        arquivoNome: fotoOtimizada.name,
        arquivoTipo: fotoOtimizada.type,
        empreendimentoId,
        localObraId: localIdFinal,
        marcoId: marcoIdFinal,
        deltaEstimado: deltaProgresso,
        descricaoTecnica:
          legenda.trim() ||
          `Registro técnico concluído em ${marcoResolvido?.nome || etapaAtiva?.nome || 'Canteiro'} (+${deltaProgresso}% no avanço).`,
        capturadoEm: new Date().toISOString(),
      };

      try {
        await evidenciasService.enviarEvidencia(payload, autorNome);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSucesso(
          `Evidência publicada • +${deltaProgresso}% contabilizado em ${etapaAtiva?.nome || 'Obra'}`,
          false
        );
      } catch (erroRede) {
        console.warn('[SubmissaoRapida] Sem sinal. Salvando na fila offline:', erroRede);
        await offlineService.enfileirar(payload);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        onSucesso(
          'Sem conexão de rede. Evidência gravada na fila offline para sincronização automática.',
          true
        );
      }

      onClose();
      setLegenda('');
    } catch (erroGeral) {
      console.error('[SubmissaoRapida] Erro no envio:', erroGeral);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title="Submissão Técnica de Evidência"
      subtitle="Registro rápido de avanço físico • Padrão de Engenharia"
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Mídia Hero Capturada */}
        {fotoUri ? (
          <View style={styles.previewContainer}>
            <Image
              source={{ uri: fotoUri }}
              style={styles.previewImagem}
              contentFit="cover"
            />
            <View style={styles.previewOverlayBar}>
              <Badge
                label="Mídia Otimizada (1440px • JPEG)"
                variant="primaria"
                size="sm"
                iconName="check-circle"
              />
              <Badge
                label={new Date().toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                variant="neutro"
                size="sm"
                iconName="clock"
              />
            </View>
          </View>
        ) : null}

        {/* 2. Seletor Rápido de Macroetapa */}
        <View style={styles.secao}>
          <Typography variant="label" color="muted">
            1. MACROETAPA DO CRONOGRAMA
          </Typography>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.etapasScroll}
          >
            {etapas.map((etapa) => {
              const ativo = etapa.id === etapaSelecionadaId;
              return (
                <Button
                  key={etapa.id}
                  label={etapa.nome}
                  variant={ativo ? 'primary' : 'secondary'}
                  size="sm"
                  onPress={() => handleSelecionarEtapa(etapa.id)}
                />
              );
            })}
          </ScrollView>
        </View>

        {/* Seletor Contextual de Marco da Etapa */}
        {marcosDaEtapa.length > 0 ? (
          <View style={styles.secao}>
            <Typography variant="label" color="muted">
              MARCO CONSTRUTIVO VINCULADO
            </Typography>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.etapasScroll}
            >
              {marcosDaEtapa.map((marco) => {
                const ativo = marco.id === marcoResolvido?.id;
                return (
                  <Button
                    key={marco.id}
                    label={marco.nome}
                    iconName={ativo ? 'check-circle' : 'layers'}
                    variant={ativo ? 'outline' : 'secondary'}
                    size="sm"
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setMarcoSelecionadoId(marco.id);
                    }}
                  />
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {/* Seletor Contextual de Local Físico da Obra */}
        {locais.length > 0 ? (
          <View style={styles.secao}>
            <Typography variant="label" color="muted">
              LOCAL FÍSICO / UNIDADE DA OBRA
            </Typography>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.etapasScroll}
            >
              {locais.slice(0, 10).map((local) => {
                const ativo = local.id === localSelecionadoId;
                return (
                  <Button
                    key={local.id}
                    label={local.nome}
                    iconName="location"
                    variant={ativo ? 'outline' : 'secondary'}
                    size="sm"
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setLocalSelecionadoId(local.id);
                    }}
                  />
                );
              })}
            </ScrollView>
          </View>
        ) : null}

        {/* 3. Slider Tátil de Estimativa de Avanço */}
        <View style={styles.secao}>
          <SliderTatil
            valor={deltaProgresso}
            aoMudarValor={setDeltaProgresso}
            rotulo="2. IMPACTO DESTA ENTREGA NO PROGRESSO GLOBAL"
          />
        </View>

        {/* 4. Comentário Rápido / Laudo Técnico + Sugestões de 1 Toque */}
        <View style={styles.secao}>
          <Input
            label="3. DESCRIÇÃO TÉCNICA / LEGENDA DO DIÁRIO"
            placeholder="Descreva o serviço executado, ensaios realizados e conformidade com o projeto..."
            value={legenda}
            onChangeText={setLegenda}
            multiline
            numberOfLines={3}
          />

          <Typography variant="caption" color="muted">
            Modelos rápidos de engenharia (toque para preencher):
          </Typography>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.etapasScroll}
          >
            {SUGESTOES_LAUDO_TECNICO.map((sugestao, idx) => (
              <Pressable
                key={idx}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setLegenda(sugestao);
                }}
                style={styles.chipSugestao}
              >
                <Typography variant="caption" color="strong" numberOfLines={1}>
                  {sugestao}
                </Typography>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Switch de Publicação no Feed Social dos Compradores */}
        <View style={styles.switchBox}>
          <View style={{ flex: 1, gap: 2 }}>
            <Typography variant="bodyStrong" color="strong">
              Publicar no Diário Social dos Compradores
            </Typography>
            <Typography variant="caption" color="muted">
              Notifica os proprietários vinculados à unidade com o badge +{deltaProgresso}%
            </Typography>
          </View>
          <Switch
            value={publicarFeedCliente}
            onValueChange={(v) => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setPublicarFeedCliente(v);
            }}
            trackColor={{
              false: ConstructoColors.borda,
              true: ConstructoColors.primaria,
            }}
          />
        </View>

        {/* Botão de Ação Primária de 52px */}
        <Button
          label={enviando ? 'Processando e Enviando...' : 'Publicar Evidência Agora'}
          iconName="check-circle"
          variant="primary"
          size="lg"
          fullWidth
          loading={enviando}
          disabled={enviando || !fotoUri}
          onPress={handlePublicar}
        />
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 16,
    paddingBottom: 24,
  },
  previewContainer: {
    position: 'relative',
    height: 185,
    borderRadius: ConstructoRadius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
    backgroundColor: ConstructoColors.fundoPainel,
  },
  previewImagem: {
    width: '100%',
    height: '100%',
  },
  previewOverlayBar: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  secao: {
    gap: 7,
  },
  etapasScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  chipSugestao: {
    maxWidth: 260,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: ConstructoRadius.field,
    backgroundColor: ConstructoColors.superficieSutil,
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
  },
  switchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    padding: 12,
    borderRadius: ConstructoRadius.card,
    backgroundColor: ConstructoColors.superficieSutil,
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
  },
});
