"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiClient, type Product } from "@/lib/api-client"

export default function ConsultarPorId() {
  const [productId, setProductId] = useState("")
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)


  const handleSearch = async () => {
    if (!productId.trim()) {
      setError("Por favor ingresa un ID de producto")
      return
    }

    try {
      setLoading(true)
      setError(null)
      setProduct(null)

      const response = await apiClient.getProduct(productId.trim())

      if (response.error) {
        setError(response.error)
        setProduct(null)
        return
      }

      if (response.data) {
        setProduct(response.data)
      } else {
        setError("No se encontró un producto con ese ID")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al buscar producto"
      setError(errorMessage)
      setProduct(null)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Consultar por ID</h2>
        <p className="text-sm md:text-base text-muted-foreground">Busca un producto específico por su ID</p>
      </div>

      <Card className="p-4 md:p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-foreground mb-2">ID del Producto</label>
            <input
              type="text"
              value={productId}
              onChange={(e) => {
                setProductId(e.target.value)
                setError(null)
                setProduct(null)
              }}
              onKeyPress={handleKeyPress}
              placeholder="Ingresa el ID del producto"
              className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-end">
            <Button 
              onClick={handleSearch} 
              disabled={loading || !productId.trim()}
              className="w-full sm:w-auto"
            >
              {loading ? "Buscando..." : "Buscar"}
            </Button>
          </div>
        </div>
      </Card>

      {error && (
        <Card className="p-4 md:p-6 bg-destructive/10 border-destructive mb-6">
          <p className="text-destructive">{error}</p>
        </Card>
      )}

      {product && (
        <Card className="p-4 md:p-6">
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-semibold text-foreground mb-2">{product.nombre}</h3>
                <p className="text-sm md:text-base text-muted-foreground">Marca: {product.marca}</p>
              </div>
              <div className="text-right">
                <p className="text-xl md:text-2xl font-bold text-primary">
                  ${typeof product.precio === 'number' ? product.precio.toFixed(2) : Number(product.precio || 0).toFixed(2)}
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted rounded-lg p-3 md:p-4">
                <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">Stock Disponible</p>
                <p className="text-lg md:text-xl font-semibold text-foreground">{product.stock}</p>
              </div>
              <div className="bg-muted rounded-lg p-3 md:p-4">
                <p className="text-xs md:text-sm text-muted-foreground mb-1 md:mb-2">ID Producto</p>
                <p className="text-lg md:text-xl font-semibold text-foreground font-mono">{product.id}</p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}

