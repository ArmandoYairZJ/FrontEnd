"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient, type User } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { Search } from "lucide-react"

export default function ActualizarUsuario() {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [searchEmail, setSearchEmail] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [loadingSearch, setLoadingSearch] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState<User[]>([])
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    rol: "" as "ADMIN" | "USER" | "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [error, setError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // Verificar que solo ADMIN pueda acceder
  useEffect(() => {
    const isAdmin = currentUser?.role === "admin" || 
                    currentUser?.role === "ADMIN" || 
                    (currentUser as any)?.role === "ADMIN" ||
                    (currentUser as any)?.backendRole === "ADMIN"
    if (!isAdmin) {
      router.push("/dashboard")
    }
  }, [currentUser, router])

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await apiClient.getUsers()

      if (response.error) {
        setError(response.error)
        return
      }

      if (response.data) {
        setUsers(response.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar usuarios")
    } finally {
      setLoadingUsers(false)
    }
  }

  // Filtrar sugerencias mientras se escribe
  useEffect(() => {
    if (searchEmail.trim().length > 0) {
      const searchTerm = searchEmail.toLowerCase()
      const filtered = users.filter((user) =>
        user.email?.toLowerCase().includes(searchTerm) ||
        user.username?.toLowerCase().includes(searchTerm)
      )
      setFilteredSuggestions(filtered.slice(0, 5)) // Máximo 5 sugerencias
      setShowSuggestions(true)
    } else {
      setFilteredSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchEmail, users])

  const handleSelectSuggestion = (user: User) => {
    setSearchEmail(user.email || "")
    setSelectedUser(user)
    setFormData({
      username: user.username || "",
      email: user.email || "",
      rol: (user.rol as "ADMIN" | "USER") || "",
      password: "",
    })
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

      // Buscar por email en la lista de usuarios
      const searchTerm = searchEmail.trim().toLowerCase()
      const foundUser = users.find((u) => 
        u.email?.toLowerCase() === searchTerm
      )

      if (foundUser) {
        setSelectedUser(foundUser)
        setFormData({
          username: foundUser.username || "",
          email: foundUser.email || "",
          rol: (foundUser.rol as "ADMIN" | "USER") || "",
          password: "",
        })
        setEmailError("")
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError("")
    
    // Validar email en tiempo real solo si hay un usuario seleccionado
    if (name === "email" && value.trim() && selectedUser) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        setEmailError("Por favor ingresa un email válido")
      } else {
        // Verificar si el email ya existe en otro usuario
        const emailExists = users.some(
          (u) => u.id !== selectedUser.id && u.email?.toLowerCase() === value.toLowerCase()
        )
        if (emailExists) {
          setEmailError("Este correo electrónico ya está en uso por otro usuario")
        } else {
          setEmailError("")
        }
      }
    } else if (name === "email") {
      setEmailError("")
    }
  }

  const handleRolChange = (value: "ADMIN" | "USER") => {
    setFormData((prev) => ({
      ...prev,
      rol: value,
    }))
    setError("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!selectedUser) {
      setError("Por favor selecciona un usuario")
      return
    }

    setLoading(true)
    setError("")
    setSuccessMessage("")

    try {
      // Verificar si hay error de email
      if (emailError) {
        setError(emailError)
        setLoading(false)
        return
      }

      // Verificar si el email cambió y si ya existe en otro usuario (validación adicional)
      if (formData.email !== selectedUser.email) {
        const emailExists = users.some(
          (u) => u.id !== selectedUser.id && u.email?.toLowerCase() === formData.email.toLowerCase()
        )

        if (emailExists) {
          setError("Este correo electrónico ya está en uso por otro usuario. Por favor, usa otro email.")
          setEmailError("Este correo electrónico ya está en uso por otro usuario")
          setLoading(false)
          return
        }
      }

      // El backend requiere todos los campos, incluso si están vacíos
      const updateData: any = {
        username: formData.username || "",
        email: formData.email || "",
        rol: formData.rol || selectedUser.rol || "USER",
        password: formData.password || "", // Si no se quiere cambiar, enviar vacío
      }

      const response = await apiClient.updateUser(selectedUser.id, updateData)

      if (response.error) {
        setError(response.error)
        return
      }

      setSuccessMessage("Usuario actualizado exitosamente")
      
      // Recargar usuarios y resetear formulario
      await loadUsers()
      setSearchEmail("")
      setSelectedUser(null)
      setFormData({
        username: "",
        email: "",
        rol: "",
        password: "",
      })

      setTimeout(() => {
        router.push("/dashboard/usuarios/consultar")
      }, 2000)
    } catch (err) {
      console.error("Error al actualizar usuario:", err)
      setError("Error al actualizar el usuario")
    } finally {
      setLoading(false)
    }
  }

  const isAdmin = currentUser?.role === "admin" || 
                  currentUser?.role === "ADMIN" || 
                  (currentUser as any)?.role === "ADMIN" ||
                  (currentUser as any)?.backendRole === "ADMIN"
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
                  // Delay para permitir click en sugerencias
                  setTimeout(() => setShowSuggestions(false), 200)
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSearchByEmail()
                  }
                }}
                placeholder="usuario@ejemplo.com"
                disabled={loading || loadingUsers || loadingSearch}
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
                disabled={loading || loadingUsers || loadingSearch || !searchEmail.trim()}
                className="w-full sm:w-auto"
              >
                {loadingSearch ? "Buscando..." : <><Search size={18} className="mr-2" /> Buscar</>}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Formulario de actualización */}
      {selectedUser && (
        <Card className="p-4 md:p-6">
          <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
            <div>
              <label className="block text-xs md:text-sm font-medium text-foreground mb-2">ID del Usuario</label>
              <Input
                type="text"
                value={selectedUser.id}
                disabled
                className="w-full text-xs md:text-base bg-muted"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Nombre de Usuario</label>
              <Input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="nombre_usuario"
                disabled={loading}
                className="w-full text-xs md:text-base"
              />
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="usuario@ejemplo.com"
                disabled={loading}
                className={`w-full text-xs md:text-base ${emailError ? "border-destructive" : ""}`}
              />
              {emailError && (
                <p className="text-xs text-destructive mt-1">{emailError}</p>
              )}
            </div>

            <div>
              <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Rol</label>
              <Select
                value={formData.rol}
                onValueChange={handleRolChange}
                disabled={loading}
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
                value={formData.password}
                onChange={handleChange}
                placeholder="Deja vacío para no cambiar"
                disabled={loading}
                className="w-full text-xs md:text-base"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-2 md:pt-4">
              <Button type="submit" disabled={loading || !!emailError} className="flex-1 text-xs md:text-base">
                {loading ? "Actualizando..." : "Actualizar Usuario"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
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

