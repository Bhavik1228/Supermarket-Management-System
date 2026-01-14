import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Step2Props {
    data: any
    updateData: (data: any) => void
}

export function Step2BusinessInfo({ data, updateData }: Step2Props) {
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <Label htmlFor="storeName">Store Name</Label>
                <Input
                    id="storeName"
                    placeholder="SuperMart Express"
                    value={data.storeName || ""}
                    onChange={(e) => updateData({ storeName: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="storeType">Store Type</Label>
                <select
                    id="storeType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={data.storeType || ""}
                    onChange={(e) => updateData({ storeType: e.target.value })}
                >
                    <option value="">Select a type</option>
                    <option value="supermarket">Supermarket</option>
                    <option value="grocery">Grocery Mini-Mart</option>
                    <option value="hypermarket">Hypermarket</option>
                    <option value="convenience">Convenience Store</option>
                </select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="regNumber">Business Registration Number</Label>
                <Input
                    id="regNumber"
                    placeholder="REG-12345678"
                    value={data.regNumber || ""}
                    onChange={(e) => updateData({ regNumber: e.target.value })}
                />
            </div>
        </div>
    )
}
