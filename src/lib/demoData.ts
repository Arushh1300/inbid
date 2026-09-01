export interface DemoCategory {
  id: string;
  name: string;
  highestBid: number;
  iconName: string;
}

export interface DemoListing {
  id: string;
  rank: number;
  title: string;
  domain: string;
  url: string;
  description: string;
  category: string;
  country: string;
  state: string;
  city: string;
  cumulativeBid: number;
  clicks: number;
  badge?: string;
  avatarUrl: string;
  daysAgo: string;
}

export interface DemoActivity {
  id: string;
  text: string;
  amount?: number;
  timeAgo: string;
  type: 'bid' | 'jump' | 'new';
  bidder?: string;
}

export const CITIES_LIST = [
  'All Cities',
  'Bengaluru',
  'Delhi',
  'Mumbai',
  'Jaipur',
  'Gurugram',
  'Pune',
  'Hyderabad',
  'Chennai',
];

export const DEMO_STATS = {
  listingsLive: 0,
  listingsToday: 0,
  totalBids: 0,
  bidsToday: 0,
  outboundClicks: 0,
  clicksToday: 0,
  citiesActive: 0,
};

export const DEMO_CATEGORIES: DemoCategory[] = [
  { id: 'all', name: 'All Categories', highestBid: 0, iconName: 'Layers' },
  { id: 'startups', name: 'Startups', highestBid: 0, iconName: 'Rocket' },
  { id: 'ai', name: 'AI', highestBid: 0, iconName: 'Cpu' },
  { id: 'saas', name: 'SaaS', highestBid: 0, iconName: 'Laptop' },
  { id: 'restaurants', name: 'Restaurants', highestBid: 0, iconName: 'Utensils' },
  { id: 'cafes', name: 'Cafés', highestBid: 0, iconName: 'Coffee' },
  { id: 'salons', name: 'Salons', highestBid: 0, iconName: 'Scissors' },
  { id: 'hotels', name: 'Hotels', highestBid: 0, iconName: 'Hotel' },
  { id: 'fashion', name: 'Fashion', highestBid: 0, iconName: 'ShoppingBag' },
  { id: 'jewellery', name: 'Jewellery', highestBid: 0, iconName: 'Gem' },
  { id: 'realestate', name: 'Real Estate', highestBid: 0, iconName: 'Home' },
  { id: 'interior', name: 'Interior Design', highestBid: 0, iconName: 'Palette' },
  { id: 'agencies', name: 'Agencies', highestBid: 0, iconName: 'Briefcase' },
  { id: 'creators', name: 'Creators', highestBid: 0, iconName: 'Video' },
  { id: 'developers', name: 'Developers', highestBid: 0, iconName: 'Code' },
  { id: 'ecommerce', name: 'E-commerce', highestBid: 0, iconName: 'ShoppingCart' },
  { id: 'entertainment', name: 'Entertainment', highestBid: 0, iconName: 'Film' },
  { id: 'other', name: 'Other', highestBid: 0, iconName: 'Sparkles' },
];

// Production database starts empty. Real listings are saved on-demand upon verified payment.
export const DEMO_LISTINGS: DemoListing[] = [];
