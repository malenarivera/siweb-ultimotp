"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  t: (key: string) => string;
  className?: string;
}

export default function Breadcrumb({ items, t, className = "" }: BreadcrumbProps) {
  const router = useRouter();

  const handleHomeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push("/home");
  };

//agrego esto nuevo para que el breadcrumb sea un link y no un button
const handleItemClick = (e:React.MouseEvent, href:string) => {
  e.preventDefault();
  router.push(href);
};  


  return (
    <nav 
      className={`max-w-7xl mx-auto my-3 text-sm text-gris ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {/* Home icon */}
        <li className="flex items-center">
          <button
            onClick={handleHomeClick}
            className="flex items-center text-gris hover:text-gris-oscuro transition-colors cursor-pointer bg-transparent border-none p-0"
            aria-label={t("common.home")}
            type="button"
          >
            <Home className="w-5 h-5" />
            <span className="sr-only">{t("common.home")}</span>
          </button>
        </li>

        {/* Breadcrumb items */}
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            <ChevronRight className="w-5 h-5 text-gris mx-1" />
            {item.href && !item.isActive ? (
              <a 
                href={item.href!}
                onClick={(e) => {
                  e.preventDefault();
                  handleItemClick(e, item.href!);
                }}
                className="text-gris hover:text-secundario transition-colors cursor-pointer bg-transparent border-none px-1 py-1"
               >
                {item.label}
              </a>
            ) : (
              <span 
                className={`text-md ${
                  item.isActive 
                    ? "font-semibold text-gris-oscuro" 
                    : "text-gris"
                }`}
                aria-current={item.isActive ? "page" : undefined}
              >
                {item.label.toUpperCase()}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
