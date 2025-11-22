# R32 E-Commerce - API Contracts & Implementation Plan

## 1. API Endpoints

### Authentication APIs
- `POST /api/auth/register` - Înregistrare utilizator
- `POST /api/auth/login` - Autentificare (returnează JWT token)
- `GET /api/auth/me` - Obține profilul utilizatorului curent (requires auth)
- `PUT /api/auth/profile` - Actualizează profilul (requires auth)

### Products APIs
- `GET /api/products` - Lista produse (cu filtrare, sortare, paginare)
- `GET /api/products/:id` - Detalii produs
- `POST /api/products` - Creează produs (admin only)
- `PUT /api/products/:id` - Actualizează produs (admin only)
- `DELETE /api/products/:id` - Șterge produs (admin only)

### Categories APIs
- `GET /api/categories` - Lista categorii
- `POST /api/categories` - Creează categorie (admin only)
- `PUT /api/categories/:id` - Actualizează categorie (admin only)
- `DELETE /api/categories/:id` - Șterge categorie (admin only)

### Cart APIs
- `GET /api/cart` - Obține coșul utilizatorului (requires auth)
- `POST /api/cart/items` - Adaugă produs în coș (requires auth)
- `PUT /api/cart/items/:id` - Actualizează cantitate (requires auth)
- `DELETE /api/cart/items/:id` - Șterge produs din coș (requires auth)
- `DELETE /api/cart` - Golește coșul (requires auth)

### Wishlist APIs
- `GET /api/wishlist` - Obține lista de dorințe (requires auth)
- `POST /api/wishlist` - Adaugă produs la wishlist (requires auth)
- `DELETE /api/wishlist/:productId` - Șterge din wishlist (requires auth)

### Orders APIs
- `GET /api/orders` - Lista comenzi utilizator (requires auth)
- `GET /api/orders/:id` - Detalii comandă (requires auth)
- `POST /api/orders` - Creează comandă (requires auth)
- `GET /api/admin/orders` - Lista toate comenzile (admin only)
- `PUT /api/admin/orders/:id/status` - Actualizează status comandă (admin only)

### Reviews APIs
- `GET /api/products/:id/reviews` - Reviews pentru produs
- `POST /api/products/:id/reviews` - Adaugă review (requires auth)
- `PUT /api/reviews/:id` - Actualizează review (requires auth)
- `DELETE /api/reviews/:id` - Șterge review (requires auth sau admin)

### Admin Dashboard APIs
- `GET /api/admin/stats` - Statistici generale (admin only)
- `GET /api/admin/users` - Lista utilizatori (admin only)
- `PUT /api/admin/users/:id/role` - Actualizează rol utilizator (admin only)
- `DELETE /api/admin/users/:id` - Șterge utilizator (admin only)

## 2. Data Models

### User Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (hashed, required),
  phone: String,
  address: String,
  role: String (enum: ['user', 'admin'], default: 'user'),
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  category: String (required),
  brand: String (required),
  price: Number (required),
  oldPrice: Number,
  image: String (URL),
  images: [String],
  inStock: Boolean (default: true),
  stock: Number (default: 0),
  rating: Number (default: 0),
  reviews: Number (default: 0),
  isNew: Boolean (default: false),
  discount: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

### Category Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  slug: String (required, unique),
  icon: String,
  description: String,
  createdAt: Date
}
```

### Cart Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  items: [{
    productId: ObjectId (ref: Product),
    quantity: Number (default: 1),
    price: Number
  }],
  updatedAt: Date
}
```

### Order Model
```javascript
{
  _id: ObjectId,
  orderId: String (unique, auto-generated),
  userId: ObjectId (ref: User, required),
  items: [{
    productId: ObjectId (ref: Product),
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  subtotal: Number,
  shipping: Number,
  total: Number,
  status: String (enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  shippingAddress: {
    name: String,
    phone: String,
    address: String,
    city: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Review Model
```javascript
{
  _id: ObjectId,
  productId: ObjectId (ref: Product, required),
  userId: ObjectId (ref: User, required),
  userName: String,
  rating: Number (1-5, required),
  comment: String,
  createdAt: Date
}
```

### Wishlist Model
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  products: [ObjectId (ref: Product)],
  updatedAt: Date
}
```

## 3. Mock Data to Replace

### Frontend Mock Files:
- `/app/frontend/src/mock/mockData.js` - Va fi înlocuit cu API calls

### Mock Data Usage:
1. **products** - Va fi înlocuit cu `GET /api/products`
2. **categories** - Va fi înlocuit cu `GET /api/categories`
3. **Cart items** - Va fi înlocuit cu `GET /api/cart`
4. **Wishlist** - Va fi înlocuit cu `GET /api/wishlist`
5. **User data** - Va fi înlocuit cu `GET /api/auth/me`
6. **Orders** - Va fi înlocuit cu `GET /api/orders`

## 4. Frontend Integration

### API Service (`/app/frontend/src/services/api.js`)
- Axios instance cu base URL și interceptors
- JWT token management
- Error handling

### Context/State Management
- AuthContext - User authentication state
- CartContext - Shopping cart state
- Toast notifications pentru feedback

### Protected Routes
- Account pages - require authentication
- Admin pages - require admin role
- Checkout - require authentication

## 5. Admin Panel Features

### Dashboard
- Total vânzări
- Număr comenzi
- Număr utilizatori
- Produse în stoc
- Grafice cu vânzări pe luni
- Top produse vândute
- Comenzi recente

### Products Management
- Lista produse cu search și filtre
- Adaugă produs nou (formular complet)
- Editează produs
- Șterge produs
- Upload imagini

### Categories Management
- Lista categorii
- Adaugă/editează/șterge categorii

### Orders Management
- Lista comenzi cu filtre (status, dată)
- Detalii comandă
- Actualizează status comandă
- Export comenzi

### Users Management
- Lista utilizatori
- Schimbă rol (user/admin)
- Șterge utilizator
- Vizualizează comenzile utilizatorului

### Reviews Management
- Lista review-uri
- Șterge review-uri neadecvate

## 6. Implementation Steps

### Backend Phase:
1. Create models (User, Product, Category, Cart, Order, Review, Wishlist)
2. Implement authentication (register, login, JWT middleware)
3. Implement product APIs
4. Implement cart APIs
5. Implement order APIs
6. Implement review APIs
7. Implement wishlist APIs
8. Implement admin APIs
9. Seed database with initial data

### Frontend Integration Phase:
1. Create API service layer
2. Create Auth context
3. Replace mock data with API calls
4. Add authentication flow (login/register)
5. Update components to use real data
6. Add loading states and error handling
7. Implement protected routes

### Admin Panel Phase:
1. Create admin layout
2. Create dashboard with stats
3. Create products management
4. Create categories management
5. Create orders management
6. Create users management
7. Add charts and analytics

## 7. Testing Checklist

- [ ] User registration and login
- [ ] Product listing with filters
- [ ] Add to cart functionality
- [ ] Wishlist functionality
- [ ] Checkout and order creation
- [ ] Order history
- [ ] Product reviews
- [ ] Admin authentication
- [ ] Admin dashboard stats
- [ ] Admin CRUD operations
- [ ] Role-based access control
