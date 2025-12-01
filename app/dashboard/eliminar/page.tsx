"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useProducts } from "@/hooks/use-products"
import { useAuth } from "@/lib/auth-context"
import { type Product } from "@/lib/api-client"

export default function EliminarProductos() {
  const { user } = useAuth()
  const router = useRouter()
  const {
    products,
    loading,
    error,
    deleteDescription,
    deleting,
    setDeletingProduct,
    setDeleteDescription,
    setError,
    handleDelete,
    loadProducts,
  } = useProducts()

  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [wasDeleting, setWasDeleting] = useState(false)

  // Solo USER y ADMIN pueden eliminar (no invitados)
  const isGuest = user?.role === "guest"
  
  useEffect(() => {
    if (isGuest) {
      router.push("/dashboard/consultar")
    }
  }, [isGuest, router])

  // Detectar éxito cuando se completa la eliminación
  useEffect(() => {
    if (wasDeleting && !deleting && !error && !confirmDelete) {
      setWasDeleting(false)
      // Recargar productos después de eliminar
      loadProducts()
    }
  }, [deleting, error, confirmDelete, wasDeleting, loadProducts])

  const handleDeleteClick = async (id: string) => {
    const product = products.find(p => p.id === id)
    if (!product) return

    setDeletingProduct(product)
    setConfirmDelete(id)
  }

  const confirmDeleteAction = async () => {
    if (!confirmDelete) return

    setWasDeleting(true)
    await handleDelete()
    
    if (!error) {
      setConfirmDelete(null)
    } else {
      setWasDeleting(false)
    }
  }

  const cancelDelete = () => {
    setConfirmDelete(null)
    setDeletingProduct(null)
    setDeleteDescription("")
    setError(null)
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

  if (error && !confirmDelete) {
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
                      <p className="text-lg font-semibold text-foreground">
                        ${typeof product.precio === 'number' ? product.precio.toFixed(2) : Number(product.precio || 0).toFixed(2)}
                      </p>
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
                      <Textarea
                        value={deleteDescription}
                        onChange={(e) => {
                          setDeleteDescription(e.target.value)
                          if (error) setError(null)
                        }}
                        placeholder="Describe por qué estás eliminando este producto... (Obligatorio)"
                        rows={3}
                        disabled={deleting}
                        className={!deleteDescription.trim() && error ? "border-destructive" : ""}
                      />
                      {!deleteDescription.trim() && error && (
                        <p className="text-xs text-destructive mt-1">
                          Este campo es obligatorio
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3">
                      <Button 
                        onClick={confirmDeleteAction} 
                        variant="destructive" 
                        className="flex-1 text-destructive-foreground"
                        disabled={deleting || !deleteDescription.trim()}
                      >
                        {deleting ? "Eliminando..." : "Eliminar"}
                      </Button>
                      <Button 
                        onClick={cancelDelete} 
                        variant="outline" 
                        className="flex-1"
                        disabled={deleting}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={() => handleDeleteClick(product.id)} variant="destructive" className="w-full">
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
