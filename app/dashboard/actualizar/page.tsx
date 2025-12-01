"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useProducts } from "@/hooks/use-products"
import { useAuth } from "@/lib/auth-context"
import { type Product } from "@/lib/api-client"

export default function ActualizarProductos() {
  const { user } = useAuth()
  const router = useRouter()
  const {
    products,
    loading,
    error,
    editingProduct,
    editFormData,
    updateDescription,
    saving,
    setEditFormData,
    setUpdateDescription,
    setError,
    handleEdit,
    handleSaveEdit,
    handleCancelEdit,
    loadProducts,
  } = useProducts()

  const [editingId, setEditingId] = useState<string | null>(null)
  const [wasSaving, setWasSaving] = useState(false)

  // Solo USER y ADMIN pueden actualizar (no invitados)
  const isGuest = user?.role === "guest"
  
  useEffect(() => {
    if (isGuest) {
      router.push("/dashboard/consultar")
    }
  }, [isGuest, router])

  // Detectar éxito cuando se completa la edición
  useEffect(() => {
    if (wasSaving && !saving && !error && !editingProduct) {
      setEditingId(null)
      setWasSaving(false)
      setTimeout(() => {
        router.push("/dashboard/consultar")
      }, 500)
    }
  }, [saving, error, editingProduct, wasSaving, router])

  const startEdit = (product: Product) => {
    setEditingId(product.id)
    handleEdit(product)
  }

  const saveEdit = async () => {
    if (!editFormData || !editingId) return

    setWasSaving(true)
    await handleSaveEdit()
    
    if (!error) {
      setEditingId(null)
    } else {
      setWasSaving(false)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    handleCancelEdit()
  }

  if (isGuest) {
    return null
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

  if (error && !editingId) {
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
              {editingId === product.id && editFormData ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Nombre</label>
                    <Input
                      type="text"
                      value={editFormData.nombre}
                      onChange={(e) => setEditFormData({ ...editFormData, nombre: e.target.value })}
                      disabled={saving}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Marca</label>
                    <Input
                      type="text"
                      value={editFormData.marca}
                      onChange={(e) => setEditFormData({ ...editFormData, marca: e.target.value })}
                      disabled={saving}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Precio</label>
                      <Input
                        type="number"
                        value={editFormData.precio}
                        onChange={(e) => setEditFormData({ ...editFormData, precio: Number.parseFloat(e.target.value) })}
                        disabled={saving}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">Stock</label>
                      <Input
                        type="number"
                        value={editFormData.stock}
                        onChange={(e) => setEditFormData({ ...editFormData, stock: Number.parseInt(e.target.value) })}
                        disabled={saving}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Motivo de actualización <span className="text-destructive">*</span>
                    </label>
                    <Textarea
                      value={updateDescription}
                      onChange={(e) => {
                        setUpdateDescription(e.target.value)
                        if (error) setError(null)
                      }}
                      placeholder="Describe por qué estás actualizando este producto... (Obligatorio)"
                      rows={3}
                      disabled={saving}
                      className={!updateDescription.trim() && error ? "border-destructive" : ""}
                    />
                    {!updateDescription.trim() && error && (
                      <p className="text-xs text-destructive mt-1">
                        Este campo es obligatorio
                      </p>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      onClick={saveEdit} 
                      className="flex-1" 
                      disabled={saving || !updateDescription.trim()}
                    >
                      {saving ? "Guardando..." : "Guardar"}
                    </Button>
                    <Button onClick={cancelEdit} variant="outline" className="flex-1" disabled={saving}>
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
                    <span className="text-2xl font-bold text-primary">
                      ${typeof product.precio === 'number' ? product.precio.toFixed(2) : Number(product.precio || 0).toFixed(2)}
                    </span>
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
