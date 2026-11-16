import React, { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ConstructoColors } from '../constants/theme';
import { useAuth } from '../context/auth-context';
import { ConstructoLogo, Typography } from '../components/ui';

export default function IndexSplashGateway() {
  const router = useRouter();
  const { usuario, carregando, autenticado } = useAuth();

  useEffect(() => {
    if (carregando) return;

    if (!autenticado || !usuario) {
      router.replace('/login');
    } else if (usuario.papel === 'GESTOR' || usuario.papel === 'ADMIN') {
      router.replace('/empresa');
    } else {
      router.replace('/cliente');
    }
  }, [carregando, autenticado, usuario, router]);

  return (
    <View style={styles.container}>
      <ConstructoLogo
        size="lg"
        subtitle="PLATAFORMA DE ENGENHARIA & GESTÃO DE OBRAS"
      />
      <ActivityIndicator
        size="small"
        color={ConstructoColors.primaria}
        style={{ marginTop: 18 }}
      />
      <Typography variant="caption" color="muted">
        Sincronizando credenciais e ambiente operacional...
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ConstructoColors.fundoPainel,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
  },
});
