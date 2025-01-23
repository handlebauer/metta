import { Brand } from '@/components/ui/brand'
import { FeaturesSection } from '@/components/dashboard/feature-section'
import { HeroSection } from '@/components/dashboard/hero-section'
import { UserNav } from '@/components/dashboard/user-nav'
import { getAuthenticatedUserWithProfile } from '@/actions/user-with-profile.actions'

export default async function HomePage() {
    const { data: user } = await getAuthenticatedUserWithProfile()

    return (
        <div className="h-screen flex flex-col">
            <header className="flex-none">
                <div className="flex h-16 items-center px-4">
                    <Brand>metta</Brand>
                    <div className="ml-auto flex items-center gap-4">
                        {user && <UserNav user={user} />}
                    </div>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto snap-y snap-mandatory">
                <section className="h-[calc(100vh-4rem)] snap-start snap-always">
                    <HeroSection isLoggedIn={!!user} />
                </section>

                <section
                    id="features"
                    className="h-[calc(100vh-4rem)] snap-start snap-always bg-muted/30 overflow-hidden"
                >
                    <div className="container h-full flex flex-col justify-center overflow-y-auto">
                        <FeaturesSection />
                    </div>
                </section>
            </main>
        </div>
    )
}
