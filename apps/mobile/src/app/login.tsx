import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import {
  Badge,
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
import { PapelUsuario } from '../types/auth';

type ModoAutenticacao = 'login' | 'cadastro';

export default function LoginScreen() {
  const router = useRouter();
  const { login, cadastrar } = useAuth();

  const [modo, setModo] = useState<ModoAutenticacao>('login');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Campos adicionais de cadastro
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [papelCadastro, setPapelCadastro] = useState<PapelUsuario>('GESTOR');

  const [carregando, setCarregando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState<string | null>(null);

  const redirecionarPorPapel = (papel: PapelUsuario) => {
    if (papel === 'GESTOR' || papel === 'ADMIN') {
      router.replace('/empresa');
    } else {
      router.replace('/cliente');
    }
  };

  const handleSubmeter = async () => {
    setMensagemErro(null);

    if (modo === 'login') {
      if (!email.trim() || !senha) {
        setMensagemErro('Informe seu e-mail corporativo e sua senha de acesso.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        return;
      }

      setCarregando(true);
      try {
        const usuario = await login(email.trim(), senha);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        redirecionarPorPapel(usuario.papel);
      } catch (erro) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setMensagemErro(
          erro instanceof Error
            ? erro.message
            : 'Não foi possível autenticar. Verifique suas credenciais.'
        );
      } finally {
        setCarregando(false);
      }
      return;
    }

    // Fluxo de Cadastro
    if (!nome.trim() || !email.trim() || senha.length < 6) {
      setMensagemErro('Preencha nome, e-mail válido e senha com no mínimo 6 caracteres.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setCarregando(true);
    try {
      const novoUsuario = await cadastrar({
        nome: nome.trim(),
        sobrenome: sobrenome.trim() || 'Constructo',
        cpf: cpf.trim() || '12345678901',
        telefone: telefone.trim() || '(63) 99200-0000',
        email: email.trim(),
        senha,
        papel: papelCadastro,
        empreendimento: 'Parque das Águas',
        unidade: papelCadastro === 'COMPRADOR' ? '202' : 'Engenharia',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      redirecionarPorPapel(novoUsuario.papel);
    } catch (erro) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setMensagemErro(
        erro instanceof Error ? erro.message : 'Erro ao criar conta corporativa.'
      );
    } finally {
      setCarregando(false);
    }
  };

  const entrarComPerfilHomologado = async (
    emailDemo: string,
    senhaDemo: string = 'Demo@123'
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setModo('login');
    setEmail(emailDemo);
    setSenha(senhaDemo);
    setMensagemErro(null);
    setCarregando(true);

    try {
      const usuario = await login(emailDemo, senhaDemo);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      redirecionarPorPapel(usuario.papel);
    } catch (erro) {
      setMensagemErro(
        erro instanceof Error ? erro.message : 'Falha ao acessar perfil demonstrativo.'
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Cabeçalho Institucional Arquitetônico */}
          <View style={styles.brandHeader}>
            <View style={styles.topStatusRow}>
              <ConstructoLogo
                size="md"
                subtitle="SISTEMA DE GESTÃO & AUDITORIA DE OBRAS"
              />
              <Badge label="v2.6 Enterprise" variant="primariaSuave" size="sm" dot />
            </View>

            <Typography variant="body" color="muted">
              Acompanhamento físico-financeiro de canteiro, controle de protocolos de qualidade e diário transparente para compradores.
            </Typography>
          </View>

          {/* Card Principal de Autenticação */}
          <Card style={styles.formCard}>
            <SegmentedControl
              options={[
                { value: 'login', label: 'Acessar Conta', iconName: 'shield-check' },
                { value: 'cadastro', label: 'Nova Conta', iconName: 'user' },
              ]}
              value={modo}
              onChange={(novoModo) => {
                setModo(novoModo);
                setMensagemErro(null);
              }}
            />

            {mensagemErro ? (
              <View style={styles.erroBox}>
                <Icon name="alert-circle" size={16} color={ConstructoColors.erro} />
                <Typography variant="caption" color="danger" style={{ flex: 1 }}>
                  {mensagemErro}
                </Typography>
              </View>
            ) : null}

            {modo === 'cadastro' ? (
              <>
                <View style={styles.rowInputs}>
                  <Input
                    label="NOME"
                    placeholder="Ex: Rafael"
                    value={nome}
                    onChangeText={setNome}
                    containerStyle={{ flex: 1 }}
                  />
                  <Input
                    label="SOBRENOME"
                    placeholder="Ex: Nogueira"
                    value={sobrenome}
                    onChangeText={setSobrenome}
                    containerStyle={{ flex: 1 }}
                  />
                </View>

                <View style={styles.rowInputs}>
                  <Input
                    label="CPF"
                    placeholder="000.000.000-00"
                    keyboardType="numeric"
                    value={cpf}
                    onChangeText={setCpf}
                    containerStyle={{ flex: 1 }}
                  />
                  <Input
                    label="TELEFONE / WHATSAPP"
                    placeholder="(63) 99999-0000"
                    keyboardType="phone-pad"
                    value={telefone}
                    onChangeText={setTelefone}
                    containerStyle={{ flex: 1 }}
                  />
                </View>

                <View style={{ gap: 6 }}>
                  <Typography variant="label" color="muted">
                    PERFIL DE ACESSO
                  </Typography>
                  <SegmentedControl
                    options={[
                      { value: 'GESTOR', label: 'Engenharia (Campo)' },
                      { value: 'COMPRADOR', label: 'Comprador (Imóvel)' },
                    ]}
                    value={papelCadastro}
                    onChange={setPapelCadastro}
                  />
                </View>
              </>
            ) : null}

            <Input
              label="E-MAIL CORPORATIVO OU DECLIENTE"
              placeholder="nome@construtora.com.br"
              leftIcon="user"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />

            <Input
              label="SENHA DE ACESSO"
              placeholder="Digite sua senha"
              leftIcon="shield-check"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
            />

            <Button
              label={
                carregando
                  ? 'Autenticando credenciais...'
                  : modo === 'login'
                    ? 'Entrar na Plataforma'
                    : 'Criar Conta e Acessar'
              }
              iconName="arrow-up-right"
              variant="primary"
              size="lg"
              fullWidth
              loading={carregando}
              disabled={carregando}
              onPress={handleSubmeter}
            />
          </Card>

          {/* Painel de Acesso Rápido Homologado (Ambientes de Demonstração Parque das Águas) */}
          <Card subtle style={styles.demoPanel}>
            <View style={styles.demoHeader}>
              <View style={{ flex: 1, gap: 2 }}>
                <Typography variant="label" color="primary">
                  AMBIENTE HOMOLOGADO • PARQUE DAS ÁGUAS
                </Typography>
                <Typography variant="caption" color="muted">
                  Toque em um perfil abaixo para entrar diretamente com dados reais de obra:
                </Typography>
              </View>
            </View>

            <View style={styles.personaList}>
              <Card
                padding={12}
                onPress={() => entrarComPerfilHomologado('demo.gestor1@example.com')}
                style={styles.personaCard}
              >
                <View style={styles.personaIconBox}>
                  <Icon name="building" size={18} color={ConstructoColors.primaria} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={styles.personaTitleRow}>
                    <Typography variant="bodyStrong" color="strong">
                      Eng. Rafael Nogueira
                    </Typography>
                    <Badge label="GESTOR DE CAMPO" variant="primariaSuave" size="sm" />
                  </View>
                  <Typography variant="caption" color="muted">
                    Captura em 3 cliques, auditoria de evidências, cronograma, estrutura e contratos
                  </Typography>
                </View>
                <Icon name="chevron-right" size={16} color={ConstructoColors.textoSuave} />
              </Card>

              <Card
                padding={12}
                onPress={() => entrarComPerfilHomologado('demo.comprador2@example.com')}
                style={styles.personaCard}
              >
                <View
                  style={[
                    styles.personaIconBox,
                    { backgroundColor: ConstructoColors.destaqueSuave, borderColor: '#E5C178' },
                  ]}
                >
                  <Icon name="home" size={18} color={ConstructoColors.destaque} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={styles.personaTitleRow}>
                    <Typography variant="bodyStrong" color="strong">
                      Beatriz Lima • Unidade 202
                    </Typography>
                    <Badge label="COMPRADOR" variant="destaqueSuave" size="sm" />
                  </View>
                  <Typography variant="caption" color="muted">
                    Feed social de evolução da obra, barra de impacto (+%) e ficha do imóvel
                  </Typography>
                </View>
                <Icon name="chevron-right" size={16} color={ConstructoColors.textoSuave} />
              </Card>

              <Card
                padding={12}
                onPress={() => entrarComPerfilHomologado('demo.admin@example.com')}
                style={styles.personaCard}
              >
                <View style={styles.personaIconBox}>
                  <Icon name="shield-check" size={18} color={ConstructoColors.primaria} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <View style={styles.personaTitleRow}>
                    <Typography variant="bodyStrong" color="strong">
                      Marina Albuquerque
                    </Typography>
                    <Badge label="DIRETORIA / ADMIN" variant="neutro" size="sm" />
                  </View>
                  <Typography variant="caption" color="muted">
                    Visão multi-empreendimentos, homologação de protocolos e governança
                  </Typography>
                </View>
                <Icon name="chevron-right" size={16} color={ConstructoColors.textoSuave} />
              </Card>
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: ConstructoColors.fundoPainel,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 18,
    paddingVertical: 20,
    justifyContent: 'center',
    gap: 18,
    maxWidth: 520,
    width: '100%',
    alignSelf: 'center',
  },
  brandHeader: {
    gap: 10,
  },
  topStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  formCard: {
    gap: 14,
    padding: 20,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  erroBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: ConstructoColors.erroSuave,
    padding: 12,
    borderRadius: ConstructoRadius.field,
    borderWidth: 1,
    borderColor: ConstructoColors.erro,
  },
  demoPanel: {
    gap: 12,
    padding: 16,
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  personaList: {
    gap: 10,
  },
  personaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  personaIconBox: {
    width: 40,
    height: 40,
    borderRadius: ConstructoRadius.field,
    backgroundColor: ConstructoColors.primariaSuave,
    borderWidth: 1,
    borderColor: ConstructoColors.bordaFoco,
    alignItems: 'center',
    justifyContent: 'center',
  },
  personaTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    flexWrap: 'wrap',
  },
});
