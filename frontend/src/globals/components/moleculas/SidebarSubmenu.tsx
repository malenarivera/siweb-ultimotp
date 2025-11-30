"use client"

import Link from "next/link"

interface SubmenuItem {
  href: string
  icon: React.ReactNode
  label: string
}

interface SidebarSubmenuProps {
  menuKey: string
  items: SubmenuItem[]
  isOpen: boolean
  isCollapsed: boolean
  onExpandSidebar?: () => void
}

export default function SidebarSubmenu({
  menuKey,
  items,
  isOpen,
  isCollapsed,
  onExpandSidebar
}: SidebarSubmenuProps) {
  if (!isOpen || isCollapsed) return null

  return (
    <ul id={`menu-${menuKey}`} className="ml-8 mt-1 space-y-0.5" role="group">
      {items.map((item, index) => (
        <li key={index}>
          <Link
            href={item.href}
            className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 hover:text-gray-900 hover:font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#5fa6b4] focus:ring-offset-2"
            onClick={() => onExpandSidebar?.()}
          >
            <div className="w-4 h-4">
              {item.icon}
            </div>
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  )
}
