const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

export interface LoginResponse {
  user?: {
    id: string
    email: string
    name?: string
    username?: string
    role?: "ADMIN" | "USER"
  }
  token?: string
  access_token?: string
  token_type?: string
  id?: string
  email?: string
  username?: string
  name?: string
  role?: "ADMIN" | "USER"
}

export interface Product {
  id: string
  nombre: string
  precio: number
  stock: number
  marca: string
}

export interface User {
  id: string
  email: string
  username: string
  rol?: "ADMIN" | "USER"
  password?: string
}

class ApiClient {
  private baseURL: string

  constructor() {
    this.baseURL = API_BASE_URL
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    if (!this.baseURL) {
      return { error: "API_BASE_URL no está configurada. Configura NEXT_PUBLIC_API_URL en tu archivo .env.local" }
    }

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("auth_token") : null

      const url = `${this.baseURL}${endpoint}`
      
      if (typeof fetch === "undefined") {
        return { error: "fetch no está disponible en este entorno" }
      }
      
      console.log(`[API] Making request to: ${url}`, {
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token?.substring(0, 20)}...` }),
        }
      })
      
      let response: Response
      try {
        response = await fetch(url, {
          ...options,
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options.headers,
          },
        })
      } catch (fetchError: any) {
        console.error("[API] Fetch error:", fetchError)
        const errorMsg = fetchError?.message || String(fetchError)
        throw new Error(`Error de red: ${errorMsg}. URL: ${url}. Verifica CORS y que el servidor esté disponible.`)
      }
      
      if (response.status === 401 && typeof window !== "undefined") {
        localStorage.removeItem("auth_token")
      }

      let data
      try {
        data = await response.json()
      } catch (e) {
        const text = await response.text()
        return {
          error: text || `Error ${response.status}: ${response.statusText}`,
        }
      }
      
      console.log(`[API] ${options.method || "GET"} ${endpoint}:`, {
        status: response.status,
        ok: response.ok,
        data: data
      })

      if (!response.ok) {
        let errorMessage = `Error ${response.status}`
        
        if (typeof data === 'string') {
          errorMessage = data
        } else if (data && typeof data === 'object') {
          if (Array.isArray(data)) {
            errorMessage = data.map((err: any) => {
              if (typeof err === 'string') return err
              if (err && typeof err === 'object') {
                return err.message || err.error || err.detail || JSON.stringify(err)
              }
              return String(err)
            }).join(', ')
          } 
          else if (Array.isArray(data.detail) || Array.isArray(data.error)) {
            const errorArray = data.detail || data.error || []
            errorMessage = errorArray.map((err: any) => {
              if (typeof err === 'string') return err
              if (err && typeof err === 'object') {
                return err.msg || err.message || JSON.stringify(err)
              }
              return String(err)
            }).join(', ')
          }
          else {
            errorMessage = data.message || data.error || data.detail || data.title || data.msg || `Error ${response.status}`
          }
        }
        
        return {
          error: errorMessage,
        }
      }

      
      return { data: data as T }
    } catch (error) {
      console.error("API Error:", error)
      let errorMessage = "Error de conexión"
      
      if (error instanceof Error) {
        if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError") || error.message.includes("Error de red")) {
          const isCorsError = error.message.includes("CORS") || error.message.includes("Access-Control")
          if (isCorsError) {
            errorMessage = `Error de CORS: El servidor no permite peticiones desde este origen. Verifica la configuración CORS del servidor.`
          } else {
            errorMessage = `Error de conexión: No se pudo conectar al servidor ${this.baseURL}. Verifica que:
- La URL sea correcta
- El servidor esté disponible
- No haya problemas de CORS
- El certificado SSL sea válido`
          }
        } else {
          errorMessage = error.message
        }
      }
      
      return {
        error: errorMessage,
      }
    }
  }

  async login(email: string, password: string): Promise<ApiResponse<TokenResponse>> {
    if (!this.baseURL) {
      return { error: "API_BASE_URL no está configurada. Configura NEXT_PUBLIC_API_URL en tu archivo .env.local" }
    }

    try {
     
      const formData = new URLSearchParams()
      formData.append("grant_type", "password")
      formData.append("username", email) 
      formData.append("password", password)

      const response = await fetch(`${this.baseURL}/auth/token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      })

      const data = await response.json()
      
      console.log(`[API] POST /auth/token:`, {
        status: response.status,
        ok: response.ok,
        data: data
      })

      if (!response.ok) {
        let errorMessage = data.message || data.error || data.detail || `Error ${response.status}`
        
        if (errorMessage.toLowerCase().includes("could not validate user") || 
            errorMessage.toLowerCase().includes("invalid credentials") ||
            errorMessage.toLowerCase().includes("incorrect password") ||
            errorMessage.toLowerCase().includes("user not found")) {
          errorMessage = "Usuario no validado. Verifica tu email y contraseña."
        }
        
        return {
          error: errorMessage,
        }
      }

      if (data.access_token && typeof window !== "undefined") {
        localStorage.setItem("auth_token", data.access_token)
        console.log("[API] Access token guardado en localStorage")
      }

