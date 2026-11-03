import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import {
  Badge,
  BottomSheet,
  Button,
  Card,
  Icon,
  Input,
  StampChancela,
  Typography,
} from '../../components/ui';
import { ConstructoColors, ConstructoRadius } from '../../constants/theme';
import {
  EvidenciaBackend,
  StatusValidacaoEvidencia,
} from '../../types/evidencias';
import { resolverUrlMidia } from '../feed/feed.adapter';

export interface InspetorEvidenciaSheetProps {
  visible: boolean;
  evidencia: EvidenciaBackend | null;
  indiceAtual: number;
  totalEvidencias: number;
  onClose: () => void;
  onAnterior: () => void;
  onProxima: () => void;
  onAmpliarImagem: (url: string) => void;
  onSalvarDescricao: (evidenciaId: number, descricao: string) => Promise<void>;
  onValidar: (
    evidenciaId: number,
    status: StatusValidacaoEvidencia,
    motivo?: string
  ) => Promise<void>;
  onRemover: (evidenciaId: number) => Promise<void>;
}

export function InspetorEvidenciaSheet({
  visible,
  evidencia,
  indiceAtual,
  totalEvidencias,
  onClose,
  onAnterior,
  onProxima,
  onAmpliarImagem,
  onSalvarDescricao,
  onValidar,
  onRemover,
}: InspetorEvidenciaSheetProps) {
  const [editandoDescricao, setEditandoDescricao] = useState(false);
  const [textoDescricao, setTextoDescricao] = useState('');
  const [modoRejeicao, setModoRejeicao] = useState(false);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');
  const [erroMotivo, setErroMotivo] = useState<string | null>(null);
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [processando, setProcessando] = useState(false);

  useEffect(() => {
    if (evidencia) {
      setTextoDescricao(evidencia.descricao_tecnica || '');
      setMotivoRejeicao(evidencia.motivo_invalidacao || '');
      setEditandoDescricao(false);
      setModoRejeicao(false);
      setErroMotivo(null);
      setConfirmandoExclusao(false);
    }
  }, [evidencia]);

  if (!evidencia) return null;

  const statusAtual: StatusValidacaoEvidencia =
    evidencia.status_validacao || 'VALIDA';
  const urlCompleta = resolverUrlMidia(evidencia.arquivo_url);

  const getStatusBadgeProps = (st: StatusValidacaoEvidencia) => {
    if (st === 'VALIDA') {
      return { label: 'VÁLIDA • HOMOLOGADA', variant: 'sucesso' as const };
    }
    if (st === 'INVALIDA') {
      return { label: 'INVÁLIDA • REPROVADA', variant: 'erro' as const };
    }
    return { label: 'PENDENTE DE AUDITORIA', variant: 'destaqueSuave' as const };
  };

  const badgeStatus = getStatusBadgeProps(statusAtual);

  const handleAprovar = async () => {
    setProcessando(true);
    try {
      await onValidar(evidencia.id, 'VALIDA', 'Registro fotográfico em conformidade.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setModoRejeicao(false);
    } finally {
      setProcessando(false);
    }
  };

  const handleConfirmarRejeicao = async () => {
    if (motivoRejeicao.trim().length < 3) {
      setErroMotivo('Informe o motivo técnico da invalidação (mínimo 3 caracteres).');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    setProcessando(true);
    setErroMotivo(null);
    try {
      await onValidar(evidencia.id, 'INVALIDA', motivoRejeicao.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setModoRejeicao(false);
    } finally {
      setProcessando(false);
    }
  };

  const handleSalvarEdicao = async () => {
    setProcessando(true);
    try {
      await onSalvarDescricao(evidencia.id, textoDescricao);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setEditandoDescricao(false);
    } finally {
      setProcessando(false);
    }
  };

  const handleConfirmarRemocao = async () => {
    setProcessando(true);
    try {
      await onRemover(evidencia.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onClose();
    } finally {
      setProcessando(false);
    }
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      title={`Evidência Técnica #${evidencia.id}`}
      subtitle={`Item ${indiceAtual + 1} de ${totalEvidencias} • Auditoria de Qualidade`}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 1. Visualizador de Imagem com Navegação Anterior / Próxima */}
        <View style={styles.imageBox}>
          <Pressable
            onPress={() => onAmpliarImagem(urlCompleta)}
            style={StyleSheet.absoluteFill}
          >
            <Image
              source={{ uri: urlCompleta }}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
          </Pressable>

          <View style={styles.imageTopOverlay}>
            <Badge
              label={badgeStatus.label}
              variant={badgeStatus.variant}
              size="sm"
              dot
            />
            <Pressable
              onPress={() => onAmpliarImagem(urlCompleta)}
              style={styles.zoomPill}
            >
              <Icon name="search" size={13} color="#FFFFFF" />
              <Typography variant="caption" color="inverted">
                Ampliar
              </Typography>
            </Pressable>
          </View>

          {totalEvidencias > 1 ? (
            <View style={styles.navOverlayRow}>
              <Button
                label="Anterior"
                iconName="chevron-left"
                variant="secondary"
                size="sm"
                disabled={indiceAtual <= 0}
                onPress={onAnterior}
              />
              <Badge
                label={`${indiceAtual + 1} / ${totalEvidencias}`}
                variant="neutro"
                size="sm"
              />
              <Button
                label="Próxima"
                rightIconName="chevron-right"
                variant="secondary"
                size="sm"
                disabled={indiceAtual >= totalEvidencias - 1}
                onPress={onProxima}
              />
            </View>
          ) : null}
        </View>

        {/* Alerta caso a evidência esteja INVALIDA */}
        {statusAtual === 'INVALIDA' && evidencia.motivo_invalidacao ? (
          <Card style={styles.invalidCard} elevated={false}>
            <View style={styles.invalidHeader}>
              <Icon name="alert-circle" size={16} color={ConstructoColors.erro} />
              <Typography variant="bodyStrong" color="danger">
                Evidência Reprovada pela Engenharia
              </Typography>
            </View>
            <Typography variant="caption" color="default">
              Motivo: {evidencia.motivo_invalidacao}
            </Typography>
          </Card>
        ) : null}

        {/* 2. Metadados Estruturais e de Taxonomia */}
        <Card subtle padding={14} style={styles.metaGrid}>
          <View style={styles.metaRow}>
            <View style={styles.metaCell}>
              <Typography variant="label" color="muted">
                LOCAL DA OBRA
              </Typography>
              <Typography variant="bodyStrong" color="strong">
                {evidencia.local_obra?.nome || `Setor #${evidencia.local_obra_id}`}
              </Typography>
            </View>
            <View style={styles.metaCell}>
              <Typography variant="label" color="muted">
                MARCO CONSTRUTIVO
              </Typography>
              <Typography variant="bodyStrong" color="primary">
                {evidencia.marco?.nome || `Marco #${evidencia.marco_id}`}
              </Typography>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.metaRow}>
            <View style={styles.metaCell}>
              <Typography variant="label" color="muted">
                RESPONSÁVEL PELA CAPTURA
              </Typography>
              <Typography variant="bodyStrong" color="strong">
                {evidencia.responsavel?.nome || 'Engenharia de Campo'}
              </Typography>
            </View>
            <View style={styles.metaCell}>
              <Typography variant="label" color="muted">
                DATA / HORA UTC
              </Typography>
              <Typography variant="mono" color="default">
                {new Date(evidencia.capturado_em).toLocaleString('pt-BR')}
              </Typography>
            </View>
          </View>
        </Card>

        {/* 3. Descrição Técnica (Leitura e Edição PATCH) */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Typography variant="label" color="muted">
              LAUDO / DESCRIÇÃO TÉCNICA
            </Typography>
            {!editandoDescricao ? (
              <Button
                label="Editar Texto"
                iconName="edit"
                variant="ghost"
                size="sm"
                onPress={() => setEditandoDescricao(true)}
              />
            ) : null}
          </View>

          {editandoDescricao ? (
            <View style={{ gap: 10 }}>
              <Input
                value={textoDescricao}
                onChangeText={setTextoDescricao}
                multiline
                numberOfLines={3}
                placeholder="Informe a descrição técnica detalhada..."
              />
              <View style={styles.rowGap}>
                <Button
                  label="Cancelar"
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    setTextoDescricao(evidencia.descricao_tecnica || '');
                    setEditandoDescricao(false);
                  }}
                  style={{ flex: 1 }}
                />
                <Button
                  label="Salvar Alteração"
                  iconName="check"
                  variant="primary"
                  size="sm"
                  loading={processando}
                  onPress={handleSalvarEdicao}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          ) : (
            <Card subtle padding={12}>
              <Typography variant="body" color="default">
                {evidencia.descricao_tecnica || 'Sem observações técnicas adicionais.'}
              </Typography>
            </Card>
          )}
        </View>

        {/* 3.5 Chancela Oficial de Engenharia */}
        <StampChancela
          status={
            statusAtual === 'VALIDA'
              ? 'HOMOLOGADO'
              : statusAtual === 'INVALIDA'
                ? 'RESSALVA'
                : 'PENDENTE'
          }
          codigoArt={`ART-SP 2026/${(evidencia.id * 149) + 4000}`}
          responsavelTecnico={evidencia.responsavel?.nome || 'Eng. Rafael Nogueira'}
          registroCrea={
            evidencia.responsavel?.email?.includes('gestor')
              ? 'CREA-SP 5062491-D'
              : 'CREA/CAU REGIONAL'
          }
          dataHora={new Date(evidencia.capturado_em).toLocaleString('pt-BR')}
          coordenadasGps="-23.5874, -46.6812 (WGS84)"
        />

        {/* 4. Ações de Validação de Qualidade (#227) */}
        <View style={styles.section}>
          <Typography variant="label" color="muted">
            CONTROLE DE QUALIDADE & VALIDAÇÃO DO PROTOCOLO
          </Typography>

          {!modoRejeicao ? (
            <View style={styles.rowGap}>
              <Button
                label={statusAtual === 'VALIDA' ? 'Evidência Aprovada' : 'Aprovar Evidência'}
                iconName="check-circle"
                variant={statusAtual === 'VALIDA' ? 'outline' : 'primary'}
                size="md"
                loading={processando}
                onPress={handleAprovar}
                style={{ flex: 1 }}
              />
              <Button
                label="Rejeitar / Invalidar"
                iconName="alert-circle"
                variant="secondary"
                size="md"
                onPress={() => setModoRejeicao(true)}
                style={{ flex: 1 }}
              />
            </View>
          ) : (
            <Card style={styles.rejectFormCard} elevated={false}>
              <Typography variant="bodyStrong" color="strong">
                Justificativa Obrigatória de Reprovação
              </Typography>
              <Input
                placeholder="Ex: Ângulo da foto não contempla o cobrimento mínimo exigido no protocolo..."
                value={motivoRejeicao}
                onChangeText={(t) => {
                  setMotivoRejeicao(t);
                  if (erroMotivo) setErroMotivo(null);
                }}
                error={erroMotivo}
                multiline
              />
              <View style={styles.rowGap}>
                <Button
                  label="Voltar"
                  variant="secondary"
                  size="sm"
                  onPress={() => {
                    setModoRejeicao(false);
                    setErroMotivo(null);
                  }}
                  style={{ flex: 1 }}
                />
                <Button
                  label="Confirmar Invalidação"
                  iconName="alert-circle"
                  variant="danger"
                  size="sm"
                  loading={processando}
                  onPress={handleConfirmarRejeicao}
                  style={{ flex: 1.4 }}
                />
              </View>
            </Card>
          )}
        </View>

        {/* 5. Remoção Segura com Confirmação (#226) */}
        <View style={styles.deleteSection}>
          {!confirmandoExclusao ? (
            <Button
              label="Remover Evidência do Empreendimento"
              iconName="trash"
              variant="danger"
              size="md"
              fullWidth
              onPress={() => setConfirmandoExclusao(true)}
            />
          ) : (
            <Card style={styles.confirmDeleteCard} elevated={false}>
              <Typography variant="bodyStrong" color="danger">
                Confirmar exclusão definitiva da evidência #{evidencia.id}?
              </Typography>
              <Typography variant="caption" color="default">
                Esta ação excluirá o arquivo fotográfico e poderá tornar o protocolo de comprovação do marco incompleto.
              </Typography>
              <View style={styles.rowGap}>
                <Button
                  label="Cancelar"
                  variant="secondary"
                  size="sm"
                  onPress={() => setConfirmandoExclusao(false)}
                  style={{ flex: 1 }}
                />
                <Button
                  label="Confirmar Exclusão"
                  iconName="trash"
                  variant="danger"
                  size="sm"
                  loading={processando}
                  onPress={handleConfirmarRemocao}
                  style={{ flex: 1.3 }}
                />
              </View>
            </Card>
          )}
        </View>
      </ScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    gap: 16,
    paddingBottom: 24,
  },
  imageBox: {
    height: 230,
    borderRadius: ConstructoRadius.card,
    overflow: 'hidden',
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
    justifyContent: 'space-between',
    padding: 12,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageTopOverlay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zoomPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: ConstructoRadius.full,
  },
  navOverlayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  invalidCard: {
    backgroundColor: ConstructoColors.erroSuave,
    borderColor: ConstructoColors.erro,
    gap: 4,
    padding: 12,
  },
  invalidHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaGrid: {
    gap: 10,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 12,
  },
  metaCell: {
    flex: 1,
    gap: 3,
  },
  divider: {
    height: 1,
    backgroundColor: ConstructoColors.borda,
  },
  section: {
    gap: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowGap: {
    flexDirection: 'row',
    gap: 10,
  },
  rejectFormCard: {
    backgroundColor: ConstructoColors.superficieSutil,
    borderColor: ConstructoColors.bordaFoco,
    gap: 10,
  },
  deleteSection: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: ConstructoColors.borda,
  },
  confirmDeleteCard: {
    backgroundColor: ConstructoColors.erroSuave,
    borderColor: ConstructoColors.erro,
    gap: 10,
  },
});

