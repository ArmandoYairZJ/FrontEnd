"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { apiClient, type User } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"

interface UserForm {
  email: string
  username: string
  password: string
  rol: "ADMIN" | "USER" | ""
}

export default function CrearUsuario() {
  const router = useRouter()
  const { user } = useAuth()
  const [formData, setFormData] = useState<UserForm>({
    email: "",
    username: "",
    password: "",
    rol: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)

  // Verificar que solo ADMIN pueda acceder
  useEffect(() => {
    const isAdmin = (user as any)?.backendRole === "ADMIN"
    if (!isAdmin) {
      router.push("/dashboard")
    }
  }, [user, router])

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoadingUsers(true)
      const response = await apiClient.getUsers()

      if (response.error) {
        console.error("Error al cargar usuarios:", response.error)
        // No mostrar error aquí, solo loguear
        return
      }

      if (response.data) {
        setUsers(response.data)
      }
    } catch (err) {
      console.error("Error al cargar usuarios:", err)
    } finally {
      setLoadingUsers(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    setError("")
    
    // Validar email en tiempo real
    if (name === "email" && value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        setEmailError("Por favor ingresa un email válido")
      } else {
        // Verificar si el email ya existe
        const emailExists = users.some(
          (u) => u.email?.toLowerCase() === value.toLowerCase()
        )
        if (emailExists) {
          setEmailError("Este correo electrónico ya está en uso")
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
    setIsLoading(true)
    setError("")
    setSuccessMessage("")

    try {
      // Validar que los campos no estén vacíos
      if (!formData.email || !formData.username || !formData.password || !formData.rol) {
        setError("Por favor completa todos los campos")
        setIsLoading(false)
        return
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError("Por favor ingresa un email válido")
        setIsLoading(false)
        return
      }

      // Verificar si el email ya existe (validación adicional antes de enviar)
      const emailExists = users.some(
        (u) => u.email?.toLowerCase() === formData.email.toLowerCase()
      )

      if (emailExists) {
        setError("Este correo electrónico ya está en uso. Por favor, usa otro email.")
        setEmailError("Este correo electrónico ya está en uso")
        setIsLoading(false)
        return
      }

      // Verificar si hay error de email
      if (emailError) {
        setError(emailError)
        setIsLoading(false)
        return
      }

      // Crear usuario en el backend
      const response = await apiClient.createUser({
        email: formData.email,
        username: formData.username,
        password: formData.password,
        rol: formData.rol as "ADMIN" | "USER",
      })

      if (response.error) {
        setError(response.error)
        setIsLoading(false)
        return
      }

      setSuccessMessage("Usuario creado exitosamente")
      setFormData({
        email: "",
        username: "",
        password: "",
        rol: "",
      })

      // Redirigir a consultar después de 2 segundos
      setTimeout(() => {
        router.push("/dashboard/usuarios/consultar")
      }, 2000)
    } catch (error) {
      console.error("Error al crear usuario:", error)
      setError("Error al crear el usuario")
    } finally {
      setIsLoading(false)
    }
  }

  const isAdmin = (user as any)?.backendRole === "ADMIN"
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
              value={formData.email}
              onChange={handleChange}
              placeholder="usuario@ejemplo.com"
              disabled={isLoading || loadingUsers}
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
              value={formData.username}
              onChange={handleChange}
              placeholder="Coloque Su Nombre de Usuario"
              disabled={isLoading}
              className="w-full text-xs md:text-base"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Contraseña</label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={isLoading}
              className="w-full text-xs md:text-base"
            />
          </div>

          {/* Rol */}
          <div>
            <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Rol</label>
            <Select
              value={formData.rol}
              onValueChange={handleRolChange}
              disabled={isLoading}
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
            <Button type="submit" disabled={isLoading || loadingUsers || !!emailError} className="flex-1 text-xs md:text-base">
              {isLoading ? "Creando..." : "Crear Usuario"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
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

