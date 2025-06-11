import { useEffect } from "react"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import AppHeader from "@/Components/Molecules/appHeader"
import NavMenu from "@/Components/Molecules/navMenu"
import { UserProvider, useUser } from "@/context/userContext"
import { NotificationProvider } from "@/context/notificationContext"

interface AppLayoutProps {
  children: ReactNode
}

function AppLayoutContent({ children }: AppLayoutProps) {
  const router = useRouter();
  const { authState, logout } = useUser();

  useEffect(() => {
    // Redirigir al login si no hay usuario autenticado
    if (!authState.loading && !authState.user) {
      router.push("/");
    }
  }, [authState.loading, authState.user, router]);

  // No renderizar nada si está cargando o no hay usuario
  if (authState.loading || !authState.user) return null;

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <NotificationProvider>
      <div className="min-h-screen bg-gray-100">
        <AppHeader user={authState.user} onLogout={handleLogout} />

        <main className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-1">
              <NavMenu userRole={authState.user.role} />
            </div>

            <div className="md:col-span-3">
              {children}
            </div>
          </div>
        </main>
      </div>
    </NotificationProvider>
  );
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <UserProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </UserProvider>
  );
}