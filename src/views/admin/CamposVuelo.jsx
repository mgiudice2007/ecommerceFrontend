import CampoFecha from '../../components/CampoFecha'
import { hoy, sumarDias } from '../../utils/formato'

// Los campos con los datos de un vuelo. Los usan "Publicar vuelo" (FormVuelo) y la
// pestaña "Datos del vuelo" de la gestion (TabDatos). No guarda estado: recibe los
// datos y la funcion para cambiarlos por props, y el padre decide que hacer al guardar.
function CamposVuelo({ formData, setFormData, aeropuertos, categorias }) {
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Fechas con logica: la salida desde hoy, y la llegada el mismo dia o el siguiente
  const diaSalida = formData.fechaSalida ? formData.fechaSalida.slice(0, 10) : ''

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

      <div className="fila-campos">
        <div className="campo">
          <label htmlFor="origenIata">Origen</label>
          <select id="origenIata" name="origenIata" value={formData.origenIata} onChange={handleChange} required>
            <option value="">Elegí el aeropuerto</option>
            {aeropuertos.map((a) => (
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
            {aeropuertos.map((a) => (
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
