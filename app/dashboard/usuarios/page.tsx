"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { useUsers } from "@/hooks/use-users"
import { Plus, Edit, Trash2, Search } from "lucide-react"

export default function UsuariosPage() {
  const {
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
    setSearchTerm,
    setCreateDialogOpen,
    setCreateFormData,
    setEditingUser,
    setEditFormData,
    setDeletingUser,
    setError,
    handleCreate,
    handleEdit,
    handleSaveEdit,
    handleCancelEdit,
    handleDelete,
    handleCreateEmailChange,
    handleEditEmailChange,
    handleCancelCreate,
  } = useUsers()

  if (!isAdmin) {
    return null
  }

  if (loading) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Cargando usuarios...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-1 md:mb-2">Usuarios</h2>
          <p className="text-sm md:text-base text-muted-foreground">Gestiona los usuarios del sistema</p>
        </div>
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="w-full sm:w-auto"
        >
          <Plus size={18} className="mr-2" />
          Agregar Usuario
        </Button>
      </div>

      {/* Buscador */}
      <Card className="p-4 md:p-6 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por username o email..."
            className="pl-10"
          />
        </div>
      </Card>

      {error && (
        <Card className="p-4 md:p-6 bg-destructive/10 border-destructive mb-6">
          <p className="text-destructive">{error}</p>
        </Card>
      )}

      {filteredUsers.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            {searchTerm.trim() ? "No se encontraron usuarios que coincidan con la búsqueda" : "No hay usuarios disponibles"}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="p-4 md:p-6">
              <div className="space-y-2 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">ID</p>
                  <p className="text-sm font-semibold text-foreground font-mono">{user.id}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-semibold text-foreground">{user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Username</p>
                  <p className="text-sm font-semibold text-foreground">{user.username}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Rol</p>
                  <p className="text-sm font-semibold text-foreground">{user.rol || "USER"}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleEdit(user)}
                  variant="outline"
                  className="flex-1"
                >
                  <Edit size={16} className="mr-2" />
                  Editar
                </Button>
                <Button
                  onClick={() => setDeletingUser(user)}
                  variant="destructive"
                  className="flex-1"
                >
                  <Trash2 size={16} className="mr-2" />
                  Eliminar
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog para crear usuario */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Email</label>
              <Input
                type="email"
                value={createFormData.email}
                onChange={(e) => handleCreateEmailChange(e.target.value)}
                placeholder="usuario@ejemplo.com"
                disabled={creating}
                className={emailError ? "border-destructive" : ""}
              />
              {emailError && (
                <p className="text-xs text-destructive mt-1">{emailError}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Nombre de Usuario</label>
              <Input
                type="text"
                value={createFormData.username}
                onChange={(e) => setCreateFormData({ ...createFormData, username: e.target.value })}
                placeholder="Coloque Su Nombre de Usuario"
                disabled={creating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Contraseña</label>
              <Input
                type="password"
                value={createFormData.password}
                onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                placeholder="••••••••"
                disabled={creating}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Rol</label>
              <Select
                value={createFormData.rol}
                onValueChange={(value: "ADMIN" | "USER") => setCreateFormData({ ...createFormData, rol: value })}
                disabled={creating}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="USER">USER</SelectItem>
                </SelectContent>
              </Select>
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
            <Button onClick={handleCreate} disabled={creating || !!emailError}>
              {creating ? "Creando..." : "Crear"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar usuario */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
          </DialogHeader>
          {editingUser && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">ID del Usuario</label>
                <Input
                  type="text"
                  value={editingUser.id}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Nombre de Usuario</label>
                <Input
                  type="text"
                  value={editFormData.username}
                  onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                  placeholder="nombre_usuario"
                  disabled={saving}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Email</label>
                <Input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => handleEditEmailChange(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  disabled={saving}
                  className={editEmailError ? "border-destructive" : ""}
                />
                {editEmailError && (
                  <p className="text-xs text-destructive mt-1">{editEmailError}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Rol</label>
                <Select
                  value={editFormData.rol}
                  onValueChange={(value: "ADMIN" | "USER") => setEditFormData({ ...editFormData, rol: value })}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                    <SelectItem value="USER">USER</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Nueva Contraseña (opcional)
                </label>
                <Input
                  type="password"
                  value={editFormData.password}
                  onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                  placeholder="Deja vacío para no cambiar"
                  disabled={saving}
                />
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
            <Button onClick={handleSaveEdit} disabled={saving || !!editEmailError}>
              {saving ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AlertDialog para eliminar usuario */}
      <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar al usuario "{deletingUser?.username}" ({deletingUser?.email})? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
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
