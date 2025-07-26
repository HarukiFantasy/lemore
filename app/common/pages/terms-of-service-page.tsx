import type { Route } from "../../+types/root";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Terms of Service | Lemore" },
    { name: "description", content: "Terms of Service for Lemore" },
  ];
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
          <p className="text-gray-700">
            By accessing and using Lemore, you accept and agree to be bound by the terms and provision of this agreement.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Description of Service</h2>
          <p className="text-gray-700 mb-4">
            Lemore is a platform that enables users to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Buy and sell secondhand items</li>
            <li>Share local tips and reviews</li>
            <li>Connect with other users in their community</li>
            <li>Participate in sustainable living practices</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. User Accounts</h2>
          <p className="text-gray-700 mb-4">
            When you create an account, you must provide accurate and complete information. You are responsible for:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Maintaining the security of your account</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us immediately of any unauthorized use</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. User Conduct</h2>
          <p className="text-gray-700 mb-4">
            You agree not to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Post false, misleading, or fraudulent content</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Violate any applicable laws or regulations</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Use the service for any illegal or unauthorized purpose</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Content and Intellectual Property</h2>
          <p className="text-gray-700 mb-4">
            You retain ownership of content you post, but grant us a license to use, display, and distribute it.
            You must have the right to share any content you post.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Transactions and Disputes</h2>
          <p className="text-gray-700 mb-4">
            We facilitate connections between buyers and sellers but are not responsible for:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>The quality or condition of items</li>
            <li>Payment disputes between users</li>
            <li>Shipping or delivery issues</li>
            <li>Any disputes arising from transactions</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Privacy</h2>
          <p className="text-gray-700">
            Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Termination</h2>
          <p className="text-gray-700">
            We may terminate or suspend your account at any time, with or without cause, with or without notice.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Disclaimers</h2>
          <p className="text-gray-700">
            The service is provided "as is" without warranties of any kind. We are not liable for any damages 
            arising from your use of the service.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Changes to Terms</h2>
          <p className="text-gray-700">
            We reserve the right to modify these terms at any time. We will notify users of any material changes.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Contact Information</h2>
          <p className="text-gray-700">
            If you have any questions about these Terms of Service, please contact us at legal@lemore.com
          </p>
        </section>

        <div className="mt-8 pt-6 border-t">
          <p className="text-sm text-gray-500">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
} 