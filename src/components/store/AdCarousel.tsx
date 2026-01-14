"use client"

import { useEffect, useState } from "react"
import { getCampaigns } from "@/app/actions/ads"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { Megaphone, ExternalLink, Sparkles } from "lucide-react"

export function AdCarousel() {
    const [ads, setAds] = useState<any[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function load() {
            const res = await getCampaigns()
            if (res.success) {
                // Only show active campaigns
                setAds(res.campaigns?.filter((ad: any) => ad.status === "ACTIVE") || [])
            }
            setLoading(false)
        }
        load()
    }, [])

    useEffect(() => {
        if (ads.length <= 1) return
        const interval = setInterval(() => {
            setCurrentIndex(prev => (prev + 1) % ads.length)
        }, 8000) // Rotate every 8 seconds
        return () => clearInterval(interval)
    }, [ads])

    if (loading || ads.length === 0) return null

    const currentAd = ads[currentIndex]

    return (
        <Card className="overflow-hidden border-none shadow-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white relative group">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />

            <CardContent className="p-0 relative h-32 flex items-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentAd.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5 }}
                        className="flex items-center gap-6 px-8 py-4 w-full"
                    >
                        <div className="h-16 w-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center flex-shrink-0 border border-white/20 shadow-xl group-hover:scale-110 transition-transform">
                            <Megaphone className="h-8 w-8 text-white rotate-[-10deg]" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <Badge className="bg-white/20 hover:bg-white/30 text-white border-none font-black text-[9px] tracking-widest uppercase py-0 px-2">
                                    Sponsored
                                </Badge>
                                <span className="text-[10px] font-bold opacity-60 uppercase tracking-tighter">{currentAd.client}</span>
                            </div>
                            <h3 className="text-xl font-black tracking-tight leading-tight truncate">
                                {currentAd.name}
                            </h3>
                            <p className="text-xs font-medium opacity-80 line-clamp-1 mt-1">
                                {currentAd.description || "Special offer available for a limited time. Don't miss out!"}
                            </p>
                        </div>

                        <div className="flex shrink-0 gap-4 items-center">
                            <div className="hidden md:block text-right">
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Revenue Boost</p>
                                <div className="flex items-center gap-1 text-amber-300 font-black">
                                    <Sparkles className="h-3 w-3" />
                                    <span>TOP PICK</span>
                                </div>
                            </div>
                            <button className="h-12 px-6 rounded-xl bg-white text-indigo-600 font-black text-xs uppercase tracking-widest shadow-xl hover:shadow-white/20 hover:-translate-y-0.5 transition-all flex items-center gap-2">
                                View Deal <ExternalLink className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Dots */}
                {ads.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {ads.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 rounded-full transition-all ${i === currentIndex ? 'w-4 bg-white' : 'w-1 bg-white/30'}`}
                            />
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
