import Link from 'next/link'

export function HeroSection() {
    return (
        <div className="flex min-h-[calc(100vh-4rem)] w-full p-4">
            <div className="flex w-full flex-col items-center justify-center p-3">
                <h1 className="max-w-[500px] scroll-m-20 text-center text-5xl font-bold leading-[70px] tracking-tight">
                    Support with{' '}
                    <span className="rounded-[8px] bg-purple-100 p-2">
                        Mindfulness
                    </span>
                </h1>
                <p className="mx-auto mt-2 max-w-[600px] text-center text-gray-500 dark:text-gray-400 md:text-lg">
                    AI-powered customer relationships that feel genuinely human
                </p>

                <div className="mt-2 flex gap-2">
                    <Link
                        href="/login"
                        className="relative mt-4 inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl bg-zinc-900 px-6 py-3 text-white shadow-lg shadow-zinc-900/20 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:shadow-zinc-100/20 dark:hover:bg-zinc-200"
                    >
                        <div className="relative z-10 flex items-center gap-2">
                            Get Started
                        </div>
                    </Link>
                    <a
                        href="#features"
                        className="relative mt-4 inline-flex cursor-pointer items-center gap-2 overflow-hidden rounded-xl bg-zinc-100 px-6 py-3 text-zinc-900 shadow-lg shadow-zinc-900/20 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-100 dark:shadow-zinc-100/20 dark:hover:bg-zinc-700"
                    >
                        <div className="relative z-10 flex items-center gap-2">
                            Learn More
                        </div>
                    </a>
                </div>
            </div>
        </div>
    )
}
