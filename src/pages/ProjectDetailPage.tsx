import { useParams, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Minus, Plus, ShoppingCart, Heart, Share2, Play, BookOpen, Clock, Settings, Layers, ListChecks } from 'lucide-react';
import SEO from '@/components/SEO';
import { projectsApi, reviewsApi } from '../services/api';
import type { Project } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import ProductReviews from '@/components/ProductReviews';
import { formatPrice } from '@/utils/price';
import { PLACEHOLDER_IMAGE, BRAND_LOGO } from '@/constants/media';
import EShopLayout from '../components/EShopLayout';

const ProjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeDetailsTab, setActiveDetailsTab] = useState<'overview' | 'components' | 'guide'>('overview');
  const [checkedComponents, setCheckedComponents] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (value.trim()) {
      navigate(`/project-kits?search=${encodeURIComponent(value.trim())}`);
    }
  };

  const { addToCart, isInCart, getQuantity, updateQuantity } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    setIsLoading(true);

    const loadProject = async () => {
      try {
        const res = await projectsApi.getById(id);
        if (res.success) {
          setProject(res.data);

          // Initialise checkboxes for components
          const initialChecked: Record<string, boolean> = {};
          if (res.data.components) {
            res.data.components.forEach(comp => {
              initialChecked[comp] = false;
            });
          }
          setCheckedComponents(initialChecked);
        }
      } catch (err) {
        console.error('Failed to load project details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProject();
  }, [id]);

  useEffect(() => {
    const loadRelated = async () => {
      if (!project) return;
      try {
        const res = await projectsApi.getAll();
        if (res.success) {
          setRelatedProjects(
            res.data.filter(p => p._id !== project._id).slice(0, 4)
          );
        }
      } catch (err) {
        console.error('Failed to load related projects:', err);
      }
    };
    loadRelated();
  }, [project]);

  const mediaItems = useMemo(() => {
    if (!project) return [];
    const imgs = (project.images || []).map((url: string) => ({ type: 'image' as const, url }));
    const vids = (project.videos || []).map((url: string) => ({ type: 'video' as const, url }));
    return [...imgs, ...vids];
  }, [project]);

  const toggleComponentCheck = (comp: string) => {
    setCheckedComponents(prev => ({
      ...prev,
      [comp]: !prev[comp]
    }));
  };

  const handleAddToCart = () => {
    if (!project) return;
    const prodAdapter = {
      ...project,
      category: 'project-kits',
      subcategory: project.projectType,
      cloudinaryUrl: project.images[0] || ''
    } as any;

    addToCart(prodAdapter, quantity);
    toast({
      title: 'Added to Cart',
      description: `${quantity} × ${project.name} combo kit has been added to your cart.`
    });
  };

  const handleBuyNow = () => {
    if (!project) return;
    const prodAdapter = {
      ...project,
      category: 'project-kits',
      subcategory: project.projectType,
      cloudinaryUrl: project.images[0] || ''
    } as any;

    sessionStorage.setItem('buyNowItem', JSON.stringify({ product: prodAdapter, quantity }));
    navigate('/checkout');
  };

  const handleWishlistToggle = () => {
    if (!project) return;
    const prodAdapter = {
      ...project,
      category: 'project-kits',
      subcategory: project.projectType,
      cloudinaryUrl: project.images[0] || ''
    } as any;

    if (isInWishlist(project._id)) {
      removeFromWishlist(project._id);
      toast({ title: 'Removed from Wishlist', description: `${project.name} has been removed.` });
    } else {
      addToWishlist(prodAdapter);
      toast({ title: 'Added to Wishlist', description: `${project.name} has been added.` });
    }
  };

  if (isLoading) {
    return (
      <EShopLayout searchQuery={searchQuery} onSearchChange={handleSearchChange}>
        <div className="flex justify-center items-center min-h-[70vh]">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </div>
      </EShopLayout>
    );
  }

  if (!project) {
    return (
      <EShopLayout searchQuery={searchQuery} onSearchChange={handleSearchChange}>
        <div className="container mx-auto px-4 py-20 text-center max-w-md min-h-[60vh] flex flex-col justify-center">
          <h2 className="text-2xl font-bold mb-2">Project Not Found</h2>
          <p className="text-muted-foreground mb-6">The requested project kit is not available or has been removed.</p>
          <Button onClick={() => navigate('/project-kits')}>Back to Hub</Button>
        </div>
      </EShopLayout>
    );
  }

  const discount = project.mrp > 0 ? Math.round(((project.mrp - project.price) / project.mrp) * 100) : 0;
  const inCart = isInCart(project._id);
  const cartQty = getQuantity(project._id);
  const isWishlisted = isInWishlist(project._id);

  return (
    <EShopLayout searchQuery={searchQuery} onSearchChange={handleSearchChange}>
      <SEO
        title={`${project.name} - Robotics Kit`}
        description={project.shortDescription}
        image={project.images[0] || BRAND_LOGO}
        path={`/project/${project._id}`}
      />
      <div className="network-bg min-h-screen py-6 sm:py-12">
        <div className="container mx-auto px-4 max-w-5xl">

          {/* Breadcrumb */}
          <nav className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground mb-6" aria-label="Breadcrumb">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link to="/project-kits" className="hover:text-foreground">Project Kits</Link>
            <span>/</span>
            <span className="text-foreground font-semibold truncate max-w-xs">{project.name}</span>
          </nav>

          {/* Project Header section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start bg-card/45 backdrop-blur-sm border border-border/80 rounded-2xl p-4 sm:p-6 md:p-8 mb-10">

            {/* Gallery */}
            <div className="space-y-4">
              <div className="aspect-square bg-background border border-border/50 rounded-xl overflow-hidden relative flex items-center justify-center">
                {mediaItems.length === 0 ? (
                  <img src={PLACEHOLDER_IMAGE} alt={project.name} className="w-full h-full object-contain p-4" />
                ) : (
                  (() => {
                    const current = mediaItems[currentImageIndex];
                    if (current?.type === 'image') {
                      return (
                        <img
                          src={current.url}
                          alt={project.name}
                          className="w-full h-full object-contain p-4"
                          loading="eager"
                        />
                      );
                    }
                    return (
                      <video
                        src={current?.url}
                        controls
                        className="w-full h-full object-contain p-4"
                      />
                    );
                  })()
                )}

                {/* Arrows */}
                {mediaItems.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length)}
                      className="absolute left-2.5 p-2 bg-background/85 border border-border rounded-full hover:bg-background transition-colors"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev + 1) % mediaItems.length)}
                      className="absolute right-2.5 p-2 bg-background/85 border border-border rounded-full hover:bg-background transition-colors"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {mediaItems.length > 1 && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {mediaItems.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-colors ${currentImageIndex === idx ? 'border-primary' : 'border-transparent'
                        }`}
                    >
                      {item.type === 'image' ? (
                        <img src={item.url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="bg-muted flex items-center justify-center w-full h-full">
                          <Play className="w-4 h-4 text-primary" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-primary/95 text-primary-foreground border-none text-[10px] uppercase font-bold tracking-wider">
                    {project.projectType === 'combo_components' ? 'Kit Combo Components' : 'Ready Made Project'}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] capitalize font-bold bg-[#131d2e] border-border/80 text-foreground">
                    Difficulty: {project.difficulty}
                  </Badge>
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-foreground tracking-tight leading-tight">
                  {project.name}
                </h1>

                <div className="flex items-center gap-3 text-xs text-muted-foreground font-semibold">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    Build time: {project.estimatedBuildTime || 'N/A'}
                  </span>
                  <span>•</span>
                  <span>SKU: {project.sku}</span>
                </div>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {project.shortDescription}
              </p>

              {/* Price & Stock */}
              <div className="space-y-1 bg-secondary/15 border border-border/30 p-4 rounded-xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="text-2xl sm:text-3xl font-extrabold text-foreground">₹{formatPrice(project.price)}</span>
                  {project.mrp > project.price && (
                    <>
                      <span className="text-base text-muted-foreground line-through">₹{formatPrice(project.mrp)}</span>
                      <span className="text-sm text-green-500 font-bold bg-green-500/10 px-2 py-0.5 rounded">
                        {discount}% OFF
                      </span>
                    </>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground">Price is excluding GST. 18% standard GST is calculated at checkout.</p>
                <div className="flex items-center gap-2 pt-2 text-xs">
                  <span className={`w-2.5 h-2.5 rounded-full ${project.stock > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="font-semibold text-muted-foreground">
                    {project.stock > 0 ? `In Stock (${project.stock} units available)` : 'Out of Stock'}
                  </span>
                </div>
              </div>

              {/* Quantity & Cart action */}
              <div className="space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-border rounded-lg bg-secondary/20">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2.5 hover:bg-secondary rounded-l-lg transition-colors"
                      disabled={project.stock <= 0}
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 text-sm font-bold min-w-[2rem] text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(project.stock, quantity + 1))}
                      className="p-2.5 hover:bg-secondary rounded-r-lg transition-colors"
                      disabled={project.stock <= 0}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="text-xs text-muted-foreground font-semibold">Select quantity</span>
                </div>

                {inCart ? (
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button variant="outline" className="flex-1 font-bold rounded-lg border-primary/50 text-primary hover:bg-primary/5 hover:text-primary" asChild>
                      <Link to="/cart">Go to Cart</Link>
                    </Button>
                    <Button onClick={handleBuyNow} className="flex-1 font-bold rounded-lg" disabled={project.stock <= 0}>
                      Buy Now
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button
                      onClick={handleAddToCart}
                      className="flex-1 font-bold rounded-lg gap-2"
                      disabled={project.stock <= 0}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </Button>
                    <Button
                      onClick={handleBuyNow}
                      className="flex-1 font-bold rounded-lg"
                      variant="secondary"
                      disabled={project.stock <= 0}
                    >
                      Buy Now
                    </Button>
                  </div>
                )}
              </div>

              {/* Wishlist and Share */}
              <div className="flex items-center gap-4 text-xs font-semibold border-t border-border/30 pt-4">
                <button
                  onClick={handleWishlistToggle}
                  className={`flex items-center gap-1.5 transition-colors ${isWishlisted ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                  {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
                </button>
                <span className="text-border/40">|</span>
                <button
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(window.location.href);
                      toast({ title: 'Link copied', description: 'Share link copied to clipboard.' });
                    } catch (e) {
                      console.error(e);
                    }
                  }}
                  className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  Share Link
                </button>
              </div>

            </div>
          </div>

          {/* Details Tabs Section (Overview, Components List, Assembly Guide) */}
          <div className="bg-card/45 backdrop-blur-sm border border-border/80 rounded-2xl overflow-hidden mb-10">
            <div className="flex border-b border-border/60 bg-muted/20">
              <button
                onClick={() => setActiveDetailsTab('overview')}
                className={`flex-1 py-4 text-xs sm:text-sm font-bold border-b-2 transition-all gap-1.5 flex items-center justify-center ${activeDetailsTab === 'overview'
                    ? 'border-primary text-primary bg-background/30'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
              >
                <Layers className="w-4 h-4" />
                Overview
              </button>
              <button
                onClick={() => setActiveDetailsTab('components')}
                className={`flex-1 py-4 text-xs sm:text-sm font-bold border-b-2 transition-all gap-1.5 flex items-center justify-center ${activeDetailsTab === 'components'
                    ? 'border-primary text-primary bg-background/30'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
              >
                <ListChecks className="w-4 h-4" />
                Parts Checklist
              </button>
              <button
                onClick={() => setActiveDetailsTab('guide')}
                className={`flex-1 py-4 text-xs sm:text-sm font-bold border-b-2 transition-all gap-1.5 flex items-center justify-center ${activeDetailsTab === 'guide'
                    ? 'border-primary text-primary bg-background/30'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                  }`}
              >
                <BookOpen className="w-4 h-4" />
                Build Guide
              </button>
            </div>

            <div className="p-6 sm:p-8">

              {/* Overview */}
              {activeDetailsTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-foreground mb-3">Project Description</h3>
                    <div
                      className="text-xs sm:text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{ __html: project.longDescription || 'No description provided.' }}
                    />
                  </div>

                  {project.specifications && Object.keys(project.specifications).length > 0 && (
                    <div>
                      <h3 className="text-base font-bold text-foreground mb-3">Technical Specifications</h3>
                      <div className="border border-border/60 rounded-xl overflow-hidden max-w-xl bg-background/25">
                        <table className="w-full text-xs">
                          <tbody>
                            {Object.entries(project.specifications).map(([key, val]) => (
                              <tr key={key} className="border-b border-border/50 last:border-none">
                                <td className="py-2.5 px-4 font-semibold text-muted-foreground bg-muted/10 w-1/3">{key}</td>
                                <td className="py-2.5 px-4 text-foreground">{val}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Components Checklist */}
              {activeDetailsTab === 'components' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground mb-1">Interactive Package Inventory</h3>
                    <p className="text-xs text-muted-foreground">
                      Here is the checklist of components included in this combo package. Use this list to verify your items upon delivery.
                    </p>
                  </div>

                  {project.components && project.components.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 max-w-2xl">
                      {project.components.map((comp) => (
                        <div
                          key={comp}
                          onClick={() => toggleComponentCheck(comp)}
                          className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-all select-none ${checkedComponents[comp]
                              ? 'bg-primary/5 border-primary text-foreground'
                              : 'bg-background/20 border-border/60 hover:bg-muted/10 text-muted-foreground'
                            }`}
                        >
                          <input
                            type="checkbox"
                            checked={checkedComponents[comp] || false}
                            onChange={() => { }} // toggling handled by parent div onClick
                            className="rounded text-primary focus:ring-primary w-4 h-4 bg-secondary/50 border-input"
                          />
                          <span className={`text-xs font-semibold ${checkedComponents[comp] ? 'line-through opacity-85 text-primary' : ''}`}>
                            {comp}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">No component list specified for this project kit.</p>
                  )}
                </div>
              )}

              {/* Assembly Guide */}
              {activeDetailsTab === 'guide' && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold text-foreground mb-1">Step-by-Step Build Guide</h3>
                    <p className="text-xs text-muted-foreground">
                      Follow these assembly instructions, schematics, and source code blocks to build and upload code to your project.
                    </p>
                  </div>

                  {project.documentation ? (
                    <div className="bg-secondary/15 border border-border/50 rounded-xl p-5 mt-3">
                      <div
                        className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed prose prose-invert max-w-none"
                        dangerouslySetInnerHTML={{ __html: project.documentation }}
                      />
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-border/80 p-8 rounded-xl text-center text-muted-foreground mt-3 bg-[#111823]/30">
                      <BookOpen className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-xs">Assembly guide for this project kit will be published soon.</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Reviews & Comments section */}
          <div className="bg-card/45 backdrop-blur-sm border border-border/80 rounded-2xl p-6 sm:p-8 mb-10">
            <h2 className="text-xl font-bold text-foreground mb-6">User Reviews & Feedback</h2>
            <ProductReviews productId={project._id} />
          </div>

          {/* Related Projects */}
          {relatedProjects.length > 0 && (
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-bold text-foreground">Explore Other Kits</h2>
                <Link to="/project-kits" className="text-xs text-primary font-bold hover:underline">
                  VIEW ALL KITS
                </Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {relatedProjects.map((p) => (
                  <Link
                    key={p._id}
                    to={`/project/${p._id}`}
                    className="bg-card/50 backdrop-blur-sm border border-border/60 hover:border-primary/50 rounded-xl p-3 flex flex-col justify-between hover:shadow-md transition-all group hover:-translate-y-0.5"
                  >
                    <div>
                      <div className="aspect-video w-full rounded-lg overflow-hidden mb-3.5 bg-background relative flex items-center justify-center">
                        <img src={p.images[0] || PLACEHOLDER_IMAGE} className="max-h-full max-w-full object-contain" alt={p.name} />
                      </div>
                      <h3 className="text-xs font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors mb-1">
                        {p.name}
                      </h3>
                      <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                        {p.shortDescription}
                      </p>
                    </div>
                    <div className="flex items-center justify-between border-t border-border/20 pt-2.5">
                      <span className="font-bold text-xs text-primary">₹{formatPrice(p.price)}</span>
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">
                        {p.projectType === 'combo_components' ? 'Kit' : 'Built'}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>
    </EShopLayout>
  );
};

export default ProjectDetailPage;
