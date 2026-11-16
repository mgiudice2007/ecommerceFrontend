import { useEffect, useState } from 'react'
import { api } from '../api/api'

// Descuentos de un vuelo: la lista y sus altas, pausas y bajas (la lista se actualiza con la respuesta).
export function useDescuentosVuelo(vueloId, { avisar, onCambio }) {
  const [descuentos, setDescuentos] = useState([])
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    api(`/api/descuentos?vueloId=${vueloId}`)
      .then((data) => setDescuentos(data))
      .catch((err) => avisar('error', err.message))
    // avisar cambia en cada render del padre; la lista se pide solo al cambiar de vuelo
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vueloId])

  const ejecutar = (url, opciones, textoExito, actualizarLista) => {
    avisar(null)
    setGuardando(true)
    return api(url, opciones)
      .then((respuesta) => {
        avisar('exito', textoExito ?? respuesta.mensaje)
        actualizarLista(respuesta)
        onCambio()
        return true
      })
      .catch((err) => {
        avisar('error', err.message)
        return false
      })
      .finally(() => setGuardando(false))
  }

  const crear = (nuevo) =>
    ejecutar(
      '/api/descuentos',
      { method: 'POST', body: { ...nuevo, vueloId, valor: Number(nuevo.valor) } },
      'Descuento creado.',
      (creado) => setDescuentos([...descuentos, creado]),
    )

  const alternarActivo = (d) =>
    ejecutar(
      `/api/descuentos/${d.id}`,
      {
        method: 'PUT',
        body: {
          vueloId,
          tipoDescuento: d.tipoDescuento,
          valor: d.valor,
          fechaDesde: d.fechaDesde,
          fechaHasta: d.fechaHasta,
          activo: !d.activo,
        },
      },
      d.activo ? 'Descuento pausado.' : 'Descuento activado.',
      (actualizado) => setDescuentos(descuentos.map((x) => (x.id === actualizado.id ? actualizado : x))),
    )

  const eliminar = (d) =>
    ejecutar(`/api/descuentos/${d.id}`, { method: 'DELETE' }, null, () =>
      setDescuentos(descuentos.filter((x) => x.id !== d.id)),
    )

  return { descuentos, guardando, crear, alternarActivo, eliminar }
}
