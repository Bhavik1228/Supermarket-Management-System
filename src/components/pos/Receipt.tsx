
import React from 'react'

interface ReceiptProps {
    order: {
        id: string
        items: any[]
        total: number
        subtotal: number
        tax: number
        paymentMethod: string
        customer?: {
            name: string
            pointsEarned?: number
        }
    }
    store?: {
        name: string
        address: string
        phone: string
        email?: string
    }
}

export const Receipt = React.forwardRef<HTMLDivElement, ReceiptProps>(({ order, store }, ref) => {
    // Default store info if not provided
    const storeInfo = store || {
        name: "Fresh Mart",
        address: "123 Grocery Lane, Market City",
        phone: "(555) 123-4567"
    }
    return (
        <div ref={ref} className="p-4 text-xs font-mono w-[80mm] mx-auto bg-white text-black">
            <div className="text-center mb-4">
                <h1 className="text-lg font-bold uppercase">{storeInfo.name}</h1>
                <p>{storeInfo.address}</p>
                <p>Tel: {storeInfo.phone}</p>
            </div>

            <div className="mb-4 border-b pb-2">
                <p>Order: #{order.id.slice(-6)}</p>
                <p>Date: {new Date().toLocaleString()}</p>
                <p>Cashier: John Doe</p> {/* TODO: Get actual cashier name */}
            </div>

            <div className="space-y-1 mb-4 border-b pb-2">
                {order.items.map((item, i) => (
                    <div key={i} className="flex justify-between">
                        <span>{item.quantity}x {item.name}</span>
                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                ))}
            </div>

            <div className="space-y-1 mb-4 border-b pb-2">
                <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${order.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Tax (10%)</span>
                    <span>${order.tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-sm mt-1">
                    <span>TOTAL</span>
                    <span>${order.total.toFixed(2)}</span>
                </div>
            </div>

            <div className="mb-4">
                <p className="uppercase">Paid via: {order.paymentMethod}</p>
            </div>

            {order.customer && (
                <div className="text-center border-t pt-2 mb-4">
                    <p className="font-bold">Loyalty Member</p>
                    <p>{order.customer.name}</p>
                    <p>Points Earned: +{order.customer.pointsEarned || 0}</p>
                </div>
            )}

            <div className="text-center">
                <p>Thank you for shopping!</p>
                <p className="mt-1">*** COPY ***</p>
            </div>
        </div>
    )
})

Receipt.displayName = "Receipt"
