"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useUsers } from "@/hooks/use-users"
import { useEffect, useState } from "react"

export default function CrearUsuario() {
  const router = useRouter()
  const {
    users,
    loading,
    error,
    createFormData,
    emailError,
    creating,
    setCreateFormData,
    setError,
    handleCreate,
    handleCreateEmailChange,
    handleCancelCreate,
    loadUsers,
    isAdmin,
  } = useUsers()
  const [successMessage, setSuccessMessage] = useState("")
  const [wasCreating, setWasCreating] = useState(false)

  useEffect(() => {
    if (!isAdmin) {
      router.push("/dashboard")
    }
  }, [isAdmin, router])

  // Detectar éxito cuando el formulario se limpia después de crear
  useEffect(() => {
    if (wasCreating && !creating && !error && !createFormData.email && !createFormData.username) {
      setSuccessMessage("Usuario creado exitosamente")
      setTimeout(() => {
        router.push("/dashboard/usuarios/consultar")
      }, 2000)
      setWasCreating(false)
    }
  }, [creating, error, createFormData, wasCreating, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage("")
    setError(null)
    setWasCreating(true)
    await handleCreate()
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Crear Nuevo Usuario</h2>
        <p className="text-sm md:text-base text-muted-foreground">Agrega un nuevo usuario al sistema</p>
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

      <Card className="p-4 md:p-6">
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
          {/* Email */}
          <div>
            <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Email</label>
            <Input
              type="email"
              name="email"
              value={createFormData.email}
              onChange={(e) => handleCreateEmailChange(e.target.value)}
              placeholder="usuario@ejemplo.com"
              disabled={creating || loading}
              className={`w-full text-xs md:text-base ${emailError ? "border-destructive" : ""}`}
            />
            {emailError && (
              <p className="text-xs text-destructive mt-1">{emailError}</p>
            )}
          </div>

          {/* Username */}
          <div>
            <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Nombre de Usuario</label>
            <Input
              type="text"
              name="username"
              value={createFormData.username}
              onChange={(e) => setCreateFormData({ ...createFormData, username: e.target.value })}
              placeholder="Coloque Su Nombre de Usuario"
              disabled={creating}
              className="w-full text-xs md:text-base"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Contraseña</label>
            <Input
              type="password"
              name="password"
              value={createFormData.password}
              onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
              placeholder="••••••••"
              disabled={creating}
              className="w-full text-xs md:text-base"
            />
          </div>

          {/* Rol */}
          <div>
            <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Rol</label>
            <Select
              value={createFormData.rol}
              onValueChange={(value: "ADMIN" | "USER") => setCreateFormData({ ...createFormData, rol: value })}
              disabled={creating}
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

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-2 md:pt-4">
            <Button type="submit" disabled={creating || loading || !!emailError} className="flex-1 text-xs md:text-base">
              {creating ? "Creando..." : "Crear Usuario"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={creating}
              className="flex-1 text-xs md:text-base"
            >
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
