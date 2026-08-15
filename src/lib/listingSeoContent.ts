/**
 * Static SEO copy for product listing (category / search) to reduce thin-content signals.
 */
import { STATIC_CATEGORIES } from '@/utils/products';

const DEFAULT_INTRO = {
  h2: 'Buy electronics and robotics parts online in India',
  sections: [
    {
      title: 'Why shop at Innovative Hub',
      body:
        'Innovative Hub is an Odisha-based store built for engineering students, hobbyists and professionals who need reliable components without guesswork. We curate microcontrollers, sensors, displays, motor drivers, power supplies and IoT modules so you can prototype faster — whether you are building a line-follower robot, a home automation project or a final-year embedded system. Every category is organized for quick discovery, with clear pricing and stock information on each product page.',
    },
    {
      title: 'Quality, delivery and support',
      body:
        'We focus on parts that match common Indian lab and maker workflows: Arduino- and ESP-family boards, breakout modules, jumper wires, relays and batteries. Orders are fulfilled with care from Bhubaneswar, with shipping across India. If you need help choosing between similar boards or sensors, our product descriptions highlight typical applications. Use the search bar for SKU or keywords, or filter by category to browse the full catalog in a few clicks.',
    },
    {
      title: 'Explore the full catalog',
      body:
        'From discrete components to complete modules, Innovative Hub connects you to the building blocks of robotics and embedded systems. Bookmark this page to return for new arrivals, seasonal offers and expanded categories. For account-specific tools, use the header links to track orders or manage your wishlist after signing in.',
    },
  ],
};

const CATEGORY_COPY: Record<string, { extra: string }> = {
  'electronics-components': {
    extra:
      'This section covers resistors, capacitors, connectors, ICs and passive parts that underpin every circuit. Ideal for restocking your workbench or classroom lab kits.',
  },
  'microcontroller-boards': {
    extra:
      'Choose from popular development boards compatible with Arduino IDE, MicroPython or embedded C workflows. Perfect for firmware learning and rapid prototyping.',
  },
  sensors: {
    extra:
      'Temperature, motion, distance, gas and environmental sensors for automation, robotics and data-logging projects.',
  },
  'motors-motor-drivers': {
    extra:
      'DC motors, steppers, servos and matching drivers for drones, rovers and CNC-style mechanisms.',
  },
  'iot-wireless-boards': {
    extra:
      'Wi-Fi, Bluetooth and LoRa-class modules for connected devices and smart-home style applications.',
  },
};

function wordCountApprox(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}

export function getListingSeoBlocks(
  categorySlug: string,
  categoryName: string,
  searchQuery: string
): { h2: string; sections: { title: string; body: string }[] } {
  if (searchQuery.trim()) {
    const q = searchQuery.trim().slice(0, 80);
    return {
      h2: `Search results for "${q}"`,
      sections: [
        {
          title: 'Find the right component',
          body: `You searched for "${q}". Refine results with the category chips above or clear the search to browse the full Innovative Hub catalog. We stock robotics, IoT and embedded parts with detailed descriptions, images and specifications on each product page. If an exact match is not listed, try broader keywords such as the chip name, voltage or interface (I2C, SPI, UART).`,
        },
        {
          title: 'Shop with confidence',
          body:
            'Innovative Hub serves students and makers across India from Bhubaneswar, Odisha. Product pages include price, GST context where applicable, and stock status so you can plan builds and coursework. Continue exploring related categories from the footer and navigation for sensors, boards, power and mechanical parts.',
        },
      ],
    };
  }

  if (!categorySlug || categorySlug === 'all') {
    return DEFAULT_INTRO;
  }

  const cat = STATIC_CATEGORIES.find((c) => c.slug === categorySlug);
  const label = cat?.name || categoryName;
  const extra = CATEGORY_COPY[categorySlug]?.extra;

  const sections = [
    {
      title: `${label} at Innovative Hub`,
      body:
        `Browse ${label.toLowerCase()} selected for robotics, IoT and embedded learning. ` +
        (extra ? `${extra} ` : '') +
        `Use sort options to compare by price or newest arrivals. Each product links to a dedicated page with gallery, description, specifications and verified customer reviews where available.`,
    },
    {
      title: 'Related categories and kits',
      body: `Combine items from ${label.toLowerCase()} with power supplies, cables and enclosures from our other categories to complete your build. Return to the E-Shop hub for featured collections, or open the footer links to jump to policies, FAQs and contact options.`,
    },
    ...DEFAULT_INTRO.sections.slice(1),
  ];

  let merged = { h2: `${label} — buy online at Innovative Hub`, sections };
  const wc = sections.reduce((n, s) => n + wordCountApprox(s.body), 0);
  if (wc < 200) {
    merged = {
      ...merged,
      sections: [
        sections[0],
        {
          title: 'How to choose and order',
          body:
            'Read the short description on each card, then open the product page for full technical detail. Add to cart when stock is available, or save to your wishlist for later. We recommend checking pin compatibility and voltage ratings before ordering for university or competition robots.',
        },
        ...sections.slice(1),
      ],
    };
  }
  return merged;
}
