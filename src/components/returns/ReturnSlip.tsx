"use client"

import { Card } from "@/components/ui/card"
import { Printer, Package, FileText } from "lucide-react"

interface ReturnSlipProps {
    orderId: string
    items: any[]
    total: number
    reason: string
    type: "CUSTOMER" | "VENDOR"
    timestamp: Date
}

export function ReturnSlip({ orderId, items, total, reason, type, timestamp }: ReturnSlipProps) {
    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="p-8 bg-white border border-slate-200 rounded-2xl shadow-sm max-w-lg mx-auto print:shadow-none print:border-none print:p-0">
            <div className="flex justify-between items-center mb-8 print:hidden">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-slate-600" />
                    </div>
                    <h3 className="font-bold text-slate-800">Return Authorization Slip</h3>
                </div>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all font-bold text-xs shadow-lg shadow-indigo-200"
                >
                    <Printer className="h-4 w-4" />
                    PRINT / SAVE PDF
                </button>
            </div>

            <div className="space-y-4 font-mono text-sm uppercase">
                <div className="text-center space-y-1">
                    <h2 className="text-2xl font-black tracking-tighter italic">FRESHMART</h2>
                    <p className="text-[10px] text-slate-500">Official Return Authorization</p>
                    <p className="text-[10px] text-slate-400">{timestamp.toLocaleString()}</p>
                </div>

                <div className="h-px bg-slate-200 w-full" />

                <div className="space-y-1">
                    <div className="flex justify-between">
                        <span className="text-slate-500">Type:</span>
                        <span className="font-bold">{type} RETURN</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-slate-500">Reference:</span>
                        <span className="font-bold">{orderId.slice(0, 12)}</span>
                    </div>
                </div>

                <div className="h-px bg-slate-200 w-full" />

                <div className="space-y-2">
                    <div className="grid grid-cols-4 font-bold text-[10px] text-slate-400">
                        <span className="col-span-2">ITEM</span>
                        <span className="text-right">QTY</span>
                        <span className="text-right">TOTAL</span>
                    </div>
                    {items.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-4 items-start text-[11px]">
                            <span className="col-span-2">{item.name}</span>
                            <span className="text-right">{item.returnQty || item.quantity}</span>
                            <span className="text-right">${(item.price * (item.returnQty || item.quantity)).toFixed(2)}</span>
                        </div>
                    ))}
                </div>

                <div className="h-px bg-slate-200 w-full" />

                <div className="space-y-1">
                    <div className="flex justify-between text-lg font-black italic">
                        <span>Grand Total:</span>
                        <span>${total.toFixed(2)}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 mt-2">
                        <span className="font-black">Reason:</span> {reason}
                    </div>
                </div>

                <div className="pt-8 text-center space-y-4">
                    <p className="text-[9px] text-slate-400">Please present this slip at the service counter for refund disbursement.</p>
                    <div className="h-10 w-full bg-slate-100 flex items-center justify-center rounded border border-slate-200">
                        <span className="text-[10px] tracking-[0.2em] font-black text-slate-300">AUTHORIZATION CODE: {Math.random().toString(36).substring(7).toUpperCase()}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
