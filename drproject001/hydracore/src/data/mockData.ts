import type {
  Product,
  Category,
  NewsItem,
  TeamMember,
  Branch,
  Stat,
  Testimonial,
  HeroSlide,
  NavItem,
  FaqItem,
} from '../types'

// ─── Hero Slides ─────────────────────────────────────────────────────────────

export const heroSlides: HeroSlide[] = [
  {
    id: 'slide-1',
    title: 'Smart Water Management for the Modern World',
    subtitle: 'iDayliff IoT Platform',
    description:
      'Monitor, control, and optimize your water systems remotely with our cutting-edge IoT technology. Real-time data, predictive maintenance, and zero downtime.',
    ctaText: 'Explore iDayliff',
    ctaLink: '/products/controllers',
    secondaryCtaText: 'Watch Demo',
    secondaryCtaLink: '/news',
    gradient: 'linear-gradient(135deg, #003380 0%, #0052CC 55%, #0066FF 100%)',
    tag: 'New Innovation',
  },
  {
    id: 'slide-2',
    title: 'Power Your Future with Clean Solar Energy',
    subtitle: 'Complete Solar Systems',
    description:
      'From rooftop panels to solar water pumps, we offer end-to-end solar solutions that reduce costs and protect the environment across East Africa.',
    ctaText: 'View Solar Solutions',
    ctaLink: '/products/solar',
    secondaryCtaText: 'Calculate Savings',
    secondaryCtaLink: '/products/solar',
    gradient: 'linear-gradient(135deg, #005E40 0%, #00875A 55%, #00A86B 100%)',
    tag: 'Solar Solutions',
  },
  {
    id: 'slide-3',
    title: 'Reliable Water Pumping Solutions for Every Need',
    subtitle: 'Industry-Leading Brands',
    description:
      'Dayliff, Grundfos, Pedrollo, and more — we stock over 5,000 pumping products for domestic, agricultural, and industrial applications.',
    ctaText: 'Shop Water Pumps',
    ctaLink: '/products/water-pumps',
    secondaryCtaText: 'Find a Branch',
    secondaryCtaLink: '/contact',
    gradient: 'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 55%, #3B82F6 100%)',
    tag: 'Water Pumps',
  },
  {
    id: 'slide-4',
    title: 'Improving Lives Across East Africa for 75+ Years',
    subtitle: '#ImprovingLives',
    description:
      "From clean water access to sustainable energy, Davis & Shirtliff's commitment to communities drives every solution we deliver across 10 countries.",
    ctaText: 'Our Impact Story',
    ctaLink: '/about',
    secondaryCtaText: 'CSR Report 2025',
    secondaryCtaLink: '/news',
    gradient: 'linear-gradient(135deg, #7C2D12 0%, #C2410C 55%, #F97316 100%)',
    tag: '#ImprovingLives',
  },
]

// ─── Product Categories ───────────────────────────────────────────────────────

