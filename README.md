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

Vite manda todo lo que empieza con `/api` al backend (ver `vite.config.js`),
así que no hace falta configurar nada más.

## Usuarios de prueba

Los crea el backend la primera vez que arranca con la base vacía:

| Usuario | Contraseña | Rol |
|---|---|---|
| `comprador` | `comprador123` | Comprador |
| `vendedor` | `vendedor123` | Vendedor |
| `admin` | `admin123` | Administrador |

## Qué puede hacer cada rol

- **Cualquier visitante:** ver el inicio, buscar vuelos (origen, destino, tipo, clase y precio) y ver el detalle de cada vuelo.
- **Comprador:** agregar pasajes al carrito, pagar (pago simulado), ver sus compras, cancelarlas (los asientos vuelven al vuelo) y completar su perfil.
- **Vendedor:** publicar, editar y eliminar sus vuelos; cargar clases con asientos y precio; crear, pausar y borrar descuentos; subir y borrar fotos.
- **Administrador:** lo mismo que el vendedor pero sobre los vuelos de todos, y además crear otros administradores.

## Estructura

```
src/
├── api/api.js            función api() para llamar al backend con el token JWT
├── context/AuthContext   sesión: usuario logueado (leído del JWT) y cantidad del carrito
├── hooks/useCatalogo     aeropuertos, categorías y clases para los selects
├── utils/                formato de precios y fechas, cálculos de vuelos y órdenes
├── components/           piezas reutilizables (Navbar, TarjetaVuelo, Buscador, ...)
└── pages/                una pantalla por ruta
    └── vendedor/         panel del vendedor y del administrador
```
