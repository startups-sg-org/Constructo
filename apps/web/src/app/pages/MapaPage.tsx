import { useState } from 'react'
import { MapComponent } from '@features/map'
import { SidebarComponent } from '@features/sidebar'
import type { Obra } from '@shared/domain/obra'
import { obrasMock } from '@shared/mocks/obras'
import './MapaPage.css'

/** Pareado com --sidebar-duracao (MapaPage.css): o mapa só reenquadra a obra
    selecionada depois que a sidebar termina de abrir espaço para si. */
const ATRASO_ENQUADRAMENTO_MS = 900

/** Título da página e nome acessível da região do mapa: o mapa não presume
    que existe um h1 ao redor, então é quem o compõe que fornece ambos. */
const TITULO_PAGINA = 'Mapa de Obras'

export function MapaPage() {
  const [obraSelecionada, setObraSelecionada] = useState<Obra | null>(null)

  // O mapa não conhece Obra: devolve só o id clicado, e quem o compõe resolve
  // para o registro completo (ou null) a partir da coleção que já tem.
  function selecionarObra(id: string | null) {
    setObraSelecionada(id ? obrasMock.find((obra) => obra.id === id) ?? null : null)
  }

  return (
    <div className='mapa-page'>
      {/* A sidebar não decide mais se aparece: quem a compõe decide montá-la,
          e este wrapper — não o componente — é quem abre espaço para ela. */}
      {obraSelecionada && (
        <div className='mapa-page-painel'>
          <SidebarComponent obra={obraSelecionada} onFechar={() => setObraSelecionada(null)} />
        </div>
      )}
      <div className='mapa-page-mapa'>
        <h1>{TITULO_PAGINA}</h1>
        <MapComponent
          obras={obrasMock}
          rotulo={TITULO_PAGINA}
          obraSelecionadaId={obraSelecionada?.id ?? null}
          onSelecionarObra={selecionarObra}
          atrasoEnquadramentoMs={ATRASO_ENQUADRAMENTO_MS}
        />
      </div>
    </div>
  )
}
