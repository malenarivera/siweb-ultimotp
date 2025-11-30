"use client"

import type React from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

interface SidebarMenuItemProps {
  menuKey: string
  icon: React.ReactNode
  label: string
  isOpen: boolean
  isCollapsed: boolean
  onToggle: (menuKey: string) => void
  onKeyDown: (e: React.KeyboardEvent, menuKey: string) => void
  onExpandSidebar?: () => void
  t: (key: string) => string
}

export default function SidebarMenuItem({
  menuKey,
  icon,
  label,
  isOpen,
  isCollapsed,
  onToggle,
  onKeyDown,
  onExpandSidebar,
  t
}: SidebarMenuItemProps) {
  return (
    <div className={`mb-1 ${isCollapsed ? 'relative' : ''}`}>
      <button
        onClick={() => {
          if (isCollapsed) {
            onExpandSidebar?.()
          } else {
            onToggle(menuKey)
          }
        }}
        onKeyDown={(e) => onKeyDown(e, menuKey)}
        aria-expanded={isOpen}
        aria-controls={`menu-${menuKey}`}
        className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} w-full px-3 py-2.5 text-gray-800 font-medium rounded-lg hover:bg-[#5fa6b4]/10 hover:text-gray-900 hover:font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#5fa6b4] focus:ring-offset-2 group`}
        title={isCollapsed ? t(`navbar.menus.${menuKey}`) : undefined}
      >
        <span className="flex items-center gap-3">
          <div className={`${isCollapsed ? 'w-6 h-6' : 'w-5 h-5'} text-gray-600 group-hover:text-gray-900 transition-colors`}>
            {icon}
          </div>
          {!isCollapsed && <span className="text-sm group-hover:font-bold">{label}</span>}
        </span>
        {!isCollapsed && (
          isOpen ? (
            <ChevronDown className="w-4 h-4 text-gray-500 transition-transform" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500 transition-transform" />
          )
        )}
      </button>
    </div>
  )
}
