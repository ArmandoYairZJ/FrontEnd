"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/sidebar"

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user === null) {
      console.log("[v0] Redirigiendo al login - user:", user, "loading:", loading)
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
