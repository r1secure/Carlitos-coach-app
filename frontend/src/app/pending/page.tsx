'use client'

import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LogOut, Clock } from 'lucide-react'

export default function PendingPage() {
    const { user, logout } = useAuth()

    return (
        <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-yellow-100 p-3 rounded-full w-fit mb-4">
                        <Clock className="h-8 w-8 text-yellow-600" />
                    </div>
                    <CardTitle>Compte en attente de validation</CardTitle>
                    <CardDescription>
                        Votre inscription a bien été prise en compte.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        Un administrateur doit valider votre compte avant que vous puissiez accéder à la plateforme.
                        Vous recevrez une notification une fois votre compte activé.
                    </p>

                    {user && (
                        <div className="bg-muted p-3 rounded-md text-xs text-left">
                            <p><strong>Email:</strong> {user.email}</p>
                            <p><strong>Statut:</strong> {user.validation_status}</p>
                        </div>
                    )}

                    <Button variant="outline" className="w-full" onClick={logout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Se déconnecter
                    </Button>
                </CardContent>
            </Card>
        </div>
    )
}
