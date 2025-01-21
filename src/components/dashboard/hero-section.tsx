import Image from 'next/image'
import Link from 'next/link'

export function HeroSection({ isLoggedIn }: { isLoggedIn: boolean }) {
    return (
        <div className="flex w-full min-h-[calc(100vh-4rem)]">
            <div className="container mx-auto flex items-center justify-center">
                <div className="relative w-full max-w-[580px]">
                    <div className="absolute -right-[250px] top-1/2 -translate-y-1/2 hidden lg:block pointer-events-none select-none">
                        <Image
                            src="/ai.png"
                            alt="AI and Human Connection Visualization"
                            width={360}
                            height={512}
                            className="object-contain opacity-95"
                            priority
                        />
                    </div>

                    <div className="relative z-10 flex flex-col items-center -translate-x-14">
                        <h1 className="font-outfit scroll-m-20 text-4xl lg:text-5xl font-bold tracking-tight leading-[1.3] lg:leading-[1.2] text-center">
                            Support with{' '}
                            <span className="p-2 bg-purple-100 rounded-[8px] whitespace-nowrap tracking-wide">
                                Balance
                            </span>
                        </h1>

                        <p className="text-gray-500 mt-4 dark:text-gray-400 max-w-[550px] text-center font-medium">
                            Harmonizing AI efficiency with authentic human
                            connection
                        </p>

                        <div className="flex gap-2 mt-8 -ml-12">
                            <Link
                                href="/login"
                                className="relative cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-xl overflow-hidden shadow-lg shadow-zinc-900/20 dark:shadow-zinc-100/20"
                            >
                                <div className="relative z-10 flex items-center gap-2">
                                    {isLoggedIn ? 'Dashboard' : 'Get Started'}
                                </div>
                            </Link>
                            <a
                                href="#features"
                                className="relative cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl overflow-hidden shadow-lg shadow-zinc-900/20 dark:shadow-zinc-100/20"
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
