"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-client"

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register" | "guest">("login")
  const router = useRouter()
  const { login, register, guestLogin } = useAuth()

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-3 md:p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <div className="p-5 md:p-8">
          {/* Header */}
          <div className="mb-6 md:mb-8 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Bienvenido</h1>
            <p className="text-xs md:text-base text-muted-foreground">Accede a tu cuenta o crea una nueva</p>
          </div>

          <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6 md:mb-8">
            <Button
              variant={activeTab === "login" ? "default" : "outline"}
              onClick={() => setActiveTab("login")}
              className="w-full text-xs md:text-sm"
            >
              Entrar
            </Button>
            <Button
              variant={activeTab === "register" ? "default" : "outline"}
              onClick={() => setActiveTab("register")}
              className="w-full text-xs md:text-sm"
            >
              Registrar
            </Button>
            <Button
              variant={activeTab === "guest" ? "default" : "outline"}
              onClick={() => setActiveTab("guest")}
              className="w-full text-xs md:text-sm"
            >
              Invitado
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-4 md:space-y-6">
            {activeTab === "login" && <LoginForm />}
            {activeTab === "register" && <RegisterForm />}
            {activeTab === "guest" && <GuestAccess />}
          </div>
        </div>
      </Card>
    </main>
  )
}

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      await login(email, password)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="space-y-3 md:space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-destructive/10 text-destructive text-xs md:text-sm p-2 md:p-3 rounded-lg border border-destructive/20">
          {error}
        </div>
      )}
      <div>
        <label className="block text-xs md:text-sm font-medium text-foreground mb-1 md:mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
          className="w-full px-3 md:px-4 py-2 text-xs md:text-base rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-xs md:text-sm font-medium text-foreground mb-1 md:mb-2">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="w-full px-3 md:px-4 py-2 text-xs md:text-base rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <Button className="w-full text-xs md:text-base" size="lg" disabled={isLoading}>
        {isLoading ? "Cargando..." : "Iniciar Sesión"}
      </Button>
      
    </form>
  )
}

function RegisterForm() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const { register } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [emailError, setEmailError] = useState("")
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)

  // Validar email en tiempo real
  useEffect(() => {
    const checkEmail = async () => {
      if (!email.trim()) {
        setEmailError("")
        return
      }

      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        setEmailError("Por favor ingresa un email válido")
        return
      }

      // Debounce: esperar 500ms después de que el usuario deje de escribir
      const timeoutId = setTimeout(async () => {
        setIsCheckingEmail(true)
        setEmailError("")
        
        try {
          const response = await apiClient.checkEmailExists(email)
          
          // Solo mostramos error si confirmamos que el email existe
          if (response.data?.exists === true) {
            setEmailError("Este correo electrónico ya está en uso")
          } else {
            // Si hay error o no existe, no mostramos error
            // Permitimos que el usuario intente registrar
            // El backend validará al final
            setEmailError("")
          }
        } catch (err) {
          console.error("Error al verificar email:", err)
          // Si hay error, no bloqueamos - el backend validará
          setEmailError("")
        } finally {
          setIsCheckingEmail(false)
        }
      }, 500)

      return () => clearTimeout(timeoutId)
    }

    checkEmail()
  }, [email])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setEmailError("")
    
    // Validar campos básicos
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setError("Por favor ingresa un email válido")
      return
    }

    setIsLoading(true)
    try {
      // VALIDACIÓN OBLIGATORIA: Verificar si el email existe antes de enviar
      console.log("[Register] Validando email antes de registrar...")
      const emailCheck = await apiClient.checkEmailExists(email)
      
      if (emailCheck.error) {
        // Si hay error al verificar, permitimos continuar (el backend validará)
        console.warn("[Register] Error al verificar email, continuando:", emailCheck.error)
      } else if (emailCheck.data?.exists === true) {
        // El email existe, bloquear el registro
        const errorMsg = "Este correo electrónico ya está en uso"
        setError(errorMsg)
        setEmailError(errorMsg)
        setIsLoading(false)
        return
      } else if (emailCheck.data?.exists === false) {
        // El email no existe, continuar con el registro
        console.log("[Register] Email disponible, procediendo con el registro...")
      } else {
        // Respuesta inesperada, permitir continuar (el backend validará)
        console.warn("[Register] Respuesta inesperada del endpoint de validación, continuando...")
      }

      // Si llegamos aquí, el email no existe o no pudimos verificar
      // Proceder con el registro
      await register(email, username, password)
      router.push("/dashboard")
    } catch (err) {
      // Si el error es por email duplicado, mostrarlo claramente
      const errorMessage = err instanceof Error ? err.message : "Error al registrar usuario"
      if (errorMessage.toLowerCase().includes("email") || 
          errorMessage.toLowerCase().includes("correo") ||
          errorMessage.toLowerCase().includes("ya existe") ||
          errorMessage.toLowerCase().includes("already exists")) {
        setError("Este correo electrónico ya está en uso")
        setEmailError("Este correo electrónico ya está en uso")
      } else {
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="space-y-3 md:space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-destructive/10 text-destructive text-xs md:text-sm p-2 md:p-3 rounded-lg border border-destructive/20">
          {error}
        </div>
      )}
      <div>
        <label className="block text-xs md:text-sm font-medium text-foreground mb-1 md:mb-2">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
          className="w-full px-3 md:px-4 py-2 text-xs md:text-base rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-xs md:text-sm font-medium text-foreground mb-1 md:mb-2">Nombre de Usuario</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Pon tu nombre de usuario"
          required
          className="w-full px-3 md:px-4 py-2 text-xs md:text-base rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-xs md:text-sm font-medium text-foreground mb-1 md:mb-2">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="w-full px-3 md:px-4 py-2 text-xs md:text-base rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <div>
        <label className="block text-xs md:text-sm font-medium text-foreground mb-1 md:mb-2">
          Confirmar Contraseña
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="w-full px-3 md:px-4 py-2 text-xs md:text-base rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      <Button className="w-full text-xs md:text-base" size="lg" disabled={isLoading || password !== confirmPassword || !!emailError || isCheckingEmail}>
        {isLoading ? "Cargando..." : "Crear Cuenta"}
      </Button>
    </form>
  )
}

function GuestAccess() {
  const { guestLogin } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleGuestLogin = async () => {
    setIsLoading(true)
    await guestLogin()
    router.push("/dashboard")
  }

  return (
    <div className="space-y-3 md:space-y-4">
      <div className="bg-muted/50 rounded-lg p-3 md:p-4 border border-border">
        <p className="text-xs md:text-sm text-foreground mb-3 md:mb-4">
          Accede como invitado para explorar sin crear una cuenta. Tendrás acceso limitado a algunas funciones.
        </p>
        <Button className="w-full text-xs md:text-base" size="lg" onClick={handleGuestLogin} disabled={isLoading}>
          {isLoading ? "Cargando..." : "Continuar como Invitado"}
        </Button>
      </div>
      
    </div>
  )
}
