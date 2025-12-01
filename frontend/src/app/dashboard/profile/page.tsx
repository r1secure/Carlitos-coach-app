'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

// Schema validation matching backend
const profileSchema = z.object({
    first_name: z.string().optional().nullable(),
    last_name: z.string().optional().nullable(),
    birth_date: z.string().optional().nullable(),
    ranking: z.string().optional().nullable(),
    fft_club: z.string().optional().nullable(),
    tenup_profile_url: z.string().url("URL invalide").optional().or(z.literal('')).nullable(),
    handedness: z.enum(['RIGHT', 'LEFT']).optional().nullable(),
    backhand_style: z.enum(['ONE_HANDED', 'TWO_HANDED']).optional().nullable(),
    play_style: z.string().optional().nullable(),
})

type ProfileFormValues = z.infer<typeof profileSchema>

export default function ProfilePage() {
    const { user, token, refreshUser } = useAuth()
    const router = useRouter()
    const [isSaving, setIsSaving] = useState(false)

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            first_name: '',
            last_name: '',
            birth_date: '',
            ranking: '',
            fft_club: '',
            tenup_profile_url: '',
            handedness: undefined,
            backhand_style: undefined,
            play_style: '',
        }
    })

    // Populate form when user data is available
    useEffect(() => {
        if (user) {
            console.log('ProfilePage: Populating form with user data', user)
            form.reset({
                first_name: user.first_name || '',
                last_name: user.last_name || '',
                birth_date: user.birth_date ? new Date(user.birth_date).toISOString().split('T')[0] : '',
                ranking: user.ranking || '',
                fft_club: user.fft_club || '',
                tenup_profile_url: user.tenup_profile_url || '',
                handedness: (user.handedness as "RIGHT" | "LEFT") || null,
                backhand_style: (user.backhand_style as "ONE_HANDED" | "TWO_HANDED") || null,
                play_style: user.play_style || '',
            })
        }
    }, [user, form])

    const onSubmit = async (data: ProfileFormValues) => {
        setIsSaving(true)
        try {
            // Prepare payload: convert empty strings to null for backend
            const payload = {
                ...data,
                first_name: data.first_name || null,
                last_name: data.last_name || null,
                birth_date: data.birth_date || null,
                ranking: data.ranking || null,
                fft_club: data.fft_club || null,
                tenup_profile_url: data.tenup_profile_url || null,
                play_style: data.play_style || null,
                // Enums are already null or valid value
            }

            console.log('ProfilePage: Sending update', payload)

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/me`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(payload)
            })

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour')
            }

            const updatedUser = await response.json()
            console.log('ProfilePage: Update success', updatedUser)

            await refreshUser()
            router.refresh()
            toast.success("Profil mis à jour avec succès")
        } catch (error) {
            console.error('ProfilePage: Error', error)
            toast.error("Erreur lors de l'enregistrement")
        } finally {
            setIsSaving(false)
        }
    }

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-muted/30 p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informations Personnelles</CardTitle>
                        <CardDescription>
                            Gérez vos informations de joueur et préférences.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="first_name">Prénom</Label>
                                    <Input id="first_name" {...form.register('first_name')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="last_name">Nom</Label>
                                    <Input id="last_name" {...form.register('last_name')} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="birth_date">Date de naissance</Label>
                                <Input type="date" id="birth_date" {...form.register('birth_date')} />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="ranking">Classement</Label>
                                    <Input id="ranking" placeholder="ex: 15/4" {...form.register('ranking')} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="fft_club">Club FFT</Label>
                                    <Input id="fft_club" {...form.register('fft_club')} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="tenup_profile_url">URL Profil Ten'Up</Label>
                                <Input id="tenup_profile_url" placeholder="https://..." {...form.register('tenup_profile_url')} />
                                {form.formState.errors.tenup_profile_url && (
                                    <p className="text-sm text-red-500">{form.formState.errors.tenup_profile_url.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Latéralité</Label>
                                    <Controller
                                        control={form.control}
                                        name="handedness"
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value || ''}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="RIGHT">Droitier</SelectItem>
                                                    <SelectItem value="LEFT">Gaucher</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Revers</Label>
                                    <Controller
                                        control={form.control}
                                        name="backhand_style"
                                        render={({ field }) => (
                                            <Select
                                                onValueChange={field.onChange}
                                                value={field.value || ''}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionner" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="ONE_HANDED">À une main</SelectItem>
                                                    <SelectItem value="TWO_HANDED">À deux mains</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        )}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="play_style">Style de jeu</Label>
                                <Input id="play_style" placeholder="ex: Attaquant de fond de court" {...form.register('play_style')} />
                            </div>

                            <div className="flex justify-end">
                                <Button type="submit" disabled={isSaving}>
                                    {isSaving ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Enregistrement...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="mr-2 h-4 w-4" />
                                            Enregistrer
                                        </>
                                    )}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
