"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Plus, ShoppingCart, Users, Package,
    FileText, Zap, X, ChevronUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function QuickActions() {
    const [isOpen, setIsOpen] = useState(false)

    const actions = [
        { label: "New Sale", icon: ShoppingCart, href: "/store/owner-pos", color: "bg-blue-500" },
        { label: "Add Product", icon: Package, href: "/store/products/new", color: "bg-emerald-500" },
        { label: "New Invoice", icon: FileText, href: "/store/documents/create?type=invoice", color: "bg-purple-500" },
        { label: "Add Supplier", icon: Users, href: "/store/suppliers", color: "bg-amber-500" },
    ]

    return (
        <div className="fixed bottom-8 right-8 z-[100]">
            <AnimatePresence>
                {isOpen && (
                    <div className="flex flex-col-reverse gap-4 mb-4 items-end">
                        {actions.map((action, idx) => (
                            <motion.div
                                key={action.label}
                                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.5, y: 50 }}
                                transition={{ delay: idx * 0.05, type: "spring", stiffness: 300, damping: 20 }}
                            >
                                <Link href={action.href}>
                                    <div className="group flex items-center gap-3">
                                        <span className="bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-black text-slate-900 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity border border-slate-100">
                                            {action.label}
                                        </span>
                                        <div className={`${action.color} h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-blue-500/20 group-hover:scale-110 transition-transform`}>
                                            <action.icon className="h-5 w-5" />
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                )}
            </AnimatePresence>

            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                className={`h-16 w-16 rounded-[2rem] flex items-center justify-center text-white shadow-2xl transition-all duration-500 ${isOpen ? 'bg-slate-900 rotate-45' : 'bg-primary shadow-primary/30'}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
            >
                {isOpen ? <X className="h-6 w-6" /> : <Zap className="h-6 w-6 fill-white" />}
            </motion.button>
        </div>
    )
}
