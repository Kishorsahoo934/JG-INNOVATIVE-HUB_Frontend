import Layout from '../components/Layout';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'react-router-dom';

const ComingSoonPage = ({ title }: { title: string }) => {
  const { pathname } = useLocation();
  const description = `${title} — launching soon on Innovative Hub, Odisha's robotics, IoT and embedded systems store. Shop components and kits in our E-Shop today.`;

  return (
    <Layout>
      <SEO title={title} description={description} path={pathname} noIndex />
      <div className="min-h-[70vh] flex items-center justify-center network-bg">
        <article className="container mx-auto px-4 py-10 sm:py-14 max-w-3xl">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-6 text-center text-balance">
            {title}
          </h1>
          <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-6 sm:p-10 mb-8">
            <h2 className="text-xl sm:text-2xl font-semibold text-primary mb-4">We are building this experience for you</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Innovative Hub is expanding beyond the E-Shop so students, makers and startups can learn robotics, buy kits and
              access structured resources in one ecosystem. This page will host curated content aligned with our mission: Learn,
              Build, Share, and Innovate — with a focus on practical, affordable access to quality electronics in India.
            </p>
            <h2 className="text-lg font-semibold text-foreground mb-3">What you can do today</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Browse thousands of SKUs including Arduino-compatible boards, ESP modules, sensors, motor drivers, batteries, relays
              and 3D printing services. Every product page includes descriptions, media and structured data to help search
              engines and customers understand what they are buying. Use the footer links to jump into popular categories in two
              clicks or fewer.
            </p>
            <h2 className="text-lg font-semibold text-foreground mb-3">Stay connected</h2>
            <p className="text-muted-foreground leading-relaxed">
              Follow us on social channels linked in the footer for restock alerts, tutorials and launch announcements. When this
              section goes live, it will appear on the same URL — no broken bookmarks.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/eshop">
              <Button size="lg" className="px-8 py-6 text-lg font-semibold rounded-full bg-primary hover:bg-primary/90">
                Explore E-Shop
              </Button>
            </Link>
            <Link to="/contact" className="text-sm text-primary hover:underline font-medium min-h-[44px] inline-flex items-center">
              Contact us
            </Link>
          </div>
        </article>
      </div>
    </Layout>
  );
};

export default ComingSoonPage;
