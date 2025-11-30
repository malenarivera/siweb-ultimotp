"use client";
import Breadcrumb from "@/globals/components/moleculas/Breadcrumb";
import Title from "../atomos/Title";
import { BreadcrumbProps, BreadcrumbItem } from "@/globals/components/moleculas/Breadcrumb";

interface PageHeaderProps {
  title?: string;
  description?: string;
  breadCrumbConf: {items: BreadcrumbProps["items"], t: BreadcrumbProps["t"], className?: BreadcrumbProps["className"]};
}

export default function PageHeader({title, description, breadCrumbConf}: PageHeaderProps) {
   let items = breadCrumbConf.items;
   let t = breadCrumbConf.t;
   let className = breadCrumbConf.className;
  return (
    <section className="border-b-1 border-manzana my-6">
      {breadCrumbConf && <Breadcrumb 
        items={items}
        t={t}
        className={className}
      />}
      {/* Render title and description only when provided */}
      {title && <Title title={title} />}
      {description && <p className="text-sm mb-3">{description}</p>}
    </section>
  );
}
