import { useState, useEffect } from "react"
import { apiClient, type Product } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"

interface CreateProductData {
  nombre: string
  precio: string
  stock: string
  marca: string
}

export function useProducts() {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Estados para crear producto
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createFormData, setCreateFormData] = useState<CreateProductData>({
    nombre: "",
    precio: "",
    stock: "",
    marca: "",
  })
  const [creating, setCreating] = useState(false)
  
  // Estados para editar producto
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [editFormData, setEditFormData] = useState<Product | null>(null)
  const [updateDescription, setUpdateDescription] = useState("")
  const [saving, setSaving] = useState(false)
  
  // Estados para eliminar producto
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [deleteDescription, setDeleteDescription] = useState("")
  const [deleting, setDeleting] = useState(false)

  // Cargar productos
  const loadProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getProducts()
      
      if (response.error) {
        setError(response.error)
      } else if (response.data) {
        setProducts(response.data)
        setFilteredProducts(response.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar productos")
    } finally {
      setLoading(false)
    }
  }

  // Filtrar productos en tiempo real
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProducts(products)
      return
    }

    const term = searchTerm.toLowerCase().trim()
    const filtered = products.filter((product) => {
      return (
        product.id.toLowerCase().includes(term) ||
        product.nombre.toLowerCase().includes(term) ||
        product.marca.toLowerCase().includes(term)
      )
    })

    setFilteredProducts(filtered)
  }, [searchTerm, products])

  // Cargar productos al montar
  useEffect(() => {
    loadProducts()
  }, [])

  // Crear producto
  const handleCreate = async () => {
    if (!createFormData.nombre || !createFormData.precio || !createFormData.stock || !createFormData.marca) {
      setError("Por favor completa todos los campos")
      return
    }

    if (isNaN(Number(createFormData.precio)) || isNaN(Number(createFormData.stock))) {
      setError("El precio y stock deben ser números")
      return
    }

    try {
      setCreating(true)
      setError(null)
      
      const response = await apiClient.createProduct({
        nombre: createFormData.nombre,
        precio: Number(createFormData.precio),
        stock: Number(createFormData.stock),
        marca: createFormData.marca,
      })

      if (response.error) {
        setError(response.error)
        return
      }

      setCreateDialogOpen(false)
      setCreateFormData({ nombre: "", precio: "", stock: "", marca: "" })
      await loadProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear producto")
    } finally {
      setCreating(false)
    }
  }

  // Iniciar edición
  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setEditFormData({ ...product })
    setUpdateDescription("")
    setError(null)
  }

  // Guardar edición
  const handleSaveEdit = async () => {
    if (!editFormData || !editingProduct) return

    if (!updateDescription.trim()) {
      setError("La descripción es obligatoria. Por favor, describe el motivo de la actualización.")
      return
    }

    try {
      setSaving(true)
      setError(null)
      
      const { id, ...updateData } = editFormData
      
      let userId = user?.id || ""
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
      
      const response = await apiClient.updateProduct(
        editingProduct.id,
        updateData,
        userId,
        updateDescription
      )
      
      if (response.error) {
        setError(response.error)
        return
      }

      setEditingProduct(null)
      setEditFormData(null)
      setUpdateDescription("")
      await loadProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar producto")
    } finally {
      setSaving(false)
    }
  }

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingProduct(null)
    setEditFormData(null)
    setUpdateDescription("")
    setError(null)
  }

  // Eliminar producto
  const handleDelete = async () => {
    if (!deletingProduct) return

    if (!deleteDescription.trim()) {
      setError("La descripción es obligatoria. Por favor, describe el motivo de la eliminación.")
      return
    }

    try {
      setDeleting(true)
      setError(null)
      
      let userId = user?.id || ""
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
      
      const response = await apiClient.deleteProduct(
        deletingProduct.id,
        userId,
        deleteDescription
      )
      
      if (response.error) {
        setError(response.error)
        return
      }

      setDeletingProduct(null)
      setDeleteDescription("")
      await loadProducts()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar producto")
    } finally {
      setDeleting(false)
    }
  }

  // Cancelar creación
  const handleCancelCreate = () => {
    setCreateDialogOpen(false)
    setCreateFormData({ nombre: "", precio: "", stock: "", marca: "" })
    setError(null)
  }

  // Buscar producto por ID
  const searchProductById = async (id: string): Promise<Product | null> => {
    try {
      setError(null)
      const response = await apiClient.getProduct(id.trim())
      
      if (response.error) {
        setError(response.error)
        return null
      }
      
      return response.data || null
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al buscar producto")
      return null
    }
  }

  return {
    // Estados
    products,
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
    
    // Setters
    setSearchTerm,
    setCreateDialogOpen,
    setCreateFormData,
    setEditingProduct,
    setEditFormData,
    setUpdateDescription,
    setDeletingProduct,
    setDeleteDescription,
    setError,
    
    // Funciones
    loadProducts,
    handleCreate,
    handleEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleDelete,
    handleCancelCreate,
    searchProductById,
  }
}

