export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <nav className="mb-8">
          <a
            href="/"
            className="text-sm text-muted-foreground hover:text-primary"
          >
            ← Back to home
          </a>
        </nav>

        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p className="text-muted-foreground mb-6">
          Last updated: October 2026
        </p>

        <article className="prose prose-sm max-w-none text-muted-foreground">
          <h2>1. Information we collect</h2>
          <p>
            Vitala collects personal information you provide directly, such as
            your email address, name, phone number, dietary preferences, health
            goals, and usage data. We also collect data automatically through
            your interactions with the app.
          </p>

          <h2>2. How we use your information</h2>
          <p>
            We use your data to provide personalized meal and workout plans,
            send reminders (only with your consent), process payments, and
            improve the service. We do not sell your personal data.
          </p>

          <h2>3. Health data</h2>
          <p>
            Information you enter about your health, diet, and fitness is used
            solely to personalize your experience. It is not shared with third
            parties for marketing purposes.
          </p>

          <h2>4. Third-party services</h2>
          <p>
            We use trusted third-party providers for authentication (Supabase),
            payments (Stripe, M-Pesa), messaging (Twilio), and AI (OpenAI).
            Each provider has its own privacy policy.
          </p>

          <h2>5. Your rights</h2>
          <p>
            You may access, correct, or delete your personal data at any time
            from your account settings or by contacting us.
          </p>

          <h2>6. Contact</h2>
          <p>
            Questions about this policy? Email us at
            <a href="mailto:privacy@vitala.app">privacy@vitala.app</a>.
          </p>
        </article>
      </div>
    </div>
  );
}