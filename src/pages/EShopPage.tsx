import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const EShopPage = () => {
  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center network-bg">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              E-Shop for Components
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Explore our vast catalog of high-quality electrical and electronic components for your projects. 
              From resistors to microcontrollers, we have everything you need.
            </p>
            <div className="bg-card/60 backdrop-blur-sm border border-border rounded-xl p-8 mb-8">
              <p className="text-muted-foreground">
                Products and categories will be displayed here. This is a placeholder for the E-Shop functionality that will be built in the next steps.
              </p>
            </div>
            <Link to="/">
              <Button variant="outline" size="lg" className="rounded-full">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EShopPage;
