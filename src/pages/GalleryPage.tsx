import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import SEO from '@/components/SEO';
import { Camera, X, ZoomIn } from 'lucide-react';
import { galleryApi, GalleryItem } from '@/services/api';

const dummyGalleryItems: GalleryItem[] = [
  {
    _id: '1',
    title: 'Robotics Workshop',
    category: 'workshops',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
    description: 'Students building and programming autonomous mobile robots during our weekend bootcamp.'
  },
  {
    _id: '2',
    title: 'IoT Circuit Bench',
    category: 'lab',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80',
    description: 'Testing sensor integration and wireless telemetry modules on custom PCB designs.'
  },
  {
    _id: '3',
    title: 'Embedded Firmware Coding',
    category: 'projects',
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80',
    description: 'Debugging driver code for microcontrollers and real-time operating systems.'
  },
  {
    _id: '4',
    title: 'Student Innovation Summit',
    category: 'events',
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
    description: 'Makers demonstrating their prototypes to industry experts and judges.'
  },
  {
    _id: '5',
    title: 'Drone Assembly and Calibration',
    category: 'projects',
    image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
    description: 'Hands-on training session on quadcopter frame assembly and PID tuning.'
  },
  {
    _id: '6',
    title: '3D Prototyping Station',
    category: 'lab',
    image: 'https://images.unsplash.com/photo-1615840287214-7fe58a8f3685?auto=format&fit=crop&w=800&q=80',
    description: 'Additive manufacturing workshop creating custom brackets for robotic arms.'
  },
  {
    _id: '7',
    title: 'Arduino Basics Lab',
    category: 'workshops',
    image: 'https://images.unsplash.com/photo-1553406830-ef251367749c?auto=format&fit=crop&w=800&q=80',
    description: 'High school students learning digital inputs, PWM, and motor driver fundamentals.'
  },
  {
    _id: '8',
    title: 'Hardware Hackathon',
    category: 'events',
    image: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
    description: '24-hour non-stop building, testing, and pitching smart IoT appliances.'
  }
];

const GalleryPage = () => {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await galleryApi.getAll();
        if (res.success && Array.isArray(res.data) && res.data.length > 0) {
          setItems(res.data);
        } else {
          setItems(dummyGalleryItems);
        }
      } catch (err) {
        console.error('Failed to load gallery from backend, using local fallbacks', err);
        setItems(dummyGalleryItems);
      } finally {
        setIsLoading(false);
      }
    };
    fetchItems();
  }, []);

  const filters = [
    { id: 'all', label: 'All Images' },
    { id: 'workshops', label: 'Workshops' },
    { id: 'projects', label: 'Projects' },
    { id: 'lab', label: 'Lab Space' },
    { id: 'events', label: 'Events' }
  ];

  const filteredItems = activeFilter === 'all'
    ? items
    : items.filter(item => item.category === activeFilter);

  return (
    <Layout>
      <SEO
        title="Gallery — Innovative Hub"
        description="Explore photos and updates from our hands-on workshops, robotics labs, hackathons, and student projects."
        path="/gallery"
      />
      <div className="network-bg">
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 flex items-center justify-center gap-3">
                <Camera className="w-10 h-10 text-primary shrink-0" />
                Our Gallery
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Take a look inside the lab. See workshops, student collaborations, prototyping, and the innovation ecosystem in action.
              </p>
            </div>
          </div>
        </section>

        {/* Filter Tabs */}
        <section className="py-4">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3 max-w-2xl mx-auto">
              {filters.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                    activeFilter === filter.id
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105'
                      : 'bg-card border border-border hover:border-primary/50 text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Grid Section */}
        <section className="py-12 md:py-16 pb-24">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="bg-[#1a2332]/40 border border-border/40 rounded-xl overflow-hidden">
                    <div className="w-full h-56 bg-slate-800/40" />
                    <div className="p-5 space-y-3">
                      <div className="w-16 h-4 bg-slate-800/40 rounded" />
                      <div className="w-3/4 h-5 bg-slate-800/40 rounded" />
                      <div className="w-full h-4 bg-slate-800/40 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <div
                    key={item._id}
                    onClick={() => setSelectedImage(item)}
                    className="group relative bg-[#1a2332]/40 border border-border/40 rounded-xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl hover:border-primary/40 transition-all duration-500 animate-fade-in"
                  >
                    {/* Aspect Ratio Container */}
                    <div className="w-full h-56 overflow-hidden relative">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        loading="lazy"
                      />
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="bg-primary/95 text-white p-3 rounded-full scale-75 group-hover:scale-100 transition-transform duration-300">
                          <ZoomIn className="w-6 h-6" />
                        </div>
                      </div>
                    </div>

                    {/* Details Card */}
                    <div className="p-5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full mb-3 inline-block">
                        {item.category}
                      </span>
                      <h3 className="text-base font-bold text-white mb-2 group-hover:text-primary transition-colors duration-300">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-400 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 transition-all duration-300"
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-primary transition-colors p-2 z-50 bg-black/45 rounded-full"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div
            className="relative max-w-4xl w-full flex flex-col items-center bg-[#0d1527] border border-border rounded-2xl overflow-hidden shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-h-[70vh] overflow-hidden">
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-6 md:p-8 w-full text-left bg-gradient-to-t from-[#0b0e17] to-[#0d1527]">
              <span className="text-xs uppercase font-bold tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full mb-3 inline-block">
                {selectedImage.category}
              </span>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-3">
                {selectedImage.title}
              </h2>
              <p className="text-sm text-gray-300 leading-relaxed">
                {selectedImage.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default GalleryPage;
