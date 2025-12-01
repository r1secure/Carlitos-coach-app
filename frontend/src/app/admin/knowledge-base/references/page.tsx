'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import { Edit, Search, Star, StarOff, Video as VideoIcon, X, ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'

interface Video {
    id: string
    filename: string
    thumbnail_url: string | null
    is_reference: boolean
    extra_metadata: {
        player_name?: string
        stroke_type?: string
        [key: string]: any
    } | null
    created_at: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function ReferencesManagementPage() {
    const [videos, setVideos] = useState<Video[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [editingVideo, setEditingVideo] = useState<Video | null>(null)
    const [formData, setFormData] = useState({
        player_name: '',
        stroke_type: ''
    })

    useEffect(() => {
        fetchVideos()
    }, [])

    const fetchVideos = async () => {
        try {
            const token = localStorage.getItem('access_token')
            const response = await fetch(`${API_URL}/api/v1/videos/admin/all?limit=100`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            const data = await response.json()
            setVideos(data.items || [])
        } catch (error) {
            console.error('Error fetching videos:', error)
            toast.error("Erreur lors du chargement des vidéos")
        } finally {
            setLoading(false)
        }
    }

    const handleToggleReference = async (video: Video) => {
        try {
            const token = localStorage.getItem('access_token')
            const newStatus = !video.is_reference

            const response = await fetch(`${API_URL}/api/v1/videos/${video.id}/reference`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    is_reference: newStatus,
                    extra_metadata: video.extra_metadata // Keep existing metadata
                })
            })

            if (response.ok) {
                setVideos(videos.map(v => v.id === video.id ? { ...v, is_reference: newStatus } : v))
                toast.success(newStatus ? "Vidéo marquée comme référence" : "Vidéo retirée des références")
            } else {
                toast.error("Erreur lors de la mise à jour")
            }
        } catch (error) {
            console.error('Error toggling reference:', error)
            toast.error("Erreur serveur")
        }
    }

    const handleEdit = (video: Video) => {
        setEditingVideo(video)
        setFormData({
            player_name: video.extra_metadata?.player_name || '',
            stroke_type: video.extra_metadata?.stroke_type || ''
        })
    }

    const handleSaveMetadata = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingVideo) return

        try {
            const token = localStorage.getItem('access_token')
            const updatedMetadata = {
                ...editingVideo.extra_metadata,
                player_name: formData.player_name,
                stroke_type: formData.stroke_type
            }

            const response = await fetch(`${API_URL}/api/v1/videos/${editingVideo.id}/reference`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    is_reference: editingVideo.is_reference,
                    extra_metadata: updatedMetadata
                })
            })

            if (response.ok) {
                setVideos(videos.map(v => v.id === editingVideo.id ? { ...v, extra_metadata: updatedMetadata } : v))
                toast.success("Métadonnées mises à jour")
                setEditingVideo(null)
            } else {
                toast.error("Erreur lors de la sauvegarde")
            }
        } catch (error) {
            console.error('Error saving metadata:', error)
            toast.error("Erreur serveur")
        }
    }

    const filteredVideos = videos.filter(v =>
        v.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.extra_metadata?.player_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        v.extra_metadata?.stroke_type?.toLowerCase().includes(searchQuery.toLowerCase())
    )

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
                    <h1 className="text-3xl font-bold">Gestion des Références</h1>
                    <p className="text-muted-foreground mt-2">
                        Gérez les vidéos de référence et leurs métadonnées
                    </p>
                </div>
            </div>

            <div className="flex gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {editingVideo && (
                <Card className="mb-8 border-primary/50 bg-primary/5">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Modifier les métadonnées</CardTitle>
                            <Button variant="ghost" size="icon" onClick={() => setEditingVideo(null)}>
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <CardDescription>
                            {editingVideo.filename}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSaveMetadata} className="flex gap-4 items-end">
                            <div className="space-y-2 flex-1">
                                <Label htmlFor="player_name">Nom du Joueur</Label>
                                <Input
                                    id="player_name"
                                    value={formData.player_name}
                                    onChange={(e) => setFormData({ ...formData, player_name: e.target.value })}
                                    placeholder="ex: Roger Federer"
                                />
                            </div>
                            <div className="space-y-2 flex-1">
                                <Label htmlFor="stroke_type">Type de Coup</Label>
                                <Input
                                    id="stroke_type"
                                    value={formData.stroke_type}
                                    onChange={(e) => setFormData({ ...formData, stroke_type: e.target.value })}
                                    placeholder="ex: Coup droit"
                                />
                            </div>
                            <Button type="submit">Enregistrer</Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Vidéo</TableHead>
                                <TableHead>Joueur</TableHead>
                                <TableHead>Coup</TableHead>
                                <TableHead>Référence</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">Chargement...</TableCell>
                                </TableRow>
                            ) : filteredVideos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-8">Aucune vidéo trouvée</TableCell>
                                </TableRow>
                            ) : (
                                filteredVideos.map((video) => (
                                    <TableRow key={video.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-16 bg-muted rounded overflow-hidden flex items-center justify-center">
                                                    {video.thumbnail_url ? (
                                                        <img src={video.thumbnail_url} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <VideoIcon className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </div>
                                                <span className="font-medium truncate max-w-[200px]" title={video.filename}>
                                                    {video.filename}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{video.extra_metadata?.player_name || '-'}</TableCell>
                                        <TableCell>{video.extra_metadata?.stroke_type || '-'}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant={video.is_reference ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handleToggleReference(video)}
                                                className={video.is_reference ? "bg-green-600 hover:bg-green-700" : ""}
                                            >
                                                {video.is_reference ? (
                                                    <><Star className="h-3 w-3 mr-1 fill-current" /> Oui</>
                                                ) : (
                                                    <><StarOff className="h-3 w-3 mr-1" /> Non</>
                                                )}
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(video)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
