import { createContext, useContext } from 'react'

// Contexto de navegación interna: permite abrir la ficha 360° de un cliente
// desde cualquier módulo (Dashboard, Clientes, Proyectos, Seguimientos).
export const NavContext = createContext({ verCliente: () => {}, irA: () => {} })
export const useNav = () => useContext(NavContext)
