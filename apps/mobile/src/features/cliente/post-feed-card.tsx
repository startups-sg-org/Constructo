import React, { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Badge, Button, Card, Icon, StampChancela, Typography } from '../../components/ui';
import { ConstructoColors, ConstructoRadius } from '../../constants/theme';
import { PostagemFeedSocial } from '../../types/feed';

export interface PostFeedCardProps {
  post: PostagemFeedSocial;
  onImagePress: (url: string) => void;
  onDetalhesPress?: (post: PostagemFeedSocial) => void;
  index: number;
}

export function PostFeedCard({
  post,
  onImagePress,
  onDetalhesPress,
  index,
}: PostFeedCardProps) {
  const progressoAlvo = post.impactoProgresso.progressoAcumuladoAteAqui;
  const progressoAnterior = post.impactoProgresso.progressoAnterior ?? Math.max(0, progressoAlvo - post.impactoProgresso.deltaPercentual);
  const barraAnimada = useSharedValue(progressoAnterior);
  const [confirmadoLeitura, setConfirmadoLeitura] = useState(false);

  useEffect(() => {
    barraAnimada.value = withDelay(
      index * 55,
      withSpring(progressoAlvo, { damping: 16, stiffness: 85 })
    );
  }, [progressoAlvo, index, barraAnimada]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${Math.min(barraAnimada.value, 100)}%`,
  }));

  const handleImageClick = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onImagePress(post.imagemUrl);
  };

  const iniciais = post.autorNome
    .replace(/^Eng\.\s*/i, '')
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  return (
    <Card style={styles.card}>
      {/* 1. Cabeçalho Técnico-Humanizado do Autor */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Typography variant="bodyStrong" color="primary">
            {iniciais || 'EN'}
          </Typography>
        </View>

        <View style={styles.autorInfo}>
          <View style={styles.autorLinha}>
            <Typography variant="bodyStrong" color="strong">
              {post.autorNome}
            </Typography>
            <Icon name="shield-check" size={14} color={ConstructoColors.primaria} />
          </View>
          <Typography variant="caption" color="muted">
            {post.autorCrea || post.autorCargo} • {post.dataExibicao}
          </Typography>
        </View>

        <Badge label={post.etapa.nome} variant="primariaSuave" size="sm" />
      </View>

      {/* Linha de Contexto Físico (Local + Marco) */}
      <View style={styles.contextoBar}>
        <View style={styles.contextoItem}>
          <Icon name="location" size={13} color={ConstructoColors.primaria} />
          <Typography variant="caption" color="strong" numberOfLines={1}>
            {post.localNome || 'Bloco A • Canteiro'}
          </Typography>
        </View>
        <View style={styles.dotSeparator} />
        <View style={styles.contextoItem}>
          <Icon name="layers" size={13} color={ConstructoColors.textoSuave} />
          <Typography variant="caption" color="muted" numberOfLines={1}>
            {post.marcoNome || post.etapa.nome}
          </Typography>
        </View>
      </View>

      {/* 2. Mídia Imersiva 4:3 com Badge de Impacto Flutuante */}
      <Pressable onPress={handleImageClick} style={styles.imagemContainer}>
        <Image
          source={{ uri: post.imagemUrl }}
          style={styles.imagem}
          contentFit="cover"
          transition={250}
        />

        {/* Badge Dinâmico de Impacto Flutuante (+X% no Progresso Total) */}
        <View style={styles.badgeFlutuante}>
          <Badge
            label={post.badge.texto}
            variant={post.badge.variante === 'destaque' ? 'destaque' : 'primaria'}
            size="md"
            iconName="bolt"
          />
        </View>

        {/* Selo de Homologação e Botão de Zoom */}
        <View style={styles.bottomImageOverlay}>
          {post.statusValidacao === 'VALIDA' ? (
            <Badge
              label="Vistoria Homologada"
              variant="sucesso"
              size="sm"
              iconName="check-circle"
            />
          ) : (
            <Badge
              label="Em auditoria técnica"
              variant="destaqueSuave"
              size="sm"
              iconName="clock"
            />
          )}
          <View style={styles.zoomHintPill}>
            <Icon name="search" size={12} color="#FFFFFF" />
            <Typography variant="caption" color="inverted">
              Tela cheia
            </Typography>
          </View>
        </View>
      </Pressable>

      {/* 3. Barra de Progresso Reativa Acumulada */}
      <View style={styles.progressoBloco}>
        <View style={styles.progressoRotulos}>
          <Typography variant="caption" color="muted">
            Evolução acumulada da obra neste marco:
          </Typography>
          <View style={styles.evolucaoNumeros}>
            <Typography variant="caption" color="muted" tabular>
              {progressoAnterior}% →
            </Typography>
            <Typography variant="bodyStrong" color="primary" tabular>
              {post.impactoProgresso.progressoAcumuladoAteAqui}%
            </Typography>
          </View>
        </View>
        <View style={styles.trilhaBarra}>
          <Animated.View style={[styles.preenchimentoBarra, progressBarStyle]} />
        </View>
      </View>

      {/* 4. Título do Marco e Descrição Técnica Traduzida */}
      <View style={styles.corpoTexto}>
        <Typography variant="titleSmall" color="strong">
          {post.marcoNome || `Avanço em ${post.etapa.nome}`}
        </Typography>
        <Typography variant="body" color="default">
          {post.legenda}
        </Typography>
      </View>

      {/* 5. Caixa Informativa de Próximo Passo */}
      <View style={styles.proximoPassoBox}>
        <View style={styles.proximoPassoHeader}>
          <Icon name="arrow-up-right" size={14} color={ConstructoColors.primaria} />
          <Typography variant="label" color="primary">
            PRÓXIMA FRENTE DE SERVIÇO
          </Typography>
        </View>
        <Typography variant="caption" color="default">
          {post.proximoPasso ||
            'A equipe de engenharia dará sequência à etapa seguinte conforme o cronograma executivo.'}
        </Typography>
      </View>

      {/* 5.5 Chancela e Selo de Auditoria Técnica */}
      <StampChancela
        status={post.statusValidacao === 'VALIDA' ? 'HOMOLOGADO' : 'PENDENTE'}
        codigoArt={`ART-2026/${(post.id * 137) + 3200}`}
        responsavelTecnico={post.autorNome}
        registroCrea={post.autorCrea || 'CREA-SP 5062491-D'}
        dataHora={`${post.dataExibicao} • CANTEIRO CENTRAL`}
        coordenadasGps="-23.5874, -46.6812"
        compact
      />

      {/* 6. Barra de Ações do Comprador */}
      <View style={styles.footerActions}>
        <Button
          label={confirmadoLeitura ? 'Avanço Conferido' : 'Confirmar Leitura'}
          iconName={confirmadoLeitura ? 'check-circle' : 'check'}
          variant={confirmadoLeitura ? 'outline' : 'secondary'}
          size="sm"
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setConfirmadoLeitura((prev) => !prev);
          }}
          style={{ flex: 1 }}
        />
        {onDetalhesPress ? (
          <Button
            label="Ficha Técnica"
            iconName="document"
            variant="secondary"
            size="sm"
            onPress={() => onDetalhesPress(post)}
            style={{ flex: 1 }}
          />
        ) : null}
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: ConstructoColors.superficie,
    borderRadius: ConstructoRadius.card,
    padding: 16,
    gap: 13,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: ConstructoRadius.field,
    backgroundColor: ConstructoColors.primariaSuave,
    borderWidth: 1,
    borderColor: ConstructoColors.bordaFoco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  autorInfo: {
    flex: 1,
    gap: 2,
  },
  autorLinha: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  contextoBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: ConstructoColors.superficieSutil,
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
    borderRadius: ConstructoRadius.field,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 8,
  },
  contextoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexShrink: 1,
  },
  dotSeparator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: ConstructoColors.bordaFoco,
  },
  imagemContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: ConstructoRadius.card,
    overflow: 'hidden',
    backgroundColor: ConstructoColors.fundoPainel,
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
  },
  imagem: {
    width: '100%',
    height: '100%',
  },
  badgeFlutuante: {
    position: 'absolute',
    top: 12,
    left: 12,
  },
  bottomImageOverlay: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  zoomHintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.72)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: ConstructoRadius.full,
  },
  progressoBloco: {
    gap: 6,
  },
  progressoRotulos: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  evolucaoNumeros: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  trilhaBarra: {
    height: 7,
    borderRadius: 4,
    backgroundColor: ConstructoColors.borda,
    overflow: 'hidden',
  },
  preenchimentoBarra: {
    height: '100%',
    backgroundColor: ConstructoColors.primaria,
    borderRadius: 4,
  },
  corpoTexto: {
    gap: 4,
  },
  proximoPassoBox: {
    backgroundColor: ConstructoColors.superficieSutil,
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
    borderRadius: ConstructoRadius.field,
    padding: 12,
    gap: 4,
  },
  proximoPassoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  footerActions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: ConstructoColors.borda,
  },
});
