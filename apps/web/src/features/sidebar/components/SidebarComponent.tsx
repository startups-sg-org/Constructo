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
  const progressoId = useId()

  return (
    <aside className='sidebar' aria-labelledby={tituloId}>
      <div className='sidebar-conteudo'>
        <header className='sidebar-cabecalho'>
          <div className='sidebar-metadados'>
            <span className='sidebar-identificacao'>{obra.id}</span>
            <span className='sidebar-status' data-status={obra.status}>{obra.status}</span>
          </div>
          <button className='sidebar-fechar' type='button' onClick={onFechar} aria-label='Fechar detalhes da obra'>
            <span aria-hidden='true'>×</span>
          </button>
          <h2 id={tituloId}>{obra.nome}</h2>
          <p className='sidebar-localizacao'>{obra.local} · {obra.municipio}/{obra.uf}</p>
        </header>

        <p className='sidebar-descricao'>{obra.descricao}</p>

        <section className='sidebar-progresso' aria-labelledby={progressoId}>
          <div className='sidebar-secao-cabecalho'>
            <h3 id={progressoId}>Progresso físico</h3>
            <strong>{obra.progresso}%</strong>
          </div>
          <div
            className='sidebar-progresso-trilho'
            role='progressbar'
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={obra.progresso}
            aria-label={`Progresso físico: ${obra.progresso}%`}
          >
            <span style={{ width: `${obra.progresso}%` }} />
          </div>
        </section>

        <section className='sidebar-secao'>
          <h3>Dados da obra</h3>
          <dl className='sidebar-lista-dados'>
            <div><dt>Tipo</dt><dd>{obra.tipo}</dd></div>
            <div><dt>Responsável</dt><dd>{obra.responsavel}</dd></div>
            <div className='sidebar-dado-destaque'><dt>Orçamento previsto</dt><dd>{moeda.format(obra.orcamento)}</dd></div>
          </dl>
        </section>

        <section className='sidebar-secao'>
          <h3>Cronograma</h3>
          <dl className='sidebar-lista-dados sidebar-lista-datas'>
            <div><dt>Início</dt><dd>{formatarData(obra.dataInicio)}</dd></div>
            <div><dt>Conclusão prevista</dt><dd>{formatarData(obra.previsaoConclusao)}</dd></div>
          </dl>
        </section>

        <section className='sidebar-secao sidebar-referencia'>
          <h3>Referência geográfica</h3>
          <p>{obra.origemCoordenadas === 'Simulação'
            ? 'Perímetro fictício para demonstração.'
            : 'Contorno do local usado como referência; não delimita um canteiro real.'}</p>
          {obra.escopoCoordenadas && <p>{obra.escopoCoordenadas}</p>}
          {obra.fonteCoordenadas && (
            <a href={obra.fonteCoordenadas} target='_blank' rel='noopener noreferrer'>
              Consultar fonte do contorno <span aria-hidden='true'>↗</span>
            </a>
          )}
        </section>

        {obra.ficticia && (
          <p className='sidebar-aviso'>Obra e informações fictícias para demonstração.</p>
        )}
      </div>
    </aside>
  )
}
