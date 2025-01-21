export default function HomePage() {
    return (
        <div className="max-w-6xl mx-auto px-4">
            {/* Main Headline */}
            <div className="text-center py-16">
                <h1 className="text-4xl font-bold mb-4">
                    Get Started in Less than 5 Minutes
                </h1>
                <p className="text-xl text-gray-600 mb-8">
                    Choose your perfect hosting solution
                </p>
            </div>

            {/* HDD Plans Section */}
            <div className="mb-20">
                <h2 className="text-2xl font-semibold mb-6">
                    Storage-Optimized Plans
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                            className={`border rounded-lg p-6 ${
                                plan.popular
                                    ? 'border-blue-500 shadow-lg relative'
                                    : 'hover:border-blue-500'
                            } transition-colors`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg">
                                    Most Popular
                                </div>
                            )}
                            <div className="font-semibold mb-2">
                                {plan.name}
                            </div>
                            <div className="text-2xl font-bold mb-4">
                                ${plan.price}
                                <span className="text-lg font-normal text-gray-600">
                                    /month
                                </span>
                            </div>
                            <div className="space-y-3 text-sm mb-6">
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
                            <div className="text-xs text-green-600 mb-4">
                                Available immediately
                            </div>
                            <button className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700 transition-colors">
                                Order Now
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* NVMe Plans Section */}
            <div className="mb-20">
                <h2 className="text-2xl font-semibold mb-6">
                    Performance-Optimized NVMe Plans
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                            className={`border rounded-lg p-6 ${
                                plan.popular
                                    ? 'border-blue-500 shadow-lg relative'
                                    : 'hover:border-blue-500'
                            } transition-colors`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-3 py-1 rounded-bl-lg rounded-tr-lg">
                                    Most Popular
                                </div>
                            )}
                            <div className="font-semibold mb-2">
                                {plan.name}
                            </div>
                            <div className="text-2xl font-bold mb-4">
                                ${plan.price}
                                <span className="text-lg font-normal text-gray-600">
                                    /month
                                </span>
                            </div>
                            <div className="space-y-3 text-sm mb-6">
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
                            <div className="text-xs text-green-600 mb-4">
                                Available immediately
                            </div>
                            <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg px-4 py-2 text-sm hover:from-blue-700 hover:to-blue-800 transition-colors">
                                Order Now
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
                <div className="border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3">Easy to Use</h3>
                    <p className="text-gray-600 mb-4">
                        Get started in minutes with our one-click installers and
                        intuitive control panel. Everything you need, right in
                        your browser.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Instant setup</li>
                        <li>• User-friendly interface</li>
                        <li>• Automated management</li>
                    </ul>
                </div>

                <div className="border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3">Full Control</h3>
                    <p className="text-gray-600 mb-4">
                        Customize your environment exactly how you want it.
                        Install your own software or use our optimized
                        configurations.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Root access available</li>
                        <li>• Custom configurations</li>
                        <li>• Multiple OS options</li>
                    </ul>
                </div>

                <div className="border rounded-lg p-6">
                    <h3 className="text-lg font-semibold mb-3">24/7 Support</h3>
                    <p className="text-gray-600 mb-4">
                        Our expert team is always here to help. Get assistance
                        whenever you need it, day or night.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-2">
                        <li>• Live chat support</li>
                        <li>• Comprehensive wiki</li>
                        <li>• Community forums</li>
                    </ul>
                </div>
            </div>

            {/* FAQ Preview */}
            <div className="mb-20">
                <h2 className="text-2xl font-semibold mb-6">
                    Common Questions
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border rounded-lg p-6">
                        <h3 className="font-semibold mb-2">
                            What is off-peak bandwidth?
                        </h3>
                        <p className="text-gray-600 text-sm">
                            During peak hours, we optimize traffic to ensure the
                            best experience for all users. This typically
                            affects less than 5% of total usage time.
                        </p>
                    </div>
                    <div className="border rounded-lg p-6">
                        <h3 className="font-semibold mb-2">
                            Do you offer refunds?
                        </h3>
                        <p className="text-gray-600 text-sm">
                            Yes! We offer a 7-day money-back guarantee on all
                            new accounts. No questions asked.
                        </p>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="text-center pb-20">
                <h2 className="text-2xl font-semibold mb-4">
                    Need Help Choosing?
                </h2>
                <p className="text-gray-600 mb-6">
                    Our team is here to help you find the perfect plan for your
                    needs.
                </p>
                <button className="bg-blue-600 text-white rounded-lg px-8 py-3 hover:bg-blue-700 transition-colors">
                    Contact Support
                </button>
            </div>
        </div>
    )
}
