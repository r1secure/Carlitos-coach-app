'use client'

import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dumbbell, Target, Lightbulb, Calendar, Activity, ArrowLeft } from 'lucide-react'

export default function KnowledgeBaseDashboard() {
    const sections = [
        {
            title: 'Drills',
            description: 'Gérer les exercices de tennis',
            icon: Target,
            href: '/admin/knowledge-base/drills',
            color: 'text-blue-600'
        },
        {
            title: 'Exercices',
            description: 'Gérer les exercices physiques',
            icon: Dumbbell,
            href: '/admin/knowledge-base/exercises',
            color: 'text-green-600'
        },
        {
            title: 'Conseils',
            description: 'Gérer les conseils et astuces',
            icon: Lightbulb,
            href: '/admin/knowledge-base/tips',
            color: 'text-yellow-600'
        },
        {
            title: 'Programmes',
            description: 'Gérer les programmes d\'entraînement',
            icon: Calendar,
            href: '/admin/knowledge-base/programs',
            color: 'text-purple-600'
        },
        {
            title: 'Modèles',
            description: 'Gérer les vidéos de référence',
            icon: Activity,
            href: '/admin/knowledge-base/references',
            color: 'text-red-600'
        }
    ]

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="mb-6">
                <Link href="/dashboard">
                    <Button variant="ghost" className="pl-0 hover:pl-0 hover:bg-transparent">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Retour au tableau de bord
                    </Button>
                </Link>
            </div>

            <div className="mb-8">
                <h1 className="text-3xl font-bold">Base de Connaissances</h1>
                <p className="text-muted-foreground mt-2">
                    Gérez le contenu de la plateforme Carlitos
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sections.map((section) => {
                    const Icon = section.icon
                    return (
                        <Card key={section.href} className="hover:shadow-lg transition-shadow">
                            <CardHeader>
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg bg-muted ${section.color}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <CardTitle>{section.title}</CardTitle>
                                        <CardDescription>{section.description}</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <Link href={section.href}>
                                    <Button className="w-full">
                                        Gérer {section.title}
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>
        </div>
    )
}
