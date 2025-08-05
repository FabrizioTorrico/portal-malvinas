import React, type FC from 'react'

interface NavigationLinksProps {
  currentPage: 'relatos' | 'portal-memoria' | 'relato-formulario' | 'formulario-portal'
}

const NavigationLinks: FC<NavigationLinksProps> = ({ currentPage }) => {
  const links = [
    {
      href: '/relatos',
      label: 'Ver Relatos',
      active: currentPage === 'relatos'
    },
    {
      href: '/relato/formulario',
      label: 'Enviar Relato',
      active: currentPage === 'relato-formulario'
    },
    {
      href: '/portal-memoria',
      label: 'Portal Memoria',
      active: currentPage === 'portal-memoria'
    },
    {
      href: '/portal-memoria/formulario',
      label: 'Agregar Memoria',
      active: currentPage === 'formulario-portal'
    }
  ]

  return (
    <nav className="flex flex-wrap gap-2 justify-center md:justify-start">
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            link.active
              ? 'bg-primary text-secondary border-2 border-primary'
              : 'bg-secondary text-primary border-2 border-primary hover:bg-primary hover:text-secondary'
          }`}
        >
          {link.label}
        </a>
      ))}
    </nav>
  )
}

export default NavigationLinks