import { useState } from 'react'
import { MapComponent } from '@features/map'
import { SidebarComponent } from '@features/sidebar'
import type { Obra } from '@shared/domain/obra'
import { obrasMock } from '@shared/mocks/obras'
import './DominusPage.css'

export function DominusPage() {
  const [obraSelecionada, setObraSelecionada] = useState<Obra | null>(null)

  return (
    <div className='dominus-page'>
      {/* A sidebar não decide mais se aparece: quem a compõe decide montá-la,
          e este wrapper — não o componente — é quem abre espaço para ela. */}
      {obraSelecionada && (
        <div className='dominus-page-painel'>
          <SidebarComponent obra={obraSelecionada} onFechar={() => setObraSelecionada(null)} />
        </div>
      )}
      <div className='dominus-page-mapa'>
        <MapComponent
          obras={obrasMock}
          obraSelecionadaId={obraSelecionada?.id ?? null}
          onSelecionarObra={setObraSelecionada}
        />
      </div>
    </div>
  )
}
