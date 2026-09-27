import {
  type MarcoComProtocolo,
} from "@constructo/shared";


export const marcosMock: MarcoComProtocolo[] = [
  {
    id: 1,
    nome: "Impermeabilização",
    descricaoTecnica: "Impermeabilização com manta asfáltica e teste de estanqueidade de 72h nas áreas molhadas.",
    descricaoCliente: "Proteção contra infiltrações e umidade nos banheiros e varandas.",
    statusMarco: "EM_ANDAMENTO",
    protocolo: {
      id: 101,
      marcoId: 1,
      nome: "Protocolo de Impermeabilização",
      itens: [
        { id: "imp-1", nome: "Regularização de base e caimento", atendido: true },
        { id: "imp-2", nome: "Aplicação de primer asfáltico", atendido: true },
        { id: "imp-3", nome: "Aplicação da manta asfáltica", atendido: true },
        { id: "imp-4", nome: "Encontro parede/piso", atendido: false, descricao: "Reforço nos cantos e rodapés com tela de poliéster" },
        { id: "imp-5", nome: "Teste de estanqueidade 72h", atendido: false, descricao: "Lâmina d'água com laudo fotográfico" },
      ],
    },
  },
  {
    id: 2,
    nome: "Estrutura do 3º Pavimento",
    descricaoTecnica: "Concretagem de lajes, pilares e vigas com verificação de armadura.",
    descricaoCliente: "Conclusão da estrutura de concreto do terceiro andar.",
    statusMarco: "CONCLUIDO",
    protocolo: {
      id: 102,
      marcoId: 2,
      nome: "Protocolo de Estrutura",
      itens: [
        { id: "est-1", nome: "Conferência de escoramento", atendido: true },
        { id: "est-2", nome: "Armadura e espaçadores", atendido: true },
        { id: "est-3", nome: "Slump test e corpos de prova", atendido: true },
      ],
    },
  },
  {
    id: 3,
    nome: "Fundação - Estacas",
    descricaoTecnica: "Perfuração e injeção de concreto das estacas hélice contínua.",
    descricaoCliente: "Bases sólidas e fundação do edifício concluídas.",
    statusMarco: "CONCLUIDO",
    protocolo: {
      id: 103,
      marcoId: 3,
      nome: "Protocolo de Fundações",
      itens: [
        { id: "fun-1", nome: "Relatório de perfuração e torque", atendido: true },
        { id: "fun-2", nome: "Controle de concreto das estacas", atendido: true },
      ],
    },
  },
  {
    id: 4,
    nome: "Instalações Hidráulicas - Ramais",
    descricaoTecnica: "Tubulação de água fria e esgoto nos shafts e conexões de prumadas.",
    descricaoCliente: "Canos e tubulações de água e esgoto do seu apartamento.",
    statusMarco: "EM_ANDAMENTO",
    protocolo: {
      id: 104,
      marcoId: 4,
      nome: "Protocolo de Hidráulica",
      itens: [
        { id: "hid-1", nome: "Assentamento de tubulação", atendido: true },
        { id: "hid-2", nome: "Teste de estanqueidade e pressão", atendido: false, descricao: "Pressurização com manômetro sem perda por 1h" },
        { id: "hid-3", nome: "Fixação e abraçadeiras", atendido: false, descricao: "Conferência de caimento e pontos de ancoragem" },
      ],
    },
  },
  {
    id: 5,
    nome: "Alvenaria e Vedação",
    descricaoTecnica: "Levantamento de paredes de blocos cerâmicos e amarração de juntas.",
    descricaoCliente: "Paredes e divisórias dos cômodos levantadas.",
    statusMarco: "NAO_INICIADO",
    protocolo: null, // SEM PROTOCOLO
  },
];

let marcosState: MarcoComProtocolo[] = JSON.parse(JSON.stringify(marcosMock));

export async function listarMarcos(): Promise<MarcoComProtocolo[]> {
  return [...marcosState];
}

export async function obterMarcoPorId(id: number | string): Promise<MarcoComProtocolo | null> {
  const marco = marcosState.find((m) => String(m.id) === String(id));
  return marco ? JSON.parse(JSON.stringify(marco)) : null;
}

export async function registrarEvidenciaNoMarco(
  marcoId: number | string,
  itemId: string | number
): Promise<MarcoComProtocolo> {
  marcosState = marcosState.map((marco) => {
    if (String(marco.id) === String(marcoId) && marco.protocolo) {
      const novosItens = marco.protocolo.itens.map((item) => {
        if (String(item.id) === String(itemId)) {
          return {
            ...item,
            atendido: true,
            capturadoEm: new Date().toISOString(),
          };
        }
        return item;
      });

      return {
        ...marco,
        protocolo: {
          ...marco.protocolo,
          itens: novosItens,
        },
      };
    }
    return marco;
  });

  const atualizado = await obterMarcoPorId(marcoId);
  if (!atualizado) throw new Error("Marco não encontrado");
  return atualizado;
}
