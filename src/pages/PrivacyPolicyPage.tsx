import Layout from '../components/Layout';
import SEO from '@/components/SEO';
import { Shield } from 'lucide-react';

const PrivacyPolicyPage = () => {
  return (
    <Layout>
      <SEO
        title="Privacy Policy — Innovative Hub"
        description="Privacy policy and data protection terms for users and customers of Innovative Hub."
        path="/privacy-policy"
      />
      <div className="network-bg">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 flex items-center justify-center gap-3">
                <Shield className="w-10 h-10 text-primary shrink-0" />
                Privacy Policy
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Last updated: June 2026. Your privacy and trust are important to us. Read how we protect and manage your data.
              </p>
            </div>
          </div>
        </section>

        <section className="py-8 md:py-12 pb-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-8 md:p-12 space-y-8 text-muted-foreground leading-relaxed">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4">1. Information We Collect</h2>
                  <p className="mb-3">
                    We collect personal information when you create an account, purchase products, register for workshops, or contact us. This may include:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Contact information (name, email address, phone number, shipping and billing address).</li>
                    <li>Account details (username, encrypted password).</li>
                    <li>Payment information processed securely by our billing partners (e.g. Razorpay). We do not store card or banking credentials on our servers.</li>
                    <li>Technical details (IP address, browser type, device information) collected automatically to improve performance and security.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4">2. How We Use Your Information</h2>
                  <p className="mb-3">
                    Your information is utilized to provide a seamless experience on Innovative Hub:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Fulfill your orders, ship parts, and manage registrations.</li>
                    <li>Send status updates, order confirmations, and tracking links.</li>
                    <li>Provide customer support and respond to queries about kits, components, or courses.</li>
                    <li>Ensure safety and compliance, preventing fraud or unauthorized transactions.</li>
                    <li>Improve our website, services, and product inventory based on usage statistics.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4">3. Data Sharing and Third Parties</h2>
                  <p>
                    We do not sell or lease your personal information. We only share details with trusted third parties necessary to perform specific services, including payment processors (Razorpay), shipping carriers for deliveries, and hosting/database services. All partners are required to maintain strict confidentiality.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4">4. Security</h2>
                  <p>
                    We employ industry-standard electronic, physical, and administrative security measures (such as SSL encryption and hashed passwords) to protect data from unauthorized access or disclosure. While we take every effort to secure information, no electronic transmission over the internet can be guaranteed 100% secure.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4">5. Cookies</h2>
                  <p>
                    We use cookies and similar tracking tools to save user preferences, manage cart items, and understand platform traffic. You can adjust your browser settings to reject cookies, though doing so might disable certain essential shop or account features.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4">6. Your Rights</h2>
                  <p>
                    You have the right to access, edit, or request the deletion of your account and personal details. Contact us directly at <span className="text-foreground">support@innovativehub.com</span> for any data portability or removal inquiries.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default PrivacyPolicyPage;
