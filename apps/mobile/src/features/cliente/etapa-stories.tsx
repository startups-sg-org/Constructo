import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Icon, Typography } from '../../components/ui';
import { ConstructoColors } from '../../constants/theme';
import { PostagemFeedSocial } from '../../types/feed';

export const CORES_ETAPAS = ['#D97706', '#059669', '#0284C7', '#7C3AED', '#EA580C'];

export interface EtapaStoriesProps {
  posts: PostagemFeedSocial[];
  selecionada: string;
  onSelect: (nome: string) => void;
}

interface ItemEtapa {
  nome: string;
  total: number;
  capa: string | null;
  cor: string;
}

/**
 * Faixa horizontal de etapas com foto de capa (inspirada em "stories"):
 * cada tile mostra a última foto da etapa, a contagem de registros e um anel
 * colorido que anima quando a etapa é selecionada.
 */
export function EtapaStories({ posts, selecionada, onSelect }: EtapaStoriesProps) {
  const itens = useMemo<ItemEtapa[]>(() => {
    const mapa = new Map<string, ItemEtapa>();
    [...posts]
      .sort((a, b) => b.timestampCaptura - a.timestampCaptura)
      .forEach((post) => {
        const existente = mapa.get(post.etapa.nome);
        if (existente) {
          existente.total += 1;
        } else {
          mapa.set(post.etapa.nome, {
            nome: post.etapa.nome,
            total: 1,
            capa: post.imagemUrl,
            cor: CORES_ETAPAS[mapa.size % CORES_ETAPAS.length],
          });
        }
      });
    return [
      {
        nome: 'TODAS',
        total: posts.length,
        capa: null,
        cor: ConstructoColors.primaria,
      },
      ...Array.from(mapa.values()),
    ];
  }, [posts]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {itens.map((item) => (
        <StoryTile
          key={item.nome}
          item={item}
          ativo={selecionada === item.nome}
          onPress={() => onSelect(item.nome)}
        />
      ))}
    </ScrollView>
  );
}

function StoryTile({
  item,
  ativo,
  onPress,
}: {
  item: ItemEtapa;
  ativo: boolean;
  onPress: () => void;
}) {
  const escala = useSharedValue(1);
  const anel = useSharedValue(ativo ? 1 : 0);

  React.useEffect(() => {
    anel.value = withTiming(ativo ? 1 : 0, { duration: 220 });
  }, [ativo, anel]);

  const tileStyle = useAnimatedStyle(() => ({
    transform: [{ scale: escala.value }],
  }));

  const anelStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      anel.value,
      [0, 1],
      [ConstructoColors.borda, item.cor]
    ),
  }));

  const rotulo = item.nome === 'TODAS' ? 'Todas' : item.nome;

  return (
    <Pressable
      onPressIn={() => {
        escala.value = withSpring(0.95, { damping: 20, stiffness: 300 });
      }}
      onPressOut={() => {
        escala.value = withSpring(1, { damping: 20, stiffness: 300 });
      }}
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      accessibilityRole="button"
      accessibilityState={{ selected: ativo }}
      accessibilityLabel={`Filtrar por ${rotulo}, ${item.total} registros`}
    >
      <Animated.View style={[styles.tile, tileStyle]}>
        <Animated.View style={[styles.anel, anelStyle]}>
          {item.capa ? (
            <Image
              source={{ uri: item.capa }}
              style={styles.capa}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.capa, styles.capaTodas]}>
              <Icon name="layers" size={22} color={ConstructoColors.primaria} />
            </View>
          )}
          <View style={[styles.contador, { backgroundColor: item.cor }]}>
            <Typography variant="caption" color="inverted" tabular style={styles.contadorTexto}>
              {item.total}
            </Typography>
          </View>
        </Animated.View>
        <Typography
          variant="caption"
          color={ativo ? 'strong' : 'muted'}
          numberOfLines={1}
          style={[styles.rotulo, ativo && styles.rotuloAtivo]}
        >
          {rotulo}
        </Typography>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 12,
    paddingVertical: 2,
    paddingRight: 8,
  },
  tile: {
    width: 68,
    alignItems: 'center',
    gap: 6,
  },
  anel: {
    width: 68,
    height: 68,
    borderRadius: 18,
    borderWidth: 2,
    padding: 3,
    backgroundColor: ConstructoColors.superficie,
  },
  capa: {
    width: '100%',
    height: '100%',
    borderRadius: 13,
  },
  capaTodas: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: ConstructoColors.primariaSuave,
  },
  contador: {
    position: 'absolute',
    right: -4,
    bottom: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: ConstructoColors.fundoPainel,
  },
  contadorTexto: {
    fontSize: 10,
    lineHeight: 12,
    fontWeight: '700',
  },
  rotulo: {
    fontSize: 11,
    lineHeight: 14,
    textAlign: 'center',
    maxWidth: 68,
  },
  rotuloAtivo: {
    fontWeight: '700',
  },
});

