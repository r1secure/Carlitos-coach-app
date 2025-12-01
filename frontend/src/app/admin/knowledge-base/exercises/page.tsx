'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import { Plus, Edit, Trash2, X, Video as VideoIcon, ArrowLeft } from 'lucide-react'
import { VideoUpload } from '@/components/VideoUpload'

interface Video {
    id: string
    filename: string
    thumbnail_url: string | null
}

interface Exercise {
    id: string
    title: string
    description: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    focus_area: 'technique' | 'physical' | 'mental' | 'tactical'
    equipment: string[]
    video_count: number
    videos?: Video[]
    created_at: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function ExercisesManagementPage() {
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingExercise, setEditingExercise] = useState<Exercise | null>(null)
    const [uploadedVideos, setUploadedVideos] = useState<any[]>([])
    const [formData, setFormData] = useState<{
        title: string
        description: string
        difficulty: 'beginner' | 'intermediate' | 'advanced'
        focus_area: 'technique' | 'physical' | 'mental' | 'tactical'
        equipment: string
    }>({
        title: '',
        description: '',
        difficulty: 'beginner',
        focus_area: 'technique',
        equipment: ''
    })

    useEffect(() => {
        fetchExercises()
    }, [])

    const fetchExercises = async () => {
        try {
            const response = await fetch(`${API_URL}/api/v1/knowledge-base/exercises`)
            const data = await response.json()
            setExercises(data.items || [])
        } catch (error) {
            console.error('Error fetching exercises:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchExerciseDetails = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/api/v1/knowledge-base/exercises/${id}`)
            if (response.ok) {
                return await response.json()
            }
        } catch (error) {
            console.error('Error fetching exercise details:', error)
        }
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const payload = {
            ...formData,
            equipment: formData.equipment.split(',').map(item => item.trim()).filter(Boolean)
        }

        try {
            const url = editingExercise
                ? `${API_URL}/api/v1/knowledge-base/exercises/${editingExercise.id}`
                : `${API_URL}/api/v1/knowledge-base/exercises`

            const response = await fetch(url, {
                method: editingExercise ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (response.ok) {
                const savedExercise = await response.json()

                // Attach uploaded videos
                if (uploadedVideos.length > 0) {
                    for (const video of uploadedVideos) {
                        await fetch(`${API_URL}/api/v1/knowledge-base/exercises/${savedExercise.id}/videos`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ video_id: video.id })
                        })
                    }
                }

                await fetchExercises()
                resetForm()
            }
        } catch (error) {
            console.error('Error saving exercise:', error)
        }
    }

