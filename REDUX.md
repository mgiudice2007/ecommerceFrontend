# Redux en BCA Airlines

Guía para explicar el estado global del frontend. Todo lo que viene del backend pasa por un slice: **ningún componente llama al backend**.

## Cómo viaja un pedido

1. La vista despacha un thunk en un `useEffect` (lecturas) o en un evento (`onSubmit`, `onClick`).
2. El thunk hace la llamada con `clienteApi` y devuelve `data`:

   ```js
   export const fetchVuelo = createAsyncThunk('vuelos/fetchVuelo', async (id) => {
     const { data } = await clienteApi.get(`/api/vuelos/${id}`)
     return data
   })
   ```

3. El slice responde en `extraReducers` a los tres estados del pedido:
   - `pending`: prende `loading` (leer) o `guardando` (escribir) y limpia `error`.
   - `fulfilled`: guarda la respuesta.
   - `rejected`: guarda `action.error.message`.
4. La vista lee el resultado con `useSelector`.

## Archivos base

- **`src/main.jsx`:** el `<Provider store={store}>` envuelve a toda la app, una sola vez.
- **`src/redux/store.js`:** junta los 7 slices. Se suscribe al store para pasarle el token a `conexion.js` cada vez que cambia.
- **`src/redux/conexion.js`:** un único cliente de axios con la URL del backend y dos interceptores:
  - **Pedido:** agrega `Authorization: Bearer <token>` si hay sesión.
  - **Respuesta:** si el backend responde con error, lo convierte en `new Error(mensajeDelBackend)`. Así `action.error.message` trae el texto real ("Usuario o contraseña incorrectos") y los thunks no necesitan `try/catch`.

## Reglas que seguimos

- **Sin GET después de un POST, PUT o DELETE:** el backend devuelve lo que cambió y el reducer lo agrega (spread), lo reemplaza (`findIndex`) o lo saca (`filter`).
- **Un slice por funcionalidad, no por tabla:** la sesión y los usuarios van juntos.
- **Estados separados por operación:** `loading` para leer y `guardando` para escribir, y en algunos casos un error propio (`errorMapa`).
- **Navegar o avisar después de un cambio sin `.then`:** el reducer deja una marca en el store (`vueloGuardado`, `ordenConfirmada`, `pasajesAgregados`, `registrado`, `mensaje`). La vista la consume en un `useEffect`: navega o muestra un aviso, y la limpia con su acción (`reiniciarGuardado`, `limpiarMensaje`, ...).
- **Datos con su dueño:** el store guarda a qué pedido pertenece cada dato. Por ejemplo `fotosVuelo = { vueloId, lista }` y `resultadoBusqueda.consulta`. La vista solo los usa si son de la pantalla actual, así nunca muestra los de otra.
- **Formularios que se vacían solos:** el padre les cambia la `key` cuando el backend confirma el alta. Si el backend rechaza, el formulario conserva lo escrito.
- **Lo que solo le importa a una pantalla queda en `useState`:** filtros, pestaña elegida, qué fila se está editando, el formulario que se está escribiendo.
- **Sin `localStorage`:** al recargar la página (F5) el store arranca vacío y hay que volver a iniciar sesión.

## Los slices

### `catalogo`

Datos fijos que usan muchas pantallas: aeropuertos, categorías y clases.

- **Thunks:** `fetchAeropuertos`, `fetchCategorias`, `fetchClases`.
- **Estado:** `aeropuertos`, `categorias`, `clases`, `error`.
- **Quién lo usa:** `App` los pide una sola vez al abrir; las vistas solo los leen.

### `vuelos`

Todo lo que es de un vuelo: inicio, búsqueda, detalle y panel del administrador.

- **Lecturas:**
  - `fetchVuelosDestacados` y `fetchPortadas` (inicio).
  - `fetchBusqueda` (ida, o ida y vuelta).
  - `fetchVuelo`, `fetchFotosVuelo`, `fetchDescuentosVuelo` y `fetchMapaAsientos` (detalle).
  - `fetchResumenPanel` y `fetchVuelosPanel` (panel).
