import Link from "next/link";

const FAQS = [
  {
    q: "How do I create a meal plan?",
    a: "Go to the Meals page, select a plan type (day, week, or month), and generate a personalized plan based on your onboarding preferences.",
  },
  {
    q: "Can I track workouts without equipment?",
    a: "Yes. During onboarding, select 'none' for equipment and we'll suggest bodyweight exercises like walking, yoga, and stretching.",
  },
  {
    q: "How do reminders work?",
    a: "Enable in-app, SMS, or WhatsApp reminders in Notification Settings. You can set quiet hours and reminder frequency.",
  },
  {
    q: "Is my health data private?",
    a: "Yes. Your personal and health data is stored securely and is not sold to third parties. See our Privacy Policy for details.",
  },
  {
    q: "How do I upgrade to Premium?",
    a: "Visit the Subscription page to upgrade. Premium unlocks unlimited plans, the AI assistant, and WhatsApp/SMS reminders.",
  },
  {
    q: "Can I pay with M-Pesa?",
    a: "Yes. If you're in Kenya, you can pay via M-Pesa. Contact support or use the M-Pesa option during checkout.",
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to home
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Help Center</h1>
          <p className="text-muted-foreground mt-2">
            Frequently asked questions about Vitala.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <div key={i} className="border rounded-xl p-4 hover:border-primary/50 transition-colors">
              <h3 className="font-semibold mb-2">{faq.q}</h3>
              <p className="text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t">
          <h3 className="font-semibold mb-4">Still need help?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Email our support team and we'll get back to you within 24 hours.
          </p>
          <Link
            href="mailto:support@vitala.app"
            className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
          >
            support@vitala.app
          </Link>
        </div>
      </div>
    </div>
  );
}