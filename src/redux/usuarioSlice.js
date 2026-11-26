import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { nombreDeRol } from '../utils/roles'
import { leerToken } from '../utils/token'
import { clienteApi } from './conexion'

// Sesión y usuarios van juntos: quién está logueado, su perfil y la administración de cuentas
export const login = createAsyncThunk('usuario/login', async (credenciales) => {
  const { data } = await clienteApi.post('/api/auth/login', credenciales)
  return data
})

export const logout = createAsyncThunk('usuario/logout', async () => {
  const { data } = await clienteApi.post('/api/auth/logout')
  return data
})

export const registrarUsuario = createAsyncThunk('usuario/registrarUsuario', async (datos) => {
  const { data } = await clienteApi.post('/api/auth/registro', datos)
  return data
})

export const registrarAdministrador = createAsyncThunk('usuario/registrarAdministrador', async (datos) => {
  const { data } = await clienteApi.post('/api/auth/registro/administrador', datos)
  return data
})

export const fetchPerfil = createAsyncThunk('usuario/fetchPerfil', async () => {
  const { data } = await clienteApi.get('/api/auth/me')
  return data
})

export const editarPerfil = createAsyncThunk('usuario/editarPerfil', async (perfil) => {
  const { data } = await clienteApi.put('/api/auth/me', perfil)
  return data
})

export const fetchUsuarios = createAsyncThunk('usuario/fetchUsuarios', async () => {
  const { data } = await clienteApi.get('/api/usuarios')
  return data
})

export const cambiarRol = createAsyncThunk('usuario/cambiarRol', async ({ id, rol }) => {
  const { data } = await clienteApi.put(`/api/usuarios/${id}/rol`, { rol })
  return data
})

const initialState = {
  // El token solo vive acá: al recargar la página (F5) se pierde la sesión y hay que volver a iniciarla
  token: null,
  sesion: null,
  perfil: null,
  usuarios: null,
  // Verdadero desde que el backend confirma el registro hasta que la vista lo consume para iniciar sesión
  registrado: false,
  // Cantidad de administradores creados: sirve para vaciar el formulario cuando se crea uno
  administradoresCreados: 0,
  mensaje: null,
  loading: false,
  guardando: false,
  error: null,
}

const usuarioSlice = createSlice({
  name: 'usuario',
  initialState,
  reducers: {
    limpiarMensaje: (state) => {
      state.mensaje = null
    },
    reiniciarError: (state) => {
      state.error = null
    },
    reiniciarRegistrado: (state) => {
      state.registrado = false
    },
    // El token venció: se cierra la sesión sin avisarle al backend
    vencerSesion: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.guardando = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.guardando = false
        state.token = action.payload.token
        state.sesion = leerToken(action.payload.token)
      })
      .addCase(login.rejected, (state, action) => {
        state.guardando = false
        state.error = action.error.message
      })
      // Si el backend no responde igual se cierra la sesión en el navegador
      .addCase(logout.fulfilled, () => initialState)
      .addCase(logout.rejected, () => initialState)
      .addCase(registrarUsuario.pending, (state) => {
        state.guardando = true
        state.error = null
      })
      .addCase(registrarUsuario.fulfilled, (state) => {
        state.guardando = false
        state.registrado = true
      })
      .addCase(registrarUsuario.rejected, (state, action) => {
        state.guardando = false
        state.error = action.error.message
      })
      .addCase(registrarAdministrador.pending, (state) => {
        state.guardando = true
        state.error = null
      })
      .addCase(registrarAdministrador.fulfilled, (state, action) => {
        state.guardando = false
        state.administradoresCreados += 1
        state.mensaje = `Se creó el administrador "${action.payload.username}". Ya puede iniciar sesión.`
      })
      .addCase(registrarAdministrador.rejected, (state, action) => {
        state.guardando = false
        state.error = action.error.message
      })
      .addCase(fetchPerfil.pending, (state) => {
        state.error = null
      })
      .addCase(fetchPerfil.fulfilled, (state, action) => {
        state.perfil = action.payload
      })
      .addCase(fetchPerfil.rejected, (state, action) => {
        state.error = action.error.message
      })
      .addCase(editarPerfil.pending, (state) => {
        state.guardando = true
        state.error = null
      })
      .addCase(editarPerfil.fulfilled, (state, action) => {
        state.guardando = false
        state.perfil = action.payload
        state.mensaje = 'Tus datos se guardaron correctamente.'
      })
      .addCase(editarPerfil.rejected, (state, action) => {
        state.guardando = false
        state.error = action.error.message
      })
      .addCase(fetchUsuarios.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUsuarios.fulfilled, (state, action) => {
        state.loading = false
        state.usuarios = action.payload
      })
      .addCase(fetchUsuarios.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(cambiarRol.pending, (state) => {
        state.guardando = true
        state.error = null
      })
      .addCase(cambiarRol.fulfilled, (state, action) => {
        state.guardando = false
        const indice = state.usuarios.findIndex((usuario) => usuario.id === action.payload.id)
        if (indice !== -1) {
          state.usuarios[indice] = action.payload
        }
        state.mensaje = `${action.payload.username} ahora es ${nombreDeRol(action.payload.rol)}. El cambio rige desde su próximo pedido.`
      })
      .addCase(cambiarRol.rejected, (state, action) => {
        state.guardando = false
        state.error = action.error.message
      })
  },
})

export const { limpiarMensaje, reiniciarError, reiniciarRegistrado, vencerSesion } = usuarioSlice.actions
export default usuarioSlice.reducer
