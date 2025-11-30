"use client"

import PageHeader from "@/globals/components/organismos/PageHeader";
import { Card, CardContent } from "@/globals/components/atomos/card";
import Footer from "@/globals/components/organismos/Footer"
import { useTranslations } from "@/globals/hooks/useTranslations"
import { UserCog, Clock } from "lucide-react"

export default function PersonalPage() {
  const { t } = useTranslations()
  

  const options = [
    {
      id: "personal",
      title: "Gestion de Personal",
      icon: UserCog,
      description: "Registra un nuevo miembro del personal médico o administrativo",
      href: "homeLogin",
    },
    {
      id: "horarios",
      title: "Horarios del Personal",
      icon: Clock,
      description: "Conoce y administra los horarios del personal",
      href: "homeLogin",
    }
  ]

  return (
    <>
      <PageHeader
        title="Personal"
        description="Gestiona la información del personal de forma segura y eficiente"
        breadCrumbConf={{
          items: [{ label: "Personal", href: "/historia-clinica", isActive: true }],
          t: t,
        }}
      />

      <div className="max-w-6xl mx-auto px-6 my-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {options.map((option) => {
            const Icon = option.icon
            return (
              <a key={option.id} href={option.href}>
                <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer border-2 border-manzana hover:border-secundario group">
                  <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-manzana/10 flex items-center justify-center group-hover:bg-manzana/20 transition-colors">
                      <Icon className="w-8 h-8 text-manzana" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-manzana transition-colors">
                      {option.title}
                    </h2>
                    <p className="text-sm text-gray-600">{option.description}</p>
                    <div className="pt-2">
                      <div className="text-manzana opacity-0 group-hover:opacity-100 transition-opacity">→</div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            )
          })}
        </div>
      </div>

      <Footer />
    </>
  )
}