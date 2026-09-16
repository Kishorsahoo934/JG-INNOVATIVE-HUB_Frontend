import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Wrench, LayoutGrid, ArrowRight, Mail, Phone, Cpu, CircuitBoard, 
  Settings, Zap, CheckCircle2, ChevronRight, FileCode, Factory, Clock, Users, WrenchIcon,
  Wifi, Box, Bot, RefreshCcw, Package, Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import SEO from '@/components/SEO';
import EShopLayout from '../components/EShopLayout';
import ScrollReveal from '@/components/ScrollReveal';
import { developedProductsApi, DevelopedProduct, productDevContentApi, ProductDevContentItem } from '../services/api';
import { PLACEHOLDER_IMAGE } from '@/constants/media';

// Map icon strings from DB to actual Lucide components
const IconMap: Record<string, React.ElementType> = {
  CircuitBoard, Cpu, Settings, Zap, ShieldCheck, Wrench, LayoutGrid, ArrowRight,
  Mail, Phone, CheckCircle2, ChevronRight, FileCode, Factory, Clock, Users, WrenchIcon,
  Wifi, Box, Bot, RefreshCcw, Package
};

import { useAuth } from '../context/AuthContext';
import { fetchWithAuth } from '../services/api';

const categories = [
  { label: 'All Projects', value: '' },
  { label: 'IoT Solutions', value: 'iot' },
  { label: 'Robotics', value: 'robotics' },
  { label: 'Custom PCB', value: 'pcb' },
  { label: 'STEM Education', value: 'education' },
];

const ProductDevelopmentPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get('search') || '';
  const categoryParam = searchParams.get('category') || '';

  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [products, setProducts] = useState<DevelopedProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dynamic Content State
  const [processSteps, setProcessSteps] = useState<ProductDevContentItem[]>([]);
  const [services, setServices] = useState<ProductDevContentItem[]>([]);
  const [faqs, setFaqs] = useState<ProductDevContentItem[]>([]);

  // Form State
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => setSearchTerm(searchParam), [searchParam]);
  useEffect(() => setSelectedCategory(categoryParam), [categoryParam]);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const trimmed = searchTerm.trim();
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (trimmed) next.set('search', trimmed);
        else next.delete('search');
        if (selectedCategory) next.set('category', selectedCategory);
        else next.delete('category');
        return next;
      },
      { replace: true }
    );
  }, [searchTerm, selectedCategory, setSearchParams]);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const res = await productDevContentApi.getAll();
        if (res.success && res.data) {
          setProcessSteps(res.data.filter(item => item.type === 'process'));
          setServices(res.data.filter(item => item.type === 'service'));
          setFaqs(res.data.filter(item => item.type === 'faq'));
        }
      } catch (err) {
        console.error('Failed to load page content:', err);
      }
    };
    loadContent();
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const res = await developedProductsApi.getAll({
          search: searchTerm.trim() || undefined,
          category: selectedCategory || undefined
        });
        if (res.success && res.data) {
          setProducts(res.data);
        }
      } catch (err) {
        console.error('Failed to load developed products:', err);
      } finally {
        setIsLoading(false);
      }
    };
    const delayDebounce = setTimeout(loadProducts, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, selectedCategory]);

  const handleCategoryChange = (value: string) => setSelectedCategory(value);
  const handleResetFilters = () => { setSearchTerm(''); setSelectedCategory(''); };

  const loadRazorpay = () =>
    new Promise<void>((resolve, reject) => {
      if ((window as any).Razorpay) return resolve();
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay'));
      document.body.appendChild(script);
    });

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'Please login to book a consultation slot.',
      });
      return navigate('/login?redirect=/product-development');
    }

    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      return toast({ variant: 'destructive', title: 'Error', description: 'Please fill out all fields.' });
    }

    setIsSubmitting(true);
    try {
      await loadRazorpay();

      // 1. Create Order
      const orderData = await fetchWithAuth<{
        orderId: string;
        amount: number;
        currency: string;
        keyId: string;
      }>('/api/contact/consultation/order', { method: 'POST' });

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'JG Innovative Hub',
        description: 'Consultation Booking Fee',
        order_id: orderData.orderId,
        handler: async (response: any) => {
          try {
            // 2. Submit Form with Payment Details
            const verifyData = await fetchWithAuth<any>('/api/contact/consultation/submit', {
              method: 'POST',
              body: JSON.stringify({
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                message: formData.message,
                subject: 'Product Development Consultation Booking',
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            toast({
              title: 'Consultation Booked!',
              description: 'Payment successful. Our engineering team will contact you shortly.',
            });
            setFormData({ name: '', email: '', phone: '', message: '' });
          } catch (err: any) {
            toast({
              variant: 'destructive',
              title: 'Verification Failed',
              description: err.message || 'Payment verified but failed to book. Contact support.',
            });
          }
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone,
        },
        theme: {
          color: '#2563eb', // primary color
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast({
          variant: 'destructive',
          title: 'Payment Failed',
          description: response.error.description || 'Payment was cancelled or failed.',
        });
      });
      rzp.open();

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <EShopLayout searchQuery={searchTerm} onSearchChange={setSearchTerm}>
      <SEO 
        title="Hardware Engineering Reimagined | Product Development"
        description="Transform your innovative idea into a real electronic product. From concept, PCB design, embedded firmware, prototyping, testing, to manufacturing support."
      />

      {/* 1. HERO SECTION */}
      <section className="relative pt-20 pb-24 md:pt-32 md:pb-32 overflow-hidden bg-background">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
          
          <style>{`
            @keyframes pulse-glow {
              0%, 100% { text-shadow: 0 0 15px rgba(var(--primary), 0.2); }
              50% { text-shadow: 0 0 30px rgba(var(--primary), 0.6); }
            }
            .animate-text-glow {
              animation: pulse-glow 3s ease-in-out infinite;
            }
            @keyframes gradient-x {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            .animate-gradient-x {
              background-size: 200% auto;
              animation: gradient-x 3s linear infinite;
            }
          `}</style>

          <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
            <Badge className="mb-6 px-4 py-1.5 bg-primary/10 text-primary hover:bg-primary/20 border-primary/20 rounded-full font-medium text-sm animate-fade-in">
              End-to-End Hardware Solutions
            </Badge>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-foreground mb-6 tracking-tight leading-tight">
              <span className="inline-block animate-in fade-in slide-in-from-bottom-8 duration-700 [animation-delay:100ms] fill-mode-both">
                Hardware Engineering,
              </span> <br className="hidden md:block"/>
              <span className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/60 to-primary animate-in fade-in zoom-in-50 duration-1000 [animation-delay:600ms] fill-mode-both animate-gradient-x animate-text-glow mt-2 hover:scale-105 transition-transform cursor-default">
                Reimagined
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 [animation-delay:1000ms] fill-mode-both">
            Transform your innovative idea into a real electronic product. From concept, PCB design, embedded firmware, prototyping, testing, to final manufacturing support — we build complete hardware solutions.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-in fade-in slide-in-from-bottom-2 duration-700 [animation-delay:1200ms] fill-mode-both">
            <Button size="lg" className="h-14 px-8 text-base font-bold rounded-full w-full sm:w-auto shadow-lg shadow-primary/25 hover:scale-105 transition-transform" onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}>
              Start Your Project
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-base font-bold rounded-full w-full sm:w-auto bg-background/50 backdrop-blur-sm border-border/60 hover:bg-secondary hover:text-secondary-foreground hover:scale-105 transition-all" onClick={() => document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })}>
              View Our Work
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-8 border-t border-border/40 animate-in fade-in duration-1000 [animation-delay:1500ms] fill-mode-both">
            {[
              { value: '50+', label: 'Projects Shipped' },
              { value: '15+', label: 'Technologies' },
              { value: '2-4 wks', label: 'First Prototype' },
              { value: '100%', label: 'IP Ownership' },
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center justify-center p-2">
                <span className="text-2xl md:text-3xl font-extrabold text-foreground mb-1">{stat.value}</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 2. PROCESS SECTION */}
      <section className="py-20 bg-secondary/20 min-h-[400px]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Process</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              A transparent, milestone-driven workflow — from your idea to a boxed hardware product.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative">
            <div className="hidden lg:block absolute top-12 left-[10%] right-[10%] h-0.5 bg-border z-0">
              <div className="absolute top-0 left-0 h-full bg-primary w-1/4 animate-pulse" />
            </div>
            
            {processSteps.length > 0 && processSteps.map((item, i) => (
              <ScrollReveal key={item._id} direction="up" delay={i * 100} className="relative z-10">
                <div className="bg-background border border-border rounded-2xl p-6 text-center h-full shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="w-14 h-14 mx-auto bg-primary/10 text-primary rounded-full flex items-center justify-center text-lg font-bold mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    {item.stepNumber || `0${i+1}`}
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-3 leading-tight">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SERVICES SECTION */}
      <section className="py-20 bg-background min-h-[600px]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Capabilities</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              One team, one accountability line — deep engineering capabilities under a single roof.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {services.length > 0 && services.map((prov, i) => {
              const Icon = prov.icon && IconMap[prov.icon] ? IconMap[prov.icon] : LayoutGrid;
              return (
                <ScrollReveal key={prov._id} direction="up" delay={(i % 3) * 100}>
                  <div className="flex flex-col bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:border-primary/40 transition-all duration-300 h-full group cursor-pointer" onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}>
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-5 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-3">{prov.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">{prov.description}</p>
                    
                    <div className="flex items-center text-primary text-sm font-semibold mt-auto">
                      Learn more <ArrowRight className="w-4 h-4 ml-1.5 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. OUR WORK (PORTFOLIO GRID) */}
      <section id="work" className="py-20 bg-secondary/10 border-y border-border/30 min-h-[800px]">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Our Work</h2>
              <p className="text-muted-foreground text-lg max-w-xl">
                Real hardware, shipping in real environments. Click any product for a full deep dive into the engineering process.
              </p>
            </div>
            {/* Search and Filter */}
            <div className="flex flex-col gap-4 w-full sm:w-auto sm:items-end mt-6 sm:mt-0">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search projects by name..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10 w-full bg-background"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-2 justify-start sm:justify-end max-w-md">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => handleCategoryChange(cat.value)}
                    className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-colors ${
                      selectedCategory === cat.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-background border border-border text-foreground hover:bg-secondary'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-24 min-h-[400px]">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20 bg-background border border-border/60 rounded-2xl max-w-lg mx-auto">
              <LayoutGrid className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-bold text-foreground mb-1.5">No Projects Found</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">
                We couldn't find any projects matching your search query or filters.
              </p>
              <Button onClick={handleResetFilters} variant="outline" size="sm">
                Reset Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card
                  key={product._id}
                  onClick={() => navigate(`/product-development/${product._id}`)}
                  className="bg-background border border-border rounded-xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:border-primary/40 cursor-pointer flex flex-col justify-between group"
                >
                  <div className="relative aspect-video bg-secondary/30 overflow-hidden">
                    <img
                      src={product.images?.[0]?.url || '/images/project-kit-bg.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/project-kit-bg.jpg';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                      <Badge className="bg-background/90 backdrop-blur text-foreground border-none text-[10px] uppercase tracking-wider font-bold shadow-sm">
                        {product.tag}
                      </Badge>
                    </div>
                  </div>
                  <CardHeader className="p-5 pb-2">
                    <CardTitle className="text-lg font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 py-0 flex-1">
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                      {product.description}
                    </p>
                    {product.features && product.features.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {product.features.slice(0, 3).map((feat) => (
                          <Badge key={feat} variant="outline" className="text-[10px] py-0 px-2 font-semibold bg-secondary/30 border-border/60">
                            {feat}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="p-5 pt-4 mt-auto border-t border-border/40 flex items-center justify-between text-primary">
                    <span className="text-sm font-bold">Deep Dive</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 5. CONSULTATION & WHY CHOOSE US */}
      <section id="consultation" className="py-24 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Left: Why Choose Us */}
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Why Choose Us</h2>
              <p className="text-muted-foreground text-lg mb-10">
                Numbers, engineering culture, and outcomes — not slogans. We take pride in building robust systems.
              </p>
              
              <div className="space-y-6">
                {[
                  { title: "End-to-End Development", desc: "One team from the initial idea all the way to mass production.", icon: LayoutGrid },
                  { title: "Industry Standard Process", desc: "IPC-compliant designs, fully documented and rigorously tested.", icon: ShieldCheck },
                  { title: "Affordable & Transparent Pricing", desc: "Clear, milestone-based quotes with absolutely no hidden costs.", icon: FileCode },
                  { title: "NDA Available", desc: "Sign-and-share workflows ensuring your IP always remains yours.", icon: CheckCircle2 },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary mt-1">
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-foreground mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Booking Form */}
            <div className="bg-card border border-border shadow-2xl shadow-black/5 rounded-3xl p-6 sm:p-10 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary to-primary/40" />
              
              <h3 className="text-2xl font-bold text-foreground mb-2">Reserve Your Slot</h3>
              <p className="text-sm text-muted-foreground mb-8">
                Facing issues in PCB Design, Firmware, or Manufacturing? Book a 1-on-1 consultation with our senior engineers.
              </p>

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Full Name</label>
                  <Input 
                    required 
                    placeholder="John Doe" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="h-12 bg-background"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Email Address</label>
                    <Input 
                      required 
                      type="email" 
                      placeholder="john@company.com" 
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="h-12 bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Phone Number</label>
                    <Input 
                      required 
                      type="tel" 
                      placeholder="+91 98765 43210" 
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="h-12 bg-background"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Project Details</label>
                  <Textarea 
                    required 
                    placeholder="Tell us briefly about your hardware idea or the challenges you are facing..." 
                    className="min-h-[120px] resize-none bg-background"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={isSubmitting} 
                  className="w-full h-12 text-base font-bold rounded-xl mt-4"
                >
                  {isSubmitting ? 'Processing Payment...' : 'Pay ₹49 & Reserve Slot'}
                </Button>
                
                <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Your information is secure. NDA available upon request.
                </p>
              </form>
            </div>

          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="py-20 bg-secondary/10 border-t border-border/40">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-lg">
              Straight answers on timelines, IP, and manufacturing.
            </p>
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            {faqs.length > 0 && faqs.map((faq, index) => (
              <AccordionItem key={faq._id} value={`item-${index}`} className="border-border/40 px-2">
                <AccordionTrigger className="text-left font-semibold text-foreground text-base py-5 hover:text-primary transition-colors">
                  {faq.title}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed text-sm sm:text-base pb-6">
                  {faq.description}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* 7. FINAL CTA */}
      <section className="py-20 bg-primary/5 border-t border-primary/10">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold text-foreground mb-6">Let's build something <span className="text-primary">legendary.</span></h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Let's convert your idea into a market-ready innovation. Reserve your slot in our engineering pipeline today.
          </p>
          <Button size="lg" className="h-14 px-10 text-base font-bold rounded-full shadow-lg shadow-primary/20" onClick={() => document.getElementById('consultation')?.scrollIntoView({ behavior: 'smooth' })}>
            Book Consultation
          </Button>
        </div>
      </section>

    </EShopLayout>
  );
};

export default ProductDevelopmentPage;