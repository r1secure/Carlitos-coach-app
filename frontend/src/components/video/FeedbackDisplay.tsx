import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Sparkles, CheckCircle, AlertTriangle, Lightbulb, Target, Activity, ArrowRight } from "lucide-react"
import Link from "next/link"

interface FeedbackDisplayProps {
    feedback: any
    onGenerate: () => void
    loading: boolean
}

export function FeedbackDisplay({ feedback, onGenerate, loading }: FeedbackDisplayProps) {
    if (!feedback) {
        return (
            <Card className="bg-zinc-900 border-zinc-800 text-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                        Coach Virtuel
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-zinc-400 mb-4">
                        Obtenez une analyse détaillée et des conseils personnalisés grâce à l'IA.
                    </p>
                    <Button onClick={onGenerate} disabled={loading} className="w-full">
                        {loading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Génération en cours...</>
                        ) : (
                            <><Sparkles className="mr-2 h-4 w-4" /> Générer le feedback</>
                        )}
                    </Button>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-4">
            <Card className="bg-zinc-900 border-zinc-800 text-white">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-yellow-500" />
                        Analyse du Coach Virtuel
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Focus Area */}
                    {feedback.focus_area && (
                        <div className="bg-blue-900/20 border border-blue-900 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-400 flex items-center gap-2 mb-2">
                                <Target className="h-4 w-4" /> Zone de Focus
                            </h3>
                            <p>{feedback.focus_area}</p>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Strengths */}
                        <div>
                            <h3 className="font-semibold text-green-400 flex items-center gap-2 mb-3">
                                <CheckCircle className="h-4 w-4" /> Points Forts
                            </h3>
                            <ul className="space-y-2">
                                {feedback.strengths?.map((item: string, i: number) => (
                                    <li key={i} className="text-sm text-zinc-300">• {item}</li>
                                ))}
                            </ul>
                        </div>

                        {/* Weaknesses */}
                        <div>
                            <h3 className="font-semibold text-red-400 flex items-center gap-2 mb-3">
                                <AlertTriangle className="h-4 w-4" /> Points à Améliorer
                            </h3>
                            <ul className="space-y-2">
                                {feedback.weaknesses?.map((item: string, i: number) => (
                                    <li key={i} className="text-sm text-zinc-300">• {item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Tips */}
                    <div>
                        <h3 className="font-semibold text-yellow-400 flex items-center gap-2 mb-3">
                            <Lightbulb className="h-4 w-4" /> Conseils du Coach
                        </h3>
                        <div className="bg-yellow-900/10 border border-yellow-900/30 rounded-lg p-4">
                            <ul className="space-y-2">
                                {feedback.tips?.map((item: string, i: number) => (
                                    <li key={i} className="text-sm text-zinc-300">• {item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Recommended Drills */}
            {feedback.recommended_drills && feedback.recommended_drills.length > 0 && (
                <Card className="bg-zinc-900 border-zinc-800 text-white">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-blue-500" />
                            Exercices Recommandés
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            {feedback.recommended_drills.map((drillId: string) => (
                                <Link href={`/knowledge-base/drills/${drillId}`} key={drillId}>
                                    <div className="block p-4 rounded-lg border border-zinc-700 hover:bg-zinc-800 transition-colors cursor-pointer">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">Voir l'exercice recommandé</span>
                                            <ArrowRight className="h-4 w-4 text-zinc-400" />
                                        </div>
                                        {/* We only have ID here, ideally we should fetch drill details or store title in feedback */}
                                        <p className="text-xs text-zinc-500 mt-1">ID: {drillId}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}


