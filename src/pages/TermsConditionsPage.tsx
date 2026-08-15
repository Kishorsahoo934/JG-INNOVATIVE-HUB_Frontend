import Layout from '../components/Layout';
import SEO from '@/components/SEO';
import { FileText } from 'lucide-react';

const TermsConditionsPage = () => {
  return (
    <Layout>
      <SEO
        title="Terms and Conditions — Innovative Hub"
        description="Terms and conditions for purchases, workshops, and services on the Innovative Hub platform."
        path="/terms-conditions"
      />
      <div className="network-bg">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 flex items-center justify-center gap-3">
                <FileText className="w-10 h-10 text-primary shrink-0" />
                Terms & Conditions
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Welcome to Innovative Hub. These terms govern your use of our platform, shop, and courses.
              </p>
            </div>
          </div>
        </section>

        <section className="py-8 md:py-12 pb-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-8 md:p-12 space-y-8 text-muted-foreground leading-relaxed">
                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4">1. Agreement to Terms</h2>
                  <p>
                    By accessing or buying from Innovative Hub, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, please do not use our services, purchase components, or attend our workshops.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4">2. Product Purchases & Pricing</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>We strive to describe products, quantities, specifications, and stock accuracy to the best of our ability. However, we do not warrant that details are completely free of technical errors.</li>
                    <li>Prices for components and kits are subject to change without prior notice. Taxes (GST) and shipping rates are calculated at checkout.</li>
                    <li>We reserve the right to cancel or limit orders at our discretion in the event of stock issues, pricing discrepancies, or suspected transaction fraud.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4">3. Workshops & Internships</h2>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Registration for live workshops and internships requires full payment at the time of signup unless stated otherwise.</li>
                    <li>Schedules, topics, and speakers are subject to change due to availability. We will notify registered students of any modifications.</li>
                    <li>Materials provided during workshops (slides, code files, circuit schematics) are for educational, non-commercial use only. Sharing, copying, or distributing these assets without consent is prohibited.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4">4. Payment & Refund Policy</h2>
                  <p className="mb-2">
                    Payments are handled securely via third-party providers (Razorpay). By paying, you agree to their service terms.
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Components or kits can be returned or replaced in case of manufacturing defects reported within 7 days of delivery. Parts must be in original condition.</li>
                    <li>Workshop registration cancellations are eligible for full or partial refunds only if requested at least 48 hours prior to the event starting.</li>
                    <li>Internship deposit/registration fees are non-refundable once the training program commences.</li>
                  </ul>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4">5. User Conduct & Accounts</h2>
                  <p>
                    When creating an account, you must provide accurate information. You are solely responsible for protecting your account credentials. Any malicious activity, spamming, hacking, or scraping of content is strictly prohibited and will result in immediate termination of access.
                  </p>
                </div>

                <div>
                  <h2 className="text-xl font-bold text-foreground mb-4">6. Limitation of Liability</h2>
                  <p>
                    Innovative Hub, its founder Jagadeswar Pati, and team members shall not be held liable for any direct, indirect, incidental, or consequential damages resulting from the use of components purchased, circuit implementations, electrical mishaps, or workshop materials. Hardware experimentation involves risks; please follow appropriate safety protocols when handling voltage and electronics.
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

export default TermsConditionsPage;
