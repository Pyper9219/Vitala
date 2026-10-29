export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <nav className="mb-8">
          <a href="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to home
          </a>
        </nav>

        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p className="text-muted-foreground mb-6">Last updated: October 2026</p>

        <article className="prose prose-sm max-w-none text-muted-foreground">
          <h2>1. Acceptance of terms</h2>
          <p>
            By accessing or using Vitala, you agree to be bound by these Terms of Service. If you do
            not agree, you may not use the service.
          </p>

          <h2>2. Account eligibility</h2>
          <p>
            You must be at least 13 years old to create an account. By registering, you represent
            that you meet this requirement.
          </p>

          <h2>3. Subscription and payments</h2>
          <p>
            Vitala offers a free plan and a paid Premium plan. Payments are processed through Stripe
            or M-Pesa. Subscription fees are recurring and may be canceled at any time from your
            account settings.
          </p>

          <h2>4. User conduct</h2>
          <p>
            You agree not to misuse the service, including attempting to reverse-engineer the AI
            assistant, scrape data, or violate any applicable laws.
          </p>

          <h2>5. Limitation of liability</h2>
          <p>
            Vitala is provided "as is" without warranties. We are not liable for any indirect or
            consequential damages arising from your use of the service.
          </p>

          <h2>6. Termination</h2>
          <p>
            We may suspend or terminate your account for violations of these terms, with or without
            notice.
          </p>

          <h2>7. Contact</h2>
          <p>
            Email us at <a href="mailto:legal@vitala.app">legal@vitala.app</a>.
          </p>
        </article>
      </div>
    </div>
  );
}