export const categories: Category[] = [
  {
    id: 'cat-1',
    name: 'Water Pumps',
    slug: 'water-pumps',
    description: 'Domestic, agricultural, and industrial pumping solutions',
    longDescription:
      'We stock one of the largest ranges of water pumps in Africa, including centrifugal pumps, submersible pumps, borehole pumps, and fire-fighting pumps from world-class brands like Dayliff, Grundfos, Pedrollo, Davey, and DAB.',
    icon: 'Droplets',
    image: '',
    color: '#0052CC',
    subcategories: [
      { name: 'Centrifugal Pumps', slug: 'centrifugal-pumps' },
      { name: 'Submersible Pumps', slug: 'submersible-pumps' },
      { name: 'Borehole Pumps', slug: 'borehole-pumps' },
      { name: 'Surface Pumps', slug: 'surface-pumps' },
      { name: 'Fire Fighting Pumps', slug: 'fire-fighting-pumps' },
    ],
  },
  {
    id: 'cat-2',
    name: 'Solar Solutions',
    slug: 'solar',
    description: 'Solar panels, inverters, water heaters & battery storage',
    longDescription:
      'Complete solar energy systems for homes, businesses, and agricultural use. From solar water pumps to full off-grid systems with lithium battery storage and smart monitoring.',
    icon: 'Sun',
    image: '',
    color: '#F59E0B',
    subcategories: [
      { name: 'Solar Panels', slug: 'solar-panels' },
      { name: 'Solar Water Heaters', slug: 'solar-water-heaters' },
      { name: 'Solar Inverters', slug: 'solar-inverters' },
      { name: 'Solar Pumps', slug: 'solar-pumps' },
      { name: 'Battery Storage', slug: 'battery-storage' },
    ],
  },
  {
    id: 'cat-3',
    name: 'Generators',
    slug: 'generators',
    description: 'Petrol, diesel, and welding generators for reliable backup power',
    longDescription:
      'Reliable power generation for homes, businesses, and industrial sites. Our range covers portable petrol generators to large silent diesel sets for critical infrastructure.',
    icon: 'Zap',
    image: '',
    color: '#EF4444',
    subcategories: [
      { name: 'Petrol Generators', slug: 'petrol-generators' },
      { name: 'Diesel Generators', slug: 'diesel-generators' },
      { name: 'Welding Generators', slug: 'welding-generators' },
      { name: 'Generator Accessories', slug: 'generator-accessories' },
    ],
  },
  {
    id: 'cat-4',
    name: 'Swimming Pools',
    slug: 'swimming-pools',
    description: 'Pool filters, pumps, chemicals, and accessories',
    longDescription:
      'Everything you need to build, maintain, and enjoy your swimming pool. We supply pool equipment, chemicals, and accessories for both residential and commercial pools.',
    icon: 'Waves',
    image: '',
    color: '#06B6D4',
    subcategories: [
      { name: 'Pool Filters', slug: 'pool-filters' },
      { name: 'Pool Pumps', slug: 'pool-pumps' },
      { name: 'Pool Chemicals', slug: 'pool-chemicals' },
      { name: 'Pool Accessories', slug: 'pool-accessories' },
      { name: 'Spas & Fountains', slug: 'spas-fountains' },
    ],
  },
  {
    id: 'cat-5',
    name: 'Water Treatment',
    slug: 'water-treatment',
    description: 'RO systems, UV purifiers, and water treatment plants',
    longDescription:
      'Comprehensive water treatment solutions from point-of-use domestic systems to large industrial and municipal water treatment plants ensuring safe, clean water.',
    icon: 'FlaskConical',
    image: '',
    color: '#8B5CF6',
    subcategories: [
      { name: 'Domestic Units', slug: 'domestic-units' },
      { name: 'RO Systems', slug: 'ro-systems' },
      { name: 'UV Systems', slug: 'uv-systems' },
      { name: 'Water Plants', slug: 'water-plants' },
      { name: 'Chemical Dosage', slug: 'chemical-dosage' },
    ],
  },
  {
    id: 'cat-6',
    name: 'Irrigation',
    slug: 'irrigation',
    description: 'Drip kits, sprinklers, pipes, tanks & flow controls',
    longDescription:
      'Modern irrigation solutions for small-scale farmers to large commercial farms. We offer drip irrigation, sprinkler systems, pivot systems, and smart irrigation controllers.',
    icon: 'Sprout',
    image: '',
    color: '#22C55E',
    subcategories: [
      { name: 'Drip Kits', slug: 'drip-kits' },
      { name: 'Sprinklers', slug: 'sprinklers' },
      { name: 'Irrigation Pipes', slug: 'irrigation-pipes' },
      { name: 'Water Tanks', slug: 'water-tanks' },
      { name: 'Flow Meters', slug: 'flow-meters' },
    ],
  },
  {
    id: 'cat-7',
    name: 'Borehole Solutions',
    slug: 'borehole-solutions',
    description: 'Complete borehole drilling and equipping packages',
    longDescription:
      'From site survey and drilling to pump installation and commissioning, we provide complete borehole solutions for residential, commercial, and community water supply.',
    icon: 'Gauge',
    image: '',
    color: '#0EA5E9',
    subcategories: [
      { name: 'Borehole Drilling', slug: 'borehole-drilling' },
      { name: 'Borehole Pumps', slug: 'borehole-pumps' },
      { name: 'Borehole Equipment', slug: 'borehole-equipment' },
    ],
  },
  {
    id: 'cat-8',
    name: 'General Machinery',
    slug: 'general-machinery',
    description: 'Pressure washers, compressors, mowers & trimmers',
    longDescription:
      'A wide range of machinery for home, garden, and industrial use. We stock pressure washers, air compressors, lawn mowers, brush cutters, and much more.',
    icon: 'Wrench',
    image: '',
    color: '#F97316',
    subcategories: [
      { name: 'Pressure Washers', slug: 'pressure-washers' },
      { name: 'Air Compressors', slug: 'air-compressors' },
      { name: 'Lawn Mowers', slug: 'lawn-mowers' },
      { name: 'Brush Cutters', slug: 'brush-cutters' },
      { name: 'Engines & Motors', slug: 'engines-motors' },
    ],
  },
  {
    id: 'cat-9',
    name: 'Controllers & IoT',
    slug: 'controllers',
    description: 'Smart pump controllers, panels & iDayliff IoT systems',
    longDescription:
      'Control and monitor your water and energy systems with our range of smart controllers, panels, and the iDayliff IoT platform for remote management and automation.',
    icon: 'Cpu',
    image: '',
    color: '#6366F1',
    subcategories: [
      { name: 'Pump Controllers', slug: 'pump-controllers' },
      { name: 'Control Panels', slug: 'control-panels' },
      { name: 'iDayliff IoT', slug: 'idayliff-iot' },
      { name: 'Flow Meters', slug: 'flow-meters' },
    ],
  },
]

// ─── Products ─────────────────────────────────────────────────────────────────

