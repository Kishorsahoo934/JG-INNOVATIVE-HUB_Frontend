import Layout from '../components/Layout';
import SEO from '@/components/SEO';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

/** Return / Refund policy content for FAQ — structured for clear reading and good fit */
const ReturnPolicyContent = () => (
  <div className="text-muted-foreground space-y-5 pr-2">
    <p className="text-foreground">
      At Innovative Hub, we ensure that all electronic products and components are verified and quality-checked before shipping — minimizing the chances of defective items.
    </p>
    <div>
      <h4 className="font-semibold text-foreground text-sm mb-2">Return/Replacement Eligibility</h4>
      <ul className="list-disc pl-5 space-y-1.5 text-sm">
        <li>Applicable only for orders above ₹1000.</li>
        <li>Only for branded or eligible products that come with a manufacturer&apos;s return or replacement policy.</li>
        <li>Products under ₹1000 (especially small electronic components and China-made items) are non-returnable and non-refundable.</li>
      </ul>
    </div>
    <div>
      <h4 className="font-semibold text-foreground text-sm mb-2">Duration</h4>
      <ul className="list-disc pl-5 space-y-1.5 text-sm">
        <li>Returns or replacements can be requested within 7 days of delivery.</li>
      </ul>
    </div>
    <div>
      <h4 className="font-semibold text-foreground text-sm mb-2">Refund Policy</h4>
      <ul className="list-disc pl-5 space-y-1.5 text-sm">
        <li>90% refund will be issued upon successful inspection of the returned product.</li>
        <li>100% refund will be provided only if an unboxing video clearly showing the product&apos;s defect is shared.</li>
      </ul>
    </div>
    <div>
      <h4 className="font-semibold text-foreground text-sm mb-2">Exclusions</h4>
      <ul className="list-disc pl-5 space-y-1.5 text-sm">
        <li>No returns are accepted for used, physically damaged, or altered products.</li>
        <li>Return or replacement depends on product type and supplier policies.</li>
      </ul>
    </div>
  </div>
);

const FAQPage = () => {
  const faqs = [
    {
      question: 'What products do you offer?',
      answer: 'We offer a wide range of electronic components, robotics kits, microcontrollers, sensors, motors, and DIY project materials. Our catalog includes everything from basic resistors and capacitors to advanced Arduino and Raspberry Pi accessories.',
    },
    {
      question: 'How can I track my order?',
      answer: 'Once your order is shipped, you will receive a tracking number via email. You can use this number on our Order Tracking page to monitor your shipment in real-time.',
    },
    {
      question: 'What are your shipping options?',
      answer: 'We offer standard shipping (5-7 business days), express shipping (2-3 business days), and same-day delivery for select areas. Shipping costs are calculated at checkout based on your location and order weight.',
    },
    {
      question: 'Do you offer bulk discounts?',
      answer: 'Yes! We offer competitive bulk pricing for educational institutions, businesses, and large orders. Please contact our sales team for a custom quote.',
    },
    {
      question: 'What is your return policy?',
      answer: 'return-policy-rich', // Rendered as rich content below
    },
    {
      question: 'Do you provide technical support?',
      answer: 'Absolutely! Our technical support team is available via email and chat to help you with product questions, project guidance, and troubleshooting. We also have extensive documentation and tutorials on our website.',
    },
    {
      question: 'Are your products covered by warranty?',
      answer: 'Most of our products come with a manufacturer warranty ranging from 6 months to 2 years. Warranty details are listed on each product page.',
    },
    {
      question: 'How can I become an affiliate or partner?',
      answer: 'We welcome partnerships with content creators, educators, and businesses. Please reach out to us through our Contact page with details about your proposal.',
    },
  ];

  return (
    <Layout>
      <SEO
        title="FAQ — Shipping, Returns & Support"
        description="Answers about Innovative Hub orders: shipping, tracking, returns, bulk pricing, warranties, and technical support for robotics and electronics."
        path="/faq"
      />
      <div className="network-bg py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
                Frequently Asked Questions
              </h1>
              <p className="text-lg text-muted-foreground">
                Find answers to common questions about our products and services.
              </p>
            </div>

            <section className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-6 md:p-8" aria-labelledby="faq-heading">
              <h2 id="faq-heading" className="sr-only">FAQ list</h2>
              <Accordion type="single" collapsible className="space-y-2">
                {faqs.map((faq, index) => (
                  <AccordionItem 
                    key={index} 
                    value={`item-${index}`}
                    className="border border-border rounded-lg px-4 data-[state=open]:bg-secondary/30"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-4">
                      <span className="font-medium text-foreground">
                        {faq.question}
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-4">
                      {faq.answer === 'return-policy-rich' ? (
                        <ReturnPolicyContent />
                      ) : (
                        <p className="text-muted-foreground">{faq.answer}</p>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>

            <div className="mt-8 text-center">
              <p className="text-muted-foreground">
                Still have questions?{' '}
                <a href="/contact" className="text-primary hover:underline">
                  Contact our support team
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default FAQPage;
