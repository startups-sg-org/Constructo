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

const FOTOS_CAMPO_DEMO = [
  '/uploads/empreendimentos/1/evidencias/parque-das-aguas-06.jpeg',
  '/uploads/empreendimentos/1/evidencias/parque-das-aguas-07.jpeg',
  '/uploads/empreendimentos/1/evidencias/parque-das-aguas-08.jpeg',
  '/uploads/empreendimentos/1/evidencias/parque-das-aguas-09.jpeg',
  '/uploads/empreendimentos/1/evidencias/parque-das-aguas-10.jpeg',
];

export function CameraSelector({ onFotoCapturada, nomeObra }: CameraSelectorProps) {
  const acionarFotoDemo = () => {
    const aleatoria = FOTOS_CAMPO_DEMO[Math.floor(Math.random() * FOTOS_CAMPO_DEMO.length)];
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
          'Ative o acesso à câmera nas configurações ou utilize uma foto da galeria.'
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
      acionarFotoDemo();
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
      acionarFotoDemo();
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
            <Badge label="Fluxo 3-Cliques" variant="primariaSuave" size="sm" dot />
          </View>
          <Typography variant="caption" color="muted">
            {nomeObra
              ? `Capture e vincule evidências diretamente em ${nomeObra}`
              : 'Capture a evidência e publique o avanço para auditoria e clientes'}
          </Typography>
        </View>
      </View>

      <View style={styles.botoesLinha}>
        <Button
          label="Capturar Câmera"
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

      <View style={styles.quickSimRow}>
        <Typography variant="caption" color="muted" style={{ flex: 1 }}>
          Sem câmera física no emulador?
        </Typography>
        <Button
          label="Simular Captura de Canteiro"
          iconName="bolt"
          variant="outline"
          size="sm"
          onPress={acionarFotoDemo}
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
    borderWidth: 1,
    borderColor: ConstructoColors.bordaFoco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  botoesLinha: {
    flexDirection: 'row',
    gap: 10,
  },
  btnAcao: {
    flex: 1.6,
  },
  btnGaleria: {
    flex: 1,
  },
  quickSimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: ConstructoColors.borda,
    gap: 8,
  },
});
