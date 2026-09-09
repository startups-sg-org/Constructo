export interface ItemNavegacao {
  /** Texto exibido no link. */
  rotulo: string
  /** Destino da rota, no formato aceito pelo React Router. */
  para: string
  /**
   * Marca o link como ativo somente na correspondência exata. Necessário em
   * rotas-raiz, que de outro modo permaneceriam ativas em todas as páginas.
   */
  exato?: boolean
}
