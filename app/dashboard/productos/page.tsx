"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useAuth } from "@/lib/auth-context"
import { useProducts } from "@/hooks/use-products"
import { Plus, Edit, Trash2, Search } from "lucide-react"

export default function ProductosPage() {
  const { user } = useAuth()
  const {
    filteredProducts,
    loading,
    error,
    searchTerm,
    createDialogOpen,
    createFormData,
    creating,
    editingProduct,
    editFormData,
    updateDescription,
    saving,
    deletingProduct,
    deleteDescription,
    deleting,
    setSearchTerm,
    setCreateDialogOpen,
    setCreateFormData,
    setEditingProduct,
    setEditFormData,
    setUpdateDescription,
    setDeletingProduct,
    setDeleteDescription,
    setError,
    handleCreate,
    handleEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleDelete,
    handleCancelCreate,
  } = useProducts()

  const isGuest = user?.role === "guest"

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Cargando productos...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Productos</h2>
          <p className="text-sm md:text-base text-muted-foreground">Gestiona tu inventario de productos</p>
        </div>
        {!isGuest && (
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="w-full sm:w-auto"
          >
            <Plus size={18} className="mr-2" />
            Agregar Producto
          </Button>
        )}
      </div>

      {/* Buscador */}
      <Card className="p-4 md:p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por ID, nombre o marca..."
            className="pl-10"
          />
        </div>
      </Card>

      {error && (
        <Card className="p-4 md:p-6 bg-destructive/10 border-destructive mb-6">
          <p className="text-destructive">{error}</p>
        </Card>
      )}

      {filteredProducts.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            {searchTerm.trim() ? "No se encontraron productos que coincidan con la búsqueda" : "No hay productos disponibles"}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filteredProducts.map((product) => (
            <Card key={product.id} className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-semibold text-foreground">{product.nombre}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">Marca: {product.marca}</p>
                </div>
                <span className="text-xl md:text-2xl font-bold text-primary">
                  ${typeof product.precio === 'number' ? product.precio.toFixed(2) : Number(product.precio || 0).toFixed(2)}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <div className="bg-muted rounded-lg p-2 md:p-3 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Stock Disponible</p>
                  <p className="text-base md:text-lg font-semibold text-foreground">{product.stock}</p>
                </div>
                <div className="bg-muted rounded-lg p-2 md:p-3 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">ID Producto</p>
                  <p className="text-base md:text-lg font-semibold text-foreground font-mono">{product.id}</p>
                </div>
              </div>
              {!isGuest && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleEdit(product)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Edit size={16} className="mr-2" />
                    Editar
                  </Button>
                  <Button
                    onClick={() => setDeletingProduct(product)}
                    variant="destructive"
                    className="flex-1"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Eliminar
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para crear producto */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Producto</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Nombre del Producto</label>
              <Input
                type="text"
                value={createFormData.nombre}
                onChange={(e) => setCreateFormData({ ...createFormData, nombre: e.target.value })}
                placeholder="Ej: Laptop, Mouse, etc..."
                disabled={creating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Marca</label>
              <Input
                type="text"
                value={createFormData.marca}
                onChange={(e) => setCreateFormData({ ...createFormData, marca: e.target.value })}
                placeholder="Ej: Samsung, Apple, etc..."
                disabled={creating}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Precio ($)</label>
                <Input
                  type="number"
                  value={createFormData.precio}
                  onChange={(e) => setCreateFormData({ ...createFormData, precio: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  disabled={creating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Stock</label>
                <Input
                  type="number"
                  value={createFormData.stock}
                  onChange={(e) => setCreateFormData({ ...createFormData, stock: e.target.value })}
                  placeholder="0"
                  min="0"
                  disabled={creating}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelCreate}
              disabled={creating}
            >
              Cancelar
            </Button>
            <Button onClick={handleCreate} disabled={creating}>
              {creating ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar producto */}
      <Dialog open={!!editingProduct} onOpenChange={(open) => !open && setEditingProduct(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Producto</DialogTitle>
          </DialogHeader>
          {editFormData && (
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
                  <p className="text-xs text-destructive mt-1">Este campo es obligatorio</p>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={handleCancelEdit}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit} disabled={saving || !updateDescription.trim()}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog para eliminar producto */}
      <AlertDialog open={!!deletingProduct} onOpenChange={(open) => !open && setDeletingProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el producto "{deletingProduct?.nombre}"? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
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
                <p className="text-xs text-destructive mt-1">Este campo es obligatorio</p>
              )}
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting || !deleteDescription.trim()}
              className="bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20"
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
