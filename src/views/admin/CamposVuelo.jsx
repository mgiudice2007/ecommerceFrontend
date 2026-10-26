import CampoFecha from '../../components/CampoFecha'
import { hoy, sumarDias } from '../../utils/formato'

const AEROPUERTOS_BUENOS_AIRES = ['AEP', 'EZE']

function CamposVuelo({ formData, setFormData, aeropuertos, categorias }) {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const diaSalida = formData.fechaSalida ? formData.fechaSalida.slice(0, 10) : ''

  const esBuenosAires = (iata) => AEROPUERTOS_BUENOS_AIRES.includes(iata)
  const buscar = (iata) => aeropuertos.find((a) => a.codigoIata === iata)

  const origenes = aeropuertos.filter((a) =>
    formData.tramo === 'ida' ? esBuenosAires(a.codigoIata) : !esBuenosAires(a.codigoIata),
  )

  const destinos = aeropuertos.filter((a) => {
    if (formData.tramo === 'ida') {
      if (esBuenosAires(a.codigoIata)) return false
      if (formData.origenIata === 'AEP') return a.pais === 'Argentina'
      if (formData.origenIata === 'EZE') return a.pais !== 'Argentina'
      return true
    }
    if (!esBuenosAires(a.codigoIata)) return false
    const origen = buscar(formData.origenIata)
    if (!origen) return true
    return a.codigoIata === (origen.pais === 'Argentina' ? 'AEP' : 'EZE')
  })

  const cambiarTramo = (tramo) => {
    setFormData({ ...formData, tramo, origenIata: '', destinoIata: '' })
  }

  const cambiarOrigen = (iata) => {
    const origen = buscar(iata)
    let destinoIata = ''
    if (formData.tramo === 'vuelta' && origen) destinoIata = origen.pais === 'Argentina' ? 'AEP' : 'EZE'
    setFormData({ ...formData, origenIata: iata, destinoIata })
  }

  return (
    <>
      <div className="fila-campos">
        <div className="campo">
          <label htmlFor="numeroVuelo">Número de vuelo</label>
          <input
            id="numeroVuelo"
            name="numeroVuelo"
            value={formData.numeroVuelo}
            onChange={handleChange}
            placeholder="Ej: AR1500"
            required
          />
        </div>
        <div className="campo">
          <label htmlFor="categoriaId">Tipo de vuelo</label>
          <select id="categoriaId" name="categoriaId" value={formData.categoriaId} onChange={handleChange} required>
            <option value="">Elegí una opción</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre} — {c.descripcion}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="campo">
        <label htmlFor="tramo">Tramo</label>
        <select id="tramo" value={formData.tramo} onChange={(e) => cambiarTramo(e.target.value)}>
          <option value="ida">Ida: sale de Buenos Aires (Aeroparque o Ezeiza)</option>
          <option value="vuelta">Vuelta: vuelve a Buenos Aires desde un destino</option>
        </select>
        <span className="panel-ayuda">
          Los vuelos de cabotaje usan Aeroparque y los internacionales Ezeiza, igual que en el buscador.
        </span>
      </div>

      <div className="fila-campos">
        <div className="campo">
          <label htmlFor="origenIata">Origen</label>
          <select
            id="origenIata"
            name="origenIata"
            value={formData.origenIata}
            onChange={(e) => cambiarOrigen(e.target.value)}
            required
          >
            <option value="">Elegí el aeropuerto</option>
            {origenes.map((a) => (
              <option key={a.codigoIata} value={a.codigoIata}>
                {a.ciudad} — {a.nombre} ({a.codigoIata})
              </option>
            ))}
          </select>
        </div>
        <div className="campo">
          <label htmlFor="destinoIata">Destino</label>
          <select id="destinoIata" name="destinoIata" value={formData.destinoIata} onChange={handleChange} required>
            <option value="">Elegí el aeropuerto</option>
            {destinos.map((a) => (
              <option key={a.codigoIata} value={a.codigoIata}>
                {a.ciudad} — {a.nombre} ({a.codigoIata})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="fila-campos">
        <div className="campo">
          <label htmlFor="fechaSalida">Salida</label>
          <CampoFecha
            id="fechaSalida"
            conHora
            min={hoy()}
            value={formData.fechaSalida}
            onChange={(valor) => setFormData({ ...formData, fechaSalida: valor })}
            required
          />
        </div>
        <div className="campo">
          <label htmlFor="fechaLlegada">Llegada</label>
          <CampoFecha
            id="fechaLlegada"
            conHora
            min={diaSalida || hoy()}
            max={diaSalida ? sumarDias(diaSalida, 1) : undefined}
            value={formData.fechaLlegada}
            onChange={(valor) => setFormData({ ...formData, fechaLlegada: valor })}
            required
          />
        </div>
      </div>

      <div className="campo">
        <label htmlFor="descripcion">Descripción (opcional)</label>
        <textarea
          id="descripcion"
          name="descripcion"
          rows="3"
          value={formData.descripcion}
          onChange={handleChange}
          placeholder="Ej: Vuelo directo, incluye snack a bordo"
        />
      </div>
    </>
  )
}

export default CamposVuelo
