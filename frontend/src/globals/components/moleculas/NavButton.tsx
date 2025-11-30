import { useState } from "react";
import { useTranslations } from "@/globals/hooks/useTranslations";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface NavItem {
  href: string;
  text: string;
  isExternal?: boolean;
}

interface NavButtonProps {
  menuKey: string;
  items: NavItem[];
}

export default function NavButton({ menuKey, items }: NavButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslations();

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const closeDropdown = () => {
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleDropdown();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown' && isOpen) {
      e.preventDefault();
      // Enfocar el primer elemento del menú
      const firstMenuItem = document.querySelector(`[role="menu"] a, [role="menu"] [role="menuitem"]`) as HTMLElement;
      if (firstMenuItem) {
        firstMenuItem.focus();
      }
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Solo cerrar si el foco no va a un elemento del menú
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget || !relatedTarget.closest('[role="menu"]')) {
      setTimeout(() => {
        if (!document.activeElement?.closest('[role="menu"]')) {
          setIsOpen(false);
        }
      }, 150);
    }
  };

  return (
    <li className="relative">
      <button
        onClick={toggleDropdown}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        className="flex text-black font-medium px-3 py-2 hover:bg-[#5fa6b4] hover:text-white rounded transition-colors justify-center items-center focus:outline-none focus:ring-2 focus:ring-[#5fa6b4] focus:ring-offset-2"
        tabIndex={0}
        aria-expanded={isOpen}
        aria-haspopup="true"
        id={`menu-${menuKey}`}
      >
        {t(`navbar.menus.${menuKey}`)}
        <ChevronDown className="mr-4 w-4 h-4" />
      </button>
      {isOpen && (
        <ul 
          className="absolute top-10 bg-[#4a6b59] text-white shadow-lg py-1.5 z-10 rounded"
          role="list"
          aria-labelledby={`menu-${menuKey}`}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
              // Volver el foco al botón
              const button = document.getElementById(`menu-${menuKey}`) as HTMLElement;
              if (button) button.focus();
            }
          }}
        >
          {items.map((item, index) => (
            <li key={index} className="w-40">
              {item.isExternal ? (
                <a
                  href={item.href}
                  className="block px-2.5 py-2.5 text-white 
                             hover:bg-[#5fa6b4] hover:outline hover:outline-2 hover:outline-black 
                             focus:outline focus:outline-2 focus:outline-[#5fa6b4] rounded transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                  tabIndex={0}
                  onClick={closeDropdown}
                >
                  {item.text}
                </a>
              ) : (
                <Link
                  href={item.href}
                  className="block px-2.5 py-2.5 text-white hover:bg-[#5fa6b4]  
                             hover:outline hover:outline-2 hover:outline-black 
                             focus:outline focus:outline-2 focus:outline-[#5fa6b4] rounded transition-colors"
                  tabIndex={0}
                  onClick={closeDropdown}
                >
                  {item.text}
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}
