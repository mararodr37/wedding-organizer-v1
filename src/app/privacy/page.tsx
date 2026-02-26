export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Privacy Policy
        </h1>
        <p className="text-sm text-gray-500 mb-8">Last updated: February 25, 2026</p>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Overview</h2>
            <p>
              Wedding Organizer (&quot;the App&quot;) is a personal-use application
              that provides daily fitness coaching by integrating with the WHOOP
              platform. This app is designed for a single authorized user and is
              not a public service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Data We Access</h2>
            <p>
              When you connect your WHOOP account, the App accesses the following
              data via the WHOOP API with your explicit authorization:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Recovery scores and heart rate variability (HRV)</li>
              <li>Sleep performance and duration</li>
              <li>Daily strain scores</li>
              <li>Basic profile information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-2">How We Use Your Data</h2>
            <p>
              Your WHOOP data is used solely to generate personalized daily
              fitness coaching emails. Data is processed in real-time and stored
              temporarily to maintain coaching context across sessions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Data Storage</h2>
            <p>
              WHOOP API tokens and daily coaching logs are stored in an encrypted,
              access-controlled database (Upstash Redis). No data is shared with
              third parties. Email content is processed through the Anthropic API
              for coaching generation and through Resend for email delivery.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Data Sharing</h2>
            <p>
              We do not sell, share, or distribute your personal data or WHOOP
              data to any third parties. Your data is only used within the App
              for the purpose of generating fitness coaching.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Revoking Access</h2>
            <p>
              You can revoke the App&apos;s access to your WHOOP data at any time
              through your WHOOP account settings. Upon revocation, stored tokens
              will become invalid and no further data will be accessed.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-medium text-gray-900 mb-2">Contact</h2>
            <p>
              For questions about this privacy policy, contact the app
              administrator directly.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
