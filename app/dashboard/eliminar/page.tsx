"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiClient, type Product } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"

export default function EliminarProductos() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [deleteDescriptions, setDeleteDescriptions] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getProducts()
        
        if (response.error) {
          setError(response.error)
        } else if (response.data) {
          setProducts(response.data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar productos")
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  const handleDelete = async (id: string) => {
    // Validar que la descripción sea obligatoria
    const description = deleteDescriptions[id]?.trim() || ""
    
    if (!description) {
      setError("La descripción es obligatoria. Por favor, describe el motivo de la eliminación.")
      alert("La descripción es obligatoria. Por favor, describe el motivo de la eliminación.")
      return
    }

    try {
      setDeleting(id)
      setError(null)
      
      // Obtener user_id del usuario autenticado
      let userId = user?.id || ""
      
      // Si el userId es un email o está vacío, intentar obtener el ID real del backend
      if (!userId || userId.includes("@")) {
        try {
          const userResponse = await apiClient.getCurrentUser(user?.email)
          if (userResponse.data?.id) {
            userId = String(userResponse.data.id)
          }
        } catch (e) {
          console.warn("No se pudo obtener el ID del usuario:", e)
        }
      }
      
      const finalDescription = description
      
      console.log("Eliminando producto con:", { 
        product_id: id, 
        user_id: userId, 
        description: finalDescription 
      })
      
      const response = await apiClient.deleteProduct(id, userId, finalDescription)
      
      if (response.error) {
        setError(response.error)
        alert(response.error)
        return
      }

      setProducts(products.filter((p) => p.id !== id))
      setConfirmDelete(null)
      // Limpiar la descripción de este producto
      const newDescriptions = { ...deleteDescriptions }
      delete newDescriptions[id]
      setDeleteDescriptions(newDescriptions)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al eliminar producto"
      setError(errorMessage)
      alert(errorMessage)
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Cargando productos...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Eliminar Productos</h2>
          <p className="text-muted-foreground">Elimina productos del inventario</p>
        </div>
        <Card className="p-6 bg-destructive/10 border-destructive">
          <p className="text-destructive">Error: {error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">Eliminar Productos</h2>
        <p className="text-muted-foreground">Elimina productos del inventario</p>
      </div>

      <div className="grid gap-4">
        {products.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No hay productos para eliminar</p>
          </Card>
        ) : (
          products.map((product) => (
            <Card key={product.id} className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground">{product.nombre}</h3>
                  <p className="text-sm text-muted-foreground mt-1">Marca: {product.marca}</p>
                  <div className="flex gap-4 mt-4">
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Precio</p>
                      <p className="text-lg font-semibold text-foreground">${typeof product.precio === 'number' ? product.precio.toFixed(2) : Number(product.precio || 0).toFixed(2)}</p>
                    </div>
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">Stock</p>
                      <p className="text-lg font-semibold text-foreground">{product.stock}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                {confirmDelete === product.id ? (
                  <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
                    <p className="text-sm font-medium text-foreground mb-3">
                      ¿Estás seguro de que deseas eliminar este producto?
                    </p>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Motivo de eliminación <span className="text-destructive">*</span>
                      </label>
                      <textarea
                        value={deleteDescriptions[product.id] || ""}
                        onChange={(e) => {
                          setDeleteDescriptions({
                            ...deleteDescriptions,
                            [product.id]: e.target.value
                          })
                          // Limpiar error si el usuario empieza a escribir
                          if (error && e.target.value.trim()) {
                            setError(null)
                          }
                        }}
                        placeholder="Describe por qué estás eliminando este producto... (Obligatorio)"
                        className={`w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 resize-none ${
                          !deleteDescriptions[product.id]?.trim() && error 
                            ? "border-destructive focus:ring-destructive" 
                            : "border-input focus:ring-primary"
                        }`}
                        rows={3}
                        disabled={deleting === product.id}
                        required
                      />
                      {!deleteDescriptions[product.id]?.trim() && (
                        <p className="text-xs text-destructive mt-1">
                          Este campo es obligatorio
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        onClick={() => handleDelete(product.id)} 
                        variant="destructive" 
                        className="flex-1"
                        disabled={deleting === product.id || !deleteDescriptions[product.id]?.trim()}
                      >
                        {deleting === product.id ? "Eliminando..." : "Eliminar"}
                      </Button>
                      <Button 
                        onClick={() => {
                          setConfirmDelete(null)
                          // Limpiar la descripción de este producto
                          const newDescriptions = { ...deleteDescriptions }
                          delete newDescriptions[product.id]
                          setDeleteDescriptions(newDescriptions)
                        }} 
                        variant="outline" 
                        className="flex-1"
                        disabled={deleting === product.id}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={() => setConfirmDelete(product.id)} variant="destructive" className="w-full">
                    Eliminar Producto
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
