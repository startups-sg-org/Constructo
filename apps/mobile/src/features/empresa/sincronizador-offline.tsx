import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Badge, Button, Card, Icon, Typography } from '../../components/ui';
import { ConstructoColors, ConstructoRadius } from '../../constants/theme';
import { offlineService } from '../../services/offline.service';

export interface SincronizadorOfflineProps {
  onSincronizacaoConcluida?: () => void;
}

export function SincronizadorOffline({ onSincronizacaoConcluida }: SincronizadorOfflineProps) {
  const [pendentes, setPendentes] = useState<number>(0);
  const [sincronizando, setSincronizando] = useState<boolean>(false);

  const carregarPendentes = async () => {
    const itens = await offlineService.listarPendentes();
    setPendentes(itens.length);
  };

  useEffect(() => {
    carregarPendentes();
    const interval = setInterval(carregarPendentes, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleSincronizar = async () => {
    setSincronizando(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const resultado = await offlineService.sincronizar();
      await carregarPendentes();

      if (resultado.enviados > 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSincronizacaoConcluida?.();
      }
    } finally {
      setSincronizando(false);
    }
  };

  if (pendentes === 0) return null;

  return (
    <Card style={styles.card}>
      <View style={styles.conteudo}>
        <View style={styles.iconBox}>
          <Icon name="wifi-off" size={18} color={ConstructoColors.destaque} />
        </View>
        <View style={styles.textoContainer}>
          <View style={styles.badgeLinha}>
            <Badge
              label={`${pendentes} evidência(s) na fila offline`}
              variant="destaque"
              size="sm"
              dot
            />
          </View>
          <Typography variant="caption" color="default">
            Registros armazenados com segurança no dispositivo aguardando sincronização.
          </Typography>
        </View>

        <Button
          label={sincronizando ? 'Enviando' : 'Sincronizar'}
          iconName="sync"
          variant="destaque"
          size="sm"
          loading={sincronizando}
          onPress={handleSincronizar}
        />
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: ConstructoColors.destaqueSuave,
    borderColor: '#E5C178',
    padding: 13,
  },
  conteudo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: ConstructoRadius.field,
    backgroundColor: ConstructoColors.superficie,
    borderWidth: 1,
    borderColor: '#E5C178',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoContainer: {
    flex: 1,
    gap: 3,
  },
  badgeLinha: {
    flexDirection: 'row',
  },
});
