import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { consultasDeBusqueda } from '../utils/busqueda'
import { asientosDe, estaOperativo } from '../utils/vuelos'
import { clienteApi } from './conexion'

const POR_PAGINA_PANEL = 20

// Imagen de una foto lista para un <img>
const pedirImagen = async (fotoId) => {
  const { data: imagen } = await clienteApi.get(`/api/fotos/${fotoId}`)
  return `data:${imagen.tipo};base64,${imagen.file}`
}

// Foto de portada de un vuelo (la primera de su lista); null si no tiene fotos
const pedirPortada = async (vueloId) => {
  const { data: fotos } = await clienteApi.get('/api/fotos', { params: { vueloId } })
  return fotos.length === 0 ? null : pedirImagen(fotos[0].id)
}

// La foto que se acaba de subir se muestra con el archivo que eligió el administrador, sin pedirla de nuevo
const leerArchivo = (archivo) =>
  new Promise((resolve) => {
    const lector = new FileReader()
    lector.onload = () => resolve(lector.result)
    lector.readAsDataURL(archivo)
  })

// Inicio: los vuelos que se pueden comprar hoy
export const fetchVuelosDestacados = createAsyncThunk('vuelos/fetchVuelosDestacados', async () => {
  const { data } = await clienteApi.get('/api/vuelos', { params: { page: 0, size: 60 } })
  return data.content.filter((vuelo) => estaOperativo(vuelo) && vuelo.hayStock)
})

// Portadas de varios vuelos a la vez. Si a un vuelo no se le puede pedir la foto, queda en null y la página se muestra igual
export const fetchPortadas = createAsyncThunk('vuelos/fetchPortadas', async (vueloIds) => {
  const unicos = [...new Set(vueloIds)]
  const respuestas = await Promise.allSettled(unicos.map((id) => pedirPortada(id)))
  const portadas = {}
  unicos.forEach((id, i) => {
    portadas[id] = respuestas[i].status === 'fulfilled' ? respuestas[i].value : null
  })
  return portadas
})

// Búsqueda de vuelos: la consulta es el texto de la URL. Si el viaje es de ida y vuelta se piden los dos tramos
export const fetchBusqueda = createAsyncThunk('vuelos/fetchBusqueda', async (consulta) => {
  const tramos = consultasDeBusqueda(consulta)
  const { data: ida } = await clienteApi.get('/api/vuelos', { params: tramos.ida })
  if (!tramos.vuelta) {
    return { consulta, ida, vuelta: null }
  }
  const { data: vuelta } = await clienteApi.get('/api/vuelos', { params: tramos.vuelta })
  return { consulta, ida, vuelta }
})

export const fetchVuelo = createAsyncThunk('vuelos/fetchVuelo', async (id) => {
  const { data } = await clienteApi.get(`/api/vuelos/${id}`)
  return data
})

// Fotos de un vuelo: cada una trae sus datos y su imagen. La primera es la portada
export const fetchFotosVuelo = createAsyncThunk('vuelos/fetchFotosVuelo', async (vueloId) => {
  const { data: fotos } = await clienteApi.get('/api/fotos', { params: { vueloId } })
  const imagenes = await Promise.all(fotos.map((foto) => pedirImagen(foto.id)))
  return { vueloId, lista: fotos.map((foto, i) => ({ ...foto, imagen: imagenes[i] })) }
})

export const fetchDescuentosVuelo = createAsyncThunk('vuelos/fetchDescuentosVuelo', async (vueloId) => {
  const { data } = await clienteApi.get('/api/descuentos', { params: { vueloId } })
  return { vueloId, lista: data }
})

// Mapa de asientos de una clase del vuelo
export const fetchMapaAsientos = createAsyncThunk('vuelos/fetchMapaAsientos', async (disponibilidadId) => {
  const { data } = await clienteApi.get(`/api/disponibilidades/${disponibilidadId}/asientos`)
  return { disponibilidadId, datos: data }
})

// Panel del administrador
export const fetchResumenPanel = createAsyncThunk('vuelos/fetchResumenPanel', async () => {
  const { data } = await clienteApi.get('/api/vuelos/resumen')
  return data
})

export const fetchVuelosPanel = createAsyncThunk('vuelos/fetchVuelosPanel', async ({ pagina, texto }) => {
  const { data } = await clienteApi.get('/api/vuelos', {
    params: { page: pagina, size: POR_PAGINA_PANEL, texto: texto || undefined },
  })
  return { pagina, texto, datos: data }
})

