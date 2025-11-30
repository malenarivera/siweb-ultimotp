'use client'
import HeaderNotLogger from "@/globals/components/organismos/HeaderNotLoggerAuth0";
import Home from "@/modules/home/homeLoggout/components/Home";
import { useTranslations } from "@/globals/hooks/useTranslations";

export default function LoggedOutHome () {
    const { t, language, changeLanguage, isLoading: translationsLoading } = useTranslations();
    if (translationsLoading) {
        return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-lg">Cargando...</div>
        </div>
        );
    }
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <HeaderNotLogger t={t} />
            <main className="flex-1">
                <Home t={t} language={language} changeLanguage={changeLanguage} />
            </main>
        </div>
    );
}