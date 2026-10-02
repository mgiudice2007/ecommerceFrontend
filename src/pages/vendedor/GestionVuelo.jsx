import { useCallback, useEffect, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { api, urlFoto } from '../../api/api'
import EncabezadoPagina from '../../components/EncabezadoPagina'
import { useAuth } from '../../context/AuthContext'
import { fechaLarga, hora } from '../../utils/formato'
import TabClases from './TabClases'
import TabDescuentos from './TabDescuentos'
import TabFotos from './TabFotos'
import './Panel.css'
import './GestionVuelo.css'

const PESTANIAS = [
  { id: 'clases', titulo: 'Clases y asientos' },
  { id: 'descuentos', titulo: 'Descuentos' },
  { id: 'fotos', titulo: 'Fotos' },
]

function GestionVuelo() {
  const { id } = useParams()
  const location = useLocation()
  const { usuario, esAdmin } = useAuth()

  const [vuelo, setVuelo] = useState(null)
  const [portadaId, setPortadaId] = useState(null) // primera foto del vuelo, para el encabezado
  const [error, setError] = useState('')
  const [pestania, setPestania] = useState('clases')

  // Las pestañas la llaman cuando cambian algo (por ejemplo un descuento
  // cambia el precio final), para volver a traer el vuelo actualizado.
  const recargarVuelo = useCallback(() => {
    Promise.all([api(`/api/vuelos/${id}`), api(`/api/fotos?vueloId=${id}`)])
      .then(([datosVuelo, fotos]) => {
        setVuelo(datosVuelo)
        setPortadaId(fotos.length > 0 ? fotos[0].id : null)
      })
      .catch((err) => setError(err.message))
  }, [id])

  useEffect(() => {
    recargarVuelo()
  }, [recargarVuelo])

  if (error) {
    return (
      <div className="contenedor pagina">
        <div className="mensaje mensaje-error">{error}</div>
        <Link to="/panel">← Volver al panel</Link>
      </div>
    )
  }

  if (!vuelo) {
    return <div className="contenedor pagina texto-suave">Cargando vuelo…</div>
  }

  // El backend tambien lo controla, pero asi evitamos mostrar formularios que van a fallar
  if (!esAdmin && vuelo.vendedorUsername !== usuario.username) {
    return (
      <div className="contenedor pagina">
        <div className="mensaje mensaje-error">Este vuelo es de otro vendedor: no lo podés modificar.</div>
        <Link to="/panel">← Volver al panel</Link>
      </div>
    )
  }

  return (
    <>
      <EncabezadoPagina
        imagen={portadaId ? urlFoto(portadaId) : undefined}
        etiqueta={`Vuelo ${vuelo.numeroVuelo} · ${vuelo.categoriaNombre}`}
        titulo={`${vuelo.origenCiudad} → ${vuelo.destinoCiudad}`}
        subtitulo={`${vuelo.origenIata} → ${vuelo.destinoIata} · Sale el ${fechaLarga(vuelo.fechaSalida)} a las ${hora(vuelo.fechaSalida)} hs`}
        acciones={
          <>
            <Link to={`/vuelos/${vuelo.id}`} className="boton boton-contorno">
              Ver como comprador
            </Link>
            <Link to={`/panel/vuelos/${vuelo.id}/editar`} className="boton boton-claro">
              Editar datos
            </Link>
          </>
        }
      >
        <Link to="/panel">← Volver al panel</Link>
      </EncabezadoPagina>

      <div className="contenedor sobre-encabezado">
        {location.state?.recienCreado && (
          <div className="mensaje mensaje-exito">
            ¡Vuelo publicado! Ahora cargale al menos una clase con asientos para que se pueda comprar.
          </div>
        )}
        {location.state?.fotosConError?.length > 0 && (
          <div className="mensaje mensaje-error">
            No se pudieron subir estas fotos: {location.state.fotosConError.join(', ')}. Probá de nuevo desde la
            pestaña Fotos.
          </div>
        )}

        <div className="gestion-pestanias" role="tablist">
          {PESTANIAS.map((p) => (
            <button
              key={p.id}
              role="tab"
              aria-selected={pestania === p.id}
              className={pestania === p.id ? 'activa' : ''}
              onClick={() => setPestania(p.id)}
            >
              {p.titulo}
            </button>
          ))}
        </div>

        {/* Solo se muestra la pestaña elegida */}
        {pestania === 'clases' && <TabClases vuelo={vuelo} onCambio={recargarVuelo} />}
        {pestania === 'descuentos' && <TabDescuentos vuelo={vuelo} onCambio={recargarVuelo} />}
        {pestania === 'fotos' && <TabFotos vuelo={vuelo} onCambio={recargarVuelo} />}
      </div>
    </>
  )
}

export default GestionVuelo
