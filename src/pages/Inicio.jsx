import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/api'
import Buscador from '../components/Buscador'
import TarjetaDestino from '../components/TarjetaDestino'
import { useAuth } from '../context/AuthContext'
import './Inicio.css'

function Inicio() {
  const { estaLogueado } = useAuth()
  const [destacados, setDestacados] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  // Al abrir la pagina traemos los primeros 4 vuelos para mostrarlos como destacados
  useEffect(() => {
    api('/api/vuelos?page=0&size=4')
      .then((pagina) => setDestacados(pagina.content))
      .catch((err) => setError(err.message))
      .finally(() => setCargando(false))
  }, [])

  return (
    <>
      <section className="inicio-hero">
        <div className="contenedor">
          <span className="inicio-hero-chip">✈ Vuelos de cabotaje, regionales e internacionales</span>
          <h1>
            Volá alto por toda la <span>Argentina</span> y el mundo
          </h1>
          <p>
            Encontrá vuelos de vendedores verificados, elegí tu clase y comprá con los descuentos
            vigentes ya aplicados.
          </p>
        </div>
      </section>

      <div className="contenedor inicio-buscador">
        <Buscador />
      </div>

      <section className="contenedor inicio-seccion">
        <div className="inicio-titulo">
          <div>
            <span className="inicio-sobretitulo">Inspiración de viaje</span>
            <h2>Destinos destacados para tu próxima aventura</h2>
          </div>
          <Link to="/vuelos">Ver todos los vuelos →</Link>
        </div>

        {cargando && <p className="texto-suave">Cargando vuelos…</p>}
        {error && <div className="mensaje mensaje-error">{error}</div>}
        {!cargando && !error && destacados.length === 0 && (
          <p className="texto-suave">Todavía no hay vuelos publicados.</p>
        )}

        <div className="inicio-destinos">
          {destacados.map((vuelo) => (
            <TarjetaDestino key={vuelo.id} vuelo={vuelo} />
          ))}
        </div>
      </section>

      {!estaLogueado && (
        <section className="contenedor inicio-seccion">
          <div className="inicio-vendedores">
            <span className="inicio-vendedores-chip">Para vendedores</span>
            <h2>¿Tenés vuelos para vender? Publicalos en BCA Airlines</h2>
            <p>
              Cargá tus vuelos, definí los asientos y el precio de cada clase, subí fotos y creá
              promociones con descuento por fecha.
            </p>
            <Link to="/registro" className="boton inicio-vendedores-boton">
              Crear cuenta de vendedor
            </Link>
          </div>
        </section>
      )}
    </>
  )
}

export default Inicio
