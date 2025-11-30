"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import {
  FileText,
  Calendar,
  Pill,
  Users,
  UserPlus,
  Search,
  FileBarChart,
  CalendarCheck,
  CalendarDays,
  Package,
  FileEdit,
  UserCog,
  Clock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import SidebarMenuItem from "../moleculas/SidebarMenuItem"
import SidebarSubmenu from "../moleculas/SidebarSubmenu"

interface SidebarProps {
  t: (key: string) => string
  onCollapseChange?: (isCollapsed: boolean) => void
}

export default function Sidebar({ t, onCollapseChange }: SidebarProps) {
  const [openMenu, setOpenMenu] = useState<string | null>("home")
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleMenu = (menu: string) => {
    setOpenMenu(openMenu === menu ? null : menu)
  }

  const toggleCollapse = () => {
    const newCollapsedState = !isCollapsed
    setIsCollapsed(newCollapsedState)
    // Cerrar todos los menús cuando se colapsa
    if (!newCollapsedState) {
      setOpenMenu(null)
    }
    // Notificar al componente padre
    onCollapseChange?.(newCollapsedState)
  }

  const expandSidebar = () => {
    if (isCollapsed) {
      setIsCollapsed(false)
      onCollapseChange?.(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, menu: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      toggleMenu(menu)
    }
  }

  return (
    <nav
      className={`${isCollapsed ? 'w-30' : 'w-64'} h-screen bg-gradient-to-b from-white to-gray-50 border-r border-gray-200 flex flex-col fixed left-0 top-0 z-10 shadow-sm transition-all duration-300`}
      aria-label="Sidebar navigation"
    >
      {/* Header con Logo */}
      <div className="flex items-center justify-center px-8 pb-6">
        {!isCollapsed && (
          <Link href="/home" className="flex items-center justify-center" aria-label={t("navbar.logo")}>
            <img src="/assets/ClinicLogo.png" alt={t("navbar.logo")} className="w-full h-auto object-contain" />
          </Link>
        )}
        {isCollapsed && (
          <Link href="/home" className="flex items-center justify-center" aria-label={t("navbar.logo")}>
            <img src="/assets/ClinicLogoSmall.png" alt={t("navbar.logo")} className="w-26 h-20 object-contain" />
          </Link>
        )}
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 flex flex-col justify-between overflow-y-auto px-3 pt-2 space-y-1">
        <div>
          {/* Historia Clínica */}
          <div className="mb-1 mt-2">
            <SidebarMenuItem
              menuKey="home"
              icon={<FileText className="w-full h-full" />}
              label={t("navbar.menus.historiaClinica")}
              isOpen={openMenu === "home"}
              isCollapsed={isCollapsed}
              onToggle={toggleMenu}
              onKeyDown={handleKeyDown}
              onExpandSidebar={expandSidebar}
              t={t}
            />
            <SidebarSubmenu
              menuKey="home"
              items={[
                {
                  href: "/registrar-paciente",
                  icon: <UserPlus className="w-full h-full" />,
                  label: t("navbar.submenus.historiaClinica.crearPaciente")
                },
                {
                  href: "/buscar-paciente",
                  icon: <Search className="w-full h-full" />,
                  label: t("navbar.submenus.historiaClinica.buscarPaciente")
                },
                {
                  href: "#",
                  icon: <FileBarChart className="w-full h-full" />,
                  label: t("navbar.submenus.historiaClinica.generarReporte")
                }
              ]}
              isOpen={openMenu === "home"}
              isCollapsed={isCollapsed}
              onExpandSidebar={expandSidebar}
            />
          </div>

          {/* Turnos */}
          <div className="mb-1">
            <SidebarMenuItem
              menuKey="turnos"
              icon={<Calendar className="w-full h-full" />}
              label={t("navbar.menus.turnos")}
              isOpen={openMenu === "turnos"}
              isCollapsed={isCollapsed}
              onToggle={toggleMenu}
              onKeyDown={handleKeyDown}
              onExpandSidebar={expandSidebar}
              t={t}
            />
            <SidebarSubmenu
              menuKey="turnos"
              items={[
                {
                  href: "#",
                  icon: <CalendarCheck className="w-full h-full" />,
                  label: t("navbar.submenus.turnos.gestionarTurnos")
                },
                {
                  href: "#",
                  icon: <CalendarDays className="w-full h-full" />,
                  label: t("navbar.submenus.turnos.calendario")
                }
              ]}
              isOpen={openMenu === "turnos"}
              isCollapsed={isCollapsed}
              onExpandSidebar={expandSidebar}
            />
          </div>

          {/* Medicamentos */}
          <div className="mb-1">
            <SidebarMenuItem
              menuKey="medicamentos"
              icon={<Pill className="w-full h-full" />}
              label={t("navbar.menus.medicamentos")}
              isOpen={openMenu === "medicamentos"}
              isCollapsed={isCollapsed}
              onToggle={toggleMenu}
              onKeyDown={handleKeyDown}
              onExpandSidebar={expandSidebar}
              t={t}
            />
            <SidebarSubmenu
              menuKey="medicamentos"
              items={[
                {
                  href: "/buscar-medicamentos",
                  icon: <Package className="w-full h-full" />,
                  label: t("navbar.submenus.medicamentos.inventario")
                },
                {
                  href: "#",
                  icon: <FileEdit className="w-full h-full" />,
                  label: t("navbar.submenus.medicamentos.recetas")
                }
              ]}
              isOpen={openMenu === "medicamentos"}
              isCollapsed={isCollapsed}
              onExpandSidebar={expandSidebar}
            />
          </div>

          {/* Personal */}
          <div className="mb-1">
            <SidebarMenuItem
              menuKey="personal"
              icon={<Users className="w-full h-full" />}
              label={t("navbar.menus.personal")}
              isOpen={openMenu === "personal"}
              isCollapsed={isCollapsed}
              onToggle={toggleMenu}
              onKeyDown={handleKeyDown}
              onExpandSidebar={expandSidebar}
              t={t}
            />
            <SidebarSubmenu
              menuKey="personal"
              items={[
                {
                  href: "registrar-personal",
                  icon: <UserCog className="w-full h-full" />,
                  label: t("navbar.submenus.personal.gestionarPersonal")
                },
                {
                  href: "#",
                  icon: <Clock className="w-full h-full" />,
                  label: t("navbar.submenus.personal.horarios")
                }
              ]}
              isOpen={openMenu === "personal"}
              isCollapsed={isCollapsed}
              onExpandSidebar={expandSidebar}
            />
          </div>
        </div>
        {/* Logout 
        <div className="w-full">
          <button
            onClick={() => {
              // Limpiar todo el localStorage
              localStorage.clear();
              // Redirigir a la ruta de logout de Auth0
              window.location.href = '/auth/logout';
            }}
            className="bottom-0 w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors text-sm font-bold h-12 w-30 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            tabIndex={0}
          >
            {t("navbar.submenus.personal.cerrarSesion")}
          </button>
        </div>
        */}
      </div>

      {/* Botón de Colapsar - Al final */}
      <div className="p-3 border-t border-gray-200">
        <button
          onClick={toggleCollapse}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault()
              toggleCollapse()
            }
          }}
          className={`w-full p-2 rounded-lg hover:bg-[#5fa6b4]/20 hover:font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#5fa6b4] focus:ring-offset-2 bg-white border border-gray-800 hover:border-[#5fa6b4] shadow-sm hover:shadow-md ${isCollapsed ? 'flex justify-center' : 'flex items-center justify-center gap-2'}`}
          aria-label={isCollapsed ? (t("common.expand") || "Expandir") : (t("common.collapse") || "Colapsar")}
          title={isCollapsed ? (t("common.expand") || "Expandir") : (t("common.collapse") || "Colapsar")}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5 text-[#9bbd6c]" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 text-[#9bbd6c]" />
              <span className="text-sm text-gray-900 font-medium hover:font-bold">{t("common.collapse") || "Colapsar"}</span>
            </>
          )}
        </button>
      </div>
    </nav>
  )
}
