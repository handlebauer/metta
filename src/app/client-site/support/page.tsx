export default function SupportPage() {
    const faqs = [
        {
            question: 'How do I get started with my hosting plan?',
            answer: "After purchasing a plan, you'll receive login credentials via email. Use these to access your control panel where you can manage your hosting resources.",
        },
        {
            question: 'What backup options are available?',
            answer: 'We offer automated backups with all plans. Basic plans include daily backups, Pro plans include hourly backups, and Enterprise plans feature real-time backups.',
        },
        {
            question: 'Do you offer refunds?',
            answer: "Yes, we offer a 30-day money-back guarantee on all new hosting plans. If you're not satisfied, simply contact our support team.",
        },
        {
            question: 'How do I upgrade my plan?',
            answer: 'You can upgrade your plan at any time through your control panel. The price difference will be prorated for your current billing period.',
        },
    ]

    return (
        <div className="py-20">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-bold mb-4">Help Center</h1>
                    <p className="text-xl text-gray-600">
                        Find answers to common questions or get in touch with
                        our support team
                    </p>
                </div>

                {/* FAQs Section */}
                <div className="max-w-3xl mx-auto mb-20">
                    <h2 className="text-2xl font-bold mb-8">
                        Frequently Asked Questions
                    </h2>
                    <div className="space-y-6">
                        {faqs.map(faq => (
                            <div
                                key={faq.question}
                                className="border border-gray-200 rounded-lg p-6"
                            >
                                <h3 className="text-lg font-semibold mb-2">
                                    {faq.question}
                                </h3>
                                <p className="text-gray-600">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Support Section */}
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-2xl font-bold mb-4">Need More Help?</h2>
                    <p className="text-gray-600 mb-8">
                        Our support team is available 24/7 to assist you with
                        any questions or concerns.
                    </p>

                    {/* Metta Widget Placeholder */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 bg-gray-50">
                        <div className="text-gray-500">
                            <p className="font-semibold mb-2">
                                Metta Support Widget
                            </p>
                            <p className="text-sm">
                                This is where the Metta support widget will be
                                embedded to provide real-time AI-powered
                                assistance.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
