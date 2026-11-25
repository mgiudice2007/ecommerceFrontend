import BotonConfirmar from '../comunes/BotonConfirmar'
import Etiqueta from '../comunes/Etiqueta'
import SinDatos from '../comunes/SinDatos'
import './GrillaFotos.css'

function GrillaFotos({ fotos, imagenes, maximo, onEliminar }) {
  return (
    <section className="tarjeta">
      <h2>
        Fotos del vuelo ({fotos.length}/{maximo})
      </h2>
      <p className="texto-suave">La primera foto es la que se muestra en la búsqueda y en el inicio.</p>

      {fotos.length === 0 ? (
        <SinDatos>Todavía no subiste fotos. Sin fotos se muestra un fondo azul con el destino.</SinDatos>
      ) : (
        <div className="gestion-fotos">
          {fotos.map((foto, indice) => (
            <figure key={foto.id} className="gestion-foto">
              {imagenes[indice] && <img src={imagenes[indice]} alt={foto.nombreArchivo} />}
              {indice === 0 && <Etiqueta>Portada</Etiqueta>}
              <div>
                <span className="texto-suave">{Math.round(foto.tamano / 1024)} KB</span>
                <BotonConfirmar texto="Eliminar" className="gestion-foto-eliminar" onConfirmar={() => onEliminar(foto)} />
              </div>
            </figure>
          ))}
        </div>
      )}
    </section>
  )
}

export default GrillaFotos
