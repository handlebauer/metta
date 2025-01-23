import Image from 'next/image'
import Link from 'next/link'

export function HeroSection({ isLoggedIn }: { isLoggedIn: boolean }) {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] w-full">
            <div className="container mx-auto flex items-center justify-center">
                <div className="relative w-full max-w-[580px]">
                    <div className="pointer-events-none absolute -right-[250px] top-1/2 hidden -translate-y-1/2 select-none lg:block">
                        <Image
                            src="/ai.png"
                            alt="AI and Human Connection Visualization"
                            width={360}
                            height={512}
                            className="object-contain opacity-95"
                            priority
                        />
                    </div>

                    <div className="relative z-10 flex -translate-x-14 flex-col items-center">
                        <h1 className="scroll-m-20 text-center font-outfit text-4xl font-bold leading-[1.3] tracking-tight lg:text-5xl lg:leading-[1.2]">
                            Support with{' '}
                            <span className="whitespace-nowrap rounded-[8px] bg-accent-purple p-2 tracking-wide">
                                Balance
                            </span>
                        </h1>

                        <p className="mt-4 max-w-[550px] text-center font-medium text-gray-500 dark:text-gray-400">
                            Harmonizing AI efficiency with authentic human
                            connection
                        </p>

                        <div className="-ml-12 mt-8 flex gap-2">
                            <Link
                                href="/login"
                                className="relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl bg-zinc-900 px-6 py-3 text-white shadow-lg shadow-zinc-900/20 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-zinc-100/20 dark:hover:bg-zinc-200"
                            >
                                <div className="relative z-10 flex items-center gap-2">
                                    {isLoggedIn ? 'Dashboard' : 'Get Started'}
                                </div>
                            </Link>
                            <a
                                href="#features"
                                className="relative inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl bg-zinc-100 px-6 py-3 text-zinc-900 shadow-lg shadow-zinc-900/20 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:shadow-zinc-100/20 dark:hover:bg-zinc-700"
                            >
                                <div className="relative z-10 flex items-center gap-2">
                                    See Features
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
