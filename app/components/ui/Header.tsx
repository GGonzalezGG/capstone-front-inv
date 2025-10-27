"use client";

import React, { useState, useEffect } from 'react';
import { Menu, X, User, Package, LayoutDashboard, Plus, LogOut , ScrollText } from 'lucide-react';

// Links de navegación con iconos
const navigationLinks = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Peticiones', href: '/requestList', icon: Package },
  { name: 'Crear Petición', href: '/requestForm', icon: Plus },
  { name: 'Historial de Retiros', href: '/reqHistory', icon: ScrollText },
];

/**
 * Componente de enlace de navegación que se resalta automáticamente
 */
function NavLink({ href, children, pathname, icon: Icon }: { 
  href: string; 
  children: React.ReactNode; 
  pathname: string;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const isActive = pathname === href;

  return (
    <a
      href={href}
      className={`
        flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-semibold 
        transition-all duration-200 transform hover:scale-105
        ${
          isActive
            ? 'bg-gradient-to-r from-lime-500 to-lime-600 text-white shadow-md'
            : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
        }
      `}
    >
      {Icon && <Icon className="w-4 h-4" />}
      <span>{children}</span>
    </a>
  );
}

/**
 * Enhanced Header with modern design and smooth interactions
 */
export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [pathname, setPathname] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
  }, []);

  // Cerrar menú móvil al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = () => {
      if (isMobileMenuOpen) setIsMobileMenuOpen(false);
      if (isProfileOpen) setIsProfileOpen(false);
    };
    
    if (isMobileMenuOpen || isProfileOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen, isProfileOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 bg-white shadow-lg border-b-2 border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo con gradiente */}
          <div className="flex-shrink-0">
            <a 
              href="/dashboard" 
              className="flex items-center space-x-2 group"
            >
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-2 transform transition-transform group-hover:scale-110">
                <Package className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent">
                Duomo Salud
              </span>
            </a>
          </div>

          {/* Navegación de Escritorio */}
          <div className="hidden md:flex md:space-x-2">
            {navigationLinks.map((link) => (
              <NavLink 
                key={link.name} 
                href={link.href} 
                pathname={pathname}
                icon={link.icon}
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Iconos de acción */}
          <div className="flex items-center space-x-2">
            {/* Dropdown de perfil (escritorio) */}
            <div className="relative hidden md:block">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsProfileOpen(!isProfileOpen);
                }}
                className="flex items-center space-x-2 p-2 rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full p-1.5">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium">Mi Cuenta</span>
              </button>

              {/* Dropdown menu */}
              {isProfileOpen && (
                <div 
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 animate-in fade-in slide-in-from-top-2 duration-200"
                  onClick={(e) => e.stopPropagation()}
                >
                  <a
                    href="/profile"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>Ver Perfil</span>
                  </a>
                  <hr className="my-1 border-gray-200" />
                  <a
                    href="/logout"
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </a>
                </div>
              )}
            </div>

            {/* Botón de Hamburguesa (móvil) */}
            <div className="md:hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }}
                className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                aria-controls="mobile-menu"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Abrir menú principal</span>
                {isMobileMenuOpen ? (
                  <X className="block w-6 h-6" />
                ) : (
                  <Menu className="block w-6 h-6" />
                )}
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Menú Móvil con animación */}
      {isMobileMenuOpen && (
        <div 
          className="md:hidden shadow-lg border-t border-gray-200 bg-white animate-in slide-in-from-top duration-300"
          id="mobile-menu"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 pt-3 pb-3 space-y-2">
            {navigationLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-semibold
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-lime-500 to-lime-600 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.name}</span>
                </a>
              );
            })}
            
            {/* Separador */}
            <hr className="my-2 border-gray-200" />
            
            {/* Opciones de perfil en móvil */}
            <a
              href="/profile"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-semibold text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 hover:text-blue-700 transition-all duration-200"
            >
              <User className="w-5 h-5" />
              <span>Mi Perfil</span>
            </a>
            
            <a
              href="/logout"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-semibold text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}