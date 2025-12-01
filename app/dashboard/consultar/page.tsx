"use client"

import { Card } from "@/components/ui/card"
import { useProducts } from "@/hooks/use-products"

export default function ConsultarProductos() {
  const {
    filteredProducts,
    loading,
    error,
  } = useProducts()

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Consultar Productos</h2>
          <p className="text-sm md:text-base text-muted-foreground">Visualiza el inventario de productos disponibles</p>
        </div>
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
      <div className="p-4 md:p-8">
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Consultar Productos</h2>
          <p className="text-sm md:text-base text-muted-foreground">Visualiza el inventario de productos disponibles</p>
        </div>
        <Card className="p-6 bg-destructive/10 border-destructive">
          <p className="text-destructive">Error: {error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Consultar Productos</h2>
        <p className="text-sm md:text-base text-muted-foreground">Visualiza el inventario de productos disponibles</p>
      </div>

      {filteredProducts.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No hay productos disponibles</p>
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
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="bg-muted rounded-lg p-2 md:p-3 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Stock Disponible</p>
                  <p className="text-base md:text-lg font-semibold text-foreground">{product.stock}</p>
                </div>
                <div className="bg-muted rounded-lg p-2 md:p-3 flex-1">
                  <p className="text-xs text-muted-foreground mb-1">ID Producto</p>
                  <p className="text-base md:text-lg font-semibold text-foreground font-mono">{product.id}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
