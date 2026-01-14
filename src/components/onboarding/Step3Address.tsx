import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Step3Props {
    data: any
    updateData: (data: any) => void
}

export function Step3Address({ data, updateData }: Step3Props) {
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <Label htmlFor="address">Main Branch Address</Label>
                <Input
                    id="address"
                    placeholder="123 Market Street"
                    value={data.address || ""}
                    onChange={(e) => updateData({ address: e.target.value })}
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                        id="city"
                        placeholder="New York"
                        value={data.city || ""}
                        onChange={(e) => updateData({ city: e.target.value })}
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input
                        id="zip"
                        placeholder="10001"
                        value={data.zip || ""}
                        onChange={(e) => updateData({ zip: e.target.value })}
                    />
                </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                    id="country"
                    placeholder="United States"
                    value={data.country || ""}
                    onChange={(e) => updateData({ country: e.target.value })}
                />
            </div>
        </div>
    )
}
