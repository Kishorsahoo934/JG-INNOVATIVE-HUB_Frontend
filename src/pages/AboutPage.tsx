import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { 
  Target, 
  Users, 
  Rocket, 
  Sparkles, 
  TrendingUp, 
  MapPin, 
  BookOpen, 
  Cpu, 
  Share2, 
  ShieldCheck 
} from 'lucide-react';
import SEO from '@/components/SEO';
import ScrollReveal from '@/components/ScrollReveal';

const AboutPage = () => {
  const fullText = "JG Innovative Hub";
  const [typedText, setTypedText] = useState("");
  const [isTypingDone, setIsTypingDone] = useState(false);
  
  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i < fullText.length) {
        setTypedText(fullText.slice(0, i + 1));
        i++;
      } else {
        clearInterval(timer);
        setIsTypingDone(true);
      }
    }, 120);
    return () => clearInterval(timer);
  }, []);

  return (
    <Layout>
      <SEO
        title="About JG Innovative Hub — Learn, Build, Share, Innovate"
        description="JG Innovative Hub Pvt. Ltd. is an innovation-driven technology and product engineering company in Odisha. Meet founder Jagadeswar Pati, co-founder Gopal Krushna Mahapatra, and discover our vision."
        path="/about"
      />
      <style>{`
        @keyframes blink-caret {
          from, to { border-color: transparent }
          50% { border-color: currentColor }
        }
        .typewriter-cursor {
          animation: blink-caret 0.75s step-end infinite;
        }
      `}</style>
      
      <div className="network-bg min-h-screen text-foreground">
        {/* Hero Section */}
        <section className="relative py-12 md:py-16 overflow-hidden border-b border-border/10">
          <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold uppercase tracking-wider mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                Innovation Engineering Excellence
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold text-foreground tracking-tight mb-6 leading-tight">
                About <span className={`text-primary pr-1 inline-block ${isTypingDone ? 'border-r-0' : 'border-r-4 border-primary typewriter-cursor'}`}>{typedText}</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground leading-relaxed font-light max-w-3xl mx-auto text-justify">
                JG Innovative Hub Pvt. Ltd. is an innovation-driven technology and product engineering company. We bridge the gap between concept and implementation by creating technologies that contribute to a smarter, more connected, and sustainable future.
              </p>
            </div>
          </div>
        </section>

        {/* Our Core Philosophy Section (Put First - Enlarged Text) */}
        <section className="py-12 md:py-16 bg-muted/5 border-b border-border/10">
          <div className="container mx-auto px-4 max-w-6xl">
            <ScrollReveal>
              <div className="text-center mb-10 max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">Our Core Philosophy</h2>
                <p className="text-sm sm:text-base text-muted-foreground mt-2 uppercase tracking-widest font-semibold text-primary">
                  Learn • Build • Share • Innovate
                </p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Learn',
                  icon: BookOpen,
                  desc: 'Learning inspires ideas. We foster continuous education and curiosity to establish a strong technical baseline.',
                  color: 'group-hover:text-blue-500',
                  bg: 'bg-blue-500/10'
                },
                {
                  title: 'Build',
                  icon: Cpu,
                  desc: 'Building transforms ideas into solutions. We prioritize hands-on engineering, custom routing, and prototyping.',
                  color: 'group-hover:text-green-500',
                  bg: 'bg-green-500/10'
                },
                {
                  title: 'Share',
                  icon: Share2,
                  desc: 'Sharing empowers individuals, communities, and innovators. We publish our tools and resources to help others grow.',
                  color: 'group-hover:text-yellow-500',
                  bg: 'bg-yellow-500/10'
                },
                {
                  title: 'Innovate',
                  icon: Sparkles,
                  desc: 'Innovation creates lasting impact. We solve real-world problems to design a smarter, more sustainable future.',
                  color: 'group-hover:text-purple-500',
                  bg: 'bg-purple-500/10'
                }
              ].map((phi, idx) => (
                <ScrollReveal key={idx} delay={idx * 150}>
                  <div className="bg-card border border-border/60 hover:border-primary/45 hover:-translate-y-1.5 transition-all duration-300 rounded-3xl p-8 flex flex-col justify-between group shadow-sm h-full">
                    <div>
                      <div className={`w-12 h-12 rounded-xl ${phi.bg} flex items-center justify-center text-muted-foreground transition-colors ${phi.color} mb-6`}>
                        <phi.icon className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-foreground mb-3">{phi.title}</h3>
                      <p className="text-sm sm:text-base text-muted-foreground/90 font-medium leading-relaxed text-justify">{phi.desc}</p>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>

        {/* Leadership Team (Put Second - Enlarged Text) */}
        <section className="py-12 md:py-16 bg-muted/10 border-b border-border/10">
          <div className="container mx-auto px-4 max-w-6xl">
            <ScrollReveal>
              <div className="text-center mb-12 max-w-2xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tight mb-4">Founder & Directors</h2>
                <p className="text-base sm:text-lg text-muted-foreground text-justify">
                  Meet the visionaries leading JG Innovative Hub toward strategic technological advancement and expansion.
                </p>
              </div>
            </ScrollReveal>

            <div className="space-y-8 max-w-4xl mx-auto">
              {/* Founder Profile */}
              <ScrollReveal delay={0} className="w-full">
                <div className="bg-card border border-border/60 hover:border-primary/45 hover:shadow-md transition-all rounded-3xl p-8 sm:p-10 block md:flow-root group">
                  <div className="w-full md:w-52 flex flex-col items-center mx-auto md:mx-0 md:float-left md:mr-8 md:mb-6 mb-6">
                    <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden border border-border bg-muted/30 shadow-inner group-hover:border-primary/50 transition-colors">
                      <img 
                        src="/assets/JP Poster.png" 
                        alt="Jagadeswar Pati"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=350&auto=format&fit=crop&q=80';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="mt-4 text-center">
                      <span className="text-xs text-primary font-bold uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                        Founder & Director
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="text-center md:text-left">
                      <h3 className="text-2xl sm:text-3xl font-black text-foreground hover:text-primary transition-colors">Jagadeswar Pati</h3>
                      <p className="text-sm sm:text-base text-primary font-bold mt-1">Chief Executive Officer (CEO)</p>
                    </div>
                    <div className="text-sm sm:text-base text-muted-foreground/90 font-medium leading-relaxed space-y-3 text-justify">
                      <p>
                        Jagadeswar Pati is the Founder and Director of JG Innovative Hub Pvt. Ltd. With a strong foundation in Robotics, Embedded Systems, Renewable Energy Technologies, and Product Development, he has dedicated his career to creating practical engineering solutions that solve real-world challenges. His passion for innovation, research, and technology-driven impact forms the cornerstone of the company's vision and long-term growth strategy.
                      </p>
                      <blockquote className="font-serif italic text-primary text-base sm:text-lg border-l-4 border-primary/45 pl-4 py-1.5 my-4 bg-primary/5 rounded-r-xl leading-relaxed text-justify">
                        “As the CEO, I lead the organization's strategic direction, product innovation initiatives, research programs, partnerships, and business expansion efforts. I believe that innovation becomes meaningful when technology is transformed into practical solutions.”
                      </blockquote>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Co-Founder Profile */}
              <ScrollReveal delay={200} className="w-full">
                <div className="bg-card border border-border/60 hover:border-primary/45 hover:shadow-md transition-all rounded-3xl p-8 sm:p-10 block md:flow-root group">
                  <div className="w-full md:w-52 flex flex-col items-center mx-auto md:mx-0 md:float-right md:ml-8 md:mb-6 mb-6">
                    <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden border border-border bg-muted/30 shadow-inner group-hover:border-primary/50 transition-colors">
                      <img 
                        src="/assets/My Poster.png" 
                        alt="Gopal Krushna Mahapatra"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=350&auto=format&fit=crop&q=80';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                    <div className="mt-4 text-center">
                      <span className="text-xs text-primary font-bold uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">
                        Co-Founder & Director
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="text-center md:text-left">
                      <h3 className="text-2xl sm:text-3xl font-black text-foreground hover:text-primary transition-colors">Gopal Krushna Mahapatra</h3>
                      <p className="text-sm sm:text-base text-primary font-bold mt-1">Chief Operating Officer (COO)</p>
                    </div>
                    <div className="text-sm sm:text-base text-muted-foreground/90 font-medium leading-relaxed space-y-3 text-justify">
                      <p>
                        Gopal Krushna Mahapatra is the Co-Founder and Director of JG Innovative Hub Pvt. Ltd. He brings expertise in Artificial Intelligence (AI), Internet of Things (IoT), Embedded Systems, Automation, Product Engineering, and Technology Operations. His commitment to innovation and execution plays a vital role in transforming ideas into scalable and market-ready solutions.
                      </p>
                      <blockquote className="font-serif italic text-primary text-base sm:text-lg border-l-4 border-primary/45 pl-4 py-1.5 my-4 bg-primary/5 rounded-r-xl leading-relaxed text-justify">
                        “As the COO, I oversee organizational operations, project execution, technology implementation, team development, and strategic growth. I believe that great innovation happens when ideas meet execution to build a technology-driven future.”
                      </blockquote>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* Core Profile Narrative & Targets (The Rest - Part 1) */}
        <section className="py-12 md:py-16 bg-muted/20 border-b border-border/10">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <ScrollReveal>
                <div className="space-y-6">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                    Transforming Ideas into Engineering Reality
                  </h2>
                  <div className="text-muted-foreground leading-relaxed space-y-4 text-base text-justify">
                    <p>
                      JG Innovative Hub Pvt. Ltd. is headquartered in Gothapatna, Bhubaneswar, Khordha, Odisha, with an operational presence at STPI. Founded with the vision of transforming ideas into impactful solutions, the company is committed to advancing innovation through engineering excellence, research, emerging technologies, and practical problem-solving.
                    </p>
                    <p>
                      Driven by a team of passionate engineers, innovators, researchers, and technology professionals, JG Innovative Hub continuously works toward building a strong innovation ecosystem that fosters creativity, collaboration, entrepreneurship, and technological advancement. We believe that meaningful innovation is achieved when knowledge, engineering, and execution come together to create solutions that generate long-term value for individuals, industries, businesses, and communities.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
              
              {/* Targets Metrics Visual */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <ScrollReveal delay={0}>
                  <div className="bg-card border border-border/60 hover:border-primary/30 transition-all rounded-2xl p-6 shadow-md flex flex-col justify-between group h-full">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-3xl md:text-4xl font-black text-foreground mb-1 bg-gradient-to-r from-primary to-indigo-500 bg-clip-text text-transparent">
                        $1 Billion
                      </div>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Valuation Target
                      </div>
                      <p className="text-[11px] text-muted-foreground/80 mt-2 text-justify">
                        Evolving into a globally recognized technology enterprise with high-growth metrics.
                      </p>
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={150}>
                  <div className="bg-card border border-border/60 hover:border-primary/30 transition-all rounded-2xl p-6 shadow-md flex flex-col justify-between group h-full">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 mb-4 group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-3xl md:text-4xl font-black text-foreground mb-1 bg-gradient-to-r from-blue-500 to-cyan-500 bg-clip-text text-transparent">
                        1,000+
                      </div>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        Talented Workforce
                      </div>
                      <p className="text-[11px] text-muted-foreground/80 mt-2 text-justify">
                        Creating large-scale employment and empowering the next generation of engineers.
                      </p>
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={300} className="sm:col-span-2">
                  <div className="bg-card border border-border/60 hover:border-primary/30 transition-all rounded-2xl p-6 shadow-md flex flex-col justify-between group h-full">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0 group-hover:scale-110 transition-transform">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-lg font-bold text-foreground">
                          Multi-City Innovation Network
                        </div>
                        <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                          Strategic Indian Tech Ecosystems by 2030
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3 leading-relaxed text-justify">
                      Expanding beyond Odisha through strategic offices and development centers in <strong className="text-foreground">Hyderabad, Bengaluru, Mumbai, Uttar Pradesh, and West Bengal</strong>, enabling nationwide reach and stronger industry partnerships.
                    </p>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>

        {/* Vision & Mission (The Rest - Part 2) */}
        <section className="py-12 md:py-16 pb-16">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {/* Vision Card */}
              <ScrollReveal delay={0}>
                <div className="bg-card/50 backdrop-blur-sm border border-border/60 rounded-2xl p-8 shadow-sm flex flex-col justify-between group hover:border-primary/45 transition-colors h-full">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                      <Target className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">Our Vision</h2>
                    <p className="text-muted-foreground leading-relaxed text-sm sm:text-base text-justify">
                      To become a globally recognized technology and innovation company that develops transformative products, advances sustainable engineering, and empowers future generations through accessible, intelligent, and impactful technologies.
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-sm sm:text-base mt-4 text-justify">
                      We envision a future where innovation drives progress, technology improves quality of life, and engineering solutions contribute to a smarter, more connected, and sustainable world. Through continuous innovation, global expansion, and engineering excellence, we aspire to build one of the world's most respected technology enterprises while creating meaningful social and economic impact.
                    </p>
                  </div>
                </div>
              </ScrollReveal>

              {/* Mission Card */}
              <ScrollReveal delay={200}>
                <div className="bg-card/50 backdrop-blur-sm border border-border/60 rounded-2xl p-8 shadow-sm flex flex-col justify-between group hover:border-primary/45 transition-colors h-full">
                  <div>
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-6">
                      <Rocket className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-foreground mb-4">Our Mission</h2>
                    <p className="text-muted-foreground leading-relaxed text-sm sm:text-base mb-6 text-justify">
                      To develop practical, innovative, and sustainable technology solutions that solve real-world challenges through research, engineering excellence, and product innovation.
                    </p>
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-foreground uppercase tracking-wider border-b border-border/40 pb-2 mb-3">
                        We are committed to:
                      </div>
                      {[
                        "Developing advanced technology products with real-world impact.",
                        "Creating reliable renewable energy and smart engineering solutions.",
                        "Transforming innovative ideas into scalable technologies and sustainable businesses.",
                        "Advancing innovation in Artificial Intelligence, IoT, Robotics, Embedded Systems, and Automation.",
                        "Supporting entrepreneurship, research, and engineering excellence.",
                        "Empowering industries, businesses, educational institutions, and communities through technology.",
                        "Building a culture of continuous learning, collaboration, and innovation.",
                        "Creating employment opportunities and contributing to technological and economic development."
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-start gap-2.5">
                          <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                            <ShieldCheck className="w-3 h-3 text-primary" />
                          </div>
                          <span className="text-xs sm:text-sm text-muted-foreground leading-snug">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default AboutPage;