export const crearVuelo = createAsyncThunk('vuelos/crearVuelo', async (vuelo) => {
  const { data } = await clienteApi.post('/api/vuelos', vuelo)
  return data
})

// El id va solo en la URL: lo que se manda en el cuerpo son los datos que el administrador puede editar
export const editarVuelo = createAsyncThunk('vuelos/editarVuelo', async ({ id, vuelo }) => {
  const { data } = await clienteApi.put(`/api/vuelos/${id}`, vuelo)
  return data
})

export const cambiarEstadoVuelo = createAsyncThunk('vuelos/cambiarEstadoVuelo', async ({ id, estado }) => {
  const { data } = await clienteApi.patch(`/api/vuelos/${id}/estado`, { estado })
  return { id, ...data }
})

export const subirFoto = createAsyncThunk('vuelos/subirFoto', async ({ vueloId, archivo }) => {
  const formulario = new FormData()
  formulario.append('vueloId', vueloId)
  formulario.append('file', archivo)
  const { data } = await clienteApi.post('/api/fotos', formulario)
  return { ...data, imagen: await leerArchivo(archivo) }
})

export const eliminarFoto = createAsyncThunk('vuelos/eliminarFoto', async (foto) => {
  const { data } = await clienteApi.delete(`/api/fotos/${foto.id}`)
  return { id: foto.id, ...data }
})

export const crearDescuento = createAsyncThunk('vuelos/crearDescuento', async ({ vueloId, descuento }) => {
  const { data } = await clienteApi.post('/api/descuentos', { ...descuento, vueloId, valor: Number(descuento.valor) })
  return data
})

// Pausa el descuento si estaba activo y lo activa si estaba pausado
export const alternarDescuento = createAsyncThunk('vuelos/alternarDescuento', async ({ vueloId, descuento }) => {
  const { data } = await clienteApi.put(`/api/descuentos/${descuento.id}`, {
    vueloId,
    tipoDescuento: descuento.tipoDescuento,
    valor: descuento.valor,
    fechaDesde: descuento.fechaDesde,
    fechaHasta: descuento.fechaHasta,
    activo: !descuento.activo,
  })
  return data
})

export const eliminarDescuento = createAsyncThunk('vuelos/eliminarDescuento', async (descuento) => {
  const { data } = await clienteApi.delete(`/api/descuentos/${descuento.id}`)
  return { id: descuento.id, ...data }
})

export const crearDisponibilidad = createAsyncThunk('vuelos/crearDisponibilidad', async ({ vueloId, clase }) => {
  const { data } = await clienteApi.post('/api/disponibilidades', {
    vueloId,
    claseId: Number(clase.claseId),
    asientosTotales: Number(clase.asientosTotales),
    precio: Number(clase.precio),
  })
  return data
})

export const editarDisponibilidad = createAsyncThunk(
  'vuelos/editarDisponibilidad',
  async ({ vueloId, disponibilidad, valores }) => {
    const { data } = await clienteApi.put(`/api/disponibilidades/${disponibilidad.id}`, {
      vueloId,
      claseId: disponibilidad.claseId,
      asientosTotales: Number(valores.asientosTotales),
      precio: Number(valores.precio),
    })
    return data
  },
)

export const eliminarDisponibilidad = createAsyncThunk('vuelos/eliminarDisponibilidad', async (disponibilidad) => {
  await clienteApi.delete(`/api/disponibilidades/${disponibilidad.id}`)
  return disponibilidad
})

