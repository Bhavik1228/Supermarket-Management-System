import React, { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { Order, OrderItem, User } from "@prisma/client"

interface DocumentProps {
    type: 'INVOICE' | 'QUOTATION' | 'DELIVERY_NOTE' | 'PROFORMA_INVOICE' | 'STATEMENT'
    order: any
}

export const ProfessionalDocument = forwardRef<HTMLDivElement, DocumentProps>(({ type, order }, ref) => {
    const isQuotation = type === 'QUOTATION'
    const isDeliveryNote = type === 'DELIVERY_NOTE'
    const isProforma = type === 'PROFORMA_INVOICE'
    const isStatement = type === 'STATEMENT'

    const getDocId = () => {
        const prefix = isQuotation ? 'QUO' : isProforma ? 'PRO' : isStatement ? 'STM' : isDeliveryNote ? 'DLV' : 'INV'
        return `${prefix}-${order.id.slice(-8).toUpperCase()}`
    }

    return (
        <div ref={ref} className="p-16 bg-white min-h-[1050px] font-sans text-slate-800 flex flex-col">
            {/* Header */}
            <header className="flex justify-between items-start border-b-8 border-slate-900 pb-10 mb-10">
                <div className="space-y-4">
                    <div className="h-16 w-16 bg-slate-900 flex items-center justify-center text-white rounded-2xl shadow-xl">
                        <span className="text-4xl font-black italic">FM</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter">Fresh Mart</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.4em]">Enterprise Supply Chain Node</p>
                    </div>
                </div>
                <div className="text-right space-y-2">
                    <h2 className="text-6xl font-black text-slate-900 opacity-10 uppercase italic leading-none">{type}</h2>
                    <div className="pt-4">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Document Registry</p>
                        <p className="text-xl font-bold text-slate-900">{getDocId()}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Issued: {new Date().toLocaleDateString()}</p>
                    </div>
                </div>
            </header>

            {/* Entity Block */}
            <div className="grid grid-cols-2 gap-20 mb-16">
                <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 pb-2">Issuer Protocol</h3>
                    <div className="space-y-1">
                        <p className="font-bold text-slate-900">Fresh Mart Headquarters</p>
                        <p className="text-xs text-slate-500">102 Logistic Way, Port Sector</p>
                        <p className="text-xs text-slate-500">Tanzania, East Africa</p>
                        <p className="text-xs font-bold text-slate-900 mt-2">+255 700 000 000</p>
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em] border-b border-slate-100 pb-2">Recipient Node</h3>
                    <div className="space-y-1">
                        <p className="font-bold text-slate-900 tracking-tight">{order.customer?.name || order.customerEmail || 'Global Sub-Client'}</p>
                        <p className="text-xs text-slate-500">{order.customerAddress || 'No primary address registered'}</p>
                        <p className="text-xs text-slate-500">{order.customerPhone || 'N/A'}</p>
                        <p className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded inline-block mt-2 uppercase">Verified Identity</p>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="flex-1">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b-2 border-slate-900">
                            <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Description</th>
                            <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Qty</th>
                            {!isDeliveryNote && <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Unit Price</th>}
                            {!isDeliveryNote && <th className="py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Extended</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {order.items.map((item: any, i: number) => (
                            <tr key={i}>
                                <td className="py-6">
                                    <p className="font-bold text-slate-900">{item.name}</p>
                                    <p className="text-[9px] text-slate-400 uppercase font-medium">{item.product?.category || 'General SKU'}</p>
                                </td>
                                <td className="py-6 text-center font-bold text-slate-900">{item.quantity}</td>
                                {!isDeliveryNote && <td className="py-6 text-right font-medium text-slate-500">${item.price.toFixed(2)}</td>}
                                {!isDeliveryNote && <td className="py-6 text-right font-bold text-slate-900">${(item.quantity * item.price).toFixed(2)}</td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Calculations / Summary */}
            {!isDeliveryNote && (
                <div className="flex justify-end pt-10 border-t-2 border-slate-100">
                    <div className="w-64 space-y-4">
                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <span>Subtotal</span>
                            <span className="text-slate-900">${order.subtotal?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <span>Regulatory Tax</span>
                            <span className="text-slate-900">${order.tax?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <span>Loyalty Disc.</span>
                            <span className="text-emerald-500">-${order.discount?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between pt-6 border-t-4 border-slate-900 items-baseline">
                            <span className="text-sm font-black uppercase italic tracking-tighter">Grand Total</span>
                            <span className="text-3xl font-black text-slate-900 tracking-tighter">${order.total?.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            )}

            {isDeliveryNote && (
                <div className="grid grid-cols-2 gap-20 pt-10 border-t-2 border-slate-100">
                    <div className="space-y-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dispatch verification</p>
                        <div className="h-24 w-full border-2 border-dashed border-slate-200 rounded-3xl" />
                        <p className="text-[8px] text-slate-400 text-center font-bold uppercase">Store Manager Signature</p>
                    </div>
                    <div className="space-y-4">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Recipient acknowledgment</p>
                        <div className="h-24 w-full border-2 border-dashed border-slate-200 rounded-3xl" />
                        <p className="text-[8px] text-slate-400 text-center font-bold uppercase">Customer Signature</p>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="mt-20 pt-10 border-t border-slate-100 text-center space-y-4">
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Generated by MarketPulse Enterprise Protocol</p>
                <div className="flex justify-center gap-10">
                    <p className="text-[8px] text-slate-400 font-medium">www.freshmart.pos</p>
                    <p className="text-[8px] text-slate-400 font-medium">compliance@freshmart.pos</p>
                    <p className="text-[8px] text-slate-400 font-medium">Verified System Record</p>
                </div>
            </footer>
        </div>
    )
})

ProfessionalDocument.displayName = 'ProfessionalDocument'
