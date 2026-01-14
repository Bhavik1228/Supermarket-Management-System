"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Step1BasicInfo } from "@/components/onboarding/Step1BasicInfo"
import { Step2BusinessInfo } from "@/components/onboarding/Step2BusinessInfo"
import { Step3Address } from "@/components/onboarding/Step3Address"
import { Step4Documents } from "@/components/onboarding/Step4Documents"
import { Step5Review } from "@/components/onboarding/Step5Review"
import { CheckCircle2, Circle, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const STEPS = [
    { id: 1, title: "Account", description: "Create your owner account" },
    { id: 2, title: "Business", description: "Store details & type" },
    { id: 3, title: "Location", description: "Address & operations" },
    { id: 4, title: "Documents", description: "Upload verification docs" },
    { id: 5, title: "Review", description: "Final check & submit" },
]

export default function RegisterStorePage() {
    const router = useRouter()
    const [currentStep, setCurrentStep] = useState(1)
    const [formData, setFormData] = useState<any>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const updateFormData = (newData: any) => {
        setFormData((prev: any) => ({ ...prev, ...newData }))
    }

    const handleNext = () => {
        if (currentStep < STEPS.length) {
            setCurrentStep((prev) => prev + 1)
        } else {
            handleSubmit()
        }
    }

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1)
        }
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        setError("")

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.ownerName || formData.name,
                    email: formData.email,
                    password: formData.password,
                    storeName: formData.storeName,
                    storeType: formData.storeType || 'SUPERMARKET',
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || 'Registration failed')
                setIsSubmitting(false)
                return
            }

            setSuccess(true)
            // Redirect to login after 2 seconds
            setTimeout(() => {
                router.push('/login')
            }, 2000)
        } catch (err) {
            setError('An error occurred. Please try again.')
            setIsSubmitting(false)
        }
    }


    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="mb-8">
                <div className="flex items-center justify-between relative">
                    <div className="absolute left-0 top-1/2 w-full h-0.5 bg-muted -z-10" />
                    {STEPS.map((step) => {
                        const isCompleted = step.id < currentStep
                        const isCurrent = step.id === currentStep
                        return (
                            <div key={step.id} className="flex flex-col items-center bg-background px-2">
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300",
                                        isCompleted || isCurrent
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-muted-foreground bg-background text-muted-foreground"
                                    )}
                                >
                                    {isCompleted ? (
                                        <CheckCircle2 className="w-5 h-5" />
                                    ) : (
                                        <span className="text-sm font-medium">{step.id}</span>
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        "text-xs mt-2 font-medium hidden sm:block",
                                        isCurrent ? "text-primary" : "text-muted-foreground"
                                    )}
                                >
                                    {step.title}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>

            <Card className="border-2">
                <CardHeader>
                    <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
                    <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                            <AlertCircle className="h-4 w-4" />
                            <span className="text-sm">{error}</span>
                        </div>
                    )}
                    {success && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
                            <CheckCircle2 className="h-4 w-4" />
                            <span className="text-sm">Registration successful! Redirecting to login...</span>
                        </div>
                    )}
                    {currentStep === 1 && <Step1BasicInfo data={formData} updateData={updateFormData} />}
                    {currentStep === 2 && <Step2BusinessInfo data={formData} updateData={updateFormData} />}
                    {currentStep === 3 && <Step3Address data={formData} updateData={updateFormData} />}
                    {currentStep === 4 && <Step4Documents data={formData} updateData={updateFormData} />}
                    {currentStep === 5 && <Step5Review data={formData} />}
                </CardContent>
                <CardFooter className="flex justify-between">
                    <Button
                        variant="outline"
                        onClick={handleBack}
                        disabled={currentStep === 1 || isSubmitting || success}
                    >
                        Back
                    </Button>
                    <Button onClick={handleNext} disabled={isSubmitting || success}>
                        {currentStep === STEPS.length ? (isSubmitting ? "Submitting..." : "Submit Application") : "Next Step"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}
