// Reglas de los datos de una cuenta: son las mismas que controla el backend.
// Se ponen como atributos del <input> (pattern, minLength, maxLength y title):
// el navegador no deja enviar el formulario si no se cumplen y muestra el title.

// Nombre y apellido: de 2 a 40 letras (con tildes y ñ), espacios, apostrofo o guion.
// \p{L} quiere decir "cualquier letra"
export const REGLA_NOMBRE = {
  pattern: "\\p{L}[\\p{L}' \\-]*",
  minLength: 2,
  maxLength: 40,
  title: 'De 2 a 40 letras. Puede tener tildes, espacios, apóstrofo o guion, pero no números.',
}

// Usuario: de 4 a 20 caracteres, empieza con letra, sin espacios ni tildes
export const REGLA_USUARIO = {
  pattern: '[A-Za-z][A-Za-z0-9._]*',
  minLength: 4,
  maxLength: 20,
  title: 'De 4 a 20 caracteres. Empieza con una letra y puede tener letras sin tilde, números, punto o guion bajo.',
}
