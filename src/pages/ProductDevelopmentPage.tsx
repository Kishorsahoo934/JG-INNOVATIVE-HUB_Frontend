import React from 'react';
import { ShieldCheck, Wrench, LayoutGrid } from 'lucide-react';
import SEO from '@/components/SEO';
import Layout from '@/components/Layout';
import ScrollReveal from '@/components/ScrollReveal';

const developedProducts = [
  {
    name: 'Industrial IoT Telemetry Node',
    description: 'Custom ESP32 & SIM7600 based multi-sensor loggers configured for real-time remote environmental data logging.',
    tag: 'IoT Gateway'
  },
  {
    name: 'Heavy-Duty 4WD Robot Rover Chassis',
    description: 'Anodized aluminum structural plates with shock absorbers, customized for autonomous robotics navigation stacks.',
    tag: 'Robotics Hardware'
  },
  {
    name: 'Custom STM32 Development Board',
    description: 'Bespoke PCB designs containing low-noise analog rails, integrated battery management, and UART modules.',
    tag: 'Custom PCB'
  },
  {
    name: 'STEM Interactive Robotics Kit',
    description: 'Educational microcontroller combo packages designed for high schools to teach embedded firmware programming.',
    tag: 'STEM Education'
  }
];

const provisions = [
  {
    title: 'Hardware Schematic & Layout Design',
    description: 'Professional multi-layer PCB design using Altium, optimized for electromagnetic compatibility (EMC).'
  },
  {
    title: 'Rapid Prototyping & Enclosures',
    description: 'In-house SLA/FDM 3D printing and custom acrylic panel cutting for robust protective enclosures.'
  },
  {
    title: 'Embedded Firmware Integration',
    description: 'Custom microcode development in C/C++, MicroPython, or ROS2 for real-time sensor processing.'
  },
  {
    title: 'Quality Verification & Tuning',
    description: 'Thorough logic analyzer profiling, power consumption diagnostics, and debugging.'
  }
];

const metrics = [
  { value: '50+', label: 'Custom Prototypes' },
  { value: '200+', label: '3D Prints Shipped' },
  { value: '15+', label: 'Industry Clients' },
  { value: '100%', label: 'In-House R&D' }
];

const ProductDevelopmentPage = () => {
  return (
    <Layout>
      <SEO 
        title="Product Development & Hardware Design" 
        description="From hardware design and multi-layer PCB routing to 3D printing and custom enclosures. We build your concept into market-ready prototypes."
        path="/product-development" 
      />
      <div className="network-bg min-h-screen py-10 sm:py-16 md:py-20 text-foreground">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header */}
          <ScrollReveal direction="up">
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4 text-foreground">
                Product Development
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                From concepts to market-ready hardware. We design, prototype, and manufacture custom electronics, IoT nodes, and mechanical parts.
              </p>
            </div>
          </ScrollReveal>

          {/* Showcase & Provisions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start mb-16">
            {/* Products Showcased (Marketing) */}
            <div className="lg:col-span-2 space-y-6">
              <ScrollReveal direction="left">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-primary" />
                  Showcase & Innovations
                </h2>
              </ScrollReveal>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {developedProducts.map((p, idx) => (
                  <ScrollReveal key={idx} delay={idx * 150} direction="up" className="h-full">
                    <div className="bg-card/50 backdrop-blur-sm border border-border/60 rounded-xl p-6 hover:border-primary/40 transition-colors flex flex-col justify-between h-full group">
                      <div>
                        <h3 className="text-sm font-bold text-foreground mb-2 group-hover:text-primary transition-colors">{p.name}</h3>
                        <p className="text-xs text-muted-foreground leading-relaxed mb-4">{p.description}</p>
                      </div>
                      <div>
                        <span className="text-[9px] text-primary font-bold uppercase tracking-wider bg-primary/10 px-2.5 py-1 rounded">
                          {p.tag}
                        </span>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </div>

            {/* List of Provisions */}
            <div className="space-y-6">
              <ScrollReveal direction="right">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-primary" />
                  What We Provide
                </h2>
              </ScrollReveal>
              <ScrollReveal direction="right" delay={150}>
                <div className="bg-card/50 backdrop-blur-sm border border-border/60 rounded-xl p-6 space-y-5">
                  {provisions.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xs font-bold text-foreground mb-1">{item.title}</h3>
                        <p className="text-[11px] text-muted-foreground leading-normal">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>

          {/* Data Showcase Metrics */}
          <ScrollReveal direction="scale" delay={300}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto bg-card/30 backdrop-blur-sm border border-border/40 rounded-xl p-8 text-center">
              {metrics.map((m, idx) => (
                <div key={idx} className="p-2 border-r border-border/10 last:border-none">
                  <div className="text-3xl sm:text-4xl font-extrabold text-primary mb-1">{m.value}</div>
                  <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider font-semibold">{m.label}</div>
                </div>
              ))}
            </div>
          </ScrollReveal>

        </div>
      </div>
    </Layout>
  );
};

export default ProductDevelopmentPage;