export const products: Product[] = [
  // Water Pumps
  {
    id: 'prod-1',
    name: 'Dayliff DSMART1100 Smart Boosting System',
    category: 'water-pumps',
    subcategory: 'Surface Pumps',
    description:
      'The DSMART1100 is an intelligent water boosting system with built-in variable speed drive and pressure sensor for constant-pressure water supply. Eliminates pressure fluctuations and reduces energy consumption by up to 40%.',
    shortDesc: 'Intelligent constant-pressure water boosting with VSP drive',
    price: 'KES 85,000',
    image: '',
    brand: 'Dayliff',
    featured: true,
    isNew: true,
    isBestSeller: false,
    tags: ['smart', 'variable speed', 'pressure boosting'],
    specs: { 'Power': '1.1 kW', 'Max Head': '50 m', 'Connection': '1"', 'Voltage': '240 V' },
  },
  {
    id: 'prod-2',
    name: 'Grundfos CM5-5 Multistage Pump',
    category: 'water-pumps',
    subcategory: 'Centrifugal Pumps',
    description:
      'Compact, horizontal, multi-stage centrifugal pump in stainless steel for water supply, pressure boosting, and light industrial applications. Highly efficient and quiet operation.',
    shortDesc: 'Reliable horizontal multistage SS pump for pressurization',
    price: 'KES 42,000',
    image: '',
    brand: 'Grundfos',
    featured: true,
    isNew: false,
    isBestSeller: true,
    tags: ['multistage', 'high pressure', 'stainless steel'],
    specs: { 'Max Flow': '3.6 m³/h', 'Max Head': '60 m', 'Power': '0.37 kW', 'Voltage': '240 V' },
  },
  {
    id: 'prod-3',
    name: 'Pedrollo JSWm2BX Self-Priming Pump',
    category: 'water-pumps',
    subcategory: 'Surface Pumps',
    description:
      'Self-priming centrifugal pump in cast iron for clean water. Ideal for domestic and civil water supply where the pump is positioned above the water source.',
    shortDesc: 'Self-priming cast iron pump for domestic water supply',
    price: 'KES 18,500',
    image: '',
    brand: 'Pedrollo',
    featured: false,
    isNew: false,
    isBestSeller: true,
    tags: ['self-priming', 'cast iron', 'domestic'],
    specs: { 'Max Flow': '9 m³/h', 'Max Head': '46 m', 'Power': '1.1 kW', 'Voltage': '240 V' },
  },
  {
    id: 'prod-4',
    name: 'Dayliff DSP 4025 Borehole Pump',
    category: 'water-pumps',
    subcategory: 'Borehole Pumps',
    description:
      '4-inch submersible borehole pump with stainless steel hydraulic parts and a sand-resistant motor. Designed for clean water abstraction from boreholes and deep wells.',
    shortDesc: '4" submersible borehole pump with stainless steel hydraulics',
    price: 'KES 35,000',
    image: '',
    brand: 'Dayliff',
    featured: false,
    isNew: false,
    isBestSeller: false,
    tags: ['borehole', 'submersible', '4-inch'],
    specs: { 'Max Flow': '2.5 m³/h', 'Max Head': '100 m', 'Power': '0.75 kW', 'Min Borehole': '4"' },
  },
  {
    id: 'prod-5',
    name: 'Davey BT40 Pressure Boosting System',
    category: 'water-pumps',
    subcategory: 'Surface Pumps',
    description:
      'Compact pressure boosting tank set with built-in pressure tank, pump, and pressure switch for automatic domestic water supply. Simple installation, minimal maintenance.',
    shortDesc: 'Compact automatic pressure boosting set with integrated tank',
    price: 'KES 25,000',
    image: '',
    brand: 'Davey',
    featured: false,
    isNew: false,
    isBestSeller: false,
    tags: ['pressure boosting', 'tank set', 'automatic'],
    specs: { 'Tank Volume': '24 L', 'Max Head': '40 m', 'Power': '0.55 kW', 'Voltage': '240 V' },
  },
  // Solar Solutions
  {
    id: 'prod-6',
    name: 'Dayliff 400W Monocrystalline Solar Panel',
    category: 'solar',
    subcategory: 'Solar Panels',
    description:
      'High-efficiency monocrystalline solar panel with IP67-rated junction box, anti-reflective tempered glass, and corrosion-resistant aluminium frame. 25-year power output warranty.',
    shortDesc: 'High-efficiency 400W mono panel with 25-year warranty',
    price: 'KES 22,000',
    image: '',
    brand: 'Dayliff',
    featured: true,
    isNew: false,
    isBestSeller: true,
    tags: ['monocrystalline', '400W', 'high efficiency'],
    specs: { 'Peak Power': '400 Wp', 'Efficiency': '20.5%', 'Voltage (Vmp)': '37.5 V', 'Current (Imp)': '10.67 A' },
  },
  {
    id: 'prod-7',
    name: 'Victron MultiPlus-II 3kVA Inverter/Charger',
    category: 'solar',
    subcategory: 'Solar Inverters',
    description:
      'All-in-one inverter, battery charger, and automatic transfer switch. Ideal for off-grid and hybrid power systems with solar integration and intelligent battery management.',
    shortDesc: 'All-in-one 3kVA inverter/charger — perfect for off-grid systems',
    price: 'KES 95,000',
    image: '',
    brand: 'Victron',
    featured: true,
    isNew: true,
    isBestSeller: false,
    tags: ['inverter', 'charger', 'off-grid', 'hybrid'],
    specs: { 'Continuous Power': '3,000 W', 'Battery Voltage': '24 V', 'AC Output': '230 V', 'Transfer Time': '<20 ms' },
  },
  {
    id: 'prod-8',
    name: 'Dayliff DSP 150 Solar Pump System',
    category: 'solar',
    subcategory: 'Solar Pumps',
    description:
      'Complete solar pump system including DC submersible pump, MPPT controller, and mounting brackets. Designed for borehole and surface water supply without grid power.',
    shortDesc: 'Complete DC solar pump system for off-grid water supply',
    price: 'KES 75,000',
    image: '',
    brand: 'Dayliff',
    featured: false,
    isNew: false,
    isBestSeller: false,
    tags: ['solar pump', 'DC pump', 'MPPT', 'off-grid'],
    specs: { 'Max Flow': '3.0 m³/h', 'Solar Input': '150–600 W', 'Max Head': '80 m', 'Type': 'DC Submersible' },
  },
  {
    id: 'prod-9',
    name: 'Dayliff 200L Flat-Plate Solar Water Heater',
    category: 'solar',
    subcategory: 'Solar Water Heaters',
    description:
      'Flat-plate solar water heater for domestic hot water supply. Includes stainless steel inner tank, flat-plate collector, and 2kW electric backup element for cloudy days.',
    shortDesc: '200L flat-plate solar water heater with electric backup',
    price: 'KES 55,000',
    image: '',
    brand: 'Dayliff',
    featured: false,
    isNew: false,
    isBestSeller: true,
    tags: ['water heater', 'solar thermal', '200L'],
    specs: { 'Tank Volume': '200 L', 'Collector Area': '2.0 m²', 'Backup': '2 kW Electric', 'Pressure': '3–8 bar' },
  },
  // Generators
  {
    id: 'prod-10',
    name: 'Dayliff DG6500SE Silent Diesel Generator',
    category: 'generators',
    subcategory: 'Diesel Generators',
    description:
      'Silent-type diesel generator with electric start, automatic voltage regulator (AVR), and a fuel-efficient engine. Ideal for homes, offices, and light commercial backup power.',
    shortDesc: '5.5 kVA silent diesel generator with electric start and AVR',
    price: 'KES 120,000',
    image: '',
    brand: 'Dayliff',
    featured: true,
    isNew: false,
    isBestSeller: false,
    tags: ['diesel', 'silent type', 'electric start'],
    specs: { 'Rated Power': '5.5 kVA', 'Engine': '10HP Diesel', 'Fuel Tank': '15 L', 'Noise Level': '68 dB @ 7m' },
  },
  {
    id: 'prod-11',
    name: 'Dayliff DG3500E Petrol Generator',
    category: 'generators',
    subcategory: 'Petrol Generators',
    description:
      'Compact and portable petrol generator with recoil and electric start. Suitable for home use, outdoor events, and small business backup power requirements.',
    shortDesc: '3 kVA petrol generator with recoil and electric start',
    price: 'KES 45,000',
    image: '',
    brand: 'Dayliff',
    featured: false,
    isNew: false,
    isBestSeller: true,
    tags: ['petrol', 'portable', 'electric start'],
    specs: { 'Rated Power': '3 kVA', 'Engine': '7HP Petrol', 'Fuel Tank': '15 L', 'Run Time': '8 hrs @ 50% load' },
  },
  // Swimming Pools
  {
    id: 'prod-12',
    name: 'Praher 500mm Sand Filter System',
    category: 'swimming-pools',
    subcategory: 'Pool Filters',
    description:
      'Glass-fibre reinforced sand filter tank with 6-way multiport valve for efficient pool water filtration. Compact, robust, and designed for residential pools up to 60,000 litres.',
    shortDesc: 'GRP sand filter with 6-way multiport valve for residential pools',
    price: 'KES 38,000',
    image: '',
    brand: 'Praher',
    featured: false,
    isNew: false,
    isBestSeller: false,
    tags: ['sand filter', 'pool filtration', 'GRP'],
    specs: { 'Tank Diameter': '500 mm', 'Flow Rate': '12 m³/h', 'Media': '100 kg sand', 'Connection': '1.5"' },
  },
  {
    id: 'prod-13',
    name: 'Hayward Super Pump 1.5HP',
    category: 'swimming-pools',
    subcategory: 'Pool Pumps',
    description:
      'Heavy-duty, self-priming pool circulation pump with a corrosion-resistant body and large strainer basket. Trusted globally for residential and commercial pool applications.',
    shortDesc: '1.5 HP self-priming pool circulation pump',
    price: 'KES 28,000',
    image: '',
    brand: 'Hayward',
    featured: false,
    isNew: false,
    isBestSeller: true,
    tags: ['pool pump', 'self-priming', 'heavy duty'],
    specs: { 'Power': '1.5 HP', 'Max Flow': '18 m³/h', 'Voltage': '240 V', 'Inlet/Outlet': '2"' },
  },
  // Water Treatment
  {
    id: 'prod-14',
    name: 'Dayliff 400 GPD Reverse Osmosis System',
    category: 'water-treatment',
    subcategory: 'RO Systems',
    description:
      'Complete 5-stage reverse osmosis water purification system for domestic use. Removes dissolved salts, heavy metals, bacteria, and viruses, producing safe, pure drinking water.',
    shortDesc: '5-stage RO system — 400 GPD pure drinking water production',
    price: 'KES 35,000',
    image: '',
    brand: 'Dayliff',
    featured: true,
    isNew: false,
    isBestSeller: false,
    tags: ['RO', 'reverse osmosis', 'purification', 'drinking water'],
    specs: { 'Capacity': '400 GPD', 'Stages': '5 stage', 'Rejection Rate': '>97%', 'Pressure': '40–80 psi' },
  },
  {
    id: 'prod-15',
    name: 'Dayliff DUV-25 UV Sterilizer',
    category: 'water-treatment',
    subcategory: 'UV Systems',
    description:
      'UV water sterilizer for eliminating bacteria, viruses, and other microorganisms without chemical additives. Provides safe, clean drinking water with 99.99% pathogen reduction.',
    shortDesc: 'UV sterilizer — 99.99% microorganism elimination, chemical-free',
    price: 'KES 12,000',
    image: '',
    brand: 'Dayliff',
    featured: false,
    isNew: false,
    isBestSeller: false,
    tags: ['UV', 'sterilization', 'bacteria removal', 'chemical-free'],
    specs: { 'Flow Rate': '25 L/min', 'UV Dose': '30 mJ/cm²', 'Lamp Life': '9,000 hrs', 'Connection': '3/4"' },
  },
  // Irrigation
  {
    id: 'prod-16',
    name: 'Dayliff 1-Acre Drip Irrigation Starter Kit',
    category: 'irrigation',
    subcategory: 'Drip Kits',
    description:
      'Complete drip irrigation kit for one acre of vegetables, fruits, or greenhouse crops. Includes mainline HDPE pipe, drip lateral lines, emitters, screen filter, fittings, and installation guide.',
    shortDesc: 'Complete 1-acre drip irrigation kit — everything included',
    price: 'KES 45,000',
    image: '',
    brand: 'Dayliff',
    featured: true,
    isNew: false,
    isBestSeller: true,
    tags: ['drip irrigation', '1 acre', 'complete kit'],
    specs: { 'Coverage': '1 Acre', 'Emitter Spacing': '20 cm', 'Emitter Flow': '1.6 L/hr', 'Filter': '120 mesh screen' },
  },
  {
    id: 'prod-17',
    name: 'Dayliff 10,000L Polyethylene Water Tank',
    category: 'irrigation',
    subcategory: 'Water Tanks',
    description:
      'Heavy-duty rotationally moulded polyethylene storage tank. UV stabilised for outdoor use, food-grade for potable water storage, suitable as an irrigation reservoir.',
    shortDesc: '10,000L heavy-duty UV-stabilised polyethylene storage tank',
    price: 'KES 68,000',
    image: '',
    brand: 'Dayliff',
    featured: false,
    isNew: false,
    isBestSeller: true,
    tags: ['water tank', '10,000L', 'polyethylene', 'food grade'],
    specs: { 'Volume': '10,000 L', 'Diameter': '2,800 mm', 'Height': '1,850 mm', 'Colour': 'Black' },
  },
  // Controllers & IoT
  {
    id: 'prod-18',
    name: 'Dayliff DPC-10 Electronic Pump Controller',
    category: 'controllers',
    subcategory: 'Pump Controllers',
    description:
      'Electronic pump controller with automatic start/stop, dry-run protection, over-pressure protection, and motor thermal protection. Simple push-button setup, LED status indicators.',
    shortDesc: 'Electronic pump controller with dry-run and over-pressure protection',
    price: 'KES 8,500',
    image: '',
    brand: 'Dayliff',
    featured: false,
    isNew: false,
    isBestSeller: false,
    tags: ['pump controller', 'dry-run protection', 'automatic'],
    specs: { 'Voltage': '240 V', 'Max Current': '10 A', 'Pressure Range': '1–6 bar', 'Display': 'LED indicators' },
  },
  {
    id: 'prod-19',
    name: 'iDayliff Remote Monitoring Hub',
    category: 'controllers',
    subcategory: 'iDayliff IoT',
    description:
      'IoT hub for remote monitoring and control of pumps, tanks, solar systems, and generators via the iDayliff smartphone app or web dashboard. Real-time alerts, data logging, and automation.',
    shortDesc: 'IoT hub — remote pump & system monitoring via smartphone app',
    price: 'KES 25,000',
    image: '',
    brand: 'Dayliff',
    featured: true,
    isNew: true,
    isBestSeller: false,
    tags: ['IoT', 'remote monitoring', 'smart', 'iDayliff'],
    specs: { 'Connectivity': '4G LTE / WiFi', 'Inputs': '4 sensor inputs', 'Outputs': '2 relay outputs', 'App': 'iOS & Android' },
  },
  // Borehole Solutions
  {
    id: 'prod-20',
    name: 'Complete Borehole Equipping Package (60m)',
    category: 'borehole-solutions',
    subcategory: 'Borehole Equipment',
    description:
      'Complete borehole equipping package including 4-inch submersible pump, stainless steel rising main, submersible cable, motor starter panel, and professional installation up to 60m depth.',
    shortDesc: 'Complete 4" borehole package with pump, cable, rising main & install',
    price: 'From KES 180,000',
    image: '',
    brand: 'Dayliff',
    featured: false,
    isNew: false,
    isBestSeller: false,
    tags: ['borehole', 'complete package', 'installation'],
    specs: { 'Max Depth': '60 m', 'Pump Size': '4"', 'Max Flow': 'Up to 5 m³/h', 'Includes': 'Full installation' },
  },
  // General Machinery
  {
    id: 'prod-21',
    name: 'Dayliff DPW-200 Electric Pressure Washer',
    category: 'general-machinery',
    subcategory: 'Pressure Washers',
    description:
      'Electric cold-water pressure washer for domestic and light commercial cleaning. Includes adjustable nozzle, 5-metre high-pressure hose, and detergent bottle for versatile cleaning.',
    shortDesc: '2,000W electric pressure washer with adjustable nozzle',
    price: 'KES 22,000',
    image: '',
    brand: 'Dayliff',
    featured: false,
    isNew: false,
    isBestSeller: false,
    tags: ['pressure washer', 'electric', 'cleaning'],
    specs: { 'Power': '2,000 W', 'Pressure': '130 bar', 'Flow': '6.5 L/min', 'Voltage': '240 V' },
  },
  {
    id: 'prod-22',
    name: 'Dayliff DLM-460 Self-Propelled Lawn Mower',
    category: 'general-machinery',
    subcategory: 'Lawn Mowers',
    description:
      'Petrol-powered self-propelled lawn mower with 460mm steel cutting deck, 6-speed drive, and 55L grass collection bag. Foldable handle for easy storage.',
    shortDesc: 'Self-propelled petrol lawn mower with 460mm cutting deck',
    price: 'KES 48,000',
    image: '',
    brand: 'Dayliff',
    featured: true,
    isNew: false,
    isBestSeller: false,
    tags: ['lawn mower', 'petrol', 'self-propelled'],
    specs: { 'Cutting Width': '460 mm', 'Engine': '190cc OHV', 'Drive Speeds': '6 forward', 'Grass Bag': '55 L' },
  },
]

