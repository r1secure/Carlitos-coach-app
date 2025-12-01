'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Dumbbell, Target, Lightbulb, Calendar, ArrowRight, Activity } from 'lucide-react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface SearchResult {
    type: 'drill' | 'exercise' | 'tip' | 'program' | 'reference'
    id: string
    title: string
    description?: string
    content?: string
    difficulty?: string
    focus_area?: string
    duration_weeks?: number
}

export default function KnowledgeBasePage() {
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [filters, setFilters] = useState({
        type: 'all',
        difficulty: 'all',
        focus_area: 'all'
    })

    useEffect(() => {
        fetchResults()
    }, [filters]) // Re-fetch when filters change

    const fetchResults = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (searchQuery) params.append('q', searchQuery)
            if (filters.type !== 'all') params.append('type', filters.type)
            if (filters.difficulty !== 'all') params.append('difficulty', filters.difficulty)
            if (filters.focus_area !== 'all') params.append('focus_area', filters.focus_area)

            const response = await fetch(`${API_URL}/api/v1/knowledge-base/search?${params.toString()}`)
            const data = await response.json()
            setResults(data.results || [])
        } catch (error) {
            console.error('Error fetching results:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        fetchResults()
    }

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'drill': return <Target className="h-4 w-4" />
            case 'exercise': return <Dumbbell className="h-4 w-4" />
            case 'tip': return <Lightbulb className="h-4 w-4" />
            case 'program': return <Calendar className="h-4 w-4" />
            case 'reference': return <Activity className="h-4 w-4" />
            default: return null
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'drill': return 'Drill'
            case 'exercise': return 'Exercice'
            case 'tip': return 'Conseil'
            case 'program': return 'Programme'
            case 'reference': return 'Modèle'
            default: return type
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'drill': return 'bg-blue-100 text-blue-800'
            case 'exercise': return 'bg-green-100 text-green-800'
            case 'tip': return 'bg-yellow-100 text-yellow-800'
            case 'program': return 'bg-purple-100 text-purple-800'
            case 'reference': return 'bg-red-100 text-red-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-8 text-center">
                <h1 className="text-4xl font-bold mb-4">Base de Connaissances</h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Explorez notre bibliothèque d'exercices, de conseils et de programmes d'entraînement pour améliorer votre tennis.
                </p>
            </div>

            {/* Search and Filters */}
            <div className="bg-card border rounded-lg p-6 mb-8 shadow-sm">
                <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Rechercher..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <Button type="submit">Rechercher</Button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Type de contenu</label>
                        <Select
                            value={filters.type}
                            onValueChange={(value) => setFilters({ ...filters, type: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Tous les types" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Tous les types</SelectItem>
                                <SelectItem value="drill">Drills</SelectItem>
                                <SelectItem value="exercise">Exercices</SelectItem>
                                <SelectItem value="tip">Conseils</SelectItem>
                                <SelectItem value="program">Programmes</SelectItem>
                                <SelectItem value="reference">Modèles</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Difficulté</label>
                        <Select
                            value={filters.difficulty}
                            onValueChange={(value) => setFilters({ ...filters, difficulty: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Toutes difficultés" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes difficultés</SelectItem>
                                <SelectItem value="beginner">Débutant</SelectItem>
                                <SelectItem value="intermediate">Intermédiaire</SelectItem>
                                <SelectItem value="advanced">Avancé</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Zone de focus</label>
                        <Select
                            value={filters.focus_area}
                            onValueChange={(value) => setFilters({ ...filters, focus_area: value })}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Toutes zones" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes zones</SelectItem>
                                <SelectItem value="technique">Technique</SelectItem>
                                <SelectItem value="physical">Physique</SelectItem>
                                <SelectItem value="mental">Mental</SelectItem>
                                <SelectItem value="tactical">Tactique</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Recherche en cours...</p>
                </div>
            ) : results.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                    <p className="text-lg font-medium mb-2">Aucun résultat trouvé</p>
                    <p className="text-muted-foreground">Essayez de modifier vos filtres ou votre recherche.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {results.map((item) => (
                        <Link
                            href={item.type === 'reference' ? `/knowledge-base/references/${item.id}` : `/knowledge-base/${item.type}s/${item.id}`}
                            key={`${item.type}-${item.id}`}
                        >
                            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer flex flex-col">
                                <CardHeader>
                                    <div className="flex justify-between items-start mb-2">
                                        <Badge variant="secondary" className={`flex items-center gap-1 ${getTypeColor(item.type)}`}>
                                            {getTypeIcon(item.type)}
                                            {getTypeLabel(item.type)}
                                        </Badge>
                                        {item.difficulty && (
                                            <Badge variant="outline" className="capitalize">
                                                {item.difficulty}
                                            </Badge>
                                        )}
                                    </div>
                                    <CardTitle className="line-clamp-2">{item.title}</CardTitle>
                                    {item.focus_area && (
                                        <CardDescription className="capitalize flex items-center gap-1 mt-1">
                                            <Filter className="h-3 w-3" />
                                            {item.focus_area}
                                        </CardDescription>
                                    )}
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <p className="text-muted-foreground line-clamp-3 text-sm">
                                        {item.description || item.content}
                                    </p>
                                    {item.duration_weeks && (
                                        <div className="mt-4 flex items-center gap-2 text-sm font-medium">
                                            <Calendar className="h-4 w-4" />
                                            {item.duration_weeks} semaines
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="border-t pt-4">
                                    <Button variant="ghost" className="w-full group">
                                        Voir les détails
                                        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </Button>
                                </CardFooter>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
