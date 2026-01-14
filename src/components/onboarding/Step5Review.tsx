import { Button } from "@/components/ui/button"

interface Step5Props {
    data: any
}

export function Step5Review({ data }: Step5Props) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold text-lg">Account Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Owner:</span>
                    <span>{data.ownerName}</span>
                    <span className="text-muted-foreground">Email:</span>
                    <span>{data.email}</span>
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{data.phone}</span>
                </div>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold text-lg">Store Information</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Name:</span>
                    <span>{data.storeName}</span>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="capitalize">{data.storeType}</span>
                    <span className="text-muted-foreground">Reg. Number:</span>
                    <span>{data.regNumber}</span>
                </div>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold text-lg">Location</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">Address:</span>
                    <span>{data.address}</span>
                    <span className="text-muted-foreground">City/Zip:</span>
                    <span>{data.city}, {data.zip}</span>
                    <span className="text-muted-foreground">Country:</span>
                    <span>{data.country}</span>
                </div>
            </div>

            <div className="space-y-4 rounded-lg border p-4">
                <h3 className="font-semibold text-lg">Documents</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="text-muted-foreground">License:</span>
                    <span>{data.licenseFile ? "Uploaded" : "Pending"}</span>
                    <span className="text-muted-foreground">Tax Docs:</span>
                    <span>{data.taxFile ? "Uploaded" : "Pending"}</span>
                </div>
            </div>
        </div>
    )
}
