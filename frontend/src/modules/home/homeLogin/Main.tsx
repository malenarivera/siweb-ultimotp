'use client';
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "@/globals/hooks/useTranslations";
import HomeLogin from "@/modules/home/homeLogin/components/HomeLogin";
import HistoriaClinica from "@/modules/historia-clinica/historia-clinica";
import RegistrarPaciente from "@/modules/historia-clinica/registrarPaciente/components/registrar-paciente";
import BuscarPaciente from "@/modules/historia-clinica/buscarPaciente/components/buscar-paciente";
import BuscarMedicamentos from "@/modules/medicamentos/components/buscar-Medicamentos";
import HistoriaClinicaPaciente from "@/modules/historia-clinica/paciente/components/historia-clinica-paciente";
import Header from "@/globals/components/organismos/Header";
import Sidebar from "@/globals/components/organismos/Sidebar";
import Medicamentos from "@/modules/medicamentos/medicamentos";
import Personal from "@/modules/personal/personal";
import RegistrarPersonal from "@/modules/personal/registrarPersonal/registrarPersonal";


export default function Main() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const { t, language, changeLanguage, isLoading: translationsLoading } = useTranslations();
      if (translationsLoading) {
        return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-lg">Cargando...</div>
        </div>
        );
      }

    const routes = {
    '/': <HomeLogin />,
    '/home': <HomeLogin />,
    '/historia-clinica': <HistoriaClinica />,
    '/medicamentos': <Medicamentos />,
    '/personal': <Personal />,
    '/registrar-personal': <RegistrarPersonal />,
    '/paciente': <HistoriaClinicaPaciente t={t} />,
    '/registrar-paciente': <RegistrarPaciente t={t} language={language} changeLanguage={changeLanguage} />,
    '/buscar-paciente': <BuscarPaciente t={t} language={language} changeLanguage={changeLanguage} />,
    '/buscar-medicamentos': <BuscarMedicamentos t={t} language={language} changeLanguage={changeLanguage} />,

  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar t={t} onCollapseChange={setSidebarCollapsed} />
      <div className={`${sidebarCollapsed ? 'ml-24' : 'ml-64'} flex flex-col transition-all duration-300`}>
        <Header 
          t={t} 
          language={language} 
          changeLanguage={changeLanguage} 
        />
        <main className="flex-1">
          {routes[pathname as keyof typeof routes] || <HomeLogin />}
        </main>
      </div>
    </div>
  );
}
