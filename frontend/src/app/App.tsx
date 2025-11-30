import { auth0 } from "@/lib/auth0";
import LoggedOutHome from "../modules/home/homeLoggout/LoggedOutHome";
import Main from "@/modules/home/homeLogin/Main";
export default async function App() {
  const session = await auth0.getSession();
  const user = session?.user;
  
  console.log("=== DATOS DE LOGIN (App.tsx) ===");
  console.log("Session completa:", session);
  console.log("Usuario:", user);
  console.log("================================");
  
  return (
        <div>
          {user ? (
            <Main />
          ) : (
            <LoggedOutHome />
          )}
        </div>
  );
}
