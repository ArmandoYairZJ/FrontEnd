"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUsers } from "@/hooks/use-users"
import { type User } from "@/lib/api-client"
import { Search } from "lucide-react"

export default function ActualizarUsuario() {
  const router = useRouter()
  const {
    users,
    loading,
    error,
    editFormData,
    editEmailError,
    saving,
    editingUser,
    isAdmin,
    setEditFormData,
    setEditingUser,
    setError,
    handleSaveEdit,
    handleEditEmailChange,
    handleCancelEdit,
    loadUsers,
  } = useUsers()

  const [searchEmail, setSearchEmail] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<User[]>([])
  const [successMessage, setSuccessMessage] = useState("")
  const [wasSaving, setWasSaving] = useState(false)

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
    handleEdit(user)
    setSelectedUser(user)
    setShowSuggestions(false)
    setError(null)
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
        handleEdit(foundUser)
        setSelectedUser(foundUser)
        setEditEmailError("")
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

  // Detectar éxito cuando se completa la edición
  useEffect(() => {
    if (wasSaving && !saving && !error && !editingUser) {
      setSuccessMessage("Usuario actualizado exitosamente")
      setSearchEmail("")
      setSelectedUser(null)
      setWasSaving(false)
      
      setTimeout(() => {
        router.push("/dashboard/usuarios/consultar")
      }, 2000)
    }
  }, [saving, error, editingUser, wasSaving, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingUser) {
      setError("Por favor selecciona un usuario")
      return
    }

    setSuccessMessage("")
    setWasSaving(true)
    await handleSaveEdit()
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Actualizar Usuario</h2>
        <p className="text-sm md:text-base text-muted-foreground">Modifica la información de un usuario existente</p>
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
                disabled={saving || loading || loadingSearch}
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
                disabled={saving || loading || loadingSearch || !searchEmail.trim()}
                className="w-full sm:w-auto"
              >
                {loadingSearch ? "Buscando..." : <><Search size={18} className="mr-2" /> Buscar</>}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Formulario de actualización */}
      {editingUser && editFormData && (
        <Card className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div>
              <label className="block text-xs md:text-sm font-medium text-foreground mb-2">ID del Usuario</label>
              <Input
                type="text"
                value={editingUser.id}
                disabled
                className="w-full text-xs md:text-base bg-muted"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Nombre de Usuario</label>
              <Input
                type="text"
                name="username"
                value={editFormData.username}
                onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                placeholder="nombre_usuario"
                disabled={saving}
                className="w-full text-xs md:text-base"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Email</label>
              <Input
                type="email"
                name="email"
                value={editFormData.email}
                onChange={(e) => handleEditEmailChange(e.target.value)}
                placeholder="usuario@ejemplo.com"
                disabled={saving}
                className={`w-full text-xs md:text-base ${editEmailError ? "border-destructive" : ""}`}
              />
              {editEmailError && (
                <p className="text-xs text-destructive mt-1">{editEmailError}</p>
              )}
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Rol</label>
              <Select
                value={editFormData.rol}
                onValueChange={(value: "ADMIN" | "USER") => setEditFormData({ ...editFormData, rol: value })}
                disabled={saving}
              >
                <SelectTrigger className="w-full text-xs md:text-base">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="USER">USER</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-foreground mb-2">
                Nueva Contraseña (opcional)
              </label>
              <Input
                type="password"
                name="password"
                value={editFormData.password}
                onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                placeholder="Deja vacío para no cambiar"
                disabled={saving}
                className="w-full text-xs md:text-base"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-2 md:pt-4">
              <Button type="submit" disabled={saving || !!editEmailError} className="flex-1 text-xs md:text-base">
                {saving ? "Actualizando..." : "Actualizar Usuario"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
                className="flex-1 text-xs md:text-base"
              >
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  )
}
