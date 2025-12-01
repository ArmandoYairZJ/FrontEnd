"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { Package, Users } from "lucide-react"

export function Sidebar() {
  const router = useRouter()
  const { user, logout } = useAuth()
  
  // Verificar roles
  const isGuest = user?.role === "guest"
  const backendRole = (user as any)?.backendRole
  const isAdmin = backendRole === "ADMIN"
  
  // Invitados solo pueden consultar
  // USER puede hacer todo con productos (crear, actualizar, eliminar, consultar, consultar por ID)
  // ADMIN puede hacer todo con productos + usuarios

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  return (
    <aside className="w-full md:w-64 bg-background border-b md:border-b-0 md:border-r border-border md:h-screen md:flex md:flex-col">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-border">
        <h1 className="text-xl md:text-2xl font-bold text-foreground">Productos</h1>
        <p className="text-xs md:text-sm text-muted-foreground mt-1">
          {user?.role === "guest" ? "Modo Invitado" : user?.name || user?.email || "Usuario"}
        </p>
      </div>

      {/* Navigation - Made responsive with flex wrap on mobile and vertical on desktop */}
      <nav className="flex-1 px-3 md:px-4 py-3 md:py-6 flex md:flex-col gap-2 md:gap-4 overflow-x-auto md:overflow-visible">
        {/* Productos - Visible para todos */}
        <Link href="/dashboard/productos" className="flex-1 md:flex-none">
          <Button
            variant="outline"
            className="w-full h-full justify-center md:justify-start bg-transparent gap-1 md:gap-3 px-2 md:px-4 text-xs md:text-base whitespace-nowrap md:whitespace-normal"
          >
            <Package size={18} className="md:w-5 md:h-5" />
            <span className="hidden sm:inline">Productos</span>
          </Button>
        </Link>
        
        {/* Sección de Usuarios - Solo para ADMIN */}
        {isAdmin && (
          <>
            <div className="hidden md:block border-t border-border my-2"></div>
            <div className="px-3 md:px-4 py-2">
              <h2 className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wide">Usuarios</h2>
            </div>
            <Link href="/dashboard/usuarios" className="flex-1 md:flex-none">
              <Button
                variant="outline"
                className="w-full h-full justify-center md:justify-start bg-transparent gap-1 md:gap-3 px-2 md:px-4 text-xs md:text-base whitespace-nowrap md:whitespace-normal"
              >
                <Users size={18} className="md:w-5 md:h-5" />
                <span className="hidden sm:inline">Usuarios</span>
              </Button>
            </Link>
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 md:p-6 border-t border-border">
        <Button className="w-full text-xs md:text-base" onClick={handleLogout}>
          Cerrar Sesión
        </Button>
      </div>
    </aside>
  )
}
