import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/api'
import portada from '../assets/portada.jpg'
import Buscador from '../components/Buscador'
import TarjetaDestino from '../components/TarjetaDestino'
import { useAuth } from '../context/AuthContext'
import { useCatalogo } from '../hooks/useCatalogo'
import { estaOperativo } from '../utils/vuelos'
import './Inicio.css'

// Las dos solapas de "El mundo" usan las categorias del backend
const REGIONES = [
  { categoria: 'Regional', titulo: 'América y el Caribe' },
  { categoria: 'Internacional', titulo: 'Europa' },
]

// Accesos rapidos debajo del buscador: llevan a la busqueda ya filtrada
const ATAJOS = [
  { destino: 'BRC', texto: 'Bariloche' },
  { destino: 'IGR', texto: 'Iguazú' },
  { destino: 'MIA', texto: 'Miami' },
  { destino: 'MAD', texto: 'Madrid' },
]

const BENEFICIOS = [
  {
    titulo: 'Precio final, sin sorpresas',
    texto: 'Ves el precio con las promociones vigentes ya aplicadas.',
    icono: 'M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  },
  {
    titulo: 'Elegí cómo viajar',
    texto: 'Económica, Ejecutiva o Primera, con o sin valija en bodega.',
    icono: 'M4 18v3M20 18v3M5 11V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5M3 11h18v7H3z',
  },
  {
    titulo: 'Cancelá desde tu cuenta',
    texto: 'Si cambian tus planes, cancelás la compra en dos clics.',
    icono: 'M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5',
  },
  {
    titulo: 'Compra protegida',
    texto: 'Tus asientos quedan reservados al instante al confirmar.',
    icono: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  },
]

function Inicio() {
  const { estaLogueado } = useAuth()
  const { aeropuertos, categorias } = useCatalogo()

  const [vuelos, setVuelos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [region, setRegion] = useState(REGIONES[0].categoria)

  // Una sola llamada trae todos los vuelos publicados; las secciones se arman filtrando
  useEffect(() => {
    api('/api/vuelos?page=0&size=60')
      // En el inicio solo se muestran vuelos que se pueden comprar (no pausados ni cancelados)
      .then((pagina) => setVuelos(pagina.content.filter(estaOperativo)))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }, [])

  const paisDe = (iata) => aeropuertos.find((a) => a.codigoIata === iata)?.pais

  // Un vuelo por destino (el primero que aparezca) para no repetir ciudades
  const unoPorDestino = (lista) =>
    lista.filter((vuelo, i) => lista.findIndex((v) => v.destinoIata === vuelo.destinoIata) === i)

  const ofertas = unoPorDestino(vuelos.filter((v) => v.descuentoVigente))
    .sort((a, b) => b.descuentoVigente.valor - a.descuentoVigente.valor)
    .slice(0, 4)
  const argentina = unoPorDestino(vuelos.filter((v) => v.categoriaNombre === 'Cabotaje')).slice(0, 8)
  const mundo = unoPorDestino(vuelos.filter((v) => v.categoriaNombre === region)).slice(0, 8)

  const grilla = (lista) => (
    <div className="inicio-grilla">
      {lista.map((vuelo) => (
        <TarjetaDestino key={vuelo.id} vuelo={vuelo} pais={paisDe(vuelo.destinoIata)} />
      ))}
    </div>
  )

  return (
    <>
      <section className="inicio-hero" style={{ backgroundImage: `url(${portada})` }}>
        <div className="contenedor inicio-hero-contenido">
          <span className="inicio-hero-chip">✈ Vuelos a Argentina, América y Europa</span>
          <h1>
            Volá alto por toda la <span>Argentina</span> y el mundo
          </h1>
          <p>Encontrá tu próximo destino, elegí tu clase y comprá en minutos con el precio final a la vista.</p>
        </div>
      </section>

      <div className="contenedor inicio-buscador">
        <Buscador />
        <div className="inicio-atajos">
          <span>Búsquedas frecuentes:</span>
          {ATAJOS.map((a) => (
            <Link key={a.destino} to={`/vuelos?destino=${a.destino}`}>
              {a.texto}
            </Link>
          ))}
        </div>
      </div>

      <section className="contenedor inicio-beneficios">
        {BENEFICIOS.map((b) => (
          <div key={b.titulo} className="inicio-beneficio">
            <span className="inicio-beneficio-icono" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={b.icono} />
              </svg>
            </span>
            <div>
              <strong>{b.titulo}</strong>
              <p>{b.texto}</p>
            </div>
          </div>
        ))}
      </section>

      {error && (
        <div className="contenedor">
          <div className="mensaje mensaje-error">{error}</div>
        </div>
      )}
      {cargando && <p className="contenedor texto-suave">Cargando vuelos…</p>}

      {ofertas.length > 0 && (
        <section className="contenedor inicio-seccion">
          <div className="inicio-titulo">
            <div>
              <span className="inicio-sobretitulo">Ofertas por tiempo limitado</span>
              <h2>Promociones imperdibles</h2>
            </div>
            <Link to="/vuelos">Ver todos los vuelos →</Link>
          </div>
          {grilla(ofertas)}
        </section>
      )}

      {argentina.length > 0 && (
        <section className="contenedor inicio-seccion">
          <div className="inicio-titulo">
            <div>
              <span className="inicio-sobretitulo">Viajá por el país</span>
              <h2>Destinos en Argentina</h2>
            </div>
            <Link to={`/vuelos?categoriaId=${categorias.find((c) => c.nombre === 'Cabotaje')?.id ?? ''}`}>
              Ver vuelos de cabotaje →
            </Link>
          </div>
          {grilla(argentina)}
        </section>
      )}

      {vuelos.length > 0 && (
        <section className="inicio-mundo">
          <div className="contenedor">
            <div className="inicio-titulo">
              <div>
                <span className="inicio-sobretitulo">Explorá el mundo</span>
                <h2>Vuelos internacionales</h2>
              </div>
              <div className="inicio-solapas" role="tablist">
                {REGIONES.map((r) => (
                  <button
                    key={r.categoria}
                    role="tab"
                    aria-selected={region === r.categoria}
                    className={region === r.categoria ? 'activa' : ''}
                    onClick={() => setRegion(r.categoria)}
                  >
                    {r.titulo}
                  </button>
                ))}
              </div>
            </div>
            {mundo.length > 0 ? grilla(mundo) : <p className="texto-suave">No hay vuelos publicados en esta región.</p>}
          </div>
        </section>
      )}

      {!estaLogueado && (
        <section className="contenedor inicio-seccion">
          <div className="inicio-cuenta">
            <div>
              <span className="inicio-cuenta-chip">Creá tu cuenta gratis</span>
              <h2>Viajá más fácil con tu cuenta BCA Airlines</h2>
              <p>
                Guardá tu carrito, comprá tus pasajes de ida y vuelta en minutos y revisá o cancelá tus compras cuando
                quieras.
              </p>
            </div>
            <Link to="/registro" className="boton inicio-cuenta-boton">
              Crear mi cuenta →
            </Link>
          </div>
        </section>
      )}
    </>
  )
}

export default Inicio
