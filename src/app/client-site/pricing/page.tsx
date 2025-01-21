export default function PricingPage() {
    const plans = [
        {
            name: 'Basic',
            price: '$15',
            storage: '500 GB',
            bandwidth: '2 TB',
            features: [
                'NVMe SSD Storage',
                '1Gbps Network',
                'Daily Backups',
                'Basic Support',
            ],
        },
        {
            name: 'Pro',
            price: '$35',
            storage: '2 TB',
            bandwidth: '5 TB',
            features: [
                'NVMe SSD Storage',
                '10Gbps Network',
                'Hourly Backups',
                'Priority Support',
                'DDoS Protection',
            ],
            popular: true,
        },
        {
            name: 'Enterprise',
            price: '$75',
            storage: '5 TB',
            bandwidth: '10 TB',
            features: [
                'NVMe SSD Storage',
                '10Gbps Network',
                'Real-time Backups',
                '24/7 Premium Support',
                'Advanced DDoS Protection',
                'Dedicated Resources',
            ],
        },
    ]

    return (
        <div className="py-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4">
                        Simple, Transparent Pricing
                    </h1>
                    <p className="text-xl text-gray-600">
                        Choose the plan that best fits your needs
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                    {plans.map(plan => (
                        <div
                            key={plan.name}
                            className={`rounded-lg border ${
                                plan.popular
                                    ? 'border-blue-500 shadow-lg'
                                    : 'border-gray-200'
                            } p-8 relative`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 bg-blue-500 text-white px-4 py-1 rounded-bl-lg rounded-tr-lg text-sm font-medium">
                                    Most Popular
                                </div>
                            )}
                            <div className="text-2xl font-bold mb-2">
                                {plan.name}
                            </div>
                            <div className="text-4xl font-bold mb-6">
                                {plan.price}
                                <span className="text-lg font-normal text-gray-600">
                                    /mo
                                </span>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center space-x-2">
                                    <span className="font-semibold">
                                        Storage:
                                    </span>
                                    <span>{plan.storage}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <span className="font-semibold">
                                        Bandwidth:
                                    </span>
                                    <span>{plan.bandwidth}</span>
                                </div>
                            </div>

                            <div className="space-y-3 mb-8">
                                {plan.features.map(feature => (
                                    <div
                                        key={feature}
                                        className="flex items-center space-x-3"
                                    >
                                        <svg
                                            className="h-5 w-5 text-green-500"
                                            fill="none"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path d="M5 13l4 4L19 7"></path>
                                        </svg>
                                        <span>{feature}</span>
                                    </div>
                                ))}
                            </div>

                            <button
                                className={`w-full py-3 rounded-lg font-semibold ${
                                    plan.popular
                                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                } transition-colors`}
                            >
                                Get Started
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
