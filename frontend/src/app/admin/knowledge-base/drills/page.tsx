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

interface Drill {
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

export default function DrillsManagementPage() {
    const [drills, setDrills] = useState<Drill[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingDrill, setEditingDrill] = useState<Drill | null>(null)
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
        fetchDrills()
    }, [])

    const fetchDrills = async () => {
        try {
            const response = await fetch(`${API_URL}/api/v1/knowledge-base/drills`)
            const data = await response.json()
            setDrills(data.items || [])
        } catch (error) {
            console.error('Error fetching drills:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchDrillDetails = async (id: string) => {
        try {
            const response = await fetch(`${API_URL}/api/v1/knowledge-base/drills/${id}`)
            if (response.ok) {
                return await response.json()
            }
        } catch (error) {
            console.error('Error fetching drill details:', error)
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
            const url = editingDrill
                ? `${API_URL}/api/v1/knowledge-base/drills/${editingDrill.id}`
                : `${API_URL}/api/v1/knowledge-base/drills`

            const response = await fetch(url, {
                method: editingDrill ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            if (response.ok) {
                const savedDrill = await response.json()

                // Attach uploaded videos
                if (uploadedVideos.length > 0) {
                    for (const video of uploadedVideos) {
                        await fetch(`${API_URL}/api/v1/knowledge-base/drills/${savedDrill.id}/videos`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ video_id: video.id })
                        })
                    }
                }

                await fetchDrills()
                resetForm()
            }
        } catch (error) {
            console.error('Error saving drill:', error)
        }
    }

    const handleEdit = async (drill: Drill) => {
        // Fetch full details to get videos
        const details = await fetchDrillDetails(drill.id)
        if (details) {
            setEditingDrill(details)
            setFormData({
                title: details.title,
                description: details.description,
                difficulty: details.difficulty,
                focus_area: details.focus_area,
                equipment: details.equipment.join(', ')
            })
            setUploadedVideos([]) // Clear any previous uploads
            setShowForm(true)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Êtes-vous sûr de vouloir supprimer ce drill ?')) return

        try {
            await fetch(`${API_URL}/api/v1/knowledge-base/drills/${id}`, {
                method: 'DELETE'
            })
            await fetchDrills()
        } catch (error) {
            console.error('Error deleting drill:', error)
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
        setEditingDrill(null)
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
                    <h1 className="text-3xl font-bold">Gestion des Drills</h1>
                    <p className="text-muted-foreground mt-2">
                        Créez et gérez les exercices de tennis
                    </p>
                </div>
                <Button onClick={() => setShowForm(true)} disabled={showForm}>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouveau Drill
                </Button>
            </div>

            {showForm && (
                <Card className="mb-8">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>{editingDrill ? 'Modifier' : 'Créer'} un Drill</CardTitle>
                                <CardDescription>
                                    Remplissez les informations du drill
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
                                {editingDrill?.videos && editingDrill.videos.length > 0 && (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                        {editingDrill.videos.map((video) => (
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
                                    {editingDrill ? 'Mettre à jour' : 'Créer'}
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
                    <CardTitle>Liste des Drills</CardTitle>
                    <CardDescription>
                        {drills.length} drill(s) au total
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-8 text-muted-foreground">Chargement...</p>
                    ) : drills.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">
                            Aucun drill. Créez-en un pour commencer !
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
                                {drills.map((drill) => (
                                    <TableRow key={drill.id}>
                                        <TableCell className="font-medium">{drill.title}</TableCell>
                                        <TableCell>
                                            <span className="capitalize">{drill.difficulty}</span>
                                        </TableCell>
                                        <TableCell>
                                            <span className="capitalize">{drill.focus_area}</span>
                                        </TableCell>
                                        <TableCell>{drill.video_count}</TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEdit(drill)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(drill.id)}
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
