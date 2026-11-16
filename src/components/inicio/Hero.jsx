import portada from '../../assets/portada.jpg'
import './Hero.css'

function Hero() {
  return (
    <section className="inicio-hero" style={{ backgroundImage: `url(${portada})` }}>
      <div className="contenedor inicio-hero-contenido">
        <span className="inicio-hero-chip">✈ Vuelos a Argentina, América y Europa</span>
        <h1>
          Volá alto por toda la <span>Argentina</span> y el mundo
        </h1>
        <p>Encontrá tu próximo destino, elegí tu clase y comprá en minutos con el precio final a la vista.</p>
      </div>
    </section>
  )
}

export default Hero
