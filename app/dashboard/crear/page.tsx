"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useProducts } from "@/hooks/use-products"
import { useAuth } from "@/lib/auth-context"

export default function CrearProductos() {
  const router = useRouter()
  const { user } = useAuth()
  const {
    createFormData,
    creating,
    error,
    setCreateFormData,
    setError,
    handleCreate,
    handleCancelCreate,
  } = useProducts()
  
  const [successMessage, setSuccessMessage] = useState("")
  const [wasCreating, setWasCreating] = useState(false)

  // Solo USER y ADMIN pueden crear (no invitados)
  const isGuest = user?.role === "guest"
  
  useEffect(() => {
    if (isGuest) {
      router.push("/dashboard/consultar")
    }
  }, [isGuest, router])

  // Detectar éxito cuando el formulario se limpia después de crear
  useEffect(() => {
    if (wasCreating && !creating && !error && !createFormData.nombre && !createFormData.marca) {
      setSuccessMessage("Producto creado exitosamente")
      setTimeout(() => {
        router.push("/dashboard/consultar")
      }, 2000)
      setWasCreating(false)
    }
  }, [creating, error, createFormData, wasCreating, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setCreateFormData({
      ...createFormData,
      [name]: value,
    })
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccessMessage("")
    setError(null)
    setWasCreating(true)
    await handleCreate()
  }

  if (isGuest) {
    return null
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Crear Nuevo Producto</h2>
        <p className="text-sm md:text-base text-muted-foreground">Agrega un nuevo producto al inventario</p>
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
          {/* Nombre del Producto */}
          <div>
            <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Nombre del Producto</label>
            <Input
              type="text"
              name="nombre"
              value={createFormData.nombre}
              onChange={handleChange}
              placeholder="Ej: Laptop, Mouse, etc..."
              disabled={creating}
              className="w-full text-xs md:text-base"
            />
          </div>

          {/* Marca */}
          <div>
            <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Marca</label>
            <Input
              type="text"
              name="marca"
              value={createFormData.marca}
              onChange={handleChange}
              placeholder="Ej: Samsung, Apple, etc..."
              disabled={creating}
              className="w-full text-xs md:text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Precio ($)</label>
              <Input
                type="number"
                name="precio"
                value={createFormData.precio}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                disabled={creating}
                className="w-full text-xs md:text-base"
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Stock</label>
              <Input
                type="number"
                name="stock"
                value={createFormData.stock}
                onChange={handleChange}
                placeholder="0"
                min="0"
                disabled={creating}
                className="w-full text-xs md:text-base"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-2 md:pt-4">
            <Button type="submit" disabled={creating} className="flex-1 text-xs md:text-base">
              {creating ? "Creando..." : "Crear Producto"}
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
