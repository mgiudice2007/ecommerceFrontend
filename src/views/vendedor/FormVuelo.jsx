import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api } from '../../api/api'
import EncabezadoPagina from '../../components/EncabezadoPagina'
import { useCatalogo } from '../../hooks/useCatalogo'
import { paraInputFechaHora } from '../../utils/formato'
import './Panel.css'

const MAXIMO_FOTOS = 5 // mismos limites que el backend
const MAXIMO_MB = 5

const FORM_VACIO = {
  numeroVuelo: '',
  descripcion: '',
  categoriaId: '',
  origenIata: '',
  destinoIata: '',
  fechaSalida: '',
  fechaLlegada: '',
  precio: '',
}

// Sirve para crear (/panel/vuelos/nuevo) y para editar (/panel/vuelos/:id/editar).
// Si la URL tiene :id, es edicion: carga el vuelo y al guardar hace PUT.
function FormVuelo() {
  const { id } = useParams()
  const esEdicion = Boolean(id)
  const navigate = useNavigate()
  const { aeropuertos, categorias } = useCatalogo()

  const [formData, setFormData] = useState(FORM_VACIO)
  const [cargando, setCargando] = useState(esEdicion)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  // Fotos elegidas al publicar: { archivo, vistaPrevia } (solo en alta; al editar se usan las pestañas)
  const [fotos, setFotos] = useState([])

  useEffect(() => {
    if (!esEdicion) return
    api(`/api/vuelos/${id}`)
      .then((vuelo) =>
        setFormData({
          numeroVuelo: vuelo.numeroVuelo,
          descripcion: vuelo.descripcion ?? '',
          categoriaId: vuelo.categoriaId,
          origenIata: vuelo.origenIata,
          destinoIata: vuelo.destinoIata,
          fechaSalida: paraInputFechaHora(vuelo.fechaSalida),
          fechaLlegada: paraInputFechaHora(vuelo.fechaLlegada),
          precio: vuelo.precio,
        }),
      )
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }, [esEdicion, id])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const agregarFotos = (e) => {
    const elegidas = [...e.target.files]
    e.target.value = '' // permite volver a elegir el mismo archivo
    setError('')

    const grandes = elegidas.filter((archivo) => archivo.size > MAXIMO_MB * 1024 * 1024)
    if (grandes.length > 0) {
      setError(`Estas fotos pesan más de ${MAXIMO_MB} MB: ${grandes.map((a) => a.name).join(', ')}`)
    }

    const validas = elegidas.filter((archivo) => archivo.size <= MAXIMO_MB * 1024 * 1024)
    const lugar = MAXIMO_FOTOS - fotos.length
    if (validas.length > lugar) {
      setError(`Se pueden subir hasta ${MAXIMO_FOTOS} fotos por vuelo`)
    }

    // URL.createObjectURL arma una direccion temporal para mostrar la foto antes de subirla
    const nuevas = validas.slice(0, lugar).map((archivo) => ({ archivo, vistaPrevia: URL.createObjectURL(archivo) }))
    setFotos([...fotos, ...nuevas])
  }

  const quitarFoto = (indice) => {
    URL.revokeObjectURL(fotos[indice].vistaPrevia)
    setFotos(fotos.filter((_, i) => i !== indice))
  }

  // Sube las fotos una por una al vuelo recien creado (POST /api/fotos, multipart).
  // Devuelve los nombres de las que fallaron, para avisar sin perder el vuelo creado.
  const subirFotos = async (vueloId) => {
    const fallidas = []
    for (const { archivo } of fotos) {
      const datos = new FormData()
      datos.append('vueloId', vueloId)
      datos.append('file', archivo)
      try {
        await api('/api/fotos', { method: 'POST', body: datos })
      } catch {
        fallidas.push(archivo.name)
      }
    }
    return fallidas
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.origenIata === formData.destinoIata) {
      setError('El origen y el destino tienen que ser distintos')
      return
    }
    if (formData.fechaLlegada <= formData.fechaSalida) {
      setError('La llegada tiene que ser después de la salida')
      return
    }

    setGuardando(true)
    try {
      const body = { ...formData, categoriaId: Number(formData.categoriaId), precio: Number(formData.precio) }
      const vuelo = esEdicion
        ? await api(`/api/vuelos/${id}`, { method: 'PUT', body })
        : await api('/api/vuelos', { method: 'POST', body })

      const fotosConError = esEdicion ? [] : await subirFotos(vuelo.id)

      // Un vuelo nuevo nace sin asientos: lo mandamos a cargarle las clases
      navigate(`/panel/vuelos/${vuelo.id}`, { state: { recienCreado: !esEdicion, fotosConError } })
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  if (cargando) {
    return <div className="contenedor pagina texto-suave">Cargando vuelo…</div>
  }

  return (
    <>
      <EncabezadoPagina
        etiqueta="Panel de vuelos"
        titulo={esEdicion ? 'Editar vuelo' : 'Publicar un vuelo nuevo'}
        subtitulo={
          esEdicion
            ? 'Los cambios se ven enseguida en la búsqueda. Las compras ya hechas no cambian.'
            : 'Cargá los datos y las fotos. Después vas a poder agregar las clases con asientos y los descuentos.'
        }
      >
        <Link to="/panel">← Volver al panel</Link>
      </EncabezadoPagina>

      <div className="contenedor sobre-encabezado">
        <section className="tarjeta panel-formulario">
          {error && <div className="mensaje mensaje-error">{error}</div>}

          <form onSubmit={handleSubmit}>
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
                <input
                  id="fechaSalida"
                  name="fechaSalida"
                  type="datetime-local"
                  value={formData.fechaSalida}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="campo">
                <label htmlFor="fechaLlegada">Llegada</label>
                <input
                  id="fechaLlegada"
                  name="fechaLlegada"
                  type="datetime-local"
                  value={formData.fechaLlegada}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="campo">
              <label htmlFor="precio">Precio base</label>
              <input
                id="precio"
                name="precio"
                type="number"
                min="1"
                step="0.01"
                value={formData.precio}
                onChange={handleChange}
                required
              />
              <span className="panel-ayuda">
                Es el precio de referencia del vuelo. El precio de cada clase se carga aparte, con sus asientos.
              </span>
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

            {esEdicion ? (
              <p className="panel-ayuda">
                Las fotos, clases y descuentos se manejan desde{' '}
                <Link to={`/panel/vuelos/${id}`}>la gestión del vuelo</Link>.
              </p>
            ) : (
              <div className="campo">
                <label htmlFor="fotos">
                  Fotos ({fotos.length}/{MAXIMO_FOTOS})
                </label>
                {fotos.length < MAXIMO_FOTOS && (
                  <input id="fotos" type="file" accept="image/*" multiple onChange={agregarFotos} />
                )}
                <span className="panel-ayuda">
                  Podés elegir varias a la vez, hasta {MAXIMO_MB} MB cada una. La primera es la portada.
                </span>

                {fotos.length > 0 && (
                  <div className="form-fotos">
                    {fotos.map((foto, indice) => (
                      <figure key={foto.vistaPrevia}>
                        <img src={foto.vistaPrevia} alt={foto.archivo.name} />
                        {indice === 0 && <span className="etiqueta">Portada</span>}
                        <button type="button" onClick={() => quitarFoto(indice)} aria-label={`Quitar ${foto.archivo.name}`}>
                          ✕
                        </button>
                      </figure>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="panel-botones">
              <button className="boton boton-primario" disabled={guardando}>
                {guardando
                  ? fotos.length > 0 && !esEdicion
                    ? 'Publicando y subiendo fotos…'
                    : 'Guardando…'
                  : esEdicion
                    ? 'Guardar cambios'
                    : 'Publicar vuelo'}
              </button>
              <Link to="/panel" className="boton boton-secundario">
                Cancelar
              </Link>
            </div>
          </form>
        </section>
      </div>
    </>
  )
}

export default FormVuelo