const vuelosSlice = createSlice({
  name: 'vuelos',
  initialState: {
    vuelosDestacados: [],
    portadas: {},
    resultadoBusqueda: null,
    vueloActual: null,
    fotosVuelo: { vueloId: null, lista: [] },
    descuentosVuelo: { vueloId: null, lista: [] },
    mapaAsientos: { disponibilidadId: null, datos: null },
    errorMapa: null,
    vuelosPanel: { pagina: 0, texto: '', datos: null },
    resumenPanel: null,
    vueloGuardado: null,
    mensaje: null,
    loading: false,
    guardando: false,
    error: null,
  },
  reducers: {
    limpiarMensaje: (state) => {
      state.mensaje = null
    },
    // Al abrir un formulario o al terminar de usar el vuelo guardado: se borra el resultado y el error de la vez anterior
    reiniciarGuardado: (state) => {
      state.vueloGuardado = null
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVuelosDestacados.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVuelosDestacados.fulfilled, (state, action) => {
        state.loading = false
        state.vuelosDestacados = action.payload
      })
      .addCase(fetchVuelosDestacados.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchPortadas.fulfilled, (state, action) => {
        state.portadas = { ...state.portadas, ...action.payload }
      })
      .addCase(fetchBusqueda.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBusqueda.fulfilled, (state, action) => {
        state.loading = false
        state.resultadoBusqueda = action.payload
      })
      .addCase(fetchBusqueda.rejected, (state, action) => {
        state.loading = false
        state.resultadoBusqueda = null
        state.error = action.error.message
      })
      .addCase(fetchVuelo.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVuelo.fulfilled, (state, action) => {
        state.loading = false
        state.vueloActual = action.payload
      })
      .addCase(fetchVuelo.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(fetchFotosVuelo.pending, (state) => {
        state.error = null
      })
      .addCase(fetchFotosVuelo.fulfilled, (state, action) => {
        state.fotosVuelo = action.payload
      })
      .addCase(fetchFotosVuelo.rejected, (state, action) => {
        state.error = action.error.message
      })
      .addCase(fetchDescuentosVuelo.pending, (state) => {
        state.error = null
      })
      .addCase(fetchDescuentosVuelo.fulfilled, (state, action) => {
        state.descuentosVuelo = action.payload
      })
      .addCase(fetchDescuentosVuelo.rejected, (state, action) => {
        state.error = action.error.message
      })
      .addCase(fetchMapaAsientos.pending, (state) => {
        state.errorMapa = null
      })
      .addCase(fetchMapaAsientos.fulfilled, (state, action) => {
        state.mapaAsientos = action.payload
      })
      .addCase(fetchMapaAsientos.rejected, (state, action) => {
        state.errorMapa = action.error.message
      })
      .addCase(fetchResumenPanel.pending, (state) => {
        state.error = null
      })
      .addCase(fetchResumenPanel.fulfilled, (state, action) => {
        state.resumenPanel = action.payload
      })
      .addCase(fetchResumenPanel.rejected, (state, action) => {
        state.error = action.error.message
      })
      .addCase(fetchVuelosPanel.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchVuelosPanel.fulfilled, (state, action) => {
        state.loading = false
        state.vuelosPanel = action.payload
      })
      .addCase(fetchVuelosPanel.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(crearVuelo.pending, (state) => {
        state.guardando = true
        state.error = null
      })
      .addCase(crearVuelo.fulfilled, (state, action) => {
        state.guardando = false
        state.vueloGuardado = action.payload
      })
      .addCase(crearVuelo.rejected, (state, action) => {
        state.guardando = false
        state.error = action.error.message
      })
      .addCase(editarVuelo.pending, (state) => {
        state.guardando = true
        state.error = null
      })
      // El backend devuelve el vuelo ya editado: reemplaza al que hubiera en el panel o en el detalle, sin volver a pedirlo
      .addCase(editarVuelo.fulfilled, (state, action) => {
        state.guardando = false
        state.vueloGuardado = action.payload
        if (state.vueloActual?.id === action.payload.id) {
          state.vueloActual = action.payload
        }
        const lista = state.vuelosPanel.datos?.content
        const indice = lista ? lista.findIndex((vuelo) => vuelo.id === action.payload.id) : -1
        if (indice !== -1) {
          lista[indice] = action.payload
        }
      })
      .addCase(editarVuelo.rejected, (state, action) => {
        state.guardando = false
        state.error = action.error.message
      })
      .addCase(cambiarEstadoVuelo.pending, (state) => {
        state.error = null
      })
      // El backend devuelve el nuevo estado: se actualiza la lista y los totales del panel sin volver a pedirlos
      .addCase(cambiarEstadoVuelo.fulfilled, (state, action) => {
        const { id, estado, mensaje } = action.payload
        const lista = state.vuelosPanel.datos.content
        const indice = lista.findIndex((vuelo) => vuelo.id === id)
        if (indice !== -1) {
          if (estado === 'ELIMINADO') {
            const asientos = asientosDe(lista[indice])
            state.vuelosPanel.datos.content = lista.filter((vuelo) => vuelo.id !== id)
            state.vuelosPanel.datos.totalElements -= 1
            state.resumenPanel.vuelos -= 1
            state.resumenPanel.asientosVendidos -= asientos.vendidos
            state.resumenPanel.asientosTotales -= asientos.totales
          } else {
            lista[indice].estado = estado
          }
        }
        state.mensaje = mensaje
      })
      .addCase(cambiarEstadoVuelo.rejected, (state, action) => {
        state.error = action.error.message
      })
      .addCase(subirFoto.pending, (state) => {
        state.guardando = true
        state.error = null
      })
      .addCase(subirFoto.fulfilled, (state, action) => {
        state.guardando = false
        state.fotosVuelo.lista = [...state.fotosVuelo.lista, action.payload]
        state.mensaje = 'Foto subida.'
      })
      .addCase(subirFoto.rejected, (state, action) => {
        state.guardando = false
        state.error = action.error.message
      })
      .addCase(eliminarFoto.pending, (state) => {
        state.guardando = true
        state.error = null
      })
      .addCase(eliminarFoto.fulfilled, (state, action) => {
        state.guardando = false
        state.fotosVuelo.lista = state.fotosVuelo.lista.filter((foto) => foto.id !== action.payload.id)
        state.mensaje = action.payload.mensaje
      })
      .addCase(eliminarFoto.rejected, (state, action) => {
        state.guardando = false
        state.error = action.error.message
      })
      .addCase(crearDescuento.pending, (state) => {
        state.guardando = true
        state.error = null
      })
      .addCase(crearDescuento.fulfilled, (state, action) => {
        state.guardando = false
        state.descuentosVuelo.lista = [...state.descuentosVuelo.lista, action.payload]
        state.mensaje = 'Descuento creado.'
      })
      .addCase(crearDescuento.rejected, (state, action) => {
        state.guardando = false
        state.error = action.error.message
      })
      .addCase(alternarDescuento.pending, (state) => {
        state.guardando = true
        state.error = null
      })
      .addCase(alternarDescuento.fulfilled, (state, action) => {
        state.guardando = false
        const lista = state.descuentosVuelo.lista
        const indice = lista.findIndex((descuento) => descuento.id === action.payload.id)
        if (indice !== -1) {
          lista[indice] = action.payload
        }
        state.mensaje = action.payload.activo ? 'Descuento activado.' : 'Descuento pausado.'
      })
      .addCase(alternarDescuento.rejected, (state, action) => {
        state.guardando = false
        state.error = action.error.message
      })
      .addCase(eliminarDescuento.pending, (state) => {
        state.guardando = true
        state.error = null
      })
      .addCase(eliminarDescuento.fulfilled, (state, action) => {
        state.guardando = false
        state.descuentosVuelo.lista = state.descuentosVuelo.lista.filter((descuento) => descuento.id !== action.payload.id)
        state.mensaje = action.payload.mensaje
      })
      .addCase(eliminarDescuento.rejected, (state, action) => {
        state.guardando = false
        state.error = action.error.message
      })
      .addCase(crearDisponibilidad.pending, (state) => {
        state.guardando = true
        state.error = null
      })
      .addCase(crearDisponibilidad.fulfilled, (state, action) => {
        state.guardando = false
        state.vueloActual.disponibilidades = [...state.vueloActual.disponibilidades, action.payload]
        state.mensaje = 'Clase agregada. Ya se puede comprar.'
      })
      .addCase(crearDisponibilidad.rejected, (state, action) => {
        state.guardando = false
        state.error = action.error.message
      })
      .addCase(editarDisponibilidad.pending, (state) => {
        state.guardando = true
        state.error = null
      })
      .addCase(editarDisponibilidad.fulfilled, (state, action) => {
        state.guardando = false
        const lista = state.vueloActual.disponibilidades
        const indice = lista.findIndex((disponibilidad) => disponibilidad.id === action.payload.id)
        if (indice !== -1) {
          lista[indice] = action.payload
        }
        state.mensaje = `Se actualizó la clase ${action.payload.claseNombre}.`
      })
      .addCase(editarDisponibilidad.rejected, (state, action) => {
        state.guardando = false
        state.error = action.error.message
      })
      .addCase(eliminarDisponibilidad.pending, (state) => {
        state.guardando = true
        state.error = null
      })
      .addCase(eliminarDisponibilidad.fulfilled, (state, action) => {
        state.guardando = false
        state.vueloActual.disponibilidades = state.vueloActual.disponibilidades.filter(
          (disponibilidad) => disponibilidad.id !== action.payload.id,
        )
        state.mensaje = `Se eliminó la clase ${action.payload.claseNombre} del vuelo.`
      })
      .addCase(eliminarDisponibilidad.rejected, (state, action) => {
        state.guardando = false
        state.error = action.error.message
      })
  },
})

export const { limpiarMensaje, reiniciarGuardado } = vuelosSlice.actions
export default vuelosSlice.reducer
