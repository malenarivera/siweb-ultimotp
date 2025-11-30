"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/globals/components/atomos/card";
import ReCAPTCHA from "react-google-recaptcha";
import { useTranslations } from "@/globals/hooks/useTranslations";

interface LoginProps {
  onLogin: () => void;
}

export default function Login({ onLogin }: LoginProps) {
  const { t } = useTranslations();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      setError(t("login.error.emptyFields"));
      return;
    }
    setError("");
    setShowCaptcha(true); // luego del login aparece captcha
  };

  const handleCaptchaComplete = () => {
    if (captchaValue) {
      onLogin();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-xl">
        <CardHeader>
          {/* Logo */}
          <div className="flex justify-center">
            <img
              src="/assets/logoCompleto.png"
              alt="Logo empresa"
              className="w-auto h-auto"
            />
          </div>
          <CardTitle className="text-center mt-4 text-[#757e74]">{t("login.title")}</CardTitle>
        </CardHeader>

        <CardContent>
          {!showCaptcha ? (
            <>
              {/* Inputs - solo se muestran antes del captcha */}
              <div className="space-y-4">
                <label className="text-[#757e74] font-bold mb-2">{t("login.username")}</label>
                <input
                  type="text"
                  placeholder={t("login.username")}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <label className="text-[#757e74] font-bold mb-2">{t("login.password")}</label>
                <input
                  type="password"
                  placeholder={t("login.password")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Mensaje error */}
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

              {/* Botón login */}
              <button
                onClick={handleLogin}
                className="w-full mt-6 bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors"
              >
                {t("login.loginButton")}
              </button>
            </>
          ) : (
            <>
              {/* Captcha - solo se muestra después del login */}
              <div className="mt-6 flex justify-center">
                <div className="transform scale-125 origin-center">
                  <ReCAPTCHA
                    sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // clave de prueba
                    onChange={(value: string | null) => setCaptchaValue(value)}
                  />
                </div>
              </div>

              <p className="sr-only">
                {t("login.captcha.description")}
              </p>

              {/* Botón para continuar después del captcha */}
              {captchaValue && (
                <button
                  onClick={handleCaptchaComplete}
                  className="w-full mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  {t("login.continueButton")}
                </button>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