    const handleEdit = async (exercise: Exercise) => {
        // Fetch full details to get videos
        const details = await fetchExerciseDetails(exercise.id)
        if (details) {
            setEditingExercise(details)
            setFormData({
                title: details.title,
                description: details.description,
                difficulty: details.difficulty,
                focus_area: details.focus_area,
                equipment: details.equipment.join(', ')
            })
            setUploadedVideos([])
            setShowForm(true)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer cet exercice ?')) return

        try {
            await fetch(`${API_URL}/api/v1/knowledge-base/exercises/${id}`, {
                method: 'DELETE'
            })
            await fetchExercises()
        } catch (error) {
            console.error('Error deleting exercise:', error)
        }
    }

    const handleVideoUpload = (videoData: any) => {
        setUploadedVideos(prev => [...prev, videoData])
    }

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            difficulty: 'beginner',
            focus_area: 'technique',
            equipment: ''
        })
        setEditingExercise(null)
        setUploadedVideos([])
        setShowForm(false)
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6">
                <Link href="/admin/knowledge-base">
                    <Button variant="ghost" className="pl-0 hover:pl-0 hover:bg-transparent">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour au tableau de bord
                    </Button>
                </Link>
            </div>

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold">Gestion des Exercices</h1>
                    <p className="text-muted-foreground mt-2">
                        Créez et gérez les exercices de tennis
                    </p>
                </div>
                <Button onClick={() => setShowForm(true)} disabled={showForm}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvel Exercice
                </Button>
            </div>

            {showForm && (
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>{editingExercise ? 'Modifier' : 'Créer'} un Exercice</CardTitle>
                                <CardDescription>
                                    Remplissez les informations de l'exercice
                                </CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" onClick={resetForm}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="title">Titre *</Label>
                                    <Input
                                        id="title"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="difficulty">Difficulté *</Label>
                                    <Select
                                        value={formData.difficulty}
                                        onValueChange={(value: any) => setFormData({ ...formData, difficulty: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="beginner">Débutant</SelectItem>
                                            <SelectItem value="intermediate">Intermédiaire</SelectItem>
                                            <SelectItem value="advanced">Avancé</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="focus_area">Zone de focus *</Label>
                                    <Select
                                        value={formData.focus_area}
                                        onValueChange={(value: any) => setFormData({ ...formData, focus_area: value })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="technique">Technique</SelectItem>
                                            <SelectItem value="physical">Physique</SelectItem>
                                            <SelectItem value="mental">Mental</SelectItem>
                                            <SelectItem value="tactical">Tactique</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="equipment">Équipement (séparé par virgules)</Label>
                                    <Input
                                        id="equipment"
                                        value={formData.equipment}
                                        onChange={(e) => setFormData({ ...formData, equipment: e.target.value })}
                                        placeholder="raquette, balles, cônes"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    rows={4}
                                />
                            </div>

                            <div className="space-y-4">
                                <Label>Vidéos associées</Label>

                                {/* Existing Videos */}
                                {editingExercise?.videos && editingExercise.videos.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                        {editingExercise.videos.map((video) => (
                                            <div key={video.id} className="border rounded-lg p-2 flex items-center gap-2 bg-muted/50">
                                                <div className="h-10 w-16 bg-black/10 rounded flex items-center justify-center overflow-hidden">
                                                    {video.thumbnail_url ? (
                                                        <img src={video.thumbnail_url} alt="Thumbnail" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <VideoIcon className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <span className="text-sm truncate flex-1">{video.filename}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Newly Uploaded Videos */}
                                {uploadedVideos.length > 0 && (
                                    <div className="mb-4">
                                        <p className="text-sm font-medium mb-2 text-green-600">Vidéos prêtes à être attachées :</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                            {uploadedVideos.map((video, idx) => (
                                                <div key={idx} className="border rounded-lg p-2 flex items-center gap-2 bg-green-50 border-green-200">
                                                    <div className="h-10 w-16 bg-black/10 rounded flex items-center justify-center overflow-hidden">
                                                        {video.thumbnail_url ? (
                                                            <img src={video.thumbnail_url} alt="Thumbnail" className="h-full w-full object-cover" />
                                                        ) : (
                                                            <VideoIcon className="h-4 w-4 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <span className="text-sm truncate flex-1">{video.filename}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <VideoUpload onUploadComplete={handleVideoUpload} />
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit">
                                    {editingExercise ? 'Mettre à jour' : 'Créer'}
                                </Button>
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    Annuler
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Liste des Exercices</CardTitle>
                    <CardDescription>
                        {exercises.length} exercice(s) au total
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-8 text-muted-foreground">Chargement...</p>
                    ) : exercises.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">
                            Aucun exercice. Créez-en un pour commencer !
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Titre</TableHead>
                                    <TableHead>Difficulté</TableHead>
                                    <TableHead>Focus</TableHead>
                                    <TableHead>Vidéos</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {exercises.map((exercise) => (
                                    <TableRow key={exercise.id}>
                                        <TableCell className="font-medium">{exercise.title}</TableCell>
                                        <TableCell>
                                            <span className="capitalize">{exercise.difficulty}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="capitalize">{exercise.focus_area}</span>
                                        </TableCell>
                                        <TableCell>{exercise.video_count}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(exercise)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(exercise.id)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
