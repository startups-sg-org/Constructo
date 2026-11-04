import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import {
  Badge,
  Button,
  Card,
  Icon,
  Input,
  SegmentedControl,
  Typography,
} from '../components/ui';
import { ConstructoColors, ConstructoRadius } from '../constants/theme';
import { useAuth } from '../context/auth-context';
import { LoginHero, LOGIN_HERO_COR_FUNDO } from '../features/auth/login-hero';
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
  const [mostrarDiretorio, setMostrarDiretorio] = useState(false);

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
            : 'Credenciais inválidas. Verifique seu e-mail e senha.'
        );
      } finally {
        setCarregando(false);
      }
      return;
    }

    // Fluxo de Cadastro Corporativo
    if (!nome.trim() || !email.trim() || senha.length < 6) {
      setMensagemErro('Preencha nome, e-mail corporativo válido e senha com no mínimo 6 dígitos.');
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
        empreendimento: 'Residencial Parque das Águas',
        unidade: papelCadastro === 'COMPRADOR' ? '202' : 'Canteiro Central',
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      redirecionarPorPapel(novoUsuario.papel);
    } catch (erro) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setMensagemErro(
        erro instanceof Error ? erro.message : 'Erro ao inicializar acesso corporativo.'
      );
    } finally {
      setCarregando(false);
    }
  };

  const entrarComCredencialDiretorio = async (
    emailAlvo: string,
    senhaPadrao: string = 'Demo@123'
  ) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setModo('login');
    setEmail(emailAlvo);
    setSenha(senhaPadrao);
    setMensagemErro(null);
    setCarregando(true);

    try {
      const usuario = await login(emailAlvo, senhaPadrao);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      redirecionarPorPapel(usuario.papel);
    } catch (erro) {
      setMensagemErro(
        erro instanceof Error ? erro.message : 'Falha ao autenticar com a credencial selecionada.'
      );
    } finally {
      setCarregando(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Hero institucional: grade técnica, edifício em construção e fluxo em 3 passos */}
          <LoginHero />

          {/* Folha de autenticação sobreposta ao hero */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(460)}
            style={styles.formSheet}
          >
            <View style={styles.formTitulos}>
              <Typography variant="titleLarge" color="strong">
                {modo === 'login' ? 'Bem-vindo de volta' : 'Crie seu acesso'}
              </Typography>
              <Typography variant="body" color="muted">
                {modo === 'login'
                  ? 'Entre para acompanhar e registrar o avanço da obra.'
                  : 'Cadastre-se como engenharia ou comprador do imóvel.'}
              </Typography>
            </View>

            <SegmentedControl
              options={[
                { value: 'login', label: 'Acesso Corporativo', iconName: 'shield-check' },
                { value: 'cadastro', label: 'Cadastrar Novo', iconName: 'user' },
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
              label="E-MAIL CORPORATIVO"
              placeholder="engenheiro@construtora.com.br"
              leftIcon="user"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />

            <Input
              label="SENHA DE ACESSO"
              placeholder="Digite sua senha de segurança"
              leftIcon="shield-check"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
            />

            <Button
              label={
                carregando
                  ? 'Validando autenticação...'
                  : modo === 'login'
                    ? 'Entrar no Sistema'
                    : 'Concluir Cadastro & Entrar'
              }
              iconName="arrow-up-right"
              variant="primary"
              size="lg"
              fullWidth
              loading={carregando}
              disabled={carregando}
              onPress={handleSubmeter}
            />
          </Animated.View>

          {/* Diretório Corporativo Autorizado (Acesso Rápido para Auditoria e Demonstração Executiva) */}
          <View style={styles.diretorioContainer}>
            <Pressable
              onPress={() => {
                Haptics.selectionAsync();
                setMostrarDiretorio((prev) => !prev);
              }}
              style={styles.diretorioToggle}
              accessibilityRole="button"
            >
              <View style={styles.diretorioToggleLeft}>
                <Icon name="building" size={14} color={ConstructoColors.primaria} />
                <Typography variant="label" color="primary">
                  DIRETÓRIO CORPORATIVO AUTORIZADO
                </Typography>
              </View>
              <Icon
                name={mostrarDiretorio ? 'chevron-up' : 'chevron-down'}
                size={16}
                color={ConstructoColors.primaria}
              />
            </Pressable>

            {mostrarDiretorio ? (
              <Card subtle style={styles.diretorioContent}>
                <Typography variant="caption" color="muted">
                  Selecione uma credencial autorizada para auditoria de canteiro ou acompanhamento do imóvel:
                </Typography>

                <View style={styles.personaList}>
                  <Card
                    padding={12}
                    onPress={() => entrarComCredencialDiretorio('demo.gestor1@example.com')}
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
                        <Badge label="ENGENHARIA" variant="esmeralda" size="sm" />
                      </View>
                      <Typography variant="caption" color="muted">
                        CREA-SP 5062491-D • Auditoria de campo, diário de obra e cronograma
                      </Typography>
                    </View>
                    <Icon name="chevron-right" size={16} color={ConstructoColors.textoSuave} />
                  </Card>

                  <Card
                    padding={12}
                    onPress={() => entrarComCredencialDiretorio('demo.comprador2@example.com')}
                    style={styles.personaCard}
                  >
                    <View
                      style={[
                        styles.personaIconBox,
                        { backgroundColor: '#FFEDD5', borderColor: '#FED7AA' },
                      ]}
                    >
                      <Icon name="home" size={18} color="#EA580C" />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={styles.personaTitleRow}>
                        <Typography variant="bodyStrong" color="strong">
                          Beatriz Lima
                        </Typography>
                        <Badge label="COMPRADOR" variant="laranja" size="sm" />
                      </View>
                      <Typography variant="caption" color="muted">
                        Unidade 202 (Torre A) • Diário fotográfico, evolução física e memorial
                      </Typography>
                    </View>
                    <Icon name="chevron-right" size={16} color={ConstructoColors.textoSuave} />
                  </Card>

                  <Card
                    padding={12}
                    onPress={() => entrarComCredencialDiretorio('demo.admin@example.com')}
                    style={styles.personaCard}
                  >
                    <View
                      style={[
                        styles.personaIconBox,
                        { backgroundColor: '#EDE9FE', borderColor: '#DDD6FE' },
                      ]}
                    >
                      <Icon name="shield-check" size={18} color="#7C3AED" />
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <View style={styles.personaTitleRow}>
                        <Typography variant="bodyStrong" color="strong">
                          Marina Albuquerque
                        </Typography>
                        <Badge label="GOVERNANÇA" variant="roxo" size="sm" />
                      </View>
                      <Typography variant="caption" color="muted">
                        Diretoria Executiva • Controle multi-empreendimentos e contratos
                      </Typography>
                    </View>
                    <Icon name="chevron-right" size={16} color={ConstructoColors.textoSuave} />
                  </Card>
                </View>
              </Card>
            ) : null}
          </View>

          {/* Rodapé */}
          <View style={styles.footerCert}>
            <Icon name="shield-check" size={14} color={ConstructoColors.primaria} />
            <Typography variant="caption" color="muted">
              CONSTRUCTO • ART HOMOLOGADA • ACESSO POR PERFIL
            </Typography>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: LOGIN_HERO_COR_FUNDO,
  },
  keyboardView: {
    flex: 1,
  },
  scroll: {
    backgroundColor: ConstructoColors.fundo,
  },
  scrollContent: {
    paddingBottom: 40,
    gap: 20,
  },
  formSheet: {
    gap: 16,
    marginTop: -32,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 24,
    backgroundColor: ConstructoColors.superficie,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    borderColor: ConstructoColors.borda,
  },
  formTitulos: {
    gap: 4,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: 10,
  },
  erroBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(217, 83, 79, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(217, 83, 79, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: ConstructoRadius.field,
  },
  diretorioContainer: {
    gap: 8,
    marginHorizontal: 20,
  },
  diretorioToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: ConstructoColors.superficieSutil,
    borderRadius: ConstructoRadius.field,
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
  },
  diretorioToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  diretorioContent: {
    gap: 12,
    padding: 14,
    backgroundColor: ConstructoColors.superficieSutil,
    borderWidth: 1,
    borderColor: ConstructoColors.borda,
  },
  personaList: {
    gap: 8,
  },
  personaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: ConstructoColors.superficie,
    borderRadius: ConstructoRadius.card,
  },
  personaIconBox: {
    width: 38,
    height: 38,
    borderRadius: ConstructoRadius.field,
    backgroundColor: ConstructoColors.primariaSuave,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: ConstructoColors.bordaFoco,
  },
  personaTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  footerCert: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingTop: 8,
    marginHorizontal: 20,
  },
});
