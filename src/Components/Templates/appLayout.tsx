import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"
import AppHeader from "@/Components/Molecules/appHeader"
import NavMenu from "@/Components/Molecules/navMenu"
import { UserProvider } from "@/context/userContext"

type User = {
  name: string
  document: string
  email: string
  role: string
}

interface AppLayoutProps {
  children: ReactNode
}

export default function AppLayout({children}: AppLayoutProps) {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        const userData = localStorage.getItem("user")
        if (userData) {
        setUser(JSON.parse(userData))
        } else {
        router.push("/login")
        }
    }, [router])

    const handleLogout = () => {
        localStorage.removeItem("user")
        router.push("/login")
    }

    if (!user) return null

    return (

    <UserProvider>
    <div className="min-h-screen bg-gray-100">
      <AppHeader user={user} onLogout={handleLogout} />

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <NavMenu userRole={user.role} />
          </div>

          <div className="md:col-span-3">
            {children}
          </div>
        </div>
      </main>
    </div>

    </UserProvider>
  )
}
