"use client"

import { useState, useEffect } from "react"
import { Search, User as UserIcon, X, Plus, Loader2, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { searchCustomers, createCustomer } from "@/app/actions/pos"

interface Customer {
    id: string
    name: string
    email: string
    points?: number
    tier?: string
}

interface CustomerSelectProps {
    onSelect: (customer: Customer | null) => void
    selectedCustomer: Customer | null
    className?: string
    inputClassName?: string
}

export function CustomerSelect({ onSelect, selectedCustomer, className, inputClassName }: CustomerSelectProps) {
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<Customer[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isSearching, setIsSearching] = useState(false)

    // Add Customer Form State
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [newName, setNewName] = useState("")
    const [newEmail, setNewEmail] = useState("")
    const [newPhone, setNewPhone] = useState("")
    const [isCreating, setIsCreating] = useState(false)

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 2) {
                setIsSearching(true)
                const data = await searchCustomers(query)
                setResults(data)
                setIsSearching(false)
                setIsOpen(true)
            } else {
                setResults([])
                setIsOpen(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [query])

    const handleAddCustomer = async () => {
        if (!newName || !newPhone) return alert("Name and Phone are required")
        setIsCreating(true)
        const res = await createCustomer({ name: newName, email: newEmail, phone: newPhone })
        setIsCreating(false)

        if (res.success && res.user) {
            onSelect(res.user)
            setIsAddOpen(false)
            setQuery("")
            setNewName("")
            setNewEmail("")
            setNewPhone("")
            setIsOpen(false)
        } else {
            alert(res.error || "Failed to create customer")
        }
    }

    if (selectedCustomer) {
        return (
            <div className={`flex items-center justify-between p-3 border rounded-lg bg-green-500/10 border-green-500/30 animate-in fade-in zoom-in-95 duration-200 ${className}`}>
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-green-500/20 flex items-center justify-center border border-green-500/30">
                        <UserIcon className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                        <p className="font-black text-xs uppercase tracking-widest text-slate-900">{selectedCustomer.name}</p>
                        <p className="text-[10px] text-slate-600 font-mono">{selectedCustomer.email}</p>
                        {selectedCustomer.points !== undefined && (
                            <p className="text-[10px] font-black text-amber-600 mt-1 flex items-center gap-2 uppercase tracking-tighter">
                                <span className="inline-block w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                                {selectedCustomer.points} PTS • {selectedCustomer.tier || 'Member'}
                            </p>
                        )}
                    </div>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-600 hover:text-slate-900 hover:bg-green-500/20" onClick={() => onSelect(null)}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
        )
    }

    return (
        <div className={`relative ${className}`}>
            <div className="relative group">
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${isSearching ? 'text-primary animate-pulse' : 'text-slate-500 group-focus-within:text-white'}`} />
                <Input
                    placeholder="Search Customer (Name/Phone)..."
                    className={`pl-10 ${inputClassName}`}
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value)
                    }}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                />
                <Button
                    size="icon"
                    variant="ghost"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-slate-500 hover:text-white"
                    onClick={() => setIsAddOpen(true)}
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            {isOpen && (
                <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-60 overflow-y-auto overflow-x-hidden p-1 shadow-2xl animate-in slide-in-from-top-2 border-white/10 bg-[#020617]/95 backdrop-blur-xl">
                    {results.length > 0 ? (
                        results.map(customer => (
                            <button
                                key={customer.id}
                                className="w-full text-left px-4 py-3 hover:bg-white/5 rounded-xl flex items-center gap-4 text-sm transition-all group"
                                onClick={() => {
                                    onSelect(customer)
                                    setIsOpen(false)
                                    setQuery("")
                                }}
                            >
                                <div className="h-9 w-9 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
                                    <UserIcon className="h-4 w-4 text-slate-400 group-hover:text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-black text-xs uppercase tracking-widest text-white">{customer.name}</p>
                                    <p className="text-[10px] text-slate-500 font-mono truncate">{customer.email}</p>
                                </div>
                            </button>
                        ))
                    ) : (
                        !isSearching && query.length >= 2 && (
                            <div className="p-4 text-center">
                                <p className="text-xs text-slate-500 font-black uppercase tracking-widest mb-4">No operative found.</p>
                                <Button
                                    size="sm"
                                    className="w-full h-10 rounded-xl bg-white text-slate-950 font-black text-[10px] uppercase tracking-widest hover:bg-slate-200"
                                    onClick={() => setIsAddOpen(true)}
                                >
                                    <Plus className="mr-2 h-4 w-4" /> REGISTER "{query}"
                                </Button>
                            </div>
                        )
                    )}
                </Card>
            )}
            {/* Add Customer Dialog - Always accessible */}
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                <DialogContent className="bg-slate-950 border-white/10 text-white rounded-[32px] sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black italic uppercase tracking-tighter">Operative Entry</DialogTitle>
                        <DialogDescription className="text-slate-500">Initiate a new loyalty profile for this agent.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Full Designation</Label>
                            <Input
                                className="h-12 bg-white/5 border-white/10 text-white font-black"
                                value={newName || (query.includes('@') ? '' : query)}
                                onChange={e => setNewName(e.target.value)}
                                placeholder="AGENT NAME..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Comm Link (Phone)</Label>
                            <Input
                                className="h-12 bg-white/5 border-white/10 text-white font-black"
                                value={newPhone || (!query.includes('@') && query.match(/^\d+$/) ? query : '')}
                                onChange={e => setNewPhone(e.target.value)}
                                placeholder="+255..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Digital ID (Email)</Label>
                            <Input
                                className="h-12 bg-white/5 border-white/10 text-white font-black"
                                value={newEmail || (query.includes('@') ? query : '')}
                                onChange={e => setNewEmail(e.target.value)}
                                placeholder="EMAIL@CORE.SYSTEM"
                            />
                        </div>
                        <Button onClick={handleAddCustomer} className="w-full h-14 bg-white text-slate-950 font-black rounded-2xl mt-4" disabled={isCreating}>
                            {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                            AUTHORIZE & SELECT
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
