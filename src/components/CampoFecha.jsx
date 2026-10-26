import { useState } from 'react'
import './CampoFecha.css'

const dosDigitos = (n) => String(n).padStart(2, '0')

const HORAS = []
for (let h = 0; h < 24; h++) HORAS.push(dosDigitos(h))
const MINUTOS = []
for (let m = 0; m < 60; m += 5) MINUTOS.push(dosDigitos(m))

const aTexto = (fecha) => (fecha ? `${fecha.slice(8, 10)}/${fecha.slice(5, 7)}/${fecha.slice(0, 4)}` : '')

const aFecha = (texto) => {
  const partes = texto.split('/')
  if (partes.length !== 3 || partes[2].length !== 4) return null
  const [dia, mes, anio] = partes.map(Number)
  if (!dia || !mes || !anio) return null
  const real = new Date(anio, mes - 1, dia)
  if (real.getDate() !== dia || real.getMonth() !== mes - 1) return null
  return `${anio}-${dosDigitos(mes)}-${dosDigitos(dia)}`
}

function CampoFecha({ id, value, onChange, min, max, conHora = false, required = false }) {
  const fecha = value ? value.slice(0, 10) : ''
  const hora = conHora && value ? value.slice(11, 13) : '12'
  const minutos = conHora && value ? value.slice(14, 16) : '00'
  const opcionesMinutos = MINUTOS.includes(minutos) ? MINUTOS : [...MINUTOS, minutos].sort()

  const [escrito, setEscrito] = useState(null)
  const [problema, setProblema] = useState('')

  const avisar = (nuevaFecha, nuevaHora, nuevosMinutos) => {
    if (!nuevaFecha) onChange('')
    else onChange(conHora ? `${nuevaFecha}T${nuevaHora}:${nuevosMinutos}` : nuevaFecha)
  }

  const escribir = (e) => {
    const texto = e.target.value
    setEscrito(texto)
    const nueva = aFecha(texto)

    let fueraDeRango = ''
    if (nueva && min && nueva < min) fueraDeRango = `La fecha tiene que ser desde el ${aTexto(min)}`
    else if (nueva && max && nueva > max) fueraDeRango = `La fecha tiene que ser hasta el ${aTexto(max)}`
    setProblema(fueraDeRango)

    if (nueva && !fueraDeRango) avisar(nueva, hora, minutos)
    else avisar('')
  }

  const salir = () => {
    if (escrito && !aFecha(escrito)) setProblema('Escribí la fecha como dd/mm/aaaa')
    else if (!problema) setEscrito(null)
  }

  const elegirEnCalendario = (e) => {
    setEscrito(null)
    setProblema('')
    avisar(e.target.value, hora, minutos)
  }

  const abrirCalendario = () => document.getElementById(`${id}-calendario`).showPicker()

  return (
    <div className="campo-fecha">
      <div className="campo-fecha-dia">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          placeholder="dd/mm/aaaa"
          autoComplete="off"
          value={escrito ?? aTexto(fecha)}
          onChange={escribir}
          onBlur={salir}
          required={required}
        />
        <button type="button" className="campo-fecha-boton" onClick={abrirCalendario} aria-label="Abrir calendario">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <rect x="3" y="5" width="18" height="16" rx="2" />
            <path d="M3 10h18M8 3v4M16 3v4" />
          </svg>
        </button>
        <input
          id={`${id}-calendario`}
          className="campo-fecha-nativo"
          type="date"
          tabIndex={-1}
          aria-hidden="true"
          min={min}
          max={max}
          value={fecha}
          onChange={elegirEnCalendario}
        />
      </div>

      {conHora && (
        <div className="campo-fecha-hora">
          <select
            aria-label="Hora"
            value={hora}
            onChange={(e) => avisar(fecha, e.target.value, minutos)}
            disabled={!fecha}
          >
            {HORAS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
          </select>
          <span>:</span>
          <select
            aria-label="Minutos"
            value={minutos}
            onChange={(e) => avisar(fecha, hora, e.target.value)}
            disabled={!fecha}
          >
            {opcionesMinutos.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
          <span className="texto-suave">hs</span>
        </div>
      )}

      {problema && <small className="campo-fecha-error">{problema}</small>}
    </div>
  )
}

export default CampoFecha
