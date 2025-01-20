import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import { SignIn } from '@/components/auth/sign-in.client'

export default function LoginPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6">
            <Card className="w-full max-w-sm">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">
                        Welcome back
                    </CardTitle>
                    <CardDescription className="text-center">
                        Sign in to your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <SignIn />
                </CardContent>
            </Card>
        </main>
    )
}
