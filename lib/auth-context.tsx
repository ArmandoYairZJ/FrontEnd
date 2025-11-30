"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef } from "react"
import { apiClient } from "./api-client"

export type UserRole = "admin" | "guest" | null

interface User {
  id: string
  email?: string
  name?: string
  role: UserRole
  backendRole?: "ADMIN" | "USER" // Rol del backend para verificación
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, username: string, password: string) => Promise<void>
  guestLogin: () => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const loadedRef = useRef(false)

  useEffect(() => {
    if (loadedRef.current) return

    console.log("[v0] Provider inicializando - leyendo localStorage")
    const savedUser = localStorage.getItem("auth_user")
    console.log("[v0] Cargando usuario desde localStorage:", savedUser)
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser)
        console.log("[v0] Usuario cargado:", parsed)
        setUser(parsed)
      } catch (e) {
        console.error("[v0] Error al parsear usuario:", e)
        localStorage.removeItem("auth_user")
      }
    }
    setLoading(false)
    loadedRef.current = true
  }, [])

  const login = async (email: string, password: string) => {
    console.log("[v0] Login:", email)
    const result = await apiClient.login(email, password)
    
    console.log("[v0] Login response:", JSON.stringify(result, null, 2))
    
    if (result.error) {
      throw new Error(result.error)
    }
    
    if (result.data?.access_token) {
      // El access_token ya se guardó en localStorage por apiClient.login
      // Obtener el ID real del usuario desde el backend usando el email del login
      try {
        // Pasar el email para filtrar y obtener el usuario correcto
        const userResponse = await apiClient.getCurrentUser(email)
        if (userResponse.data?.id) {
          // El backend devuelve "ADMIN" o "USER", pero el frontend usa "admin" o "guest"
          // Guardamos el rol del backend pero también mantenemos compatibilidad
          const backendRole = userResponse.data.role
          const isAdmin = backendRole === "ADMIN" || backendRole === "admin"
          
          const newUser: User = {
            id: String(userResponse.data.id), // Usar el ID real del usuario correcto
            email: userResponse.data.email || email,
            name: userResponse.data.name || userResponse.data.username,
            role: isAdmin ? "admin" : "admin" as UserRole, // Para productos, ambos tienen "admin"
            backendRole: (backendRole === "ADMIN" ? "ADMIN" : "USER") as "ADMIN" | "USER", // Guardar el rol del backend para verificación
          }
          
          setUser(newUser)
          localStorage.setItem("auth_user", JSON.stringify(newUser))
          console.log("[v0] Usuario guardado en localStorage después de login:", newUser)
        } else {
          // Si no se puede obtener el usuario, usar el email como fallback
          console.warn("[v0] No se pudo obtener el ID del usuario:", userResponse.error)
          const newUser = {
            id: email,
            email,
            role: "admin" as UserRole,
          }
          setUser(newUser)
          localStorage.setItem("auth_user", JSON.stringify(newUser))
          console.log("[v0] Usuario guardado con email como ID (fallback):", newUser)
        }
      } catch (e) {
        console.warn("[v0] No se pudo obtener el usuario del backend, usando email como ID:", e)
        // Fallback: usar el email como ID
        const newUser = {
          id: email,
          email,
          role: "admin" as UserRole,
        }
        setUser(newUser)
        localStorage.setItem("auth_user", JSON.stringify(newUser))
      }
    } else {
      throw new Error("No se recibió access_token del servidor")
    }
  }

  const register = async (email: string, username: string, password: string) => {
    console.log("[v0] Register:", email, username)
    const result = await apiClient.register(email, username, password)
    
    console.log("[v0] Register response:", JSON.stringify(result, null, 2))
    
    if (result.error) {
      throw new Error(result.error)
    }
    
    if (result.data) {
      // Manejar diferentes estructuras de respuesta
      // Estructura 1: { user: { id, email, ... }, token }
      // Estructura 2: { id, email, username, ... } (directo)
      const userData = (result.data as any).user || result.data
      
      // Extraer el id de diferentes formas posibles
      const userId = userData?.id || userData?.Id || userData?.user_id || userData?.userId
      
      if (!userId) {
        console.error("[v0] Respuesta del API no tiene id:", result.data)
        throw new Error("La respuesta del servidor no contiene un ID de usuario")
      }
      
      const newUser = {
        id: String(userId), // Asegurar que sea string
        email: userData.email || email,
        name: userData.name || userData.username || username,
        role: (userData.role === "ADMIN" || userData.role === "admin") ? "admin" : "admin" as UserRole,
      }
      
      setUser(newUser)
      localStorage.setItem("auth_user", JSON.stringify(newUser))
      console.log("[v0] Usuario guardado en localStorage después de registro:", newUser)
    } else {
      throw new Error("No se recibieron datos del servidor")
    }
  }

  const guestLogin = async () => {
    console.log("[v0] Guest login")
    const newUser = {
      id: `guest-${Date.now()}`,
      role: "guest" as UserRole,
    }
    setUser(newUser)
    localStorage.setItem("auth_user", JSON.stringify(newUser))
    console.log("[v0] Usuario guest guardado en localStorage")
  }

  const logout = () => {
    console.log("[v0] Logout")
    setUser(null)
    localStorage.removeItem("auth_user")
    localStorage.removeItem("auth_token") // Limpiar también el access_token
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, guestLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider")
  }
  return context
}