- **Escrituras:**
  - Vuelo: `crearVuelo`, `editarVuelo`, `cambiarEstadoVuelo`.
  - Fotos: `subirFoto`, `eliminarFoto`.
  - Descuentos: `crearDescuento`, `alternarDescuento`, `eliminarDescuento`.
  - Clases del vuelo: `crearDisponibilidad`, `editarDisponibilidad`, `eliminarDisponibilidad`.
- **Estado:** `vuelosDestacados`, `portadas`, `resultadoBusqueda`, `vueloActual`, `fotosVuelo`, `descuentosVuelo`, `mapaAsientos`, `errorMapa`, `vuelosPanel`, `resumenPanel`, `vueloGuardado`, `mensaje`, `loading`, `guardando`, `error`.
- **Acciones:** `limpiarMensaje`, `reiniciarGuardado`.
- **Cuidado:** al eliminar un vuelo desde el panel, el reducer lo saca de la lista y descuenta sus asientos del resumen, sin volver a pedir nada.

### `carrito`

Los pasajes que el comprador va a pagar.

- **Thunks:** `fetchCarrito`, `fetchVuelosDelCarrito`, `agregarPasajes`, `cambiarCantidad`, `eliminarItem`. Las tres que cambian el carrito devuelven el carrito completo, que reemplaza al del store.
- **Estado:** `carrito`, `vuelosDelCarrito`, `pasajesAgregados`, `loading`, `guardando`, `error`.
- **Acción:** `reiniciarAgregado`.
- **Escucha a otros slices:**
  - `confirmarCompra.fulfilled` (de `ordenes`): el carrito queda vacío al pagar.
  - `logout` y `vencerSesion` (de `usuario`): no queda el carrito del usuario anterior.
- **El contador del navbar** se calcula con el carrito del store.

### `ordenes`

Las compras del comprador y el pago.

- **Thunks:** `fetchOrdenes`, `fetchOrden`, `confirmarCompra` (el POST del pago), `cancelarOrden`.
- **Estado:** `ordenes`, `ordenActual`, `ordenConfirmada`, `mensaje`, `loading`, `guardando`, `error`.
- **Acciones:** `limpiarMensaje`, `reiniciarConfirmada`.
- **Cómo funciona:**
  - Al pagar, la orden que devuelve el backend queda en `ordenActual`. La pantalla de compra exitosa la lee de ahí, sin pedirla.
  - Cancelar reemplaza la orden en la lista y en el detalle.

### `usuario`

Sesión y cuentas juntas.

- **Thunks:** `login`, `logout`, `registrarUsuario`, `registrarAdministrador`, `fetchPerfil`, `editarPerfil`, `fetchUsuarios`, `cambiarRol`.
- **Estado:** `token`, `sesion`, `perfil`, `usuarios`, `registrado`, `administradoresCreados`, `mensaje`, `loading`, `guardando`, `error`.
  - `sesion` es el id, usuario, rol y vencimiento, leídos del JWT.
- **Acciones:** `limpiarMensaje`, `reiniciarError`, `reiniciarRegistrado`, `vencerSesion`.
- **Cómo funciona:**
  - Al aparecer la `sesion`, `App` pide el perfil y, si es comprador, el carrito.
  - Un `setTimeout` en `App` despacha `vencerSesion` cuando vence el token.
  - `RutaProtegida` lee la `sesion` para dejar pasar o mandar al login.

### `embarque`

Validación del pase de embarque por el administrador.

- **Thunks:** `fetchPase` (buscar por código), `embarcarPasajero`.
- **Estado:** `pase`, `loading`, `error`.
- **Acción:** `limpiarPase`.

### `avisos`

Los mensajes flotantes de éxito. No llama al backend.

- **Acciones:** `avisar(texto)`, `cerrarAviso(id)`.
- **Estado:** `lista`, `ultimoId`.
- **Cómo funciona:** las vistas despachan `avisar` cuando consumen el `mensaje` de otro slice. `App` dibuja los avisos y cada uno se cierra solo a los 6 segundos.
