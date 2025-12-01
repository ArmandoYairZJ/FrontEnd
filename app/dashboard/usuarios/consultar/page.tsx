"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUsers } from "@/hooks/use-users"
import { apiClient, type User } from "@/lib/api-client"
import { Search } from "lucide-react"

export default function ConsultarUsuarios() {
  const router = useRouter()
  const {
    users,
    filteredUsers,
    loading,
    error,
    isAdmin,
    loadUsers,
    setError,
  } = useUsers()
  
  const [searchValue, setSearchValue] = useState("")
  const [searchType, setSearchType] = useState<"id" | "username" | "email">("id")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [loadingSearch, setLoadingSearch] = useState(false)

  useEffect(() => {
    if (!isAdmin) {
      router.push("/dashboard")
    }
  }, [isAdmin, router])

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      setError(`Por favor ingresa un ${searchType === "id" ? "ID" : searchType === "username" ? "username" : "email"} de usuario`)
      return
    }

    try {
      setLoadingSearch(true)
      setError(null)
      setSelectedUser(null)

      if (searchType === "id") {
        // Búsqueda por ID usando el endpoint del API
        const response = await apiClient.getUser(searchValue.trim())

        if (response.error) {
          setError(response.error)
          return
        }

        if (response.data) {
          setSelectedUser(response.data)
        } else {
          setError("No se encontró un usuario con ese ID")
        }
      } else {
        // Búsqueda por username o email en la lista local
        const searchTerm = searchValue.trim().toLowerCase()
        let foundUser: User | undefined

        if (searchType === "username") {
          foundUser = users.find((u) => 
            u.username?.toLowerCase() === searchTerm
          )
        } else if (searchType === "email") {
          foundUser = users.find((u) => 
            u.email?.toLowerCase() === searchTerm
          )
        }

        if (foundUser) {
          setSelectedUser(foundUser)
        } else {
          setError(`No se encontró un usuario con ese ${searchType === "username" ? "username" : "email"}`)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al buscar usuario")
    } finally {
      setLoadingSearch(false)
    }
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Consultar Usuarios</h2>
        <p className="text-sm md:text-base text-muted-foreground">Gestiona y consulta los usuarios del sistema</p>
      </div>

      {/* Búsqueda por ID, Username o Email */}
      <Card className="p-4 md:p-6 mb-6">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Tipo de Búsqueda</label>
            <Select
              value={searchType}
              onValueChange={(value: "id" | "username" | "email") => {
                setSearchType(value)
                setSearchValue("")
                setError(null)
                setSelectedUser(null)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecciona el tipo de búsqueda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="id">Buscar por ID</SelectItem>
                <SelectItem value="username">Buscar por Username</SelectItem>
                <SelectItem value="email">Buscar por Email</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-2">
                {searchType === "id" ? "ID del Usuario" : searchType === "username" ? "Username" : "Email"}
              </label>
              <Input
                type={searchType === "email" ? "email" : "text"}
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value)
                  setError(null)
                  setSelectedUser(null)
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSearch()
                  }
                }}
                placeholder={
                  searchType === "id" 
                    ? "Ingresa el ID del usuario" 
                    : searchType === "username"
                    ? "Ingresa el username"
                    : "Ingresa el email del usuario"
                }
                className="w-full"
              />
            </div>
            <div className="flex items-end">
              <Button 
                onClick={handleSearch} 
                disabled={loadingSearch || !searchValue.trim()}
                className="w-full sm:w-auto"
              >
                {loadingSearch ? "Buscando..." : <><Search size={18} className="mr-2" /> Buscar</>}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {error && (
        <Card className="p-4 md:p-6 bg-destructive/10 border-destructive mb-6">
          <p className="text-destructive">{error}</p>
        </Card>
      )}

      {/* Usuario encontrado por ID */}
      {selectedUser && (
        <Card className="p-4 md:p-6 mb-6">
          <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-4">Usuario Encontrado</h3>
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

      {/* Lista de todos los usuarios */}
      <div className="mb-4">
        <h3 className="text-lg md:text-xl font-semibold text-foreground mb-4">Todos los Usuarios</h3>
        {loading ? (
          <Card className="p-4 md:p-6">
            <p className="text-muted-foreground">Cargando usuarios...</p>
          </Card>
        ) : filteredUsers.length === 0 ? (
          <Card className="p-4 md:p-6">
            <p className="text-muted-foreground">No hay usuarios disponibles</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="p-4 md:p-6">
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-muted-foreground">ID</p>
                    <p className="text-sm font-semibold text-foreground font-mono">{user.id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm font-semibold text-foreground">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Username</p>
                    <p className="text-sm font-semibold text-foreground">{user.username}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rol</p>
                    <p className="text-sm font-semibold text-foreground">{user.rol || "USER"}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
