'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { LogOut, BookOpen, Settings, FileVideo } from 'lucide-react'
import { PermissionGuard } from '@/components/auth/PermissionGuard'

export default function DashboardPage() {
    const { user, logout } = useAuth()

    if (!user) {
        return null // Protected route wrapper should handle redirect
    }

    return (
        <div className="min-h-screen bg-muted/30 p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
                        <p className="text-muted-foreground mt-2">
                            Bienvenue, {user.full_name || user.email}
                        </p>
                    </div>
                    <Button variant="outline" onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Se déconnecter
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <PermissionGuard permission="can_view_knowledge_base">
                        <Card className="flex flex-col h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    Base de connaissances
                                </CardTitle>
                                <CardDescription>
                                    Accédez aux exercices et programmes
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="mt-auto">
                                <Link href="/knowledge-base">
                                    <Button className="w-full">Accéder</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </PermissionGuard>

                    <PermissionGuard permission="can_upload_videos">
                        <Card className="flex flex-col h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileVideo className="h-5 w-5" />
                                    Mes Vidéos
                                </CardTitle>
                                <CardDescription>
                                    Uploadez et gérez vos vidéos
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="mt-auto">
                                <Link href="/dashboard/videos">
                                    <Button className="w-full">Gérer</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    </PermissionGuard>

                    <Card className="flex flex-col h-full">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings className="h-5 w-5" />
                                Mon Profil
                            </CardTitle>
                            <CardDescription>
                                Gérez vos informations personnelles
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="mt-auto">
                            <Link href="/dashboard/profile">
                                <Button className="w-full">Modifier</Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {user.role === 'admin' && (
                        <Card className="flex flex-col h-full">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    Administration
                                </CardTitle>
                                <CardDescription>
                                    Gérer le contenu et les utilisateurs
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4 mt-auto">
                                <Link href="/admin/knowledge-base" className="w-full block">
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Gérer Contenu</Button>
                                </Link>
                                <Link href="/admin/users" className="w-full block">
                                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Gérer Utilisateurs</Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