// ─── News ─────────────────────────────────────────────────────────────────────

export const news: NewsItem[] = [
  {
    id: 'news-1',
    title: 'Davis & Shirtliff Launches iDayliff IoT Platform for Smart Water Management',
    excerpt:
      'The new iDayliff platform enables real-time remote monitoring and control of water systems, pumps, and solar installations across East Africa.',
    date: '2025-04-15',
    category: 'Innovation',
    image: '',
    slug: 'idayliff-iot-platform-launch',
    author: 'D&S Communications',
    readTime: '4 min read',
  },
  {
    id: 'news-2',
    title: 'Solar Installations Reach 10,000 Rural Homes Through Government Partnership',
    excerpt:
      'Davis & Shirtliff partners with the Government of Kenya to supply and install solar water pumping systems across 12 counties.',
    date: '2025-04-02',
    category: 'CSR',
    image: '',
    slug: 'solar-10000-homes-kenya',
    author: 'D&S Communications',
    readTime: '5 min read',
  },
  {
    id: 'news-3',
    title: 'Africa-Made Innovation: Dayliff Unveils New Locally Designed Pump Range',
    excerpt:
      "The new Dayliff pump range, designed and assembled in Kenya, represents D&S's commitment to local manufacturing and African engineering excellence.",
    date: '2025-03-20',
    category: 'Products',
    image: '',
    slug: 'dayliff-africa-made-pumps',
    author: 'D&S Communications',
    readTime: '3 min read',
  },
  {
    id: 'news-4',
    title: 'D&S Expands into Senegal and Somalia — Now in 10 African Countries',
    excerpt:
      'With new branches in Dakar and Mogadishu, Davis & Shirtliff continues its pan-African expansion bringing water and energy solutions to more communities.',
    date: '2025-03-08',
    category: 'Expansion',
    image: '',
    slug: 'expansion-senegal-somalia',
    author: 'D&S Communications',
    readTime: '3 min read',
  },
  {
    id: 'news-5',
    title: 'PumpCalc Tool Helps Engineers Select the Right Pump for Every Application',
    excerpt:
      "D&S introduces PumpCalc, a free online sizing tool that helps contractors and engineers calculate pump requirements accurately.",
    date: '2025-02-18',
    category: 'Tools',
    image: '',
    slug: 'pumpcalc-tool-launch',
    author: 'D&S Communications',
    readTime: '2 min read',
  },
  {
    id: 'news-6',
    title: 'CSR Report 2025: Improving 500,000 Lives Across Africa',
    excerpt:
      "D&S's 2025 CSR report highlights programs that have provided clean water access, solar energy, and livelihood support to over 500,000 Africans.",
    date: '2025-01-30',
    category: 'CSR',
    image: '',
    slug: 'csr-report-2025',
    author: 'D&S Communications',
    readTime: '6 min read',
  },
]

