export const ROLES = [
  { valor: 'COMPRADOR', nombre: 'Comprador', plural: 'Compradores' },
  { valor: 'ADMIN', nombre: 'Administrador', plural: 'Administradores' },
]

export const nombreDeRol = (valor) => ROLES.find((r) => r.valor === valor)?.nombre ?? valor
