"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"

interface ProductForm {
  nombre: string
  precio: string
  stock: string
  marca: string
}

export default function CrearProductos() {
  const router = useRouter()
  const { user } = useAuth()
  const [formData, setFormData] = useState<ProductForm>({
    nombre: "",
    precio: "",
    stock: "",
    marca: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validar que los campos no estén vacíos
      if (!formData.nombre || !formData.precio || !formData.stock || !formData.marca) {
        alert("Por favor completa todos los campos")
        setIsLoading(false)
        return
      }

      // Validar que precio y stock sean números
      if (isNaN(Number(formData.precio)) || isNaN(Number(formData.stock))) {
        alert("El precio y stock deben ser números")
        setIsLoading(false)
        return
      }

      // Crear producto en el backend
      const response = await apiClient.createProduct({
        nombre: formData.nombre,
        precio: Number(formData.precio),
        stock: Number(formData.stock),
        marca: formData.marca,
      })

      if (response.error) {
        alert(response.error)
        setIsLoading(false)
        return
      }

      setSuccessMessage("Producto creado exitosamente")
      setFormData({
        nombre: "",
        precio: "",
        stock: "",
        marca: "",
      })

      // Redirigir a consultar después de 2 segundos
      setTimeout(() => {
        router.push("/dashboard/consultar")
      }, 2000)
    } catch (error) {
      console.error("Error al crear producto:", error)
      alert("Error al crear el producto")
    } finally {
      setIsLoading(false)
    }
  }

  // Solo USER y ADMIN pueden crear (no invitados)
  const isGuest = user?.role === "guest"
  useEffect(() => {
    if (isGuest) {
      router.push("/dashboard/consultar")
    }
  }, [isGuest, router])

  if (isGuest) {
    return null
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl">
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Crear Nuevo Producto</h2>
        <p className="text-sm md:text-base text-muted-foreground">Agrega un nuevo producto al inventario</p>
      </div>

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
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Ej: Laptop, Mouse, etc..."
              disabled={isLoading}
              className="w-full text-xs md:text-base"
            />
          </div>

          {/* Marca */}
          <div>
            <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Marca</label>
            <Input
              type="text"
              name="marca"
              value={formData.marca}
              onChange={handleChange}
              placeholder="Ej: Samsung, Apple, etc..."
              disabled={isLoading}
              className="w-full text-xs md:text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Precio ($)</label>
              <Input
                type="number"
                name="precio"
                value={formData.precio}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
                min="0"
                disabled={isLoading}
                className="w-full text-xs md:text-base"
              />
            </div>
            <div>
              <label className="block text-xs md:text-sm font-medium text-foreground mb-2">Stock</label>
              <Input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="0"
                min="0"
                disabled={isLoading}
                className="w-full text-xs md:text-base"
              />
            </div>
          </div>

          {/* Botones */}
          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-2 md:pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1 text-xs md:text-base">
              {isLoading ? "Creando..." : "Crear Producto"}
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
