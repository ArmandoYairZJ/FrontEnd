"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { Package, Edit, Trash2, Plus, Search, Users } from "lucide-react"

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
        {/* Consultar - Visible para todos */}
        <Link href="/dashboard/consultar" className="flex-1 md:flex-none">
          <Button
            variant="outline"
            className="w-full h-full justify-center md:justify-start bg-transparent gap-1 md:gap-3 px-2 md:px-4 text-xs md:text-base whitespace-nowrap md:whitespace-normal"
          >
            <Package size={18} className="md:w-5 md:h-5" />
            <span className="hidden sm:inline">Consultar</span>
          </Button>
        </Link>
        
        {/* Consultar por ID - Visible para todos */}
        <Link href="/dashboard/consultar-por-id" className="flex-1 md:flex-none">
          <Button
            variant="outline"
            className="w-full h-full justify-center md:justify-start bg-transparent gap-1 md:gap-3 px-2 md:px-4 text-xs md:text-base whitespace-nowrap md:whitespace-normal"
          >
            <Search size={18} className="md:w-5 md:h-5" />
            <span className="hidden sm:inline">Consultar por ID</span>
          </Button>
        </Link>

        {/* Crear, Actualizar, Eliminar - Solo para USER y ADMIN (no invitados) */}
        {!isGuest && (
          <>
            <Link href="/dashboard/crear" className="flex-1 md:flex-none">
              <Button
                variant="outline"
                className="w-full h-full justify-center md:justify-start bg-transparent gap-1 md:gap-3 px-2 md:px-4 text-xs md:text-base whitespace-nowrap md:whitespace-normal"
              >
                <Plus size={18} className="md:w-5 md:h-5" />
                <span className="hidden sm:inline">Crear</span>
              </Button>
            </Link>
            <Link href="/dashboard/actualizar" className="flex-1 md:flex-none">
              <Button
                variant="outline"
                className="w-full h-full justify-center md:justify-start bg-transparent gap-1 md:gap-3 px-2 md:px-4 text-xs md:text-base whitespace-nowrap md:whitespace-normal"
              >
                <Edit size={18} className="md:w-5 md:h-5" />
                <span className="hidden sm:inline">Actualizar</span>
              </Button>
            </Link>
            <Link href="/dashboard/eliminar" className="flex-1 md:flex-none">
              <Button
                variant="outline"
                className="w-full h-full justify-center md:justify-start bg-transparent gap-1 md:gap-3 px-2 md:px-4 text-xs md:text-base whitespace-nowrap md:whitespace-normal"
              >
                <Trash2 size={18} className="md:w-5 md:h-5" />
                <span className="hidden sm:inline">Eliminar</span>
              </Button>
            </Link>
          </>
        )}
        
        {/* Sección de Usuarios - Solo para ADMIN */}
        {isAdmin && (
          <>
            <div className="hidden md:block border-t border-border my-2"></div>
            <div className="px-3 md:px-4 py-2">
              <h2 className="text-xs md:text-sm font-semibold text-muted-foreground uppercase tracking-wide">Usuarios</h2>
            </div>
            <Link href="/dashboard/usuarios/consultar" className="flex-1 md:flex-none">
              <Button
                variant="outline"
                className="w-full h-full justify-center md:justify-start bg-transparent gap-1 md:gap-3 px-2 md:px-4 text-xs md:text-base whitespace-nowrap md:whitespace-normal"
              >
                <Users size={18} className="md:w-5 md:h-5" />
                <span className="hidden sm:inline">Consultar Usuarios</span>
              </Button>
            </Link>
            <Link href="/dashboard/usuarios/crear" className="flex-1 md:flex-none">
              <Button
                variant="outline"
                className="w-full h-full justify-center md:justify-start bg-transparent gap-1 md:gap-3 px-2 md:px-4 text-xs md:text-base whitespace-nowrap md:whitespace-normal"
              >
                <Plus size={18} className="md:w-5 md:h-5" />
                <span className="hidden sm:inline">Crear Usuario</span>
              </Button>
            </Link>
            <Link href="/dashboard/usuarios/actualizar" className="flex-1 md:flex-none">
              <Button
                variant="outline"
                className="w-full h-full justify-center md:justify-start bg-transparent gap-1 md:gap-3 px-2 md:px-4 text-xs md:text-base whitespace-nowrap md:whitespace-normal"
              >
                <Edit size={18} className="md:w-5 md:h-5" />
                <span className="hidden sm:inline">Actualizar Usuario</span>
              </Button>
            </Link>
            <Link href="/dashboard/usuarios/eliminar" className="flex-1 md:flex-none">
              <Button
                variant="outline"
                className="w-full h-full justify-center md:justify-start bg-transparent gap-1 md:gap-3 px-2 md:px-4 text-xs md:text-base whitespace-nowrap md:whitespace-normal"
              >
                <Trash2 size={18} className="md:w-5 md:h-5" />
                <span className="hidden sm:inline">Eliminar Usuario</span>
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
