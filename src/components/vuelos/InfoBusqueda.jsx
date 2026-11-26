import './InfoBusqueda.css'

const IconoCalendario = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
)

// Barra de informacion de la busqueda, como las pantallas del aeropuerto: muestra solo
// los datos que aplican (fechas flexibles si se eligio una fecha, y el paso a paso si es
// ida y vuelta)
function InfoBusqueda({ diasFlexibles, idaYVuelta }) {
  if (!diasFlexibles && !idaYVuelta) return null

  return (
    <div className="info-busqueda">
      {diasFlexibles && (
        <div className="info-busqueda-dato">
          <span className="info-busqueda-icono">
            <IconoCalendario />
          </span>
          <div>
            <small>Fechas flexibles</small>
            <p>
              Ves vuelos hasta <strong>±{diasFlexibles} días</strong> de tu fecha
            </p>
          </div>
        </div>
      )}

      {idaYVuelta && (
        <div className="info-busqueda-dato">
          <span className="info-busqueda-icono" aria-hidden="true">
            ⇄
          </span>
          <div>
            <small>Ida y vuelta</small>
            <p>Elegí la ida, agregala al carrito y seguí con la vuelta</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default InfoBusqueda