      return { data: data as TokenResponse }
    } catch (error) {
      console.error("API Error:", error)
      return {
        error: error instanceof Error ? error.message : "Error de conexión",
      }
    }
  }

  async checkEmailExists(email: string): Promise<ApiResponse<{ exists: boolean }>> {
    if (!this.baseURL) {
      return { error: "API_BASE_URL no está configurada" }
    }

    try {
      const encodedEmail = encodeURIComponent(email)
      const url = `${this.baseURL}/auth/email/${encodedEmail}`
      
      console.log(`[API] Checking if email exists: ${url}`)
      
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      console.log(`[API] Email check response:`, {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      })

      if (!response.ok && response.status !== 404) {
        // Error del servidor (no 404)
        const errorText = await response.text().catch(() => "")
        console.error(`[API] Error checking email (${response.status}):`, errorText)
        return { error: `Error ${response.status}: ${response.statusText}` }
      }

      // Intentar parsear la respuesta como JSON
      let data: any
      try {
        const text = await response.text()
        data = text ? JSON.parse(text) : null
      } catch (parseError) {
        // Si no es JSON, puede ser un booleano directo o texto
        const text = await response.text()
        if (text === "true" || text === "false") {
          data = text === "true"
        } else {
          data = null
        }
      }

      console.log(`[API] Email check data:`, data)

      // El endpoint puede retornar:
      // - true/false directamente
      // - { exists: true/false }
      // - status 200 = existe, 404 = no existe
      let exists = false

      if (response.status === 200) {
        if (typeof data === "boolean") {
          exists = data
        } else if (data && typeof data === "object") {
          exists = data.exists === true || data === true
        } else {
          exists = true // Si hay respuesta 200, asumimos que existe
        }
      } else if (response.status === 404) {
        exists = false
      } else {
        // Otro caso, intentar interpretar la respuesta
        if (typeof data === "boolean") {
          exists = data
        } else if (data && typeof data === "object" && "exists" in data) {
          exists = data.exists === true
        }
      }

      console.log(`[API] Email exists: ${exists}`)
      return { data: { exists } }
    } catch (error) {
      console.error("Error checking email:", error)
      return {
        error: error instanceof Error ? error.message : "Error al verificar el email",
      }
    }
  }

  async register(email: string, username: string, password: string): Promise<ApiResponse<LoginResponse>> {
    const result = await this.request<LoginResponse>("/auth/", {
      method: "POST",
      body: JSON.stringify({ email, username, password }),
    })

    const token = result.data?.token || (result.data as any)?.access_token || (result.data as any)?.token
    if (token && typeof window !== "undefined") {
      localStorage.setItem("auth_token", token)
    }

    return result
  }

  async getCurrentUser(email?: string): Promise<ApiResponse<LoginResponse["user"]>> {

    const result = await this.request<any>("/domains/usuarios/users", {
      method: "GET",
    })
    
    if (result.error) {
      return result as ApiResponse<LoginResponse["user"]>
    }
    
    if (result.data) {
      let userData: any
      
      if (Array.isArray(result.data)) {
        if (email) {
          userData = result.data.find((user: any) => 
            user.email?.toLowerCase() === email.toLowerCase()
          )
        } else {
          userData = result.data[0]
        }
      } else {
        userData = result.data
        if (email && userData.email?.toLowerCase() !== email.toLowerCase()) {
          return {
            error: "El usuario obtenido no coincide con el email proporcionado"
          }
        }
      }
      
      if (!userData || !userData.id) {
        return {
          error: email 
            ? `No se encontró un usuario con el email ${email}`
            : "No se pudo obtener el ID del usuario de la respuesta"
        }
      }
      
      return {
        data: {
          id: String(userData.id),
          email: userData.email || "",
          username: userData.username || "",
          name: userData.name || userData.username || "",
          role: (userData.rol === "ADMIN" || userData.role === "ADMIN") ? "ADMIN" : "USER",
        }
      }
    }
    
    return {
      error: "No se recibieron datos del usuario"
    }
  }

  async logout(): Promise<ApiResponse<void>> {
    const result = await this.request<void>("/api/auth/logout", {
      method: "POST",
    })

    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token")
    }

    return result
  }

  // Productos
  async getProducts(): Promise<ApiResponse<Product[]>> {
    const result = await this.request<any[]>("/domains/productos/products", {
      method: "GET",
    })

    if (result.error) {
      return result as ApiResponse<Product[]>
    }

    if (result.data) {
      const mappedProducts: Product[] = result.data.map((item: any) => ({
        id: item.id?.toString() || item.Id?.toString() || "",
        nombre: item.nombre || item.Nombre || "",
        precio: typeof item.precio === "number" ? item.precio : typeof item.Precio === "number" ? item.Precio : parseFloat(item.precio || item.Precio || 0),
        stock: typeof item.stock === "number" ? item.stock : typeof item.Stock === "number" ? item.Stock : typeof item.stock?.Value === "number" ? item.stock.Value : parseInt(item.stock || item.Stock || 0),
        marca: item.marca || item.Marca || "",
      }))

      return { data: mappedProducts }
    }

    return result as ApiResponse<Product[]>
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    return this.request<Product>(`/domains/productos/products/${id}`, {
      method: "GET",
    })
  }

  async createProduct(product: Omit<Product, "id">): Promise<ApiResponse<Product>> {
    const productData = {
      nombre: product.nombre,
      precio: product.precio,
      marca: product.marca,
      stock: product.stock,
    }
    
    return this.request<Product>("/domains/productos/products", {
      method: "POST",
      body: JSON.stringify(productData),
    })
  }

  async updateProduct(id: string, product: Partial<Product>, userId?: string, description?: string): Promise<ApiResponse<Product>> {
    const { id: _, ...productWithoutId } = product as any
    const updateData: any = {}
    
    if (productWithoutId.nombre !== undefined) updateData.nombre = productWithoutId.nombre
    if (productWithoutId.precio !== undefined) updateData.precio = productWithoutId.precio
    if (productWithoutId.marca !== undefined) updateData.marca = productWithoutId.marca
    if (productWithoutId.stock !== undefined) updateData.stock = productWithoutId.stock
    
    const params = new URLSearchParams()
    const userIdValue = userId !== undefined ? userId : ""
    params.append("user_id", userIdValue)
    const descriptionValue = description !== undefined ? description : ""
    params.append("description", descriptionValue)
    
    const queryString = params.toString()
    const endpoint = `/domains/productos/products/${id}?${queryString}`
    
    console.log(`[API] PUT request:`, {
      endpoint: endpoint,
      fullUrl: `${this.baseURL}${endpoint}`,
      product_id: id,
      user_id: userIdValue || "(vacío)",
      description: descriptionValue || "(vacío)"
    })
    
    return this.request<Product>(endpoint, {
      method: "PUT",
      body: JSON.stringify(updateData),
    })
  }

  async deleteProduct(id: string, userId?: string, description?: string): Promise<ApiResponse<void>> {

    const params = new URLSearchParams()
    const userIdValue = userId !== undefined ? userId : ""
    params.append("user_id", userIdValue)
    const descriptionValue = description !== undefined ? description : ""
    params.append("description", descriptionValue)
    
    const queryString = params.toString()
    const endpoint = `/domains/productos/products/${id}?${queryString}`
    
    console.log(`[API] DELETE request:`, {
      endpoint: endpoint,
      fullUrl: `${this.baseURL}${endpoint}`,
      product_id: id,
      user_id: userIdValue || "(vacío)",
      description: descriptionValue || "(vacío)"
    })
    
    return this.request<void>(endpoint, {
      method: "DELETE",
    })
  }

  // Usuarios
  async createUser(user: { email: string; username: string; password: string; rol?: "ADMIN" | "USER" }): Promise<ApiResponse<User>> {
    const userData: any = {
      email: user.email,
      username: user.username,
      password: user.password,
    }
    
    if (user.rol) {
      userData.rol = user.rol
    }
    
    return this.request<User>("/auth/", {
      method: "POST",
      body: JSON.stringify(userData),
    })
  }

  async getUsers(): Promise<ApiResponse<User[]>> {
    return this.request<User[]>("/domains/usuarios/users", {
      method: "GET",
    })
  }

  async getUser(id: string): Promise<ApiResponse<User>> {
    return this.request<User>(`/domains/usuarios/users/${id}`, {
      method: "GET",
    })
  }

  async updateUser(id: string, user: Partial<{ username: string; email: string; rol: "ADMIN" | "USER"; password: string }>): Promise<ApiResponse<User>> {
    // El backend requiere todos los campos siempre, incluso si están vacíos
    const updateData: any = {
      username: user.username !== undefined ? user.username : "",
      email: user.email !== undefined ? user.email : "",
      rol: user.rol !== undefined ? user.rol : "USER",
      password: user.password !== undefined ? user.password : "",
    }
    
    const endpoint = `/domains/usuarios/users/${id}`
    
    console.log(`[API] PUT request (user):`, {
      endpoint: endpoint,
      fullUrl: `${this.baseURL}${endpoint}`,
      user_id: id,
      body: updateData
    })
    
    return this.request<User>(endpoint, {
      method: "PUT",
      body: JSON.stringify(updateData),
    })
  }

  async deleteUser(id: string, userId?: string, description?: string): Promise<ApiResponse<void>> {
    const params = new URLSearchParams()
    const userIdValue = userId !== undefined ? userId : ""
    params.append("user_id", userIdValue)
    const descriptionValue = description !== undefined ? description : ""
    params.append("description", descriptionValue)
    
    const queryString = params.toString()
    const endpoint = `/domains/usuarios/users/${id}?${queryString}`
    
    console.log(`[API] DELETE request (user):`, {
      endpoint: endpoint,
      fullUrl: `${this.baseURL}${endpoint}`,
      user_id: id,
      user_id_param: userIdValue || "(vacío)",
      description: descriptionValue || "(vacío)"
    })
    
    return this.request<void>(endpoint, {
      method: "DELETE",
    })
  }
}

export const apiClient = new ApiClient()

