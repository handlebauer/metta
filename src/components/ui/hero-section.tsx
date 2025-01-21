import Link from 'next/link'

export function HeroSection() {
    return (
        <div className="flex w-full min-h-[calc(100vh-4rem)] p-4">
            <div className="flex flex-col items-center justify-center p-3 w-full">
                <h1 className="scroll-m-20 max-w-[500px] text-5xl font-bold tracking-tight leading-[70px] text-center">
                    Support with{' '}
                    <span className="p-2 bg-purple-100 rounded-[8px]">
                        Mindfulness
                    </span>
                </h1>
                <p className="mx-auto max-w-[600px] text-gray-500 md:text-lg text-center mt-2 dark:text-gray-400">
                    AI-powered customer relationships that feel genuinely human
                </p>

                <div className="flex gap-2 mt-2">
                    <Link
                        href="/login"
                        className="relative cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-xl overflow-hidden shadow-lg shadow-zinc-900/20 dark:shadow-zinc-100/20 mt-4"
                    >
                        <div className="relative z-10 flex items-center gap-2">
                            Get Started
                        </div>
                    </Link>
                    <a
                        href="#features"
                        className="relative cursor-pointer inline-flex items-center gap-2 px-6 py-3 bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-xl overflow-hidden shadow-lg shadow-zinc-900/20 dark:shadow-zinc-100/20 mt-4"
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
