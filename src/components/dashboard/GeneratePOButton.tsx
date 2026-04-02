"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Loader2, Truck } from "lucide-react"
import { generatePurchaseOrders } from "@/app/actions/purchase-orders"

export function GeneratePOButton() {
    const [isLoading, setIsLoading] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    const handleGenerate = async () => {
        setIsLoading(true)
        try {
            const res = await generatePurchaseOrders()
            if (res.success) {
                const count = res.count || 0
                toast({
                    title: count > 0 ? "Purchase Order Generated" : "Inventory Healthy",
                    description: res.message,
                })
                if (count > 0) {
                    router.push("/store/inventory/purchase-orders")
                }
            } else {
                toast({
                    title: "Error",
                    description: res.error,
                    variant: "destructive"
                })
            }
        } catch (error) {
            toast({
                title: "Critcal Failure",
                description: "The neural link to the logistics engine was interrupted.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Button
            className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 rounded-xl group transition-all"
            onClick={handleGenerate}
            disabled={isLoading}
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Truck className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            )}
            {isLoading ? "Generating..." : "Generate Purchase Orders"}
        </Button>
    )
}
