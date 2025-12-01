'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Search, Loader2, MoreHorizontal, Shield, ShieldAlert, ShieldCheck, ArrowLeft } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'

interface User {
    id: string
    email: string
    full_name: string | null
    role: 'admin' | 'coach' | 'player'
    is_active: boolean
    validation_status: 'PENDING' | 'APPROVED' | 'REJECTED'
    permissions: { [key: string]: boolean }
    created_at: string
}

export default function AdminUsersPage() {
    const { user: currentUser, token } = useAuth()
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL')
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [updating, setUpdating] = useState(false)

    // Edit form state
    const [editRole, setEditRole] = useState<'admin' | 'coach' | 'player'>('player')
    const [editValidationStatus, setEditValidationStatus] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING')
    const [editPermissions, setEditPermissions] = useState<{ [key: string]: boolean }>({})

    useEffect(() => {
        if (currentUser && currentUser.role !== 'admin') {
            router.push('/dashboard')
            return
        }
        fetchUsers()
    }, [currentUser, token])

    const fetchUsers = async () => {
        if (!token) return
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (response.ok) {
                const data = await response.json()
                setUsers(data)
            }
        } catch (error) {
            console.error('Failed to fetch users:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleEditClick = (user: User) => {
        setSelectedUser(user)
        setEditRole(user.role)
        setEditValidationStatus(user.validation_status)
        setEditPermissions(user.permissions || {})
        setIsDialogOpen(true)
    }

    const handleUpdateUser = async () => {
        if (!selectedUser || !token) return
        setUpdating(true)
        try {
            // Update Role and Status
            // We can use the generic update or specific endpoints.
            // Let's use specific endpoints for clarity as per backend implementation.

            // 1. Validate Status
            if (editValidationStatus !== selectedUser.validation_status) {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${selectedUser.id}/validate?status=${editValidationStatus}`, {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            }

            // 2. Update Permissions
            // Check if permissions changed
            if (JSON.stringify(editPermissions) !== JSON.stringify(selectedUser.permissions)) {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${selectedUser.id}/permissions`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(editPermissions)
                })
            }

            // 3. Update Role (using generic update if needed, or we assume role update is separate?
            // The previous code used generic update for role and is_active.
            // Let's keep using generic update for role.
            if (editRole !== selectedUser.role) {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${selectedUser.id}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ role: editRole })
                })
            }

            // Refresh list
            fetchUsers()
            setIsDialogOpen(false)
            toast.success("Utilisateur mis à jour avec succès")

        } catch (error) {
            console.error('Failed to update user:', error)
            toast.error('Une erreur est survenue lors de la mise à jour')
        } finally {
            setUpdating(false)
        }
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email.toLowerCase().includes(search.toLowerCase()) ||
            (user.full_name && user.full_name.toLowerCase().includes(search.toLowerCase()))
        const matchesStatus = statusFilter === 'ALL' || user.validation_status === statusFilter
        return matchesSearch && matchesStatus
    })

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin': return <Badge variant="destructive" className="gap-1"><ShieldAlert className="h-3 w-3" /> Admin</Badge>
            case 'coach': return <Badge variant="default" className="bg-blue-600 gap-1"><ShieldCheck className="h-3 w-3" /> Coach</Badge>
            default: return <Badge variant="secondary" className="gap-1"><Shield className="h-3 w-3" /> Joueur</Badge>
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED': return <Badge variant="outline" className="text-green-600 border-green-600">Approuvé</Badge>
            case 'PENDING': return <Badge variant="outline" className="text-yellow-600 border-yellow-600">En attente</Badge>
            case 'REJECTED': return <Badge variant="outline" className="text-red-600 border-red-600">Rejeté</Badge>
            default: return <Badge variant="outline">Inconnu</Badge>
        }
    }

    if (loading) {
        return <div className="flex justify-center items-center h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>
    }

    return (
        <div className="min-h-screen bg-muted/30 p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Gestion des Utilisateurs</h1>
                        <p className="text-muted-foreground mt-2">
                            Gérez les rôles, validations et permissions.
                        </p>
                    </div>
                    <Link href="/dashboard">
                        <Button variant="ghost" className="pl-0 hover:pl-0 hover:bg-transparent">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Retour au tableau de bord
                        </Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Utilisateurs ({filteredUsers.length})</CardTitle>
                            <div className="flex gap-2">
                                <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Filtrer par statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">Tous les statuts</SelectItem>
                                        <SelectItem value="PENDING">En attente</SelectItem>
                                        <SelectItem value="APPROVED">Approuvé</SelectItem>
                                        <SelectItem value="REJECTED">Rejeté</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="relative w-64">
                                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Rechercher..."
                                        className="pl-8"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Utilisateur</TableHead>
                                    <TableHead>Rôle</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Date d'inscription</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div className="font-medium">{user.full_name || 'Sans nom'}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </TableCell>
                                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                                        <TableCell>
                                            {getStatusBadge(user.validation_status)}
                                        </TableCell>
                                        <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Ouvrir menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleEditClick(user)}>
                                                        Modifier droits/statut
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Modifier l'utilisateur</DialogTitle>
                            <DialogDescription>
                                {selectedUser?.email}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="role" className="text-right">
                                    Rôle
                                </Label>
                                <Select
                                    value={editRole}
                                    onValueChange={(value: 'admin' | 'coach' | 'player') => setEditRole(value)}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Sélectionner un rôle" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="player">Joueur</SelectItem>
                                        <SelectItem value="coach">Coach</SelectItem>
                                        <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="status" className="text-right">
                                    Statut
                                </Label>
                                <Select
                                    value={editValidationStatus}
                                    onValueChange={(value: 'PENDING' | 'APPROVED' | 'REJECTED') => setEditValidationStatus(value)}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Sélectionner un statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="PENDING">En attente</SelectItem>
                                        <SelectItem value="APPROVED">Approuvé</SelectItem>
                                        <SelectItem value="REJECTED">Rejeté</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="col-span-4 border-t pt-4 mt-2">
                                <h4 className="mb-4 text-sm font-medium leading-none">Permissions</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="perm_kb"
                                            className="h-4 w-4 rounded border-gray-300"
                                            checked={editPermissions.can_view_knowledge_base || false}
                                            onChange={(e) => setEditPermissions({ ...editPermissions, can_view_knowledge_base: e.target.checked })}
                                        />
                                        <Label htmlFor="perm_kb">Accès Base de Connaissances</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="perm_upload"
                                            className="h-4 w-4 rounded border-gray-300"
                                            checked={editPermissions.can_upload_videos || false}
                                            onChange={(e) => setEditPermissions({ ...editPermissions, can_upload_videos: e.target.checked })}
                                        />
                                        <Label htmlFor="perm_upload">Upload de Vidéos</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id="perm_coach"
                                            className="h-4 w-4 rounded border-gray-300"
                                            checked={editPermissions.can_use_virtual_coach || false}
                                            onChange={(e) => setEditPermissions({ ...editPermissions, can_use_virtual_coach: e.target.checked })}
                                        />
                                        <Label htmlFor="perm_coach">Coach Virtuel</Label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                            <Button onClick={handleUpdateUser} disabled={updating}>
                                {updating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Enregistrer
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
