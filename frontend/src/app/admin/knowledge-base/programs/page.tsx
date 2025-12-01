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

interface Program {
    id: string
    title: string
    description: string
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    duration_weeks: number
    video_count: number
    videos?: Video[]
    created_at: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function ProgramsManagementPage() {
    const [programs, setPrograms] = useState<Program[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingProgram, setEditingProgram] = useState<Program | null>(null)
    const [uploadedVideos, setUploadedVideos] = useState<any[]>([])
    const [formData, setFormData] = useState<{
        title: string
        description: string
        difficulty: 'beginner' | 'intermediate' | 'advanced'
        duration_weeks: number
    }>({
        title: '',
        description: '',
        difficulty: 'beginner',
        duration_weeks: 4
    })

    useEffect(() => {
        fetchPrograms()
    }, [])

    const fetchPrograms = async () => {
        try {
            const response = await fetch(`${API_URL}/api/v1/knowledge-base/programs`)
            const data = await response.json()
            setPrograms(data.items || [])
        } catch (error) {
            console.error('Error fetching programs:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchProgramDetails = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/api/v1/knowledge-base/programs/${id}`)
            if (response.ok) {
                return await response.json()
            }
        } catch (error) {
            console.error('Error fetching program details:', error)
        }
        return null
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const url = editingProgram
                ? `${API_URL}/api/v1/knowledge-base/programs/${editingProgram.id}`
                : `${API_URL}/api/v1/knowledge-base/programs`

            const response = await fetch(url, {
                method: editingProgram ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                const savedProgram = await response.json()

                // Attach uploaded videos
                if (uploadedVideos.length > 0) {
                    for (const video of uploadedVideos) {
                        await fetch(`${API_URL}/api/v1/knowledge-base/programs/${savedProgram.id}/videos`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ video_id: video.id })
                        })
                    }
                }

                await fetchPrograms()
                resetForm()
            }
        } catch (error) {
            console.error('Error saving program:', error)
        }
    }

    const handleEdit = async (program: Program) => {
        // Fetch full details to get videos
        const details = await fetchProgramDetails(program.id)
        if (details) {
            setEditingProgram(details)
            setFormData({
                title: details.title,
                description: details.description,
                difficulty: details.difficulty,
                duration_weeks: details.duration_weeks
            })
            setUploadedVideos([])
            setShowForm(true)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce programme ?')) return

        try {
            await fetch(`${API_URL}/api/v1/knowledge-base/programs/${id}`, {
                method: 'DELETE'
            })
            await fetchPrograms()
        } catch (error) {
            console.error('Error deleting program:', error)
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
            duration_weeks: 4
        })
        setEditingProgram(null)
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
                    <h1 className="text-3xl font-bold">Gestion des Programmes</h1>
                    <p className="text-muted-foreground mt-2">
                        Créez et gérez les programmes d'entraînement
                    </p>
                </div>
                <Button onClick={() => setShowForm(true)} disabled={showForm}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouveau Programme
                </Button>
            </div>

            {showForm && (
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>{editingProgram ? 'Modifier' : 'Créer'} un Programme</CardTitle>
                                <CardDescription>
                                    Remplissez les informations du programme
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

                            <div className="space-y-2">
                                <Label htmlFor="duration_weeks">Durée (semaines) *</Label>
                                <Input
                                    id="duration_weeks"
                                    type="number"
                                    min="1"
                                    max="52"
                                    value={formData.duration_weeks}
                                    onChange={(e) => setFormData({ ...formData, duration_weeks: parseInt(e.target.value) || 1 })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description *</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    rows={6}
                                />
                            </div>

                            <div className="space-y-4">
                                <Label>Vidéos associées</Label>

                                {/* Existing Videos */}
                                {editingProgram?.videos && editingProgram.videos.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                        {editingProgram.videos.map((video) => (
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
                                    {editingProgram ? 'Mettre à jour' : 'Créer'}
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
                    <CardTitle>Liste des Programmes</CardTitle>
                    <CardDescription>
                        {programs.length} programme(s) au total
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-8 text-muted-foreground">Chargement...</p>
                    ) : programs.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">
                            Aucun programme. Créez-en un pour commencer !
                        </p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Titre</TableHead>
                                    <TableHead>Difficulté</TableHead>
                                    <TableHead>Durée</TableHead>
                                    <TableHead>Vidéos</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {programs.map((program) => (
                                    <TableRow key={program.id}>
                                        <TableCell className="font-medium">{program.title}</TableCell>
                                        <TableCell>
                                            <span className="capitalize">{program.difficulty}</span>
                                        </TableCell>
                                        <TableCell>{program.duration_weeks} semaines</TableCell>
                                        <TableCell>{program.video_count}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(program)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(program.id)}
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
