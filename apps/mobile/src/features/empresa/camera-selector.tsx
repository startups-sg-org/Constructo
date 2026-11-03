import React from 'react';
import { Alert, Platform, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Haptics from 'expo-haptics';
import { Badge, Button, Card, Icon, Typography } from '../../components/ui';
import { ConstructoColors, ConstructoRadius } from '../../constants/theme';
import { resolverUrlMidia } from '../feed/feed.adapter';

export interface CameraSelectorProps {
  onFotoCapturada: (uri: string) => void;
  nomeObra?: string;
}

const AMOSTRAS_VISTORIA_TECNICA = [
  '/uploads/empreendimentos/1/evidencias/parque-das-aguas-06.jpeg',
  '/uploads/empreendimentos/1/evidencias/parque-das-aguas-07.jpeg',
  '/uploads/empreendimentos/1/evidencias/parque-das-aguas-08.jpeg',
  '/uploads/empreendimentos/1/evidencias/parque-das-aguas-09.jpeg',
  '/uploads/empreendimentos/1/evidencias/parque-das-aguas-10.jpeg',
];

export function CameraSelector({ onFotoCapturada, nomeObra }: CameraSelectorProps) {
  const carregarDoAcervoTecnico = () => {
    const aleatoria = AMOSTRAS_VISTORIA_TECNICA[Math.floor(Math.random() * AMOSTRAS_VISTORIA_TECNICA.length)];
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onFotoCapturada(resolverUrlMidia(aleatoria));
  };

  const handleTirarFoto = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      if (Platform.OS === 'web') {
        const res = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.9,
        });
        if (!res.canceled && res.assets[0]?.uri) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onFotoCapturada(res.assets[0].uri);
        }
        return;
      }

      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão de Câmera',
          'Ative o acesso à câmera nas configurações ou utilize o acervo técnico.'
        );
        return;
      }

      const resultado = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });

      if (!resultado.canceled && resultado.assets[0]?.uri) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onFotoCapturada(resultado.assets[0].uri);
      }
    } catch {
      carregarDoAcervoTecnico();
    }
  };

  const handleEscolherGaleria = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted' && Platform.OS !== 'web') {
        Alert.alert('Permissão de Galeria', 'É necessário permitir o acesso às fotos.');
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.9,
      });

      if (!resultado.canceled && resultado.assets[0]?.uri) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onFotoCapturada(resultado.assets[0].uri);
      }
    } catch {
      carregarDoAcervoTecnico();
    }
  };

  return (
    <Card style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconBox}>
          <Icon name="camera" size={20} color={ConstructoColors.primaria} />
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <View style={styles.titleLine}>
            <Typography variant="titleSmall" color="strong">
              Registro Técnico de Campo
            </Typography>
            <Badge label="Fluxo de Vistoria" variant="primariaSuave" size="sm" dot />
          </View>
          <Typography variant="caption" color="muted">
            {nomeObra
              ? `Capture e vincule evidências com geolocalização em ${nomeObra}`
              : 'Capture a evidência física e homologue o avanço para auditoria e compradores'}
          </Typography>
        </View>
      </View>

      <View style={styles.botoesLinha}>
        <Button
          label="Fotografar Obra"
          iconName="camera"
          variant="primary"
          size="lg"
          onPress={handleTirarFoto}
          style={styles.btnAcao}
        />
        <Button
          label="Galeria"
          iconName="photo-library"
          variant="secondary"
          size="lg"
          onPress={handleEscolherGaleria}
          style={styles.btnGaleria}
        />
      </View>

      <View style={styles.acervoRow}>
        <View style={styles.acervoInfo}>
          <Icon name="archive" size={13} color={ConstructoColors.textoSuave} />
          <Typography variant="caption" color="muted">
            Acervo Técnico Local
          </Typography>
        </View>
        <Button
          label="Carregar Amostra da Obra"
          iconName="bolt"
          variant="ghost"
          size="sm"
          onPress={carregarDoAcervoTecnico}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: 14,
    backgroundColor: ConstructoColors.superficie,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: ConstructoRadius.field,
    backgroundColor: ConstructoColors.primariaSuave,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ConstructoColors.bordaFoco,
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  botoesLinha: {
    flexDirection: 'row',
    gap: 10,
  },
  btnAcao: {
    flex: 1.4,
  },
  btnGaleria: {
    flex: 1,
  },
  acervoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: ConstructoColors.bordaSutil,
  },
  acervoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
});
