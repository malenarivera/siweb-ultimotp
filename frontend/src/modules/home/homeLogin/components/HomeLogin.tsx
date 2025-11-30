import React, { useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";


interface Turno {
  id: number;
  hora: string;
  servicio: string;
}

const HomeLogin: React.FC = () => {
  const { user, isLoading: userCargando } = useUser();

  // Obtener y guardar el token cuando el usuario se loguea
  useEffect(() => {
    if (user && !userCargando) {
      // Verificar si ya tenemos el token en localStorage
      const storedToken = localStorage.getItem('authToken');
      
      if (!storedToken) {
        // Si no existe, obtenerlo del servidor
        fetch('/api/auth/token')
          .then(res => {
            if (!res.ok) {
              throw new Error('No se pudo obtener el token');
            }
            return res.json();
          })
          .then(data => {
            if (data.token) {
              // Guardar en localStorage
              localStorage.setItem('authToken', data.token);
              console.log("Token guardado en localStorage");
            }
          })
          .catch(error => {
            console.error("Error al obtener token:", error);
          });
      } else {
        console.log("Token ya existe en localStorage");
      }
    }
  }, [user, userCargando]);
  const turnos: Turno[] = [
    { id: 1, hora: "09:00", servicio: "Consulta general" },
    { id: 2, hora: "10:30", servicio: "Control odontológico" },
    { id: 3, hora: "12:00", servicio: "Chequeo anual" },
    { id: 4, hora: "15:00", servicio: "Vacunación" },
  ];

  const fecha = "Lunes 01/02";
  if (userCargando) {
    return (
    <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Cargando...</div>
    </div>
    );
  }else{
    console.log("=== DATOS DE USUARIO (HomeLogin.tsx) ===");
    console.log("Usuario completo:", user);
    console.log("Propiedades del usuario:", user ? Object.keys(user) : "No hay usuario");
    if (user) {
      console.log("ID (sub):", user.sub);
      console.log("Nombre:", user.name);
      console.log("Email:", user.email);
      console.log("Picture:", user.picture);
      console.log("Rol:", (user as any).rol || (user as any).role || (user as any)['https://clinic.com/roles'] || "No encontrado");
      console.log("Nickname:", (user as any).nickname);
      console.log("Updated at:", (user as any).updated_at);
      console.log("Email verified:", (user as any).email_verified);
      console.log("Todas las propiedades (JSON):", JSON.stringify(user, null, 2));
      console.log("Todas las propiedades (objeto):", user);
      // Mostrar cada propiedad individualmente
      console.log("--- Todas las propiedades individualmente ---");
      Object.keys(user).forEach(key => {
        console.log(`${key}:`, (user as any)[key]);
      });
    }
    console.log("========================================");
  }

  return (
    <div className="flex flex-col p-20 mt-10 space-y-10 font-sans">
      <h1 className="text-4xl font-semibold text-black">
        Bienvenido, {user?.name}
      </h1>

      <div className="w-2/3 mx-auto rounded-md overflow-hidden shadow-sm">
        {/* Etiqueta de fecha integrada */}
        <div className="bg-blue-200 text-black font-semibold px-4 py-2 text-lg w-36 border-b border-gray-600">
          {fecha}
        </div>

        {/* Dashboard de turnos */}
        {turnos.map((turno, index) => (
          <div
            key={turno.id}
            className={`py-3 px-4 border-b border-gray-600 ${
              index % 2 === 0 ? "bg-emerald-200" : "bg-emerald-300"
            }`}
          >
            <p className="text-gray-800">
              <span className="font-semibold">{turno.hora}</span> —{" "}
              {turno.servicio}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomeLogin;
