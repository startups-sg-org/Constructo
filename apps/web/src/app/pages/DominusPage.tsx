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
      <SidebarComponent obra={obraSelecionada} onFechar={() => setObraSelecionada(null)} />
      <MapComponent
        obras={obrasMock}
        obraSelecionadaId={obraSelecionada?.id ?? null}
        onSelecionarObra={setObraSelecionada}
      />
    </div>
  )
}
