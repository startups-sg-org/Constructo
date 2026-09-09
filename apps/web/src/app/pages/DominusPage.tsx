import { useState, type CSSProperties } from 'react'
import { MapComponent } from '@features/map'
import { SidebarComponent } from '@features/sidebar'
import type { Obra } from '@shared/domain/obra'
import { obrasMock } from '@shared/mocks/obras'
import './DominusPage.css'

/** Uma única fonte de duração alimenta o CSS do painel e o voo do Leaflet. */
const DURACAO_MOVIMENTO_MS = 620

/** Título da página e nome acessível da região do mapa: o mapa não presume
    que existe um h1 ao redor, então é quem o compõe que fornece ambos. */
const TITULO_PAGINA = 'Mapa de Obras'

export function DominusPage() {
  const [obraSelecionada, setObraSelecionada] = useState<Obra | null>(null)
  // Conserva os dados durante a animação de saída. A seleção do mapa pode ser
  // limpa imediatamente, enquanto o painel termina de desaparecer.
  const [obraNoPainel, setObraNoPainel] = useState<Obra | null>(null)

  // O mapa não conhece Obra: devolve só o id clicado, e quem o compõe resolve
  // para o registro completo (ou null) a partir da coleção que já tem.
  function selecionarObra(id: string | null) {
    const obra = id ? obrasMock.find((item) => item.id === id) ?? null : null
    setObraSelecionada(obra)
    if (obra) {
      setObraNoPainel(obra)
    }
  }

  function fecharPainel() {
    setObraSelecionada(null)
  }

  function finalizarSaidaPainel() {
    if (!obraSelecionada) {
      setObraNoPainel(null)
    }
  }

  const estiloMovimento = {
    '--dominus-duracao': `${DURACAO_MOVIMENTO_MS}ms`,
  } as CSSProperties

  return (
    <div className='dominus-page' style={estiloMovimento}>
      <h1 className='sr-only'>{TITULO_PAGINA}</h1>
      {obraNoPainel && (
        <div
          className={obraSelecionada ? 'dominus-page-painel dominus-page-painel-aberto' : 'dominus-page-painel'}
          aria-hidden={!obraSelecionada}
          onAnimationEnd={finalizarSaidaPainel}
        >
          <SidebarComponent obra={obraNoPainel} onFechar={fecharPainel} />
        </div>
      )}
      <div className='dominus-page-mapa'>
        <MapComponent
          obras={obrasMock}
          rotulo={TITULO_PAGINA}
          obraSelecionadaId={obraSelecionada?.id ?? null}
          onSelecionarObra={selecionarObra}
          duracaoMovimentoMs={DURACAO_MOVIMENTO_MS}
        />
      </div>
    </div>
  )
}
