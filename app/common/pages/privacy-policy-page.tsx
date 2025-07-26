import type { Route } from "../../+types/root";

export const meta: Route.MetaFunction = () => {
  return [
    { title: "Privacy Policy | Lemore" },
    { name: "description", content: "Privacy Policy for Lemore" },
  ];
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>
          <p className="text-gray-700 mb-4">
            We collect information you provide directly to us, such as when you create an account, 
            post listings, or contact us. This may include:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Name, email address, and profile information</li>
            <li>Content you post, including product listings and community posts</li>
            <li>Messages and communications with other users</li>
            <li>Location data when you choose to share it</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-700 mb-4">
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Provide, maintain, and improve our services</li>
            <li>Connect you with other users and facilitate transactions</li>
            <li>Send you notifications and updates</li>
            <li>Ensure the security and integrity of our platform</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Information Sharing</h2>
          <p className="text-gray-700 mb-4">
            We do not sell your personal information. We may share your information in the following circumstances:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>With your consent</li>
            <li>To comply with legal obligations</li>
            <li>To protect our rights and safety</li>
            <li>With service providers who assist in our operations</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
          <p className="text-gray-700">
            We implement appropriate security measures to protect your personal information 
            against unauthorized access, alteration, disclosure, or destruction.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Your Rights</h2>
          <p className="text-gray-700 mb-4">
            You have the right to:
          </p>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Access and update your personal information</li>
            <li>Delete your account and associated data</li>
            <li>Opt out of certain communications</li>
            <li>Request a copy of your data</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Contact Us</h2>
          <p className="text-gray-700">
            If you have any questions about this Privacy Policy, please contact us at privacy@lemore.com
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Updates to This Policy</h2>
          <p className="text-gray-700">
            We may update this Privacy Policy from time to time. We will notify you of any changes 
            by posting the new Privacy Policy on this page.
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