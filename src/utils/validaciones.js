export const REGLA_NOMBRE = {
  pattern: "\\p{L}[\\p{L}' \\-]*",
  minLength: 2,
  maxLength: 40,
  title: 'De 2 a 40 letras. Puede tener tildes, espacios, apóstrofo o guion, pero no números.',
}

export const REGLA_USUARIO = {
  pattern: '[A-Za-z][A-Za-z0-9._]*',
  minLength: 4,
  maxLength: 20,
  title: 'De 4 a 20 caracteres. Empieza con una letra y puede tener letras sin tilde, números, punto o guion bajo.',
}

export const sinRuedita = (e) => e.currentTarget.blur()
