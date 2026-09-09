import { useId } from 'react'
import type { Obra } from '@shared/domain/obra'
import './SidebarComponent.css'

interface SidebarComponentProps {
  obra: Obra
  onFechar: () => void
}

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

function formatarData(data: string) {
  const [ano, mes, dia] = data.split('-')
  return `${dia}/${mes}/${ano}`
}

// Mostrar ou não a sidebar é decisão de quem a compõe, não dela mesma: quem
// não tem obra selecionada simplesmente não a monta.
export function SidebarComponent({ obra, onFechar }: SidebarComponentProps) {
  const tituloId = useId()

  return (
    <aside className='sidebar' aria-labelledby={tituloId}>
      {/* Largura fixa: o wrapper que compõe este painel cresce e recorta a
          partir de fora; este conteúdo não reflui enquanto isso acontece. */}
      <div className='sidebar-conteudo'>
        <header className='sidebar-cabecalho'>
          <h2 id={tituloId}>{obra.nome}</h2>
          <button type='button' onClick={onFechar}>Fechar</button>
        </header>
        <p>{obra.local} — {obra.municipio}/{obra.uf}</p>
        <p>{obra.descricao}</p>
        <dl>
          <dt>Identificação</dt><dd>{obra.id}</dd>
          <dt>Tipo</dt><dd>{obra.tipo}</dd>
          <dt>Status</dt><dd>{obra.status}</dd>
          <dt>Progresso físico</dt><dd>{obra.progresso}%</dd>
          <dt>Responsável</dt><dd>{obra.responsavel}</dd>
          <dt>Orçamento previsto</dt><dd>{moeda.format(obra.orcamento)}</dd>
          <dt>Início</dt><dd>{formatarData(obra.dataInicio)}</dd>
          <dt>Conclusão prevista</dt><dd>{formatarData(obra.previsaoConclusao)}</dd>
        </dl>
        <p>{obra.origemCoordenadas === 'Simulação'
          ? 'Perímetro fictício para demonstração.'
          : 'Contorno do local usado como referência; não delimita um canteiro real.'}</p>
        {obra.escopoCoordenadas && <p>{obra.escopoCoordenadas}</p>}
        {obra.fonteCoordenadas && (
          <a href={obra.fonteCoordenadas} target='_blank' rel='noopener noreferrer'>
            Fonte do contorno
          </a>
        )}
        {obra.ficticia && <p>Obra e informações fictícias para demonstração.</p>}
      </div>
    </aside>
  )
}
