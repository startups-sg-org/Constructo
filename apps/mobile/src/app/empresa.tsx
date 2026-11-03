import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Badge,
  BottomSheet,
  BottomTabBar,
  Button,
  Card,
  ConstructoLogo,
  Icon,
  Input,
  SegmentedControl,
  Typography,
} from '../components/ui';
import { ConstructoColors, ConstructoRadius } from '../constants/theme';
import { useAuth } from '../context/auth-context';
import {
  ContratoObra,
  Empreendimento,
  Etapa,
  LocalHierarquia,
  LocalObra,
  Marco,
  ProgressoEmpreendimento,
  StatusMarco,
  TipoLocal,
} from '../types/obras';
import {
  EvidenciaBackend,
  ProtocoloEvidencia,
  StatusValidacaoEvidencia,
} from '../types/evidencias';
import { UsuarioSessao } from '../types/auth';
import { obrasService } from '../services/obras.service';
import { evidenciasService } from '../services/evidencias.service';
import { authService } from '../services/auth.service';
import { achatarLocaisHierarquia, PROTOCOLOS_SEED, snapshotStore } from '../services/demo-seed';
import { API_BASE_URL } from '../services/api';
import { resolverUrlMidia } from '../features/feed/feed.adapter';
import { CameraSelector } from '../features/empresa/camera-selector';
import { SubmissaoRapidaModal } from '../features/empresa/submissao-rapida';
import { SincronizadorOffline } from '../features/empresa/sincronizador-offline';
import { InspetorEvidenciaSheet } from '../features/empresa/inspetor-evidencia-sheet';
import { ImageLightbox } from '../features/cliente/image-lightbox';

type AbaEmpresa = 'canteiro' | 'cronograma' | 'estrutura' | 'contratos';
type FiltroStatusEvidencia = 'TODAS' | StatusValidacaoEvidencia;

