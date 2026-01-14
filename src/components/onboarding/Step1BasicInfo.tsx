import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Step1Props {
    data: any
    updateData: (data: any) => void
}

export function Step1BasicInfo({ data, updateData }: Step1Props) {
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-2">
                <Label htmlFor="ownerName">Owner Name</Label>
                <Input
                    id="ownerName"
                    placeholder="John Doe"
                    value={data.ownerName || ""}
                    onChange={(e) => updateData({ ownerName: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={data.email || ""}
                    onChange={(e) => updateData({ email: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={data.password || ""}
                    onChange={(e) => updateData({ password: e.target.value })}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    value={data.phone || ""}
                    onChange={(e) => updateData({ phone: e.target.value })}
                />
            </div>
        </div>
    )
}
