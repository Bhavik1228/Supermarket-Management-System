"use client"

import React, { forwardRef } from "react"
import { ShoppingCart, Users, Truck, Lock, FileText, Calendar } from "lucide-react"

interface StatementTemplateProps {
    type: string
    title: string
    days: string
    data: any[]
    headers: string[]
}

export const StatementTemplate = forwardRef<HTMLDivElement, StatementTemplateProps>(({ type, title, days, data, headers }, ref) => {
    return (
        <div ref={ref} className="p-16 text-slate-900 bg-white min-h-[1000px] font-sans">
            {/* Header */}
            <div className="flex justify-between items-start mb-12 border-b-4 border-slate-900 pb-8">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">MarketPulse</h1>
                    <p className="text-sm font-bold text-slate-400 tracking-widest uppercase">Executive Business Intelligence</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-black text-slate-900">{title}</h2>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Period: Last {days} Days</p>
                    <p className="text-xs text-slate-400 mt-1">Generated: {new Date().toLocaleString()}</p>
                </div>
            </div>

            {/* Summary Block */}
            <div className="grid grid-cols-3 gap-8 mb-12">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Data Points</p>
                    <p className="text-2xl font-black">{data.length}</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                    <p className="text-2xl font-black text-emerald-600">VERIFIED</p>
                </div>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Security</p>
                    <p className="text-2xl font-black">ENCRYPTED</p>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-900 text-white">
                        <tr>
                            {headers.map(h => (
                                <th key={h} className="px-6 py-4 text-[10px] font-black uppercase tracking-widest">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {data.map((row, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                {headers.map(h => (
                                    <td key={h} className="px-6 py-4 text-sm font-medium text-slate-600">
                                        {row[h]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Footer */}
            <div className="mt-20 pt-8 border-t border-slate-100 text-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Official MarketPulse Document • Proprietary & Confidential</p>
                <div className="flex justify-center gap-12">
                    <div className="text-center">
                        <div className="h-0.5 w-32 bg-slate-200 mb-2 mx-auto" />
                        <p className="text-[9px] font-black text-slate-400 uppercase">System Auditor</p>
                    </div>
                    <div className="text-center">
                        <div className="h-0.5 w-32 bg-slate-200 mb-2 mx-auto" />
                        <p className="text-[9px] font-black text-slate-400 uppercase">Financial Officer</p>
                    </div>
                </div>
            </div>
        </div>
    )
})

StatementTemplate.displayName = "StatementTemplate"
