// Mock data pentru clona EMAG

export const categories = [
  { id: 1, name: 'Telefoane & Tablete', icon: 'Smartphone', slug: 'telefoane-tablete' },
  { id: 2, name: 'Laptop, PC & Periferice', icon: 'Laptop', slug: 'laptop-pc' },
  { id: 3, name: 'TV, Audio-Video & Foto', icon: 'Tv', slug: 'tv-audio-video' },
  { id: 4, name: 'Electrocasnice', icon: 'Refrigerator', slug: 'electrocasnice' },
  { id: 5, name: 'Gaming', icon: 'Gamepad2', slug: 'gaming' },
  { id: 6, name: 'Fashion', icon: 'Shirt', slug: 'fashion' },
  { id: 7, name: 'Carte', icon: 'BookOpen', slug: 'carte' },
  { id: 8, name: 'Casa & Grădină', icon: 'Home', slug: 'casa-gradina' },
  { id: 9, name: 'Sport', icon: 'Dumbbell', slug: 'sport' },
  { id: 10, name: 'Jucării & Copii', icon: 'Baby', slug: 'jucarii-copii' },
];

export const products = [
  {
    id: 1,
    name: 'Samsung Galaxy S24 Ultra 256GB',
    category: 'telefoane-tablete',
    brand: 'Samsung',
    price: 5499,
    oldPrice: 6299,
    rating: 4.8,
    reviews: 342,
    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=500&q=80',
    inStock: true,
    isNew: true,
    discount: 13,
    description: 'Telefon Samsung Galaxy S24 Ultra cu ecran Dynamic AMOLED 2X de 6.8 inch, procesor Snapdragon 8 Gen 3, cameră de 200MP și baterie de 5000mAh.'
  },
  {
    id: 2,
    name: 'iPhone 15 Pro Max 512GB',
    category: 'telefoane-tablete',
    brand: 'Apple',
    price: 7899,
    oldPrice: null,
    rating: 4.9,
    reviews: 589,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&q=80',
    inStock: true,
    isNew: true,
    discount: 0
  },
  {
    id: 3,
    name: 'Laptop Lenovo IdeaPad 3 15.6" Intel Core i5',
    category: 'laptop-pc',
    brand: 'Lenovo',
    price: 2799,
    oldPrice: 3299,
    rating: 4.5,
    reviews: 234,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500&q=80',
    inStock: true,
    isNew: false,
    discount: 15
  },
  {
    id: 4,
    name: 'MacBook Pro 16" M3 Pro 512GB',
    category: 'laptop-pc',
    brand: 'Apple',
    price: 13999,
    oldPrice: null,
    rating: 4.9,
    reviews: 421,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&q=80',
    inStock: true,
    isNew: true,
    discount: 0
  },
  {
    id: 5,
    name: 'Samsung Smart TV 65" QLED 4K',
    category: 'tv-audio-video',
    brand: 'Samsung',
    price: 4299,
    oldPrice: 5199,
    rating: 4.7,
    reviews: 178,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&q=80',
    inStock: true,
    isNew: false,
    discount: 17
  },
  {
    id: 6,
    name: 'LG OLED TV 55" 4K Smart',
    category: 'tv-audio-video',
    brand: 'LG',
    price: 5699,
    oldPrice: null,
    rating: 4.8,
    reviews: 267,
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=500&q=80',
    inStock: true,
    isNew: true,
    discount: 0
  },
  {
    id: 7,
    name: 'PlayStation 5 Slim Digital Edition',
    category: 'gaming',
    brand: 'Sony',
    price: 2499,
    oldPrice: 2799,
    rating: 4.9,
    reviews: 892,
    image: 'https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=500&q=80',
    inStock: false,
    isNew: true,
    discount: 11
  },
  {
    id: 8,
    name: 'Xbox Series X 1TB',
    category: 'gaming',
    brand: 'Microsoft',
    price: 2699,
    oldPrice: null,
    rating: 4.8,
    reviews: 654,
    image: 'https://images.unsplash.com/photo-1621259182978-fbf93132d53d?w=500&q=80',
    inStock: true,
    isNew: false,
    discount: 0
  },
  {
    id: 9,
    name: 'Frigider Samsung Side by Side 617L',
    category: 'electrocasnice',
    brand: 'Samsung',
    price: 4899,
    oldPrice: 5799,
    rating: 4.6,
    reviews: 145,
    image: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=500&q=80',
    inStock: true,
    isNew: false,
    discount: 16
  },
  {
    id: 10,
    name: 'Mașină de spălat Bosch Serie 6 9kg',
    category: 'electrocasnice',
    brand: 'Bosch',
    price: 2999,
    oldPrice: null,
    rating: 4.7,
    reviews: 289,
    image: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=500&q=80',
    inStock: true,
    isNew: false,
    discount: 0
  },
  {
    id: 11,
    name: 'Nike Air Max 270 React',
    category: 'fashion',
    brand: 'Nike',
    price: 599,
    oldPrice: 799,
    rating: 4.4,
    reviews: 523,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
    inStock: true,
    isNew: false,
    discount: 25
  },
  {
    id: 12,
    name: 'Adidas Ultraboost 22',
    category: 'fashion',
    brand: 'Adidas',
    price: 699,
    oldPrice: null,
    rating: 4.6,
    reviews: 412,
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80',
    inStock: true,
    isNew: true,
    discount: 0
  },
];

export const banners = [
  {
    id: 1,
    title: 'Black Friday',
    subtitle: 'Reduceri până la 50%',
    image: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=1200&q=80',
    link: '/oferte-speciale'
  },
  {
    id: 2,
    title: 'Telefoane Premium',
    subtitle: 'Cele mai noi modele',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=80',
    link: '/telefoane-tablete'
  },
  {
    id: 3,
    title: 'Gaming Setup',
    subtitle: 'Console & Accesorii',
    image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=1200&q=80',
    link: '/gaming'
  }
];

export const brands = [
  'Samsung', 'Apple', 'Lenovo', 'HP', 'Dell', 'Asus', 'Acer', 'LG', 'Sony', 'Microsoft',
  'Bosch', 'Whirlpool', 'Nike', 'Adidas', 'Canon', 'Nikon'
];

export const priceRanges = [
  { id: 1, label: 'Sub 500 Lei', min: 0, max: 500 },
  { id: 2, label: '500 - 1000 Lei', min: 500, max: 1000 },
  { id: 3, label: '1000 - 2500 Lei', min: 1000, max: 2500 },
  { id: 4, label: '2500 - 5000 Lei', min: 2500, max: 5000 },
  { id: 5, label: 'Peste 5000 Lei', min: 5000, max: 999999 },
];
