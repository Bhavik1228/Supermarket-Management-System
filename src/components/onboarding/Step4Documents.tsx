import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Step4Props {
    data: any
    updateData: (data: any) => void
}

export function Step4Documents({ data, updateData }: Step4Props) {
    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="p-4 border-2 border-dashed rounded-lg bg-muted/50 text-center">
                <Label htmlFor="license" className="cursor-pointer block">
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Business License</p>
                        <p className="text-xs text-muted-foreground">Click to upload or drag and drop</p>
                        <Input
                            id="license"
                            type="file"
                            className="hidden"
                            onChange={(e) => updateData({ licenseFile: e.target.files?.[0]?.name })}
                        />
                        {data.licenseFile && (
                            <p className="text-sm text-green-600 font-medium mt-2">
                                Selected: {data.licenseFile}
                            </p>
                        )}
                    </div>
                </Label>
            </div>

            <div className="p-4 border-2 border-dashed rounded-lg bg-muted/50 text-center">
                <Label htmlFor="taxDoc" className="cursor-pointer block">
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Tax Documents</p>
                        <p className="text-xs text-muted-foreground">Click to upload or drag and drop</p>
                        <Input
                            id="taxDoc"
                            type="file"
                            className="hidden"
                            onChange={(e) => updateData({ taxFile: e.target.files?.[0]?.name })}
                        />
                        {data.taxFile && (
                            <p className="text-sm text-green-600 font-medium mt-2">
                                Selected: {data.taxFile}
                            </p>
                        )}
                    </div>
                </Label>
            </div>
        </div>
    )
}
