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
