"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiClient, type Product } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"

export default function ActualizarProductos() {
  const { user } = useAuth()
  const router = useRouter()
  const [products, setProducts] = useState<Product[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Product | null>(null)
  const [updateDescriptions, setUpdateDescriptions] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Solo USER y ADMIN pueden actualizar (no invitados)
  const isGuest = user?.role === "guest"
  useEffect(() => {
    if (isGuest) {
      router.push("/dashboard/consultar")
    }
  }, [isGuest, router])

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

  if (isGuest) {
    return null
  }

  const startEdit = (product: Product) => {
    setEditingId(product.id)
    setEditData({ ...product })
  }

  const saveEdit = async () => {
    if (!editData || !editingId) return

    // Validar que la descripción sea obligatoria
    const description = updateDescriptions[editingId]?.trim() || ""
    
    if (!description) {
      setError("La descripción es obligatoria. Por favor, describe el motivo de la actualización.")
      alert("La descripción es obligatoria. Por favor, describe el motivo de la actualización.")
      return
    }

    try {
      setSaving(true)
      setError(null)
      
      // Excluir el id del objeto que se envía
      const { id, ...updateData } = editData
      
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
      
      console.log("Actualizando producto con:", { 
        product_id: editingId, 
        user_id: userId, 
        description: finalDescription 
      })
      
      const response = await apiClient.updateProduct(editingId, updateData, userId, finalDescription)
      
      if (response.error) {
        setError(response.error)
        alert(response.error)
        return
      }

      if (response.data) {
        // Actualizar la lista de productos
        setProducts(products.map((p) => (p.id === editingId ? response.data! : p)))
        setEditingId(null)
        setEditData(null)
        // Limpiar la descripción de este producto
        const newDescriptions = { ...updateDescriptions }
        delete newDescriptions[editingId]
        setUpdateDescriptions(newDescriptions)
        setError(null)
        
        // Redirigir a consultar después de actualizar exitosamente
        setTimeout(() => {
          router.push("/dashboard/consultar")
        }, 500) // Pequeño delay para que el usuario vea el éxito
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar producto"
      setError(errorMessage)
      alert(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditData(null)
    // Limpiar la descripción de este producto
    if (editingId) {
      const newDescriptions = { ...updateDescriptions }
      delete newDescriptions[editingId]
      setUpdateDescriptions(newDescriptions)
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
          <h2 className="text-3xl font-bold text-foreground mb-2">Actualizar Productos</h2>
          <p className="text-muted-foreground">Modifica la información de los productos</p>
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
        <h2 className="text-3xl font-bold text-foreground mb-2">Actualizar Productos</h2>
        <p className="text-muted-foreground">Modifica la información de los productos</p>
      </div>

      {products.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No hay productos disponibles</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {products.map((product, index) => (
            <Card key={product.id || `product-${index}`} className="p-6">
              {editingId === product.id && editData ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Nombre</label>
                    <input
                      type="text"
                      value={editData.nombre}
                      onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Marca</label>
                    <input
                      type="text"
                      value={editData.marca}
                      onChange={(e) => setEditData({ ...editData, marca: e.target.value })}
                      className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Precio</label>
                      <input
                        type="number"
                        value={editData.precio}
                        onChange={(e) => setEditData({ ...editData, precio: Number.parseFloat(e.target.value) })}
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Stock</label>
                      <input
                        type="number"
                        value={editData.stock}
                        onChange={(e) => setEditData({ ...editData, stock: Number.parseInt(e.target.value) })}
                        className="w-full px-4 py-2 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Motivo de actualización <span className="text-destructive">*</span>
                    </label>
                    <textarea
                      value={updateDescriptions[product.id] || ""}
                      onChange={(e) => {
                        setUpdateDescriptions({
                          ...updateDescriptions,
                          [product.id]: e.target.value
                        })
                        if (error && e.target.value.trim()) {
                          setError(null)
                        }
                      }}
                      placeholder="Describe por qué estás actualizando este producto... (Obligatorio)"
                      className={`w-full px-3 py-2 text-sm rounded-lg border bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 resize-none ${
                        !updateDescriptions[product.id]?.trim() && error 
                          ? "border-destructive focus:ring-destructive" 
                          : "border-input focus:ring-primary"
                      }`}
                      rows={3}
                      disabled={saving}
                      required
                    />
                    {!updateDescriptions[product.id]?.trim() && (
                      <p className="text-xs text-destructive mt-1">
                        Este campo es obligatorio
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={saveEdit} 
                      className="flex-1" 
                      disabled={saving || !updateDescriptions[product.id]?.trim()}
                    >
                      {saving ? "Guardando..." : "Guardar"}
                    </Button>
                    <Button onClick={cancelEdit} variant="outline" className="flex-1 bg-transparent" disabled={saving}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-foreground">{product.nombre}</h3>
                      <p className="text-sm text-muted-foreground mt-1">Marca: {product.marca}</p>
                    </div>
                    <span className="text-2xl font-bold text-primary">${typeof product.precio === 'number' ? product.precio.toFixed(2) : Number(product.precio || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex gap-4 mb-4">
                    <div className="bg-muted rounded-lg p-3 flex-1">
                      <p className="text-xs text-muted-foreground mb-1">Stock</p>
                      <p className="text-lg font-semibold text-foreground">{product.stock}</p>
                    </div>
                  </div>
                  <Button onClick={() => startEdit(product)} className="w-full">
                    Editar
                  </Button>
                </>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