export default function EmpresaScreen() {
  const router = useRouter();
  const { usuario, logout } = useAuth();

  const [abaAtiva, setAbaAtiva] = useState<AbaEmpresa>('canteiro');
  const [empreendimentos, setEmpreendimentos] = useState<Empreendimento[]>([]);
  const [obraSelecionada, setObraSelecionada] = useState<Empreendimento | null>(null);
  const [progresso, setProgresso] = useState<ProgressoEmpreendimento | null>(null);
  const [etapas, setEtapas] = useState<Etapa[]>([]);
  const [marcos, setMarcos] = useState<Marco[]>([]);
  const [locais, setLocais] = useState<LocalObra[]>([]);
  const [estruturaFisica, setEstruturaFisica] = useState<LocalHierarquia[]>([]);
  const [evidencias, setEvidencias] = useState<EvidenciaBackend[]>([]);
  const [protocolos, setProtocolos] = useState<ProtocoloEvidencia[]>([]);
  const [contratos, setContratos] = useState<ContratoObra[]>([]);
  const [equipeUsuarios, setEquipeUsuarios] = useState<UsuarioSessao[]>([]);

  const [carregando, setCarregando] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [toastMensagem, setToastMensagem] = useState<string | null>(null);

  // Filtros de Evidências (Aba Canteiro)
  const [buscaEvidencia, setBuscaEvidencia] = useState<string>('');
  const [filtroValidacao, setFiltroValidacao] = useState<FiltroStatusEvidencia>('TODAS');
  const [filtroEtapaId, setFiltroEtapaId] = useState<number | null>(null);

  // Estado do Modal de Submissão Rápida em 3 Cliques
  const [fotoModalUri, setFotoModalUri] = useState<string | null>(null);
  const [modalEnvioAberto, setModalEnvioAberto] = useState<boolean>(false);
  const [marcoPreSelecionadoId, setMarcoPreSelecionadoId] = useState<number | null>(null);
  const [localPreSelecionadoId, setLocalPreSelecionadoId] = useState<number | null>(null);

  // Inspetor de Evidência & Lightbox (#226, #227, #228)
  const [evidenciaInspecionadaId, setEvidenciaInspecionadaId] = useState<number | null>(null);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Modais de Gestão Operacional (Obra, Etapa/Marco, Local, Contrato, Protocolo)
  const [sheetObrasAberto, setSheetObrasAberto] = useState<boolean>(false);
  const [modoCriarObra, setModoCriarObra] = useState<boolean>(false);
  const [novaObraNome, setNovaObraNome] = useState<string>('');
  const [novaObraDescricao, setNovaObraDescricao] = useState<string>(
    'Torre residencial de alto padrão construtivo'
  );
  const [novaObraEndereco, setNovaObraEndereco] = useState<string>('');

  const [sheetCronogramaAberto, setSheetCronogramaAberto] = useState<boolean>(false);
  const [tipoNovoItemCrono, setTipoNovoItemCrono] = useState<'ETAPA' | 'MARCO'>('MARCO');
  const [novoItemCronoNome, setNovoItemCronoNome] = useState<string>('');
  const [novoItemCronoDesc, setNovoItemCronoDesc] = useState<string>('');
  const [etapaPaiNovoMarcoId, setEtapaPaiNovoMarcoId] = useState<number | null>(null);

  const [sheetLocalAberto, setSheetLocalAberto] = useState<boolean>(false);
  const [novoLocalNome, setNovoLocalNome] = useState<string>('');
  const [novoLocalTipo, setNovoLocalTipo] = useState<TipoLocal>('UNIDADE');
  const [novoLocalPaiId, setNovoLocalPaiId] = useState<number | null>(null);

  const [sheetContratoAberto, setSheetContratoAberto] = useState<boolean>(false);
  const [novoContratoCodigo, setNovoContratoCodigo] = useState<string>('CTR-2026/005');
  const [novoContratoFornecedor, setNovoContratoFornecedor] = useState<string>('');
  const [novoContratoCnpj, setNovoContratoCnpj] = useState<string>('18.420.990/0001-11');
  const [novoContratoEscopo, setNovoContratoEscopo] = useState<string>('');
  const [novoContratoValor, setNovoContratoValor] = useState<string>('320000');

  const [marcoProtocoloAtivo, setMarcoProtocoloAtivo] = useState<Marco | null>(null);
  const [salvandoModal, setSalvandoModal] = useState<boolean>(false);

  const exibirToast = useCallback((mensagem: string) => {
    setToastMensagem(mensagem);
    setTimeout(() => {
      setToastMensagem((atual) => (atual === mensagem ? null : atual));
    }, 4000);
  }, []);

  const carregarDadosObra = useCallback(async (empreendimentoId: number) => {
    try {
      const [
        progressoData,
        etapasData,
        locaisData,
        estruturaData,
        evidenciasData,
        protocolosData,
        contratosData,
        usuariosData,
      ] = await Promise.all([
        obrasService.obterProgresso(empreendimentoId),
        obrasService.listarEtapas(empreendimentoId),
        obrasService.listarLocais(empreendimentoId),
        obrasService.listarEstruturaFisica(empreendimentoId),
        evidenciasService.listarEvidencias(empreendimentoId),
        obrasService.listarProtocolos(empreendimentoId),
        obrasService.listarContratos(empreendimentoId),
        authService.listarUsuarios(),
      ]);

      setProgresso(progressoData);
      setEtapas(etapasData);
      setLocais(locaisData);
      setEstruturaFisica(estruturaData);
      setEvidencias(evidenciasData);
      setProtocolos(protocolosData);
      setContratos(contratosData);
      setEquipeUsuarios(usuariosData);

      if (etapasData.length > 0) {
        setEtapaPaiNovoMarcoId((atual) => atual ?? etapasData[0].id);
        const marcosPromises = etapasData.map((e) =>
          obrasService.listarMarcos(empreendimentoId, e.id).catch(() => [])
        );
        const marcosResultados = await Promise.all(marcosPromises);
        setMarcos(marcosResultados.flat());
      } else {
        setMarcos([]);
      }
    } catch (erro) {
      console.warn('[EmpresaScreen] Erro ao carregar dados da obra:', erro);
    }
  }, []);

  useEffect(() => {
    let ativo = true;

    async function inicializar() {
      // 1. Resposta imediata em 0ms a partir do snapshot local para evitar delays
      try {
        const snap = await snapshotStore.obter();
        if (snap.empreendimentos.length > 0) {
          const primeira = snap.empreendimentos[0];
          setEmpreendimentos(snap.empreendimentos);
          setObraSelecionada(primeira);
          setProgresso(snap.progresso);
          setEtapas(snap.etapas);
          setMarcos(snap.marcos);
          setLocais(achatarLocaisHierarquia(snap.estruturaFisica));
          setEstruturaFisica(snap.estruturaFisica);
          setEvidencias(snap.evidencias);
          setProtocolos(PROTOCOLOS_SEED);
          setContratos(snap.contratos);
          setCarregando(false);
        }
      } catch (err) {
        console.warn('[EmpresaScreen] Erro na hidratação instantânea:', err);
      }

      // 2. Revalidação em background se conectado
      try {
        const lista = await obrasService.listarEmpreendimentos();
        if (!ativo) return;
        setEmpreendimentos(lista);

        if (lista.length > 0) {
          const primeira = lista[0];
          setObraSelecionada(primeira);
          await carregarDadosObra(primeira.id);
        }
      } catch (erro) {
        console.warn('[EmpresaScreen] Erro ao listar empreendimentos:', erro);
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    inicializar();

    return () => {
      ativo = false;
    };
  }, [carregarDadosObra]);

  const handleRefresh = async () => {
    setRefreshing(true);
    if (obraSelecionada) {
      await carregarDadosObra(obraSelecionada.id);
    }
    setRefreshing(false);
  };

  const handleFotoCapturada = (
    uri: string,
    opcoes?: { marcoId?: number | null; localId?: number | null }
  ) => {
    setMarcoPreSelecionadoId(opcoes?.marcoId ?? null);
    setLocalPreSelecionadoId(opcoes?.localId ?? null);
    setFotoModalUri(uri);
    setModalEnvioAberto(true);
  };

  const handleDispararFotoContextual = (opcoes: {
    marcoId?: number | null;
    localId?: number | null;
  }) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const amostraContextual = `${API_BASE_URL}/uploads/empreendimentos/1/evidencias/parque-das-aguas-04.jpeg`;
    handleFotoCapturada(amostraContextual, opcoes);
  };

  const handleSucessoEnvio = async (msg: string) => {
    exibirToast(msg);
    if (obraSelecionada) {
      await carregarDadosObra(obraSelecionada.id);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  const obterStatusEvidencia = (ev: EvidenciaBackend): StatusValidacaoEvidencia =>
    ev.status_validacao || 'PENDENTE';

  // KPIs Calculados
  const kpis = useMemo(() => {
    const avancoGlobal = Math.round(progresso?.percentual ?? 34);
    const marcosConcluidos = marcos.filter((m) => m.status === 'CONCLUIDO').length;
    const evidenciasValidas = evidencias.filter(
      (e) => obterStatusEvidencia(e) === 'VALIDA'
    ).length;
    const evidenciasPendentes = evidencias.filter(
      (e) => obterStatusEvidencia(e) === 'PENDENTE'
    ).length;
    return {
      avancoGlobal,
      marcosConcluidos,
      totalMarcos: marcos.length,
      evidenciasValidas,
      evidenciasPendentes,
    };
  }, [progresso, marcos, evidencias]);

  // Evidências Filtradas
  const evidenciasFiltradas = useMemo(() => {
    return evidencias.filter((ev) => {
      if (filtroValidacao !== 'TODAS' && obterStatusEvidencia(ev) !== filtroValidacao) {
        return false;
      }
      if (filtroEtapaId !== null) {
        const marcoDaEv = marcos.find((m) => m.id === ev.marco_id);
        if (!marcoDaEv || marcoDaEv.etapa_id !== filtroEtapaId) {
          return false;
        }
      }
      if (buscaEvidencia.trim().length > 0) {
        const termo = buscaEvidencia.trim().toLowerCase();
        const desc = (ev.descricao_tecnica || '').toLowerCase();
        const local = (ev.local_obra?.nome || '').toLowerCase();
        const marco = (ev.marco?.nome || '').toLowerCase();
        const resp = (ev.responsavel?.nome || '').toLowerCase();
        return (
          desc.includes(termo) ||
          local.includes(termo) ||
          marco.includes(termo) ||
          resp.includes(termo)
        );
      }
      return true;
    });
  }, [evidencias, filtroValidacao, filtroEtapaId, buscaEvidencia, marcos]);

  const indiceEvidenciaInspecionada = useMemo(() => {
    if (evidenciaInspecionadaId === null) return -1;
    return evidenciasFiltradas.findIndex((e) => e.id === evidenciaInspecionadaId);
  }, [evidenciaInspecionadaId, evidenciasFiltradas]);

  const evidenciaInspecionada =
    indiceEvidenciaInspecionada >= 0
      ? evidenciasFiltradas[indiceEvidenciaInspecionada]
      : null;

  // Handlers de Auditoria de Evidência (#226, #227, #228)
  const handleSalvarDescricaoEvidencia = async (
    evidenciaId: number,
    descricao: string
  ) => {
    if (!obraSelecionada) return;
    await evidenciasService.atualizarDescricaoEvidencia(
      obraSelecionada.id,
      evidenciaId,
      descricao
    );
    await carregarDadosObra(obraSelecionada.id);
    exibirToast('Laudo técnico atualizado com sucesso.');
  };

  const handleValidarEvidencia = async (
    evidenciaId: number,
    status: StatusValidacaoEvidencia,
    motivo?: string
  ) => {
    if (!obraSelecionada) return;
    await evidenciasService.alterarValidacaoEvidencia(
      obraSelecionada.id,
      evidenciaId,
      status,
      motivo,
      usuario?.nome
    );
    await carregarDadosObra(obraSelecionada.id);
    exibirToast(
      status === 'VALIDA'
        ? 'Evidência homologada pela engenharia.'
        : 'Evidência reprovada e marcada para retrabalho.'
    );
  };

  const handleRemoverEvidencia = async (evidenciaId: number) => {
    if (!obraSelecionada) return;
    await evidenciasService.removerEvidencia(obraSelecionada.id, evidenciaId);
    setEvidenciaInspecionadaId(null);
    await carregarDadosObra(obraSelecionada.id);
    exibirToast('Evidência removida permanentemente.');
  };

  // Handlers de Cronograma e Marcos
  const handleAlternarStatusMarco = async (marco: Marco) => {
    if (!obraSelecionada) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const proximoStatus: StatusMarco =
      marco.status === 'NAO_INICIADO'
        ? 'EM_ANDAMENTO'
        : marco.status === 'EM_ANDAMENTO'
          ? 'CONCLUIDO'
          : 'EM_ANDAMENTO';

    await obrasService.atualizarStatusMarco(
      obraSelecionada.id,
      marco.id,
      proximoStatus
    );
    await carregarDadosObra(obraSelecionada.id);
    exibirToast(`Marco "${marco.nome}" atualizado para ${proximoStatus.replace('_', ' ')}.`);
  };

  const handleCriarObra = async () => {
    if (!novaObraNome.trim()) return;
    setSalvandoModal(true);
    try {
      const criada = await obrasService.criarEmpreendimento({
        nome: novaObraNome.trim(),
        descricao: novaObraDescricao.trim() || 'Empreendimento corporativo',
        endereco: novaObraEndereco.trim() || 'Canteiro Central',
        status: 'EM_ANDAMENTO',
      });
      const lista = await obrasService.listarEmpreendimentos();
      setEmpreendimentos(lista);
      setObraSelecionada(criada);
      await carregarDadosObra(criada.id);
      setModoCriarObra(false);
      setSheetObrasAberto(false);
      setNovaObraNome('');
      exibirToast(`Empreendimento "${criada.nome}" criado e ativado.`);
    } finally {
      setSalvandoModal(false);
    }
  };

  const handleCriarItemCronograma = async () => {
    if (!obraSelecionada || !novoItemCronoNome.trim()) return;
    setSalvandoModal(true);
    try {
      if (tipoNovoItemCrono === 'ETAPA') {
        await obrasService.criarEtapa(obraSelecionada.id, {
          nome: novoItemCronoNome.trim(),
          descricao_tecnica:
            novoItemCronoDesc.trim() || 'Macroetapa técnica de engenharia',
          descricao_cliente:
            novoItemCronoDesc.trim() || 'Nova fase construtiva do empreendimento',
        });
        exibirToast(`Etapa "${novoItemCronoNome.trim()}" adicionada ao cronograma.`);
      } else {
        const etapaAlvo = etapaPaiNovoMarcoId ?? etapas[0]?.id;
        if (etapaAlvo) {
          await obrasService.criarMarco(obraSelecionada.id, etapaAlvo, {
            nome: novoItemCronoNome.trim(),
            descricao_tecnica:
              novoItemCronoDesc.trim() || 'Verificação de conformidade em campo',
            descricao_cliente:
              novoItemCronoDesc.trim() || 'Avanço físico de etapa homologado',
          });
          exibirToast(`Marco "${novoItemCronoNome.trim()}" vinculado à etapa.`);
        }
      }
      await carregarDadosObra(obraSelecionada.id);
      setNovoItemCronoNome('');
      setNovoItemCronoDesc('');
      setSheetCronogramaAberto(false);
    } finally {
      setSalvandoModal(false);
    }
  };

  const handleCriarLocalFisico = async () => {
    if (!obraSelecionada || !novoLocalNome.trim()) return;
    setSalvandoModal(true);
    try {
      await obrasService.criarLocalFisico(obraSelecionada.id, {
        nome: novoLocalNome.trim(),
        tipo: novoLocalTipo,
        parentId: novoLocalPaiId,
      });
      await carregarDadosObra(obraSelecionada.id);
      setNovoLocalNome('');
      setSheetLocalAberto(false);
      exibirToast(`Local físico "${novoLocalNome.trim()}" cadastrado na árvore.`);
    } finally {
      setSalvandoModal(false);
    }
  };

  const handleCriarContrato = async () => {
    if (!obraSelecionada || !novoContratoFornecedor.trim() || !novoContratoEscopo.trim()) {
      return;
    }
    setSalvandoModal(true);
    try {
      await obrasService.criarContrato(obraSelecionada.id, {
        numero_contrato: novoContratoCodigo.trim() || 'CTR-2026/NOVO',
        fornecedor_nome: novoContratoFornecedor.trim(),
        fornecedor_cnpj: novoContratoCnpj.trim() || '00.000.000/0001-00',
        objeto: novoContratoEscopo.trim(),
        valor_total: Number(novoContratoValor) || 150000,
      });
      await carregarDadosObra(obraSelecionada.id);
      setNovoContratoFornecedor('');
      setNovoContratoEscopo('');
      setSheetContratoAberto(false);
      exibirToast('Contrato registrado e vinculado ao empreendimento.');
    } finally {
      setSalvandoModal(false);
    }
  };

  const handleAlternarStatusContrato = async (contrato: ContratoObra) => {
    if (!obraSelecionada) return;
    Haptics.selectionAsync();
    const novoStatus = contrato.status === 'ATIVO' ? 'CONCLUIDO' : 'ATIVO';
    await obrasService.atualizarStatusContrato(contrato.id, novoStatus);
    await carregarDadosObra(obraSelecionada.id);
    exibirToast(`Contrato ${contrato.numero_contrato} marcado como ${novoStatus}.`);
  };

  const renderBadgeValidacao = (status?: StatusValidacaoEvidencia) => {
    if (status === 'VALIDA') {
      return <Badge label="Válida" variant="sucesso" size="sm" iconName="shield-check" />;
    }
    if (status === 'INVALIDA') {
      return <Badge label="Reprovada" variant="erro" size="sm" iconName="close" />;
    }
    return <Badge label="Em Auditoria" variant="destaqueSuave" size="sm" iconName="clock" />;
  };

  const renderNoHierarquia = (no: LocalHierarquia, nivel = 0) => {
    // Contagem agregada: o local e todos os descendentes (Bloco > Pavimento > Unidade)
    const idsSubarvore = new Set<number>();
    const coletarIds = (n: LocalHierarquia) => {
      idsSubarvore.add(n.id);
      n.filhos?.forEach(coletarIds);
    };
    coletarIds(no);
    const evidenciasDoNo = evidencias.filter((e) => idsSubarvore.has(e.local_obra_id));
    const qtdEvidenciasNoLocal = evidenciasDoNo.length;
    const qtdPendentesNoLocal = evidenciasDoNo.filter(
      (e) => obterStatusEvidencia(e) === 'PENDENTE'
    ).length;
    const numeroUnidade = no.tipo === 'UNIDADE' ? no.nome.replace(/\D/g, '') : '';
    const compradorVinculado = numeroUnidade
      ? equipeUsuarios.find(
          (u) => u.papel === 'COMPRADOR' && (u.unidade || '').includes(numeroUnidade)
        )
      : undefined;
    const isUnidadeDestaque = Boolean(compradorVinculado);

    return (
      <Animated.View
        key={no.id}
        entering={FadeInDown.delay(Math.min(nivel, 4) * 35).duration(200)}
        style={[
          styles.noHierarquiaContainer,
          nivel > 0 && { marginLeft: nivel * 16 },
        ]}
      >
        <View
          style={[
            styles.noHierarquiaCard,
            isUnidadeDestaque && styles.noHierarquiaDestaque,
          ]}
        >
          <View style={styles.noHierarquiaHeader}>
            <View style={styles.noHierarquiaTituloRow}>
              <View
                style={[
                  styles.iconeLocalBox,
                  {
                    backgroundColor:
                      no.tipo === 'BLOCO' || no.tipo === 'TORRE'
                        ? '#E0F2FE'
                        : no.tipo === 'PAVIMENTO'
                          ? '#EDE9FE'
                          : '#D1FAE5',
                    borderColor:
                      no.tipo === 'BLOCO' || no.tipo === 'TORRE'
                        ? '#0284C7'
                        : no.tipo === 'PAVIMENTO'
                          ? '#7C3AED'
                          : '#059669',
                  },
                ]}
              >
                <Icon
                  name={
                    no.tipo === 'BLOCO' || no.tipo === 'TORRE'
                      ? 'building'
                      : no.tipo === 'PAVIMENTO'
                        ? 'layers'
                        : 'home'
                  }
                  size={16}
                  color={
                    no.tipo === 'BLOCO' || no.tipo === 'TORRE'
                      ? '#0284C7'
                      : no.tipo === 'PAVIMENTO'
                        ? '#7C3AED'
                        : '#059669'
                  }
                />
              </View>
              <View style={styles.flex1}>
                <Typography variant="bodyStrong" color="strong">
                  {no.nome}
                </Typography>
                <Typography variant="caption" color="muted">
                  {no.tipo} • ID #{no.id}
                  {isUnidadeDestaque && compradorVinculado
                    ? ` • Comprador: ${compradorVinculado.nome} ${compradorVinculado.sobrenome}`
                    : ''}
                </Typography>
              </View>
            </View>

            <View style={styles.noHierarquiaAcoes}>
              {qtdPendentesNoLocal > 0 ? (
                <Badge
                  label={`${qtdPendentesNoLocal} pend.`}
                  variant="destaqueSuave"
                  size="sm"
                  dot
                />
              ) : null}
              <Badge
                label={`${qtdEvidenciasNoLocal} fotos`}
                variant={qtdEvidenciasNoLocal > 0 ? 'primariaSuave' : 'neutro'}
                size="sm"
              />
              <Pressable
                onPress={() => handleDispararFotoContextual({ localId: no.id })}
                style={styles.botaoCameraMini}
                accessibilityRole="button"
                accessibilityLabel={`Fotografar ${no.nome}`}
              >
                <Icon name="camera" size={15} color={ConstructoColors.primaria} />
              </Pressable>
            </View>
          </View>
        </View>

        {no.filhos && no.filhos.length > 0 ? (
          <View style={styles.filhosContainer}>
            {no.filhos.map((filho) => renderNoHierarquia(filho, nivel + 1))}
          </View>
        ) : null}
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Bar Corporativa */}
      <View style={styles.topHeader}>
        <View style={styles.topHeaderLeft}>
          <ConstructoLogo size="sm" showWordmark={false} />
          <View style={styles.topHeaderTitleCol}>
            <Typography variant="label" color="primary" numberOfLines={1}>
              ENGENHARIA DE CAMPO
            </Typography>
            <Typography variant="titleSmall" color="strong" numberOfLines={1}>
              {usuario?.nome || 'Eng. Carlos Andrade'}
            </Typography>
          </View>
        </View>

        <View style={styles.topHeaderActions}>
          <Button
            label="Visão Cliente"
            variant="secondary"
            size="sm"
            iconName="eye"
            onPress={() => router.push('/cliente')}
          />
          <Pressable
            onPress={handleLogout}
            style={styles.logoutIconBtn}
            accessibilityRole="button"
            accessibilityLabel="Encerrar sessão"
          >
            <Icon name="logout" size={18} color={ConstructoColors.textoSuave} />
          </Pressable>
        </View>
      </View>

      {/* Seletor de Empreendimento Ativo */}
      <View style={styles.obraSelectorBar}>
        <Pressable
          onPress={() => {
            setModoCriarObra(false);
            setSheetObrasAberto(true);
          }}
          style={styles.obraSelectorPill}
        >
          <View style={styles.obraSelectorInfo}>
            <Icon name="building" size={16} color={ConstructoColors.primaria} />
            <View style={styles.flex1}>
              <Typography variant="bodyStrong" color="strong" numberOfLines={1}>
                {obraSelecionada?.nome || 'Carregando empreendimento...'}
              </Typography>
              <Typography variant="caption" color="muted" numberOfLines={1}>
                {obraSelecionada?.endereco || 'Canteiro central'} • Status:{' '}
                {obraSelecionada?.status || 'EM_ANDAMENTO'}
              </Typography>
            </View>
          </View>
          <View style={styles.trocarObraChip}>
            <Typography variant="caption" color="primary">
              Trocar ({empreendimentos.length})
            </Typography>
            <Icon name="chevron-down" size={14} color={ConstructoColors.primaria} />
          </View>
        </Pressable>
      </View>

      {/* Régua Técnica de Canteiro & Condições Operacionais */}
      <View style={styles.siteStatusTicker}>
        <View style={styles.siteTickerItem}>
          <View style={[styles.tickerPill, { backgroundColor: '#FEF3C7' }]}>
            <Icon name="sun" size={11} color="#D97706" />
          </View>
          <Typography variant="mono" color="strong" style={styles.siteTickerText}>
            28°C • CÉU CLARO
          </Typography>
        </View>
        <View style={styles.siteTickerDot} />
        <View style={styles.siteTickerItem}>
          <View style={[styles.tickerPill, { backgroundColor: '#D1FAE5' }]}>
            <Icon name="shield-check" size={11} color="#059669" />
          </View>
          <Typography variant="mono" color="strong" style={styles.siteTickerText}>
            SLUMP TEST OK
          </Typography>
        </View>
        <View style={styles.siteTickerDot} />
        <View style={styles.siteTickerItem}>
          <View style={[styles.tickerPill, { backgroundColor: '#E0F2FE' }]}>
            <Icon name="contract" size={11} color="#0284C7" />
          </View>
          <Typography variant="mono" color="strong" style={styles.siteTickerText}>
            ART-2026 ATIVA
          </Typography>
        </View>
      </View>

      {/* Toast Flutuante */}
      {toastMensagem ? (
        <View style={styles.toastBanner}>
          <Icon name="check-circle" size={16} color={ConstructoColors.textoInvertido} />
          <Typography variant="bodyStrong" color="inverted" style={styles.flex1}>
            {toastMensagem}
          </Typography>
        </View>
      ) : null}

      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={ConstructoColors.primaria}
          />
        }
      >
        {/* Banner Offline */}
        <SincronizadorOffline
          onSincronizacaoConcluida={() => {
            if (obraSelecionada) carregarDadosObra(obraSelecionada.id);
          }}
        />

        {/* =========================================================
            ABA 1: CANTEIRO & AUDITORIA DE EVIDÊNCIAS
           ========================================================= */}
        {abaAtiva === 'canteiro' ? (
          <View style={styles.abaContainer}>
            {/* Grid de 4 KPIs Executivos com Acentos Cromáticos */}
            <View style={styles.kpiGrid}>
              <Card style={[styles.kpiCard, { borderTopWidth: 3, borderTopColor: '#059669' }]}>
                <View style={styles.kpiTopRow}>
                  <Typography variant="label" color="muted">
                    AVANÇO FÍSICO
                  </Typography>
                  <View style={[styles.kpiIconBox, { backgroundColor: '#D1FAE5' }]}>
                    <Icon name="chart" size={14} color="#059669" />
                  </View>
                </View>
                <Typography variant="titleLarge" tabular style={{ color: '#059669', fontWeight: '800' }}>
                  {kpis.avancoGlobal}%
                </Typography>
                <Typography variant="caption" color="muted">
                  Meta mensal em dia
                </Typography>
              </Card>

              <Card style={[styles.kpiCard, { borderTopWidth: 3, borderTopColor: '#0284C7' }]}>
                <View style={styles.kpiTopRow}>
                  <Typography variant="label" color="muted">
                    MARCOS
                  </Typography>
                  <View style={[styles.kpiIconBox, { backgroundColor: '#E0F2FE' }]}>
                    <Icon name="check-circle" size={14} color="#0284C7" />
                  </View>
                </View>
                <Typography variant="titleLarge" tabular style={{ color: '#0284C7', fontWeight: '800' }}>
                  {kpis.marcosConcluidos}/{kpis.totalMarcos}
                </Typography>
                <Typography variant="caption" color="muted">
                  Etapas homologadas
                </Typography>
              </Card>

              <Card style={[styles.kpiCard, { borderTopWidth: 3, borderTopColor: '#7C3AED' }]}>
                <View style={styles.kpiTopRow}>
                  <Typography variant="label" color="muted">
                    APROVADAS
                  </Typography>
                  <View style={[styles.kpiIconBox, { backgroundColor: '#EDE9FE' }]}>
                    <Icon name="shield-check" size={14} color="#7C3AED" />
                  </View>
                </View>
                <Typography variant="titleLarge" tabular style={{ color: '#7C3AED', fontWeight: '800' }}>
                  {kpis.evidenciasValidas}
                </Typography>
                <Typography variant="caption" color="muted">
                  Laudos no feed
                </Typography>
              </Card>

              <Card style={[styles.kpiCard, { borderTopWidth: 3, borderTopColor: '#EA580C' }]}>
                <View style={styles.kpiTopRow}>
                  <Typography variant="label" color="muted">
                    EM AUDITORIA
                  </Typography>
                  <View style={[styles.kpiIconBox, { backgroundColor: '#FFEDD5' }]}>
                    <Icon name="clock" size={14} color="#EA580C" />
                  </View>
                </View>
                <Typography variant="titleLarge" tabular style={{ color: '#EA580C', fontWeight: '800' }}>
                  {kpis.evidenciasPendentes}
                </Typography>
                <Typography variant="caption" color="muted">
                  Aguardando validação
                </Typography>
              </Card>
            </View>

            {/* Captura Hero em 3 Cliques */}
            <CameraSelector onFotoCapturada={(uri) => handleFotoCapturada(uri)} />

            {/* Cabeçalho + Filtros da Galeria de Evidências */}
            <View style={styles.secaoHeader}>
              <View style={styles.flex1}>
                <Typography variant="titleMedium" color="strong">
                  Central de Evidências & Qualidade
                </Typography>
                <Typography variant="caption" color="muted">
                  Toque em qualquer registro para inspecionar, editar ou homologar
                </Typography>
              </View>
              <Badge
                label={`${evidenciasFiltradas.length} registros`}
                variant="neutro"
                size="sm"
              />
            </View>

            <Input
              placeholder="Buscar por laudo, local, marco ou engenheiro..."
              value={buscaEvidencia}
              onChangeText={setBuscaEvidencia}
              leftIcon="search"
              rightIcon={buscaEvidencia ? 'close' : undefined}
              onRightIconPress={() => setBuscaEvidencia('')}
            />

            {/* Filtro por Status de Validação */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filtrosRow}
            >
              {(
                [
                  { id: 'TODAS', label: `Todas (${evidencias.length})` },
                  {
                    id: 'PENDENTE',
                    label: `Pendentes (${evidencias.filter((e) => obterStatusEvidencia(e) === 'PENDENTE').length})`,
                  },
                  {
                    id: 'VALIDA',
                    label: `Válidas (${evidencias.filter((e) => obterStatusEvidencia(e) === 'VALIDA').length})`,
                  },
                  {
                    id: 'INVALIDA',
                    label: `Reprovadas (${evidencias.filter((e) => obterStatusEvidencia(e) === 'INVALIDA').length})`,
                  },
                ] as { id: FiltroStatusEvidencia; label: string }[]
              ).map((item) => {
                const ativo = filtroValidacao === item.id;
                const corChipAtivo =
                  item.id === 'VALIDA'
                    ? { bg: '#059669', border: '#059669' }
                    : item.id === 'PENDENTE'
                      ? { bg: '#EA580C', border: '#EA580C' }
                      : item.id === 'INVALIDA'
                        ? { bg: '#DC2626', border: '#DC2626' }
                        : { bg: '#236557', border: '#236557' };
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => {
                      Haptics.selectionAsync();
                      setFiltroValidacao(item.id);
                    }}
                    style={[
                      styles.chipFiltro,
                      ativo && { backgroundColor: corChipAtivo.bg, borderColor: corChipAtivo.border },
                    ]}
                  >
                    <Typography
                      variant="caption"
                      color={ativo ? 'inverted' : 'strong'}
                    >
                      {item.label}
                    </Typography>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Filtro por Etapa */}
            {etapas.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtrosRow}
              >
                <Pressable
                  onPress={() => setFiltroEtapaId(null)}
                  style={[
                    styles.chipEtapa,
                    filtroEtapaId === null && styles.chipEtapaAtivo,
                  ]}
                >
                  <Typography
                    variant="caption"
                    color={filtroEtapaId === null ? 'primary' : 'muted'}
                  >
                    Todas as Etapas
                  </Typography>
                </Pressable>
                {etapas.map((et) => {
                  const ativo = filtroEtapaId === et.id;
                  return (
                    <Pressable
                      key={et.id}
                      onPress={() => setFiltroEtapaId(ativo ? null : et.id)}
                      style={[styles.chipEtapa, ativo && styles.chipEtapaAtivo]}
                    >
                      <Typography
                        variant="caption"
                        color={ativo ? 'primary' : 'muted'}
                      >
                        {et.nome}
                      </Typography>
                    </Pressable>
                  );
                })}
              </ScrollView>
            ) : null}

            {/* Lista de Evidências */}
            {evidenciasFiltradas.length === 0 && !carregando ? (
              <Card style={styles.emptyCard}>
                <Icon name="photo-library" size={28} color={ConstructoColors.textoSuave} />
                <Typography variant="bodyStrong" color="strong">
                  Nenhuma evidência encontrada para este filtro
                </Typography>
                <Typography variant="caption" color="muted">
                  Ajuste os filtros acima ou capture uma nova foto de campo.
                </Typography>
              </Card>
            ) : (
              <View style={styles.listaEvidencias}>
                {evidenciasFiltradas.map((item, index) => {
                  const statusItem = obterStatusEvidencia(item);
                  const corTrilho =
                    statusItem === 'VALIDA'
                      ? ConstructoColors.sucesso
                      : statusItem === 'INVALIDA'
                        ? ConstructoColors.erro
                        : ConstructoColors.destaque;

                  return (
                    <Animated.View
                      key={item.id}
                      entering={FadeInDown.delay(Math.min(index, 8) * 45)
                        .duration(200)}
                    >
                      <Card
                        style={styles.cardEvidenciaItem}
                        padding={0}
                        onPress={() => setEvidenciaInspecionadaId(item.id)}
                      >
                        <View style={[styles.trilhoStatus, { backgroundColor: corTrilho }]} />
                        <View style={styles.cardEvidenciaConteudo}>
                          <Image
                            source={{ uri: resolverUrlMidia(item.arquivo_url) }}
                            style={styles.thumbEvidencia}
                            contentFit="cover"
                            transition={150}
                          />
                          <View style={styles.evidenciaItemBody}>
                            <View style={styles.evidenciaItemTop}>
                              <Typography variant="mono" color="muted">
                                EV-{String(item.id).padStart(4, '0')}
                              </Typography>
                              {renderBadgeValidacao(statusItem)}
                            </View>

                            <Typography
                              variant="bodyStrong"
                              color="strong"
                              numberOfLines={2}
                            >
                              {item.descricao_tecnica || 'Registro técnico de campo'}
                            </Typography>

                            <View style={styles.evidenciaMetaRow}>
                              <View style={styles.metaInline}>
                                <Icon
                                  name="location"
                                  size={12}
                                  color={ConstructoColors.primaria}
                                />
                                <Typography
                                  variant="caption"
                                  color="primary"
                                  numberOfLines={1}
                                >
                                  {item.local_obra?.nome || `Local #${item.local_obra_id}`}
                                </Typography>
                              </View>
                              <Typography variant="caption" color="muted" tabular>
                                • {new Date(item.capturado_em).toLocaleDateString('pt-BR')}
                              </Typography>
                            </View>

                            {statusItem === 'PENDENTE' ? (
                              <View style={styles.acaoRapidaLinha}>
                                <Button
                                  label="Homologar"
                                  variant="primary"
                                  size="sm"
                                  iconName="check"
                                  onPress={() =>
                                    handleValidarEvidencia(item.id, 'VALIDA')
                                  }
                                />
                                <Button
                                  label="Inspecionar"
                                  variant="ghost"
                                  size="sm"
                                  onPress={() => setEvidenciaInspecionadaId(item.id)}
                                />
                              </View>
                            ) : null}
                          </View>
                        </View>
                      </Card>
                    </Animated.View>
                  );
                })}
              </View>
            )}
          </View>
        ) : null}

        {/* =========================================================
            ABA 2: CRONOGRAMA FÍSICO & MARCOS DE ENGENHARIA
           ========================================================= */}
        {abaAtiva === 'cronograma' ? (
          <View style={styles.abaContainer}>
            <View style={styles.secaoHeader}>
              <View style={styles.flex1}>
                <Typography variant="titleMedium" color="strong">
                  Cronograma Físico & Marcos
                </Typography>
                <Typography variant="caption" color="muted">
                  Gerencie etapas, aprove marcos e consulte protocolos técnicos
                </Typography>
              </View>
              <Button
                label="Novo Item"
                variant="primary"
                size="sm"
                iconName="plus"
                onPress={() => setSheetCronogramaAberto(true)}
              />
            </View>

            {etapas.map((etapa, etapaIndex) => {
              const marcosDaEtapa = marcos.filter((m) => m.etapa_id === etapa.id);
              const concluidos = marcosDaEtapa.filter(
                (m) => m.status === 'CONCLUIDO'
              ).length;
              const progItem = progresso?.etapas?.find((pe) => pe.etapa_id === etapa.id);
              const percEtapa = Math.round(
                progItem?.percentual ??
                  (marcosDaEtapa.length > 0
                    ? (concluidos / marcosDaEtapa.length) * 100
                    : 0)
              );

              return (
                <Animated.View key={etapa.id} entering={FadeInDown.delay(Math.min(etapaIndex, 6) * 45).duration(200)}>
                <Card style={styles.etapaCard}>
                  <View style={styles.etapaHeader}>
                    <View style={styles.flex1}>
                      <View style={styles.etapaBadgesRow}>
                        <Badge
                          label={`Etapa ${etapa.ordem}`}
                          variant="primariaSuave"
                          size="sm"
                        />
                        <Badge
                          label={`${concluidos}/${marcosDaEtapa.length} marcos`}
                          variant="neutro"
                          size="sm"
                        />
                      </View>
                      <Typography variant="titleSmall" color="strong">
                        {etapa.nome}
                      </Typography>
                      {etapa.descricao_tecnica ? (
                        <Typography variant="caption" color="muted">
                          {etapa.descricao_tecnica}
                        </Typography>
                      ) : null}
                    </View>
                    <Typography variant="titleMedium" color="primary" tabular>
                      {percEtapa}%
                    </Typography>
                  </View>

                  <View style={styles.barraTrilha}>
                    <View
                      style={[
                        styles.barraPreenchimento,
                        {
                          width: `${Math.min(100, Math.max(0, percEtapa))}%`,
                          backgroundColor:
                            percEtapa >= 100
                              ? '#059669'
                              : percEtapa > 40
                                ? '#0284C7'
                                : '#D97706',
                        },
                      ]}
                    />
                  </View>

                  {/* Lista de Marcos da Etapa */}
                  <View style={styles.listaMarcosEtapa}>
                    {marcosDaEtapa.map((marco) => {
                      const qtdFotosMarco = evidencias.filter(
                        (e) => e.marco_id === marco.id
                      ).length;
                      const protocoloDoMarco = protocolos.find(
                        (p) => p.marco_id === marco.id
                      );

                      return (
                        <View key={marco.id} style={styles.marcoRowCard}>
                          <View style={styles.marcoRowTop}>
                            <View style={styles.flex1}>
                              <Typography variant="bodyStrong" color="strong">
                                {marco.nome}
                              </Typography>
                              <Typography variant="caption" color="muted">
                                Ordem #{marco.ordem} • {qtdFotosMarco} evidência(s)
                              </Typography>
                            </View>
                            <Badge
                              label={
                                marco.status === 'CONCLUIDO'
                                  ? 'Concluído'
                                  : marco.status === 'EM_ANDAMENTO'
                                    ? 'Em Execução'
                                    : 'Não Iniciado'
                              }
                              variant={
                                marco.status === 'CONCLUIDO'
                                  ? 'esmeralda'
                                  : marco.status === 'EM_ANDAMENTO'
                                    ? 'azul'
                                    : 'laranja'
                              }
                              size="sm"
                              dot
                            />
                          </View>

                          <View style={styles.marcoAcoesRow}>
                            <Button
                              label={
                                marco.status === 'NAO_INICIADO'
                                  ? 'Iniciar Marco'
                                  : marco.status === 'EM_ANDAMENTO'
                                    ? 'Concluir Marco'
                                    : 'Reabrir'
                              }
                              variant={
                                marco.status === 'EM_ANDAMENTO' ? 'primary' : 'secondary'
                              }
                              size="sm"
                              iconName={
                                marco.status === 'CONCLUIDO' ? 'sync' : 'check-circle'
                              }
                              onPress={() => handleAlternarStatusMarco(marco)}
                            />

                            {protocoloDoMarco ? (
                              <Button
                                label="Protocolo"
                                variant="secondary"
                                size="sm"
                                iconName="document"
                                onPress={() => setMarcoProtocoloAtivo(marco)}
                              />
                            ) : null}

                            <Button
                              label="Fotografar"
                              variant="ghost"
                              size="sm"
                              iconName="camera"
                              onPress={() =>
                                handleDispararFotoContextual({ marcoId: marco.id })
                              }
                            />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </Card>
                </Animated.View>
              );
            })}
          </View>
        ) : null}

        {/* =========================================================
            ABA 3: ESTRUTURA FÍSICA HIERÁRQUICA (BLOCOS / UNIDADES)
           ========================================================= */}
        {abaAtiva === 'estrutura' ? (
          <View style={styles.abaContainer}>
            <View style={styles.secaoHeader}>
              <View style={styles.flex1}>
                <Typography variant="titleMedium" color="strong">
                  Árvore de Locais & Unidades
                </Typography>
                <Typography variant="caption" color="muted">
                  Rastreabilidade de evidências por Bloco, Pavimento e Unidade
                </Typography>
              </View>
              <Button
                label="Novo Local"
                variant="primary"
                size="sm"
                iconName="plus"
                onPress={() => {
                  setNovoLocalPaiId(locais[0]?.id ?? null);
                  setSheetLocalAberto(true);
                }}
              />
            </View>

            <Card subtle style={styles.resumoEstruturaCard}>
              <View style={styles.resumoEstruturaItem}>
                <Typography variant="titleMedium" color="primary" tabular>
                  {locais.filter((l) => l.tipo === 'BLOCO' || l.tipo === 'TORRE').length}
                </Typography>
                <Typography variant="caption" color="muted">
                  Blocos / Torres
                </Typography>
              </View>
              <View style={styles.divisorVertical} />
              <View style={styles.resumoEstruturaItem}>
                <Typography variant="titleMedium" color="strong" tabular>
                  {locais.filter((l) => l.tipo === 'PAVIMENTO').length}
                </Typography>
                <Typography variant="caption" color="muted">
                  Pavimentos
                </Typography>
              </View>
              <View style={styles.divisorVertical} />
              <View style={styles.resumoEstruturaItem}>
                <Typography variant="titleMedium" color="accent" tabular>
                  {locais.filter((l) => l.tipo === 'UNIDADE').length}
                </Typography>
                <Typography variant="caption" color="muted">
                  Unidades
                </Typography>
              </View>
            </Card>

            <View style={styles.arvoreWrapper}>
              {estruturaFisica.map((noRaiz) => renderNoHierarquia(noRaiz, 0))}
            </View>
          </View>
        ) : null}

        {/* =========================================================
            ABA 4: CONTRATOS DE EMPREITEIRAS & EQUIPE TÉCNICA
           ========================================================= */}
        {abaAtiva === 'contratos' ? (
          <View style={styles.abaContainer}>
            <View style={styles.secaoHeader}>
              <View style={styles.flex1}>
                <Typography variant="titleMedium" color="strong">
                  Contratos & Suprimentos
                </Typography>
                <Typography variant="caption" color="muted">
                  Controle de medição financeira e vigência de fornecedores
                </Typography>
              </View>
              <Button
                label="Novo Contrato"
                variant="primary"
                size="sm"
                iconName="plus"
                onPress={() => setSheetContratoAberto(true)}
              />
            </View>

            {contratos.map((ctr, ctrIndex) => {
              const percMedido = Math.round(ctr.percentual_medido || 0);
              const valorMedidoCalculado = Math.round(
                (ctr.valor_total * percMedido) / 100
              );

              return (
                <Animated.View key={ctr.id} entering={FadeInDown.delay(Math.min(ctrIndex, 6) * 45).duration(200)}>
                <Card style={styles.contratoCard}>
                  <View style={styles.contratoTopRow}>
                    <Typography variant="mono" style={{ color: '#7C3AED', fontWeight: '800' }}>
                      {ctr.numero_contrato}
                    </Typography>
                    <Badge
                      label={ctr.status}
                      variant={
                        ctr.status === 'ATIVO'
                          ? 'esmeralda'
                          : ctr.status === 'CONCLUIDO'
                            ? 'azul'
                            : 'laranja'
                      }
                      size="sm"
                      dot
                    />
                  </View>

                  <Typography variant="titleSmall" color="strong">
                    {ctr.fornecedor_nome}
                  </Typography>
                  <Typography variant="caption" color="muted">
                    CNPJ: {ctr.fornecedor_cnpj} • Vigência até {ctr.data_fim_prevista}
                  </Typography>

                  <Typography variant="body" color="default">
                    {ctr.objeto}
                  </Typography>

                  <View style={styles.contratoValoresRow}>
                    <View>
                      <Typography variant="label" color="muted">
                        VALOR CONTRATADO
                      </Typography>
                      <Typography variant="bodyStrong" color="strong" tabular>
                        R$ {ctr.valor_total.toLocaleString('pt-BR')}
                      </Typography>
                    </View>
                    <View style={styles.alignRight}>
                      <Typography variant="label" color="muted">
                        MEDIÇÃO ACUMULADA ({percMedido}%)
                      </Typography>
                      <Typography variant="bodyStrong" color="primary" tabular>
                        R$ {valorMedidoCalculado.toLocaleString('pt-BR')}
                      </Typography>
                    </View>
                  </View>

                  <View style={styles.barraTrilha}>
                    <View
                      style={[
                        styles.barraPreenchimento,
                        { width: `${Math.min(100, percMedido)}%` },
                      ]}
                    />
                  </View>

                  <View style={styles.contratoFooter}>
                    <Button
                      label={
                        ctr.status === 'ATIVO'
                          ? 'Marcar como Concluído'
                          : 'Reativar Contrato'
                      }
                      variant="secondary"
                      size="sm"
                      iconName="check"
                      onPress={() => handleAlternarStatusContrato(ctr)}
                    />
                  </View>
                </Card>
                </Animated.View>
              );
            })}

            {/* Equipe & Stakeholders Credenciados */}
            <View style={[styles.secaoHeader, { marginTop: 8 }]}>
              <View>
                <Typography variant="titleMedium" color="strong">
                  Equipe Técnica & Compradores
                </Typography>
                <Typography variant="caption" color="muted">
                  Usuários homologados com acesso ao empreendimento
                </Typography>
              </View>
              <Badge label={`${equipeUsuarios.length} ativos`} variant="neutro" size="sm" />
            </View>

            <View style={styles.listaEquipe}>
              {equipeUsuarios.map((membro) => (
                <Card key={membro.id} style={styles.membroCard}>
                  <View style={styles.avatarMembro}>
                    <Icon
                      name={
                        membro.papel === 'COMPRADOR'
                          ? 'home'
                          : membro.papel === 'ADMIN'
                            ? 'shield-check'
                            : 'user'
                      }
                      size={18}
                      color={ConstructoColors.primaria}
                    />
                  </View>
                  <View style={styles.flex1}>
                    <Typography variant="bodyStrong" color="strong">
                      {membro.nome} {membro.sobrenome}
                    </Typography>
                    <Typography variant="caption" color="muted">
                      {membro.email} • {membro.unidade || 'Equipe Central'}
                    </Typography>
                  </View>
                  <Badge
                    label={membro.papel}
                    variant={
                      membro.papel === 'COMPRADOR' ? 'destaque' : 'primariaSuave'
                    }
                    size="sm"
                  />
                </Card>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>

      {/* Navegação Inferior Corporativa (4 Abas) */}
      <BottomTabBar<AbaEmpresa>
        activeTab={abaAtiva}
        onSelectTab={(tab) => setAbaAtiva(tab)}
        tabs={[
          {
            value: 'canteiro',
            label: 'Canteiro',
            iconName: 'camera',
            badgeCount: kpis.evidenciasPendentes || undefined,
          },
          {
            value: 'cronograma',
            label: 'Cronograma',
            iconName: 'calendar',
          },
          {
            value: 'estrutura',
            label: 'Estrutura',
            iconName: 'layers',
          },
          {
            value: 'contratos',
            label: 'Contratos',
            iconName: 'contract',
          },
        ]}
      />

      {/* Modal de Submissão Rápida em 3 Cliques */}
      <SubmissaoRapidaModal
        visible={modalEnvioAberto}
        onClose={() => setModalEnvioAberto(false)}
        fotoUri={fotoModalUri}
        empreendimentoId={obraSelecionada?.id || 1}
        etapas={etapas}
        marcos={marcos}
        locais={locais}
        localObraIdPadrao={locais[0]?.id || 1}
        marcoIdInicial={marcoPreSelecionadoId}
        localIdInicial={localPreSelecionadoId}
        autorNome={usuario?.nome}
        onSucesso={handleSucessoEnvio}
      />

      {/* Inspetor de Evidência & Validação (#226, #227, #228) */}
      <InspetorEvidenciaSheet
        visible={evidenciaInspecionada !== null}
        evidencia={evidenciaInspecionada}
        indiceAtual={Math.max(0, indiceEvidenciaInspecionada)}
        totalEvidencias={evidenciasFiltradas.length}
        onClose={() => setEvidenciaInspecionadaId(null)}
        onAnterior={() => {
          if (indiceEvidenciaInspecionada > 0) {
            setEvidenciaInspecionadaId(
              evidenciasFiltradas[indiceEvidenciaInspecionada - 1].id
            );
          }
        }}
        onProxima={() => {
          if (indiceEvidenciaInspecionada < evidenciasFiltradas.length - 1) {
            setEvidenciaInspecionadaId(
              evidenciasFiltradas[indiceEvidenciaInspecionada + 1].id
            );
          }
        }}
        onAmpliarImagem={(url) => setLightboxUrl(url)}
        onSalvarDescricao={handleSalvarDescricaoEvidencia}
        onValidar={handleValidarEvidencia}
        onRemover={handleRemoverEvidencia}
      />

      {/* Lightbox Fullscreen de Inspeção Visual */}
      <ImageLightbox
        visible={Boolean(lightboxUrl)}
        imageUrl={lightboxUrl}
        onClose={() => setLightboxUrl(null)}
      />

      {/* Bottom Sheet: Trocar ou Criar Novo Empreendimento */}
      <BottomSheet
        visible={sheetObrasAberto}
        onClose={() => setSheetObrasAberto(false)}
        title={modoCriarObra ? 'Novo Empreendimento' : 'Selecionar Canteiro Ativo'}
        subtitle={
          modoCriarObra
            ? 'Cadastre uma nova obra na carteira da construtora'
            : 'Alterne entre as obras sob sua responsabilidade técnica'
        }
      >
        {!modoCriarObra ? (
          <View style={styles.sheetStack}>
            {empreendimentos.map((obra) => {
              const selecionada = obra.id === obraSelecionada?.id;
              return (
                <Card
                  key={obra.id}
                  selected={selecionada}
                  onPress={() => {
                    setObraSelecionada(obra);
                    carregarDadosObra(obra.id);
                    setSheetObrasAberto(false);
                  }}
                  style={styles.obraOptionCard}
                >
                  <View style={styles.flex1}>
                    <Typography variant="bodyStrong" color="strong">
                      {obra.nome}
                    </Typography>
                    <Typography variant="caption" color="muted">
                      {obra.endereco || 'Canteiro central'} • {obra.status}
                    </Typography>
                  </View>
                  <Badge
                    label={selecionada ? 'Ativa' : 'Selecionar'}
                    variant={selecionada ? 'primariaSuave' : 'neutro'}
                    size="sm"
                  />
                </Card>
              );
            })}

            <Button
              label="Cadastrar Novo Empreendimento"
              variant="primary"
              iconName="plus"
              fullWidth
              onPress={() => setModoCriarObra(true)}
            />
          </View>
        ) : (
          <View style={styles.sheetStack}>
            <Input
              label="Nome do Empreendimento"
              placeholder="Ex: Residencial Horizonte Sul"
              value={novaObraNome}
              onChangeText={setNovaObraNome}
              leftIcon="building"
            />
            <Input
              label="Descrição Técnica"
              placeholder="Torre residencial de alto padrão..."
              value={novaObraDescricao}
              onChangeText={setNovaObraDescricao}
            />
            <Input
              label="Endereço do Canteiro"
              placeholder="Av. Engenheiro Roberto Freire, 900"
              value={novaObraEndereco}
              onChangeText={setNovaObraEndereco}
              leftIcon="location"
            />
            <View style={styles.rowInputs}>
              <View style={styles.flex1}>
                <Button
                  label="Voltar"
                  variant="secondary"
                  fullWidth
                  onPress={() => setModoCriarObra(false)}
                />
              </View>
              <View style={styles.flex1}>
                <Button
                  label="Criar Obra"
                  variant="primary"
                  fullWidth
                  loading={salvandoModal}
                  onPress={handleCriarObra}
                />
              </View>
            </View>
          </View>
        )}
      </BottomSheet>

      {/* Bottom Sheet: Criar Etapa ou Marco */}
      <BottomSheet
        visible={sheetCronogramaAberto}
        onClose={() => setSheetCronogramaAberto(false)}
        title="Adicionar ao Cronograma"
        subtitle="Cadastre uma nova macroetapa ou marco de medição física"
      >
        <View style={styles.sheetStack}>
          <SegmentedControl
            value={tipoNovoItemCrono}
            onChange={setTipoNovoItemCrono}
            options={[
              { value: 'MARCO', label: 'Novo Marco', iconName: 'check-circle' },
              { value: 'ETAPA', label: 'Nova Etapa', iconName: 'layers' },
            ]}
          />

          {tipoNovoItemCrono === 'MARCO' && etapas.length > 0 ? (
            <View style={styles.subSecaoModal}>
              <Typography variant="label" color="muted">
                VINCULAR À ETAPA
              </Typography>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtrosRow}
              >
                {etapas.map((et) => {
                  const ativo = etapaPaiNovoMarcoId === et.id;
                  return (
                    <Pressable
                      key={et.id}
                      onPress={() => setEtapaPaiNovoMarcoId(et.id)}
                      style={[styles.chipFiltro, ativo && styles.chipFiltroAtivo]}
                    >
                      <Typography
                        variant="caption"
                        color={ativo ? 'inverted' : 'strong'}
                      >
                        {et.nome}
                      </Typography>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          ) : null}

          <Input
            label={
              tipoNovoItemCrono === 'MARCO'
                ? 'Título do Marco Técnico'
                : 'Nome da Macroetapa'
            }
            placeholder={
              tipoNovoItemCrono === 'MARCO'
                ? 'Ex: Concretagem da Laje do 2º Pavimento'
                : 'Ex: Esquadrias e Fachada'
            }
            value={novoItemCronoNome}
            onChangeText={setNovoItemCronoNome}
          />

          <Input
            label="Descrição Técnica / Critério de Aceite"
            placeholder="Ex: Verificação de prumo, estanqueidade e resistência..."
            value={novoItemCronoDesc}
            onChangeText={setNovoItemCronoDesc}
          />

          <Button
            label="Salvar no Cronograma"
            variant="primary"
            iconName="check"
            fullWidth
            loading={salvandoModal}
            onPress={handleCriarItemCronograma}
          />
        </View>
      </BottomSheet>

      {/* Bottom Sheet: Novo Local Físico */}
      <BottomSheet
        visible={sheetLocalAberto}
        onClose={() => setSheetLocalAberto(false)}
        title="Novo Local na Estrutura Física"
        subtitle="Amplie a árvore de rastreabilidade do empreendimento"
      >
        <View style={styles.sheetStack}>
          <SegmentedControl
            value={novoLocalTipo}
            onChange={setNovoLocalTipo}
            options={[
              { value: 'BLOCO', label: 'Bloco' },
              { value: 'PAVIMENTO', label: 'Pavimento' },
              { value: 'UNIDADE', label: 'Unidade' },
            ]}
          />

          {novoLocalTipo !== 'BLOCO' && locais.length > 0 ? (
            <View style={styles.subSecaoModal}>
              <Typography variant="label" color="muted">
                LOCAL PAI (BLOCO OU PAVIMENTO)
              </Typography>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filtrosRow}
              >
                {locais
                  .filter(
                    (l) =>
                      l.tipo === 'BLOCO' ||
                      l.tipo === 'TORRE' ||
                      l.tipo === 'PAVIMENTO'
                  )
                  .map((loc) => {
                    const ativo = novoLocalPaiId === loc.id;
                    return (
                      <Pressable
                        key={loc.id}
                        onPress={() => setNovoLocalPaiId(loc.id)}
                        style={[styles.chipFiltro, ativo && styles.chipFiltroAtivo]}
                      >
                        <Typography
                          variant="caption"
                          color={ativo ? 'inverted' : 'strong'}
                        >
                          {loc.nome}
                        </Typography>
                      </Pressable>
                    );
                  })}
              </ScrollView>
            </View>
          ) : null}

          <Input
            label="Identificação do Local"
            placeholder="Ex: Unidade 302 ou 3º Pavimento"
            value={novoLocalNome}
            onChangeText={setNovoLocalNome}
            leftIcon="location"
          />

          <Button
            label="Adicionar Local Físico"
            variant="primary"
            iconName="plus"
            fullWidth
            loading={salvandoModal}
            onPress={handleCriarLocalFisico}
          />
        </View>
      </BottomSheet>

      {/* Bottom Sheet: Novo Contrato */}
      <BottomSheet
        visible={sheetContratoAberto}
        onClose={() => setSheetContratoAberto(false)}
        title="Cadastrar Contrato de Obra"
        subtitle="Vincule um fornecedor ou empreiteira ao empreendimento"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.sheetStack}>
            <View style={styles.rowInputs}>
              <View style={styles.flex1}>
                <Input
                  label="Código"
                  value={novoContratoCodigo}
                  onChangeText={setNovoContratoCodigo}
                />
              </View>
              <View style={styles.flex1}>
                <Input
                  label="Valor (R$)"
                  value={novoContratoValor}
                  onChangeText={setNovoContratoValor}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <Input
              label="Razão Social / Fornecedor"
              placeholder="Ex: Atlas Elevadores e Montagens Ltda"
              value={novoContratoFornecedor}
              onChangeText={setNovoContratoFornecedor}
              leftIcon="building"
            />

            <Input
              label="CNPJ"
              value={novoContratoCnpj}
              onChangeText={setNovoContratoCnpj}
            />

            <Input
              label="Escopo Técnico Contratado"
              placeholder="Fornecimento e instalação de 2 elevadores sociais..."
              value={novoContratoEscopo}
              onChangeText={setNovoContratoEscopo}
              multiline
            />

            <Button
              label="Homologar Contrato"
              variant="primary"
              iconName="check"
              fullWidth
              loading={salvandoModal}
              onPress={handleCriarContrato}
            />
          </View>
        </ScrollView>
      </BottomSheet>

      {/* Bottom Sheet: Protocolo de Exigências do Marco */}
      <BottomSheet
        visible={marcoProtocoloAtivo !== null}
        onClose={() => setMarcoProtocoloAtivo(null)}
        title={marcoProtocoloAtivo?.nome || 'Protocolo de Qualidade'}
        subtitle="Checklist normativo de evidências para homologação do marco"
      >
        {marcoProtocoloAtivo ? (
          <View style={styles.sheetStack}>
            {protocolos
              .filter((p) => p.marco_id === marcoProtocoloAtivo.id)
              .map((prot) => (
                <View key={prot.id} style={styles.sheetStack}>
                  <Typography variant="body" color="muted">
                    {prot.descricao}
                  </Typography>
                  {prot.itens.map((item) => (
                    <Card key={item.id} subtle style={styles.itemProtocoloCard}>
                      <Icon
                        name="shield-check"
                        size={18}
                        color={ConstructoColors.primaria}
                      />
                      <View style={styles.flex1}>
                        <Typography variant="bodyStrong" color="strong">
                          {item.nome}
                        </Typography>
                        <Typography variant="caption" color="muted">
                          {item.descricao || 'Verificação normativa de campo'} •{' '}
                          {item.obrigatorio ? 'Obrigatório' : 'Opcional'}
                        </Typography>
                      </View>
                    </Card>
                  ))}
                </View>
              ))}

            <Button
              label="Capturar Evidência para este Marco"
              variant="primary"
              iconName="camera"
              fullWidth
              onPress={() => {
                const idMarco = marcoProtocoloAtivo.id;
                setMarcoProtocoloAtivo(null);
                handleDispararFotoContextual({ marcoId: idMarco });
              }}
            />
          </View>
        ) : null}
      </BottomSheet>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ConstructoColors.fundoPainel,
  },
  flex1: {
    flex: 1,
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: ConstructoColors.superficie,
    borderBottomWidth: 1,
    borderBottomColor: ConstructoColors.borda,
  },
  topHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
    marginRight: 8,
  },
  topHeaderTitleCol: {
    flex: 1,
    minWidth: 0,
  },
  roleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoutIconBtn: {
    width: 36,
    height: 36,
    borderRadius: ConstructoRadius.button,
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
    backgroundColor: ConstructoColors.superficieSutil,
    alignItems: 'center',
    justifyContent: 'center',
  },
  obraSelectorBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: ConstructoColors.superficieSutil,
    borderBottomWidth: 1,
    borderBottomColor: ConstructoColors.borda,
  },
  obraSelectorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: ConstructoColors.superficie,
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
    borderRadius: ConstructoRadius.card,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  obraSelectorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  trocarObraChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: ConstructoRadius.full,
    backgroundColor: ConstructoColors.primariaSuave,
  },
  siteStatusTicker: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: ConstructoColors.superficie,
    borderBottomWidth: 1,
    borderBottomColor: ConstructoColors.borda,
  },
  siteTickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  siteTickerText: {
    fontSize: 9.5,
    letterSpacing: 0.3,
  },
  siteTickerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: ConstructoColors.borda,
  },
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: ConstructoRadius.card,
    backgroundColor: ConstructoColors.primaria,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  abaContainer: {
    gap: 16,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  kpiCard: {
    flexBasis: '48%',
    flexGrow: 1,
    padding: 14,
    gap: 4,
  },
  kpiTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickerPill: {
    width: 20,
    height: 20,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secaoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    marginTop: 4,
  },
  filtrosRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  chipFiltro: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: ConstructoRadius.full,
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
    backgroundColor: ConstructoColors.superficie,
  },
  chipFiltroAtivo: {
    backgroundColor: ConstructoColors.primaria,
    borderColor: ConstructoColors.primaria,
  },
  chipEtapa: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: ConstructoRadius.button,
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
    backgroundColor: ConstructoColors.superficieSutil,
  },
  chipEtapaAtivo: {
    borderColor: ConstructoColors.primaria,
    backgroundColor: ConstructoColors.primariaSuave,
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 28,
    gap: 6,
  },
  listaEvidencias: {
    gap: 12,
  },
  cardEvidenciaItem: {
    flexDirection: 'row',
    alignItems: 'stretch',
    overflow: 'hidden',
  },
  trilhoStatus: {
    width: 4,
  },
  cardEvidenciaConteudo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    gap: 12,
  },
  acaoRapidaLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  thumbEvidencia: {
    width: 72,
    height: 72,
    borderRadius: ConstructoRadius.field,
    backgroundColor: ConstructoColors.superficieSutil,
  },
  evidenciaItemBody: {
    flex: 1,
    gap: 4,
  },
  evidenciaItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  evidenciaMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  metaInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  etapaCard: {
    gap: 12,
  },
  etapaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  etapaBadgesRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  barraTrilha: {
    height: 8,
    borderRadius: ConstructoRadius.full,
    backgroundColor: ConstructoColors.superficieSutil,
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
    overflow: 'hidden',
  },
  barraPreenchimento: {
    height: '100%',
    backgroundColor: ConstructoColors.primaria,
  },
  listaMarcosEtapa: {
    gap: 10,
    marginTop: 4,
  },
  marcoRowCard: {
    padding: 12,
    borderRadius: ConstructoRadius.field,
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
    backgroundColor: ConstructoColors.superficieSutil,
    gap: 10,
  },
  marcoRowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  marcoAcoesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  resumoEstruturaCard: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 14,
  },
  resumoEstruturaItem: {
    alignItems: 'center',
    gap: 2,
  },
  divisorVertical: {
    width: 1,
    height: 28,
    backgroundColor: ConstructoColors.borda,
  },
  arvoreWrapper: {
    gap: 10,
  },
  noHierarquiaContainer: {
    gap: 8,
  },
  noHierarquiaCard: {
    backgroundColor: ConstructoColors.superficie,
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
    borderRadius: ConstructoRadius.card,
    padding: 12,
  },
  noHierarquiaDestaque: {
    borderColor: ConstructoColors.bordaFoco,
    backgroundColor: ConstructoColors.primariaSuave,
  },
  noHierarquiaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  noHierarquiaTituloRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  iconeLocalBox: {
    width: 32,
    height: 32,
    borderRadius: ConstructoRadius.button,
    backgroundColor: ConstructoColors.superficieSutil,
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noHierarquiaAcoes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  botaoCameraMini: {
    width: 32,
    height: 32,
    borderRadius: ConstructoRadius.button,
    borderWidth: 1,
    borderColor: ConstructoColors.bordaFoco,
    backgroundColor: ConstructoColors.superficie,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filhosContainer: {
    gap: 8,
  },
  contratoCard: {
    gap: 10,
  },
  contratoTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contratoValoresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  contratoFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  listaEquipe: {
    gap: 8,
  },
  membroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  avatarMembro: {
    width: 38,
    height: 38,
    borderRadius: ConstructoRadius.full,
    backgroundColor: ConstructoColors.primariaSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetStack: {
    gap: 12,
  },
  obraOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    gap: 10,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  subSecaoModal: {
    gap: 6,
  },
  itemProtocoloCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 10,
  },
});