// ─── Stats ────────────────────────────────────────────────────────────────────

export const stats: Stat[] = [
  { value: '75+', label: 'Years of Excellence', description: 'Serving East Africa since 1948' },
  { value: '10+', label: 'Countries', description: 'Pan-African presence and growing' },
  { value: '50+', label: 'Branch Locations', description: 'Across East and Central Africa' },
  { value: '5,000+', label: 'Products', description: 'Water, energy, and machinery' },
]

// ─── Team ─────────────────────────────────────────────────────────────────────

export const team: TeamMember[] = [
  {
    id: 'team-1',
    name: 'Alex Twinomugisha',
    role: 'Group Chief Executive Officer',
    department: 'Executive',
    image: '',
    bio: 'Leading Davis & Shirtliff with a vision of expanding access to water and energy solutions across all of Africa.',
  },
  {
    id: 'team-2',
    name: 'Sarah Kimani',
    role: 'Chief Operations Officer',
    department: 'Operations',
    image: '',
    bio: 'Overseeing operations across 10 countries, ensuring efficient delivery and service excellence at every branch.',
  },
  {
    id: 'team-3',
    name: 'James Oloo',
    role: 'Chief Technology Officer',
    department: 'Technology',
    image: '',
    bio: 'Driving digital transformation and the iDayliff IoT platform for smart water and energy management.',
  },
  {
    id: 'team-4',
    name: 'Fatuma Hassan',
    role: 'Group Finance Director',
    department: 'Finance',
    image: '',
    bio: 'Managing the financial strategy, sustainability, and growth investments of the Davis & Shirtliff Group.',
  },
  {
    id: 'team-5',
    name: 'David Mwangi',
    role: 'Chief Commercial Officer',
    department: 'Commercial',
    image: '',
    bio: 'Leading commercial strategy, brand growth, and new market development across the African continent.',
  },
  {
    id: 'team-6',
    name: 'Grace Nakato',
    role: 'Director of Sustainability',
    department: 'CSR',
    image: '',
    bio: "Championing D&S's #ImprovingLives mission and leading community water and energy access programs.",
  },
]

