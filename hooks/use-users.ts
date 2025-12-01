import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiClient, type User } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"

interface CreateUserData {
  email: string
  username: string
  password: string
  rol: "" | "ADMIN" | "USER"
}

interface EditUserData {
  username: string
  email: string
  rol: "" | "ADMIN" | "USER"
  password: string
}

export function useUsers() {
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  
  // Estados para crear usuario
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createFormData, setCreateFormData] = useState<CreateUserData>({
    email: "",
    username: "",
    password: "",
    rol: "",
  })
  const [emailError, setEmailError] = useState("")
  const [creating, setCreating] = useState(false)
  
  // Estados para editar usuario
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [editFormData, setEditFormData] = useState<EditUserData>({
    username: "",
    email: "",
    rol: "",
    password: "",
  })
  const [editEmailError, setEditEmailError] = useState("")
  const [saving, setSaving] = useState(false)
  
  // Estados para eliminar usuario
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Verificar que solo ADMIN pueda acceder
  useEffect(() => {
    const isAdmin = (currentUser as any)?.backendRole === "ADMIN"
    if (!isAdmin) {
      router.push("/dashboard")
    }
  }, [currentUser, router])

  // Cargar usuarios
  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiClient.getUsers()

      if (response.error) {
        setError(response.error)
        return
      }

      if (response.data) {
        setUsers(response.data)
        setFilteredUsers(response.data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar usuarios")
    } finally {
      setLoading(false)
    }
  }

  // Filtrar usuarios en tiempo real
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users)
      return
    }

    const term = searchTerm.toLowerCase().trim()
    const filtered = users.filter((user) => {
      return (
        user.username?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term)
      )
    })

    setFilteredUsers(filtered)
  }, [searchTerm, users])

  // Cargar usuarios al montar
  useEffect(() => {
    loadUsers()
  }, [])

  // Crear usuario
  const handleCreate = async () => {
    if (!createFormData.email || !createFormData.username || !createFormData.password || !createFormData.rol) {
      setError("Por favor completa todos los campos")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(createFormData.email)) {
      setError("Por favor ingresa un email válido")
      return
    }

    const emailExists = users.some(
      (u) => u.email?.toLowerCase() === createFormData.email.toLowerCase()
    )
    if (emailExists) {
      setError("Este correo electrónico ya está en uso")
      return
    }

    if (emailError) {
      setError(emailError)
      return
    }

    try {
      setCreating(true)
      setError(null)
      
      const response = await apiClient.createUser({
        email: createFormData.email,
        username: createFormData.username,
        password: createFormData.password,
        rol: createFormData.rol as "ADMIN" | "USER",
      })

      if (response.error) {
        setError(response.error)
        return
      }

      setCreateDialogOpen(false)
      setCreateFormData({ email: "", username: "", password: "", rol: "" })
      setEmailError("")
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear usuario")
    } finally {
      setCreating(false)
    }
  }

  // Iniciar edición
  const handleEdit = (user: User) => {
    setEditingUser(user)
    setEditFormData({
      username: user.username || "",
      email: user.email || "",
      rol: (user.rol as "ADMIN" | "USER") || "",
      password: "",
    })
    setEditEmailError("")
    setError(null)
  }

  // Guardar edición
  const handleSaveEdit = async () => {
    if (!editingUser || !editFormData) return

    if (editEmailError) {
      setError(editEmailError)
      return
    }

    if (editFormData.email !== editingUser.email) {
      const emailExists = users.some(
        (u) => u.id !== editingUser.id && u.email?.toLowerCase() === editFormData.email.toLowerCase()
      )
      if (emailExists) {
        setError("Este correo electrónico ya está en uso por otro usuario")
        return
      }
    }

    try {
      setSaving(true)
      setError(null)
      
      const updateData: any = {
        username: editFormData.username || "",
        email: editFormData.email || "",
        rol: editFormData.rol || editingUser.rol || "USER",
        password: editFormData.password || "",
      }

      const response = await apiClient.updateUser(editingUser.id, updateData)

      if (response.error) {
        setError(response.error)
        return
      }

      setEditingUser(null)
      setEditFormData({ username: "", email: "", rol: "", password: "" })
      setEditEmailError("")
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al actualizar usuario")
    } finally {
      setSaving(false)
    }
  }

  // Cancelar edición
  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditFormData({ username: "", email: "", rol: "", password: "" })
    setEditEmailError("")
    setError(null)
  }

  // Eliminar usuario
  const handleDelete = async () => {
    if (!deletingUser) return

    try {
      setDeleting(true)
      setError(null)
      
      let userId = currentUser?.id || ""
      if (!userId || userId.includes("@")) {
        try {
          const userResponse = await apiClient.getCurrentUser(currentUser?.email)
          if (userResponse.data?.id) {
            userId = String(userResponse.data.id)
          }
        } catch (e) {
          console.warn("No se pudo obtener el ID del usuario:", e)
        }
      }

      const response = await apiClient.deleteUser(deletingUser.id, userId, "")

      if (response.error) {
        setError(response.error)
        return
      }

      setDeletingUser(null)
      await loadUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al eliminar usuario")
    } finally {
      setDeleting(false)
    }
  }

  // Validar email al crear
  const handleCreateEmailChange = (value: string) => {
    setCreateFormData({ ...createFormData, email: value })
    setError("")
    
    if (value.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        setEmailError("Por favor ingresa un email válido")
      } else {
        const emailExists = users.some(
          (u) => u.email?.toLowerCase() === value.toLowerCase()
        )
        if (emailExists) {
          setEmailError("Este correo electrónico ya está en uso")
        } else {
          setEmailError("")
        }
      }
    } else {
      setEmailError("")
    }
  }

  // Validar email al editar
  const handleEditEmailChange = (value: string) => {
    setEditFormData({ ...editFormData, email: value })
    setError("")
    
    if (value.trim() && editingUser) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(value)) {
        setEditEmailError("Por favor ingresa un email válido")
      } else {
        const emailExists = users.some(
          (u) => u.id !== editingUser.id && u.email?.toLowerCase() === value.toLowerCase()
        )
        if (emailExists) {
          setEditEmailError("Este correo electrónico ya está en uso por otro usuario")
        } else {
          setEditEmailError("")
        }
      }
    } else {
      setEditEmailError("")
    }
  }

  // Cancelar creación
  const handleCancelCreate = () => {
    setCreateDialogOpen(false)
    setCreateFormData({ email: "", username: "", password: "", rol: "" })
    setEmailError("")
    setError(null)
  }

  const isAdmin = (currentUser as any)?.backendRole === "ADMIN"

  return {
    // Estados
    users,
    filteredUsers,
    loading,
    error,
    searchTerm,
    createDialogOpen,
    createFormData,
    emailError,
    creating,
    editingUser,
    editFormData,
    editEmailError,
    saving,
    deletingUser,
    deleting,
    isAdmin,
    
    // Setters
    setSearchTerm,
    setCreateDialogOpen,
    setCreateFormData,
    setEditingUser,
    setEditFormData,
    setDeletingUser,
    setError,
    
    // Funciones
    loadUsers,
    handleCreate,
    handleEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleDelete,
    handleCreateEmailChange,
    handleEditEmailChange,
    handleCancelCreate,
  }
}

