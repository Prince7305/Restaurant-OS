# RestaurantOS

Multi-restaurant SaaS platform for QR-based ordering and restaurant operations.

## Live Demo

- Frontend: [https://restaurant-os-plum.vercel.app/](https://restaurant-os-plum.vercel.app/)
- Backend API: [https://restaurant-os-backend-k0j6.onrender.com/](https://restaurant-os-backend-k0j6.onrender.com/)

## Overview

RestaurantOS is a full-stack multi-restaurant platform that connects customers, restaurant administrators, kitchen staff, and waiters through a single system.

Customers can scan a table QR code, browse the menu, add items to their cart, and place orders. Restaurant staff can manage menus and tables, process orders in the kitchen, and handle ready orders through the waiter dashboard.

The platform uses role-based authentication, restaurant-level data isolation, and real-time order updates through Socket.IO.

## Core Features

### Customer Ordering

- QR-based table ordering
- Menu browsing with category filtering
- Menu search
- Cart management
- Customer checkout
- Cash and UPI payment mode selection
- Order confirmation

### Restaurant Management

- Restaurant-specific data isolation
- Menu item CRUD
- Menu availability management
- Table management
- Table status management
- QR code generation
- Customer management and visit tracking

### Kitchen Management

- Real-time order reception
- Order status workflow: Pending → Preparing → Ready
- Live order updates using Socket.IO
- Order details and totals

### Waiter Management

- Real-time ready-order updates
- Mark orders as served
- Automatic order updates without page refresh

### Authentication & Security

- JWT-based authentication
- Role-based access control
- Restaurant-level authorization
- Protected API routes
- Cross-restaurant access protection
- Server-side order total calculation
- Environment-based secret management

## Tech Stack

### Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios
- Socket.IO Client

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JWT
- bcryptjs
- QRCode

### Deployment & Infrastructure

- Vercel — Frontend
- Render — Backend
- MongoDB Atlas — Database

## System Architecture

```text
Customer / Admin / Kitchen / Waiter
                │
                ▼
        React + Vite Frontend
                │
        ┌───────┴────────┐
        │                │
        ▼                ▼
   REST API          Socket.IO
        │                │
        └───────┬────────┘
                ▼
       Node.js + Express
                │
                ▼
          MongoDB Atlas
```

### Application Flow

```text
Customer scans table QR
        ↓
Browse menu
        ↓
Add items to cart
        ↓
Place order
        ↓
Express REST API
        ↓
MongoDB
        ↓
Socket.IO real-time update
        ↓
Kitchen Dashboard
        ↓
Preparing
        ↓
Ready
        ↓
Waiter Dashboard
        ↓
Served
```

## User Roles

### SuperAdmin

Developer-level role used to manage the overall RestaurantOS platform and restaurants.

### Admin

Restaurant owner/administrator who can manage data and operations for their own restaurant.

### Kitchen

Kitchen staff responsible for processing active orders:

Pending → Preparing → Ready

### Waiter

Waiter staff receives ready orders in real time and marks them as served.

## Security & Authorization

RestaurantOS implements multiple layers of authentication and authorization:

- JWT-based authentication for protected routes
- Role-based access control
- Restaurant-level data isolation
- Protected API endpoints
- Cross-restaurant access protection
- Server-side order total calculation
- Menu price fetched from the database during order creation
- Environment variables for sensitive configuration
- `.env` files excluded from Git tracking

### Order Security

When a customer places an order, the client sends only the menu item IDs and quantities.

The backend fetches the current menu prices from MongoDB and calculates the order total on the server. This prevents the client from modifying item prices or the final order amount.

## Project Structure

```text
RestaurantOS/
│
├── Server/
│   ├── Config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── customerController.js
│   │   ├── menuController.js
│   │   ├── orderController.js
│   │   ├── restaurantController.js
│   │   └── tableController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── models/
│   │   ├── Customer.js
│   │   ├── MenuItem.js
│   │   ├── Order.js
│   │   ├── Restaurant.js
│   │   ├── Table.js
│   │   └── User.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── customerRoutes.js
│   │   ├── menuRoutes.js
│   │   ├── orderRoutes.js
│   │   ├── restaurantRoutes.js
│   │   └── tableRoutes.js
│   ├── Socket.js
│   ├── server.js
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   └── vercel.json
│
├── .gitignore
└── README.md
```

## Local Development

### Prerequisites

- Node.js
- MongoDB Atlas account or MongoDB instance
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Prince7305/Restaurant-OS.git
cd Restaurant-OS
```

### 2. Backend Setup

```bash
cd Server
npm install
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

## Environment Variables

### Backend

Create a `.env` file inside the `Server` directory:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLIENT_BASE_URL=http://localhost:5173
```

### Frontend

Create a `.env` file inside the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

> Never commit `.env` files or expose database credentials and secret keys publicly.

## API Overview

RestaurantOS exposes REST APIs for authentication, restaurants, menus, tables, customers, and orders.

| Module | Base Route | Purpose |
|---|---|---|
| Authentication | `/api/auth` | Login and authentication |
| Restaurants | `/api/restaurants` | Restaurant management |
| Menu | `/api/menu` | Menu item management |
| Tables | `/api/tables` | Table and QR management |
| Customers | `/api/customers` | Customer management and visit tracking |
| Orders | `/api/orders` | Order creation and order lifecycle |

Real-time order updates are handled separately using Socket.IO.

## Future Improvements

The current version focuses on the core restaurant ordering and operations workflow. Planned improvements include:

- Online payment gateway integration
- POS and billing module
- Sales and revenue analytics
- Restaurant performance dashboards
- Inventory and stock management
- Advanced reporting and exports
- Multi-branch restaurant support
- Notifications for customers and staff
- Improved deployment and monitoring

## License

This project is developed for educational and portfolio purposes.