// ─── Branches ─────────────────────────────────────────────────────────────────

export const branches: Branch[] = [
  { id: 'br-1',  country: 'Kenya',     city: 'Nairobi (HQ)',  address: 'Dundori Road, Industrial Area',       phone: '+254 711 079 000', email: 'nairobi@dayliff.com',   isHeadquarters: true  },
  { id: 'br-2',  country: 'Kenya',     city: 'Mombasa',       address: 'Mombasa Road, Industrial Area',       phone: '+254 711 079 100', email: 'mombasa@dayliff.com',   isHeadquarters: false },
  { id: 'br-3',  country: 'Kenya',     city: 'Kisumu',        address: 'Kondele, Kisumu',                     phone: '+254 711 079 200', email: 'kisumu@dayliff.com',    isHeadquarters: false },
  { id: 'br-4',  country: 'Uganda',    city: 'Kampala',       address: 'Plot 72, Jinja Road',                 phone: '+256 414 234 567', email: 'uganda@dayliff.com',    isHeadquarters: false },
  { id: 'br-5',  country: 'Tanzania',  city: 'Dar es Salaam', address: 'Mikocheni Industrial Area',           phone: '+255 22 277 1234', email: 'tanzania@dayliff.com',  isHeadquarters: false },
  { id: 'br-6',  country: 'Zambia',    city: 'Lusaka',        address: 'Lusaka Industrial Area',              phone: '+260 211 234 567', email: 'zambia@dayliff.com',    isHeadquarters: false },
  { id: 'br-7',  country: 'Rwanda',    city: 'Kigali',        address: 'Kacyiru Business District',           phone: '+250 788 123 456', email: 'rwanda@dayliff.com',    isHeadquarters: false },
  { id: 'br-8',  country: 'Ethiopia',  city: 'Addis Ababa',   address: 'Kazanchis Business District',         phone: '+251 115 501 234', email: 'ethiopia@dayliff.com',  isHeadquarters: false },
  { id: 'br-9',  country: 'DRC',       city: 'Kinshasa',      address: 'Kinshasa Business District, Gombe',   phone: '+243 812 345 678', email: 'drc@dayliff.com',       isHeadquarters: false },
  { id: 'br-10', country: 'Zimbabwe',  city: 'Harare',        address: 'Graniteside Industrial Area',         phone: '+263 242 781 234', email: 'zimbabwe@dayliff.com',  isHeadquarters: false },
  { id: 'br-11', country: 'Senegal',   city: 'Dakar',         address: 'Zone Industrielle de Dakar',          phone: '+221 338 527 890', email: 'senegal@dayliff.com',   isHeadquarters: false },
  { id: 'br-12', country: 'Somalia',   city: 'Mogadishu',     address: 'KM4, Hodan District',                 phone: '+252 612 345 678', email: 'somalia@dayliff.com',   isHeadquarters: false },
]

