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
    created_at: string
}

export default function AdminUsersPage() {
    const { user: currentUser, token } = useAuth()
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [updating, setUpdating] = useState(false)

    // Edit form state
    const [editRole, setEditRole] = useState<'admin' | 'coach' | 'player'>('player')
    const [editActive, setEditActive] = useState(true)

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
        setEditActive(user.is_active)
        setIsDialogOpen(true)
    }

    const handleUpdateUser = async () => {
        if (!selectedUser || !token) return
        setUpdating(true)
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${selectedUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    role: editRole,
                    is_active: editActive
                })
            })

            if (response.ok) {
                // Update local state
                setUsers(users.map(u => u.id === selectedUser.id ? { ...u, role: editRole, is_active: editActive } : u))
                setIsDialogOpen(false)
                toast.success("Utilisateur mis à jour avec succès")
            } else {
                const errorData = await response.json()
                toast.error(`Erreur: ${errorData.detail}`)
            }
        } catch (error) {
            console.error('Failed to update user:', error)
            toast.error('Une erreur est survenue lors de la mise à jour')
        } finally {
            setUpdating(false)
        }
    }

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(search.toLowerCase()) ||
        (user.full_name && user.full_name.toLowerCase().includes(search.toLowerCase()))
    )

    const getRoleBadge = (role: string) => {
        switch (role) {
            case 'admin': return <Badge variant="destructive" className="gap-1"><ShieldAlert className="h-3 w-3" /> Admin</Badge>
            case 'coach': return <Badge variant="default" className="bg-blue-600 gap-1"><ShieldCheck className="h-3 w-3" /> Coach</Badge>
            default: return <Badge variant="secondary" className="gap-1"><Shield className="h-3 w-3" /> Joueur</Badge>
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
                            Gérez les rôles et les accès des utilisateurs.
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
                            <CardTitle>Utilisateurs ({users.length})</CardTitle>
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
                                            {user.is_active ?
                                                <Badge variant="outline" className="text-green-600 border-green-600">Actif</Badge> :
                                                <Badge variant="outline" className="text-red-600 border-red-600">Inactif</Badge>
                                            }
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
                                    value={editActive ? "active" : "inactive"}
                                    onValueChange={(value) => setEditActive(value === "active")}
                                >
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Sélectionner un statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="active">Actif</SelectItem>
                                        <SelectItem value="inactive">Inactif</SelectItem>
                                    </SelectContent>
                                </Select>
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
