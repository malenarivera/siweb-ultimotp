import Link from "next/link";

interface HeaderNotLoggerProps {
  t: (key: string) => string;
}

export default function HeaderNotLogger({
  t,
}: HeaderNotLoggerProps) {
  return (
    <div className="bg-[#88B497] flex items-center justify-between px-8 py-4">
      {/* Logo centrado */}
      <div className="flex-1 flex justify-center">
        <Link href="/" className="flex items-center justify-center" aria-label={t("navbar.logo")}>
          <img
            src="/assets/logoCompleto.png"
            alt={t("navbar.logo")}
            className="h-16 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Botón de iniciar sesión a la derecha */}
      <div className="flex items-center">
        <a
            href="/auth/login"
            className="bg-white text-[#88B497] px-6 py-2 rounded font-bold hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#5fa6b4] focus:ring-offset-2 inline-block"
            tabIndex={0}
        >
          {t("login.loginButton")}
        </a>
      </div>
    </div>
  );
}