// ─── Testimonials ─────────────────────────────────────────────────────────────

export const testimonials: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Benjamin Koech',
    company: 'Rift Valley Farms',
    role: 'Farm Manager',
    content:
      "The drip irrigation kit from D&S transformed our operation. We've reduced water usage by 60% while doubling our tomato yield. The technical support team was exceptional throughout the project.",
    rating: 5,
    image: '',
  },
  {
    id: 'test-2',
    name: 'Dr. Amara Diallo',
    company: 'Nairobi General Hospital',
    role: 'Facilities Director',
    content:
      "We installed a Grundfos pump system with iDayliff remote monitoring for our hospital. The reliability and real-time alerts have completely eliminated water supply disruptions.",
    rating: 5,
    image: '',
  },
  {
    id: 'test-3',
    name: 'Wanjiru Ngugi',
    company: 'Ngugi Residences',
    role: 'Property Developer',
    content:
      "D&S supplied all solar and water systems for our 200-unit residential development. Professional team, on time, competitive pricing, and excellent after-sales service. Will definitely use again.",
    rating: 5,
    image: '',
  },
  {
    id: 'test-4',
    name: 'Ibrahim Ssali',
    company: 'Kampala Water Works',
    role: 'Project Engineer',
    content:
      "We've been sourcing water treatment equipment from D&S Uganda for 8 years. The product quality and technical expertise are truly unmatched in the East African market.",
    rating: 5,
    image: '',
  },
]

