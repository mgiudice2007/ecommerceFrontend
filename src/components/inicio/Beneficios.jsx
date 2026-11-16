import './Beneficios.css'

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

function Beneficios() {
  return (
    <section className="contenedor inicio-beneficios">
      {BENEFICIOS.map((b) => (
        <div key={b.titulo} className="inicio-beneficio">
          <span className="inicio-beneficio-icono" aria-hidden="true">
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
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
  )
}

export default Beneficios
