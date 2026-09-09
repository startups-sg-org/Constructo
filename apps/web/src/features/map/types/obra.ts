// Reexportação temporária: o tipo de domínio mudou para @shared/domain/obra
// (PR 1 do isolamento de componentes) porque não é exclusivo do mapa — a
// sidebar e futuras features também o usam. Este arquivo sai quando o último
// import de '@features/map' que só queria o tipo for atualizado.
export type { CoordenadaObra, Obra, StatusObra, TipoObra } from '@shared/domain/obra'
