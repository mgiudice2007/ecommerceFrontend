# BCA Airlines — Frontend

Frontend del ecommerce de pasajes de avión, hecho con **React + Vite** (JavaScript).
Consume la API REST del backend en Spring Boot
([mgiudice2007/ecommerce](https://github.com/mgiudice2007/ecommerce)).

## Cómo levantarlo

1. Levantar el backend (puerto `8080`).
2. Instalar las dependencias (solo la primera vez):

   ```bash
   npm install
   ```

3. Levantar el frontend:

   ```bash
   npm run dev
   ```

4. Abrir http://localhost:5173

El frontend le habla directo al backend en `http://localhost:8080` (ver `BASE_URL`
en `src/api/api.js`). Como corren en puertos distintos, el backend lo permite con CORS.

## Usuarios de prueba

Los crea el backend la primera vez que arranca con la base vacía:

| Usuario | Contraseña | Rol |
|---|---|---|
| `comprador` | `comprador123` | Pasajero (comprador) |
| `admin` | `admin123` | Administrador |

## Qué puede hacer cada rol

La aerolínea tiene **un único vendedor: el administrador**. El registro del sitio es solo para pasajeros.

- **Cualquier visitante:** ver el inicio, buscar vuelos de **ida y vuelta** o solo ida (origen, destino, tipo, clase y precio) y ver el detalle de cada vuelo.
- **Pasajero (comprador):** agregar pasajes al carrito, confirmar la compra (sin pedir datos de pago), ver sus compras, cancelarlas (los asientos vuelven al vuelo) y completar su perfil.
- **Administrador:** publicar, editar y eliminar vuelos; cambiarles el estado (activo, demorado, pausado, cancelado); cargar clases con asientos y precio; crear, pausar y borrar descuentos; subir y borrar fotos; ver las cuentas, cambiarles el rol y crear otros administradores.

## Estructura

```
src/
├── api/api.js            función api() para llamar al backend con el token JWT
├── context/AuthContext   sesión: usuario logueado (leído del JWT) y cantidad del carrito
├── hooks/useCatalogo     aeropuertos, categorías y clases para los selects
├── utils/                formato de precios y fechas, cálculos de vuelos y órdenes
├── components/           piezas reutilizables (Navbar, TarjetaVuelo, Buscador, ...)
└── views/                una vista (pantalla) por ruta
    └── vendedor/         panel del vendedor y del administrador
```
