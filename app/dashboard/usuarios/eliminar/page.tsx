"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useUsers } from "@/hooks/use-users"
import { type User } from "@/lib/api-client"
import { Search } from "lucide-react"

export default function EliminarUsuario() {
  const router = useRouter()
  const {
    users,
    loading,
    error,
    deletingUser,
    deleting,
    isAdmin,
    setDeletingUser,
    setError,
    handleDelete,
    loadUsers,
  } = useUsers()

  const [searchEmail, setSearchEmail] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<User[]>([])
  const [successMessage, setSuccessMessage] = useState("")

  useEffect(() => {
    if (!isAdmin) {
      router.push("/dashboard")
    }
  }, [isAdmin, router])

  // Filtrar sugerencias mientras se escribe
  useEffect(() => {
    if (searchEmail.trim().length > 0) {
      const searchTerm = searchEmail.toLowerCase()
      const filtered = users.filter((user) =>
        user.email?.toLowerCase().includes(searchTerm) ||
        user.username?.toLowerCase().includes(searchTerm)
      )
      setFilteredSuggestions(filtered.slice(0, 5))
      setShowSuggestions(true)
    } else {
      setFilteredSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchEmail, users])

  const handleSelectSuggestion = (user: User) => {
    setSearchEmail(user.email || "")
    setSelectedUser(user)
    setDeletingUser(user)
    setShowSuggestions(false)
    setError("")
  }

  const handleSearchByEmail = async () => {
    if (!searchEmail.trim()) {
      setError("Por favor ingresa un email")
      return
    }

    try {
      setLoadingSearch(true)
      setError("")
      setSuccessMessage("")
      setSelectedUser(null)
      setShowSuggestions(false)

      const searchTerm = searchEmail.trim().toLowerCase()
      const foundUser = users.find((u) => 
        u.email?.toLowerCase() === searchTerm
      )

      if (foundUser) {
        setSelectedUser(foundUser)
        setDeletingUser(foundUser)
      } else {
        setError("No se encontró un usuario con ese email")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al buscar usuario")
      setSelectedUser(null)
    } finally {
      setLoadingSearch(false)
    }
  }

  const [wasDeleting, setWasDeleting] = useState(false)

  // Detectar éxito cuando se completa la eliminación
  useEffect(() => {
    if (wasDeleting && !deleting && !error && !deletingUser) {
      setSuccessMessage("Usuario eliminado exitosamente")
      setSearchEmail("")
      setSelectedUser(null)
      setWasDeleting(false)
      
      setTimeout(() => {
        router.push("/dashboard/usuarios/consultar")
      }, 2000)
    }
  }, [deleting, error, deletingUser, wasDeleting, router])

  const handleDeleteClick = async () => {
    if (!selectedUser || !deletingUser) {
      setError("Por favor selecciona un usuario")
      return
    }

    const confirmDelete = window.confirm(
      `¿Estás seguro de que deseas eliminar al usuario "${selectedUser.username}" (${selectedUser.email})? Esta acción no se puede deshacer.`
    )

    if (!confirmDelete) {
      return
    }

    setSuccessMessage("")
    setWasDeleting(true)
    await handleDelete()
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Eliminar Usuario</h2>
        <p className="text-sm md:text-base text-muted-foreground">Elimina un usuario del sistema</p>
      </div>

      {error && (
        <Card className="mb-6 p-3 md:p-4 bg-destructive/10 border-destructive">
          <p className="text-xs md:text-base text-destructive">{error}</p>
        </Card>
      )}

      {successMessage && (
        <Card className="mb-6 p-3 md:p-4 bg-green-50 border-green-200">
          <p className="text-xs md:text-base text-green-800">{successMessage}</p>
        </Card>
      )}

      {/* Búsqueda por email */}
      <Card className="p-4 md:p-6 mb-6">
        <div className="space-y-3">
          <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Buscar Usuario por Email</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Input
                type="email"
                value={searchEmail}
                onChange={(e) => {
                  setSearchEmail(e.target.value)
                  setError("")
                  setSelectedUser(null)
                }}
                onFocus={() => {
                  if (searchEmail.trim().length > 0 && filteredSuggestions.length > 0) {
                    setShowSuggestions(true)
                  }
                }}
                onBlur={() => {
                  setTimeout(() => setShowSuggestions(false), 200)
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSearchByEmail()
                  }
                }}
                placeholder="usuario@ejemplo.com"
                disabled={deleting || loading || loadingSearch}
                className="w-full text-xs md:text-base"
              />
              {/* Dropdown de sugerencias */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
                  {filteredSuggestions.map((user) => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(user)}
                      className="w-full text-left px-4 py-2 hover:bg-muted focus:bg-muted focus:outline-none transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">{user.email}</span>
                        <span className="text-xs text-muted-foreground">{user.username} - {user.rol || "USER"}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleSearchByEmail} 
                disabled={deleting || loading || loadingSearch || !searchEmail.trim()}
                className="w-full sm:w-auto"
              >
                {loadingSearch ? "Buscando..." : <><Search size={18} className="mr-2" /> Buscar</>}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Información del usuario seleccionado */}
      {selectedUser && (
        <Card className="p-4 md:p-6 mb-6">
          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4">Información del Usuario</h3>
          <div className="space-y-3">
            <div className="bg-muted rounded-lg p-3 md:p-4">
              <p className="text-xs text-muted-foreground mb-1">ID</p>
              <p className="text-base font-semibold text-foreground font-mono">{selectedUser.id}</p>
            </div>
            <div className="bg-muted rounded-lg p-3 md:p-4">
              <p className="text-xs text-muted-foreground mb-1">Email</p>
              <p className="text-base font-semibold text-foreground">{selectedUser.email}</p>
            </div>
            <div className="bg-muted rounded-lg p-3 md:p-4">
              <p className="text-xs text-muted-foreground mb-1">Username</p>
              <p className="text-base font-semibold text-foreground">{selectedUser.username}</p>
            </div>
            <div className="bg-muted rounded-lg p-3 md:p-4">
              <p className="text-xs text-muted-foreground mb-1">Rol</p>
              <p className="text-base font-semibold text-foreground">{selectedUser.rol || "USER"}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Botones */}
      {selectedUser && (
        <div className="flex flex-col sm:flex-row gap-2 md:gap-3">
          <Button
            onClick={handleDeleteClick}
            disabled={deleting || !selectedUser}
            variant="destructive"
            className="flex-1 text-xs md:text-base"
          >
            {deleting ? "Eliminando..." : "Eliminar Usuario"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={deleting}
            className="flex-1 text-xs md:text-base"
          >
            Cancelar
          </Button>
        </div>
      )}
    </div>
  )
}