// ─── Navigation ───────────────────────────────────────────────────────────────

export const navItems: NavItem[] = [
  { label: 'Home', href: '/' },
  {
    label: 'About Us',
    href: '/about',
    children: [
      { label: 'Our Story', href: '/about' },
      { label: 'Mission & Vision', href: '/about' },
      { label: 'Executive Team', href: '/about' },
      { label: '#ImprovingLives', href: '/about' },
      { label: 'Careers', href: '/contact' },
    ],
  },
  {
    label: 'Products & Solutions',
    href: '/products',
    children: [
      { label: 'Water Pumps', href: '/products/water-pumps' },
      { label: 'Solar Solutions', href: '/products/solar' },
      { label: 'Generators', href: '/products/generators' },
      { label: 'Swimming Pools', href: '/products/swimming-pools' },
      { label: 'Water Treatment', href: '/products/water-treatment' },
      { label: 'Irrigation', href: '/products/irrigation' },
      { label: 'Borehole Solutions', href: '/products/borehole-solutions' },
      { label: 'General Machinery', href: '/products/general-machinery' },
      { label: 'Controllers & IoT', href: '/products/controllers' },
    ],
  },
  {
    label: 'News & Media',
    href: '/news',
    children: [
      { label: 'Latest News', href: '/news' },
      { label: 'Press Releases', href: '/news' },
      { label: 'Gallery', href: '/news' },
      { label: 'FAQs', href: '/contact' },
    ],
  },
  { label: 'Contact Us', href: '/contact' },
]

// ─── FAQs ─────────────────────────────────────────────────────────────────────

export const faqs: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'What areas do you cover for installations and service?',
    answer:
      'We cover all major cities and towns across Kenya, Uganda, Tanzania, Zambia, Rwanda, Ethiopia, DRC, Zimbabwe, Senegal, and Somalia through our network of 50+ branches.',
  },
  {
    id: 'faq-2',
    question: 'Do you offer after-sales service and spare parts?',
    answer:
      'Yes, we maintain a comprehensive spare parts stock and have trained service technicians at all branches. We offer service contracts and preventive maintenance programs for all equipment we supply.',
  },
  {
    id: 'faq-3',
    question: 'Can you help me choose the right pump for my application?',
    answer:
      'Absolutely. Our technical team provides free consultation and we have the PumpCalc online tool to help size pumps correctly. Visit any branch or call our technical support line.',
  },
  {
    id: 'faq-4',
    question: 'What financing options are available for purchases?',
    answer:
      'We partner with several banks and microfinance institutions to offer equipment financing. We also accept M-PESA, bank transfers, Visa, and Mastercard.',
  },
  {
    id: 'faq-5',
    question: 'What warranties come with Dayliff-branded products?',
    answer:
      'Dayliff-branded products typically carry a 2-year manufacturer warranty. Third-party brands carry their respective manufacturer warranties, generally ranging from 1 to 5 years.',
  },
]

// ─── Company Timeline ─────────────────────────────────────────────────────────

export const timeline = [
  { year: '1948', title: 'Founded in Nairobi', description: 'Davis & Shirtliff established in Kenya as a water pump distributor.' },
  { year: '1970', title: 'Dayliff Brand Launched', description: 'Introduction of the Dayliff own-brand product range.' },
  { year: '1985', title: 'Regional Expansion', description: 'Expansion into Uganda and Tanzania, beginning the pan-African journey.' },
  { year: '2005', title: 'Solar Division', description: 'Launch of the Solar Solutions division to address Africa\'s energy challenges.' },
  { year: '2015', title: '10,000+ Solar Installations', description: 'Milestone of 10,000 solar systems installed across East Africa.' },
  { year: '2020', title: 'iDayliff IoT Platform', description: 'Launch of the iDayliff smart monitoring platform for remote system management.' },
  { year: '2025', title: '10 Countries, 50+ Branches', description: 'Pan-African presence spanning 10 countries with over 50 service locations.' },
]
