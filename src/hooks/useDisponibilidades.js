import { useState } from 'react'
import { api } from '../api/api'

// Altas, cambios y bajas de las clases (disponibilidades) de un vuelo.
// avisar(tipo, texto) muestra el resultado; onCambio() le avisa al padre que el vuelo cambio.
export function useDisponibilidades(vuelo, { avisar, onCambio }) {
  const [guardando, setGuardando] = useState(false)

  const ejecutar = (url, opciones, textoExito) => {
    avisar(null)
    setGuardando(true)
    return api(url, opciones)
      .then(() => {
        avisar('exito', textoExito)
        onCambio()
        return true
      })
      .catch((err) => {
        avisar('error', err.message)
        return false
      })
      .finally(() => setGuardando(false))
  }

  const agregar = (nueva) =>
    ejecutar(
      '/api/disponibilidades',
      {
        method: 'POST',
        body: {
          vueloId: vuelo.id,
          claseId: Number(nueva.claseId),
          asientosTotales: Number(nueva.asientosTotales),
          precio: Number(nueva.precio),
        },
      },
      'Clase agregada. Ya se puede comprar.',
    )

  const guardar = (disponibilidad, valores) =>
    ejecutar(
      `/api/disponibilidades/${disponibilidad.id}`,
      {
        method: 'PUT',
        body: {
          vueloId: vuelo.id,
          claseId: disponibilidad.claseId,
          asientosTotales: Number(valores.asientosTotales),
          precio: Number(valores.precio),
        },
      },
      `Se actualizó la clase ${disponibilidad.claseNombre}.`,
    )

  const eliminar = (disponibilidad) =>
    ejecutar(
      `/api/disponibilidades/${disponibilidad.id}`,
      { method: 'DELETE' },
      `Se eliminó la clase ${disponibilidad.claseNombre} del vuelo.`,
    )

  return { guardando, agregar, guardar, eliminar }
}
