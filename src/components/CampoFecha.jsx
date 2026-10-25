import { useState } from 'react'
import './CampoFecha.css'

// El <input type="date"> del navegador muestra la fecha segun el idioma de la compu
// (en una en ingles sale 12/15/2026 y la hora con AM/PM). Este campo muestra siempre
// dd/mm/aaaa y la hora en 24 hs, y con el boton del calendario abre el del navegador.
//
// value: "2026-12-15" (o "2026-12-15T10:00" con conHora), igual que los inputs nativos
// onChange: recibe el valor nuevo en ese mismo formato ('' si se borra)
// min / max: "2026-10-25" (opcionales)

const dosDigitos = (n) => String(n).padStart(2, '0')

const HORAS = []
for (let h = 0; h < 24; h++) HORAS.push(dosDigitos(h))
const MINUTOS = []
for (let m = 0; m < 60; m += 5) MINUTOS.push(dosDigitos(m))

// "2026-12-15" -> "15/12/2026"
const aTexto = (fecha) => (fecha ? `${fecha.slice(8, 10)}/${fecha.slice(5, 7)}/${fecha.slice(0, 4)}` : '')

// "15/12/2026" -> "2026-12-15", o null si no es una fecha que exista (por ejemplo 31/02/2026)
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
  // Si la hora guardada no cae en un multiplo de 5 (por ejemplo 07:13), igual se muestra
  const opcionesMinutos = MINUTOS.includes(minutos) ? MINUTOS : [...MINUTOS, minutos].sort()

  // Lo que el usuario esta escribiendo. null = mostrar la fecha que viene en value
  const [escrito, setEscrito] = useState(null)

  const avisar = (nuevaFecha, nuevaHora, nuevosMinutos) => {
    if (!nuevaFecha) onChange('')
    else onChange(conHora ? `${nuevaFecha}T${nuevaHora}:${nuevosMinutos}` : nuevaFecha)
  }

  const escribir = (e) => {
    const texto = e.target.value
    setEscrito(texto)
    const nueva = aFecha(texto)

    // setCustomValidity (del DOM) hace que el navegador no deje enviar el formulario
    // y muestre este mensaje, igual que con min y max en un input comun
    let problema = ''
    if (texto && !nueva) problema = 'Escribí la fecha como dd/mm/aaaa'
    else if (nueva && min && nueva < min) problema = `La fecha tiene que ser desde el ${aTexto(min)}`
    else if (nueva && max && nueva > max) problema = `La fecha tiene que ser hasta el ${aTexto(max)}`
    e.target.setCustomValidity(problema)

    if (!texto) avisar('')
    else if (!problema) avisar(nueva, hora, minutos)
  }

  // Al salir del campo, si la fecha es valida se muestra prolija (1/2/2027 -> 01/02/2027)
  const salir = (e) => {
    if (e.target.validationMessage === '') setEscrito(null)
  }

  const elegirEnCalendario = (e) => {
    setEscrito(null)
    document.getElementById(id).setCustomValidity('')
    avisar(e.target.value, hora, minutos)
  }

  // showPicker abre el calendario del input de fecha escondido
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
    </div>
  )
}

export default CampoFecha
