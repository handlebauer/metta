export default function HomePage() {
    return (
        <div className="mx-auto max-w-6xl px-4">
            {/* Main Headline */}
            <div className="py-16 text-center">
                <h1 className="mb-4 text-4xl font-bold">
                    Get Started in Less than 5 Minutes
                </h1>
                <p className="mb-8 text-xl text-gray-600">
                    Choose your perfect hosting solution
                </p>
            </div>

            {/* HDD Plans Section */}
            <div className="mb-20">
                <h2 className="mb-6 text-2xl font-semibold">
                    Storage-Optimized Plans
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {[
                        {
                            name: 'Basic',
                            storage: '1 TB',
                            price: 15,
                            network: '20 Gbps',
                        },
                        {
                            name: 'Pro',
                            storage: '2.5 TB',
                            price: 30,
                            network: '20 Gbps',
                            popular: true,
                        },
                        {
                            name: 'Elite',
                            storage: '5 TB',
                            price: 50,
                            network: '20 Gbps',
                        },
                    ].map(plan => (
                        <div
                            key={plan.name}
                            className={`rounded-lg border p-6 ${
                                plan.popular
                                    ? 'relative border-blue-500 shadow-lg'
                                    : 'hover:border-blue-500'
                            } transition-colors`}
                        >
                            {plan.popular && (
                                <div className="absolute right-0 top-0 rounded-bl-lg rounded-tr-lg bg-blue-500 px-3 py-1 text-xs text-white">
                                    Most Popular
                                </div>
                            )}
                            <div className="mb-2 font-semibold">
                                {plan.name}
                            </div>
                            <div className="mb-4 text-2xl font-bold">
                                ${plan.price}
                                <span className="text-lg font-normal text-gray-600">
                                    /month
                                </span>
                            </div>
                            <div className="mb-6 space-y-3 text-sm">
                                <div className="flex items-center text-gray-600">
                                    <span className="font-medium">
                                        {plan.storage}
                                    </span>
                                    <span className="mx-2">•</span>
                                    <span>HDD Storage</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <span className="font-medium">
                                        {plan.network}
                                    </span>
                                    <span className="mx-2">•</span>
                                    <span>Network</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <span className="font-medium">
                                        Unlimited
                                    </span>
                                    <span className="mx-2">•</span>
                                    <span>Traffic</span>
                                </div>
                            </div>
                            <div className="mb-4 text-xs text-green-600">
                                Available immediately
                            </div>
                            <button className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-700">
                                Order Now
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* NVMe Plans Section */}
            <div className="mb-20">
                <h2 className="mb-6 text-2xl font-semibold">
                    Performance-Optimized NVMe Plans
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {[
                        {
                            name: 'Speed',
                            storage: '200GB',
                            price: 40,
                            network: '40 Gbps',
                        },
                        {
                            name: 'Performance',
                            storage: '400GB',
                            price: 60,
                            network: '40 Gbps',
                        },
                        {
                            name: 'Ultimate',
                            storage: '800GB',
                            price: 100,
                            network: '40 Gbps',
                            popular: true,
                        },
                        {
                            name: 'Enterprise',
                            storage: '1.6TB',
                            price: 160,
                            network: '40 Gbps',
                        },
                    ].map(plan => (
                        <div
                            key={plan.name}
                            className={`rounded-lg border p-6 ${
                                plan.popular
                                    ? 'relative border-blue-500 shadow-lg'
                                    : 'hover:border-blue-500'
                            } transition-colors`}
                        >
                            {plan.popular && (
                                <div className="absolute right-0 top-0 rounded-bl-lg rounded-tr-lg bg-blue-500 px-3 py-1 text-xs text-white">
                                    Most Popular
                                </div>
                            )}
                            <div className="mb-2 font-semibold">
                                {plan.name}
                            </div>
                            <div className="mb-4 text-2xl font-bold">
                                ${plan.price}
                                <span className="text-lg font-normal text-gray-600">
                                    /month
                                </span>
                            </div>
                            <div className="mb-6 space-y-3 text-sm">
                                <div className="flex items-center text-gray-600">
                                    <span className="font-medium">
                                        {plan.storage}
                                    </span>
                                    <span className="mx-2">•</span>
                                    <span>NVMe Storage</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <span className="font-medium">
                                        {plan.network}
                                    </span>
                                    <span className="mx-2">•</span>
                                    <span>Network</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <span className="font-medium">RAID-0</span>
                                    <span className="mx-2">•</span>
                                    <span>Configuration</span>
                                </div>
                                <div className="flex items-center text-gray-600">
                                    <span className="font-medium">
                                        Unlimited
                                    </span>
                                    <span className="mx-2">•</span>
                                    <span>Traffic</span>
                                </div>
                            </div>
                            <div className="mb-4 text-xs text-green-600">
                                Available immediately
                            </div>
                            <button className="w-full rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-2 text-sm text-white transition-colors hover:from-blue-700 hover:to-blue-800">
                                Order Now
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features Grid */}
            <div className="mb-20 grid grid-cols-1 gap-8 md:grid-cols-3">
                <div className="rounded-lg border p-6">
                    <h3 className="mb-3 text-lg font-semibold">Easy to Use</h3>
                    <p className="mb-4 text-gray-600">
                        Get started in minutes with our one-click installers and
                        intuitive control panel. Everything you need, right in
                        your browser.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Instant setup</li>
                        <li>• User-friendly interface</li>
                        <li>• Automated management</li>
                    </ul>
                </div>

                <div className="rounded-lg border p-6">
                    <h3 className="mb-3 text-lg font-semibold">Full Control</h3>
                    <p className="mb-4 text-gray-600">
                        Customize your environment exactly how you want it.
                        Install your own software or use our optimized
                        configurations.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Root access available</li>
                        <li>• Custom configurations</li>
                        <li>• Multiple OS options</li>
                    </ul>
                </div>

                <div className="rounded-lg border p-6">
                    <h3 className="mb-3 text-lg font-semibold">24/7 Support</h3>
                    <p className="mb-4 text-gray-600">
                        Our expert team is always here to help. Get assistance
                        whenever you need it, day or night.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li>• Live chat support</li>
                        <li>• Comprehensive wiki</li>
                        <li>• Community forums</li>
                    </ul>
                </div>
            </div>

            {/* FAQ Preview */}
            <div className="mb-20">
                <h2 className="mb-6 text-2xl font-semibold">
                    Common Questions
                </h2>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="rounded-lg border p-6">
                        <h3 className="mb-2 font-semibold">
                            What is off-peak bandwidth?
                        </h3>
                        <p className="text-sm text-gray-600">
                            During peak hours, we optimize traffic to ensure the
                            best experience for all users. This typically
                            affects less than 5% of total usage time.
                        </p>
                    </div>
                    <div className="rounded-lg border p-6">
                        <h3 className="mb-2 font-semibold">
                            Do you offer refunds?
                        </h3>
                        <p className="text-sm text-gray-600">
                            Yes! We offer a 7-day money-back guarantee on all
                            new accounts. No questions asked.
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="pb-20 text-center">
                <h2 className="mb-4 text-2xl font-semibold">
                    Need Help Choosing?
                </h2>
                <p className="mb-6 text-gray-600">
                    Our team is here to help you find the perfect plan for your
                    needs.
                </p>
                <button className="rounded-lg bg-blue-600 px-8 py-3 text-white transition-colors hover:bg-blue-700">
                    Contact Support
                </button>
            </div>
        </div>
    )
}
