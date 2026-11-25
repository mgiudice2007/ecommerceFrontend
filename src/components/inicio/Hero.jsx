import portada from '../../assets/portada.jpg'
import './Hero.css'

const AVION =
  'M21 11.4c0-.8-.6-1.4-1.4-1.4h-4.2L11.2 3.5H9.4l2 6.5H7.2L5.8 8.1H4.3l.9 3.3-.9 3.3h1.5l1.4-1.9h4.2l-2 6.6h1.8l4.2-6.6h4.2c.8 0 1.4-.6 1.4-1.4z'

// Aviones que cruzan el cielo del hero dejando estela, y nubes que pasan despacio
function CieloHero() {
  return (
    <div className="hero-cielo" aria-hidden="true">
      <span className="hero-nube n1" />
      <span className="hero-nube n2" />
      <span className="hero-nube n3" />
      {['a1', 'a2', 'a3'].map((clase) => (
        <span key={clase} className={`hero-avion ${clase}`}>
          <svg viewBox="0 0 24 24">
            <path fill="currentColor" d={AVION} />
          </svg>
        </span>
      ))}
    </div>
  )
}

function Hero() {
  return (
    <section className="inicio-hero" style={{ backgroundImage: `url(${portada})` }}>
      <CieloHero />
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
