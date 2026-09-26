# 🛒 FreshBasket - Complete Grocery E-Commerce Application

A clean, modular, and modern grocery e-commerce application structure built with **React.js**, **Express.js**, and designed for future **MySQL** integration.

---

## 📁 Project Architecture & Folder Structure

```
grocery_app/
├── backend/                  # Node.js + Express.js API Server
│   ├── config/               # Database & Pool configurations (MySQL placeholder)
│   ├── routes/               # Modular API Routes (Auth, Products, Categories, Cart, Orders, etc.)
│   ├── server.js             # Entry point (Runs on http://localhost:5000)
│   ├── .env.example          # Backend Environment Template
│   └── package.json
│
├── customer-frontend/        # Customer Web App (React + Vite)
│   ├── src/
│   │   ├── components/       # Header, Footer, HeroBanner, ProductCard, CategoryCard
│   │   ├── context/          # CartContext & AuthContext
│   │   ├── data/             # Sample Grocery Categories & Products
│   │   ├── pages/            # Home, Products, ProductDetails, Cart, Login, Register, Checkout, MyOrders
│   │   ├── index.css         # Modern Green & Warm Accent Design System
│   │   └── App.jsx           # Customer Routing (Runs on http://localhost:3000)
│   ├── .env.example
│   └── package.json
│
├── admin-panel/              # Store Admin Panel (React + Vite)
│   ├── src/                  # Admin Control Dashboard & Management UI
│   └── package.json          # (Runs on http://localhost:3001)
│
├── delivery-panel/           # Delivery Partner Panel (React + Vite)
│   ├── src/                  # Active Order Pickup, Map Location Preview & Status Updates
│   └── package.json          # (Runs on https://fast-delivery-ft2x.vercel.app)
│
├── package.json              # Monorepo command runner
└── README.md                 # Project setup and documentation guide
```

---

## 🚀 How to Run the Project

You can run each module independently from its folder:

### 1. Start Backend Server
```bash
cd backend
npm run dev
# Server will run on http://localhost:5000
# API Health Check: http://localhost:5000/api/health
```

### 2. Start Customer Frontend
```bash
cd customer-frontend
npm run dev
# App will open on https://fast-delivery-8iuj3e5t9-sharmi35.vercel.app
```

### 3. Start Admin Panel
```bash
cd admin-panel
npm run dev
# Dashboard will open on https://fast-delivery-ft2x.vercel.app
```

### 4. Start Delivery Partner Panel
```bash
cd delivery-panel
npm run dev
# App will open on https://fast-delivery-7fe5.vercel.app
```

---

## ✅ Step 1 Completed Features
- **Project Structure**: Modular monorepo split into Customer Frontend, Admin Panel, Delivery Partner Panel, and Backend Express API.
- **Customer Pages & Routing**:
  - `Home`: Hero banner, category grid, popular product catalog.
  - `Products`: Complete product listing with category filtering, search input, and sorting (Price low/high, rating).
  - `Product Details`: Product view, unit price, rating, stock status, quantity picker, add-to-cart action.
  - `Cart`: Interactive cart drawer/page, quantity modifier, subtotal calculation, free shipping threshold indicator.
  - `Login` & `Register`: Styled forms for customer access simulation.
  - `Checkout`: Address details form, time slot preview, payment method selector (COD/Online).
  - `My Orders`: Order status timeline (Placed, Out for Delivery, Delivered).
- **Admin Panel**: Key performance indicators (Revenue, Orders, Products, Delivery Partners) and live orders overview.
- **Delivery Partner Panel**: Online/Offline toggle, earnings summary, order pickup/dropoff cards with call customer & "Mark Delivered" actions.
- **Express Backend Scaffolding**: Structured API endpoints for Auth, Products, Categories, Cart, Orders, Payments, Delivery, Notifications, and Location.
- **Environment Variables**: `.env.example` templates created for all components.

---

## 🚧 Intentionally NOT Implemented Yet (Step 1 Scaffolding)
- MySQL live database connections (Schema & tables will be built in Step 2).
- Real payment gateway processing (Razorpay integration).
- Live GPS / Google Maps real-time location tracking.
- Web Socket push notifications.
- Automatic delivery partner assignment algorithms.
