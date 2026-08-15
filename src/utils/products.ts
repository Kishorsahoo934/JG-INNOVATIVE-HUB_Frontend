export interface Product {
  _id: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  price: number;
  mrp: number;
  gstMode?: 'including' | 'excluding';
  gstPercentage?: number;
  category: string;
  subcategory: string;
  images: string[];
  videos?: string[];
  cloudinaryUrl: string;
  stock: number;
  sku: string;
  features: string[];
  specifications: Record<string, string>;
  datasheet?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  icon: string;
  image: string;
}

export const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-');

export const STATIC_CATEGORIES: Category[] = [
  { _id: 'electronics-components', name: 'Electronics Components', slug: 'electronics-components', icon: 'CircuitBoard', image: '' },
  { _id: 'microcontroller-boards', name: 'Microcontroller Boards', slug: 'microcontroller-boards', icon: 'Cpu', image: '' },
  { _id: 'electronic-modules', name: 'Electronic Modules', slug: 'electronic-modules', icon: 'Layers', image: '' },
  { _id: 'displays', name: 'Displays', slug: 'displays', icon: 'Monitor', image: '' },
  { _id: '3d-printing-service', name: '3D Printing Service', slug: '3d-printing-service', icon: 'Box', image: '' },
  { _id: 'battery-charger', name: 'Battery & Charger', slug: 'battery-charger', icon: 'Battery', image: '' },
  { _id: 'iot-wireless-boards', name: 'IoT / Wireless Boards', slug: 'iot-wireless-boards', icon: 'Wifi', image: '' },
  { _id: 'sensors', name: 'Sensors', slug: 'sensors', icon: 'Activity', image: '' },
  { _id: 'power-supply', name: 'Power Supply', slug: 'power-supply', icon: 'Zap', image: '' },
  { _id: 'mic-speaker', name: 'Mic & Speaker', slug: 'mic-speaker', icon: 'Volume2', image: '' },
  { _id: 'motors-motor-drivers', name: 'Motors & Motor Drivers', slug: 'motors-motor-drivers', icon: 'Wrench', image: '' },
  { _id: 'relays', name: 'Relays', slug: 'relays', icon: 'ToggleRight', image: '' },
  { _id: 'drone-parts', name: 'Drone Parts', slug: 'drone-parts', icon: 'Plane', image: '' },
  { _id: 'equipment', name: 'Equipment', slug: 'equipment', icon: 'Package', image: '' },
  { _id: 'engineering-zone', name: 'Engineering Zone', slug: 'engineering-zone', icon: 'Settings', image: '' },
  { _id: 'innovation-zone', name: 'Innovation Zone', slug: 'innovation-zone', icon: 'LayoutGrid', image: '' },
  { _id: 'miscellaneous', name: 'Miscellaneous', slug: 'miscellaneous', icon: 'Box', image: '' },
];

