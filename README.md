# Mini ERP

A full-stack, responsive, and beautifully designed Mini ERP (Enterprise Resource Planning) system for small to medium businesses. The system manages customers, products/inventory, sales challans, invoices, payments, and employees with role-based access control.

**Live Demo:** [https://mini-erp-git-main-om-portfolio1.vercel.app/](https://mini-erp-one-sigma.vercel.app/)

## ✨ Features

- **Dashboard:** Interactive analytics, revenue overview, and low-stock alerts with a modern 3D UI.
- **Role-Based Access Control:** Custom roles (`ADMIN`, `SALES`, `ACCOUNTS`, `WAREHOUSE`) with specific permissions.
- **Customer Management:** Track retail, wholesale, and distributor details, including GSTIN and contact info.
- **Product & Inventory Management:** SKU tracking, dynamic stock calculation, and minimum stock alerts.
- **Sales Challans (Delivery Notes):** Create, confirm, or cancel challans. Supports an "Edit Request" workflow for confirmed challans.
- **Invoices:** One-click invoice generation from confirmed challans.
- **Payments:** Record partial or full payments against invoices with various payment modes.
- **Print & PDF Generation:** Built-in printable templates for both Challans and Invoices.
- **Company Settings:** Manage global company details (name, address, GST, logo) and a master reset feature.
- **Premium UI:** Glassmorphism, 3D hover effects, GPU-accelerated CSS animations, and a sleek dark theme.

## 🛠️ Technology Stack

**Frontend:**
- React 19
- Vite
- React Router DOM for routing
- Lucide React for iconography
- Pure CSS with variables, keyframe animations, and 3D transforms

**Backend:**
- Node.js & Express.js
- Prisma ORM
- LibSQL / SQLite (Turso)
- JSON Web Tokens (JWT) for authentication
- bcryptjs for password hashing

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kumarom-arya/mini-erp.git
   cd mini-erp
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Create a .env file with your variables (e.g., DATABASE_URL, JWT_SECRET, PORT)
   # Sync Prisma schema to your database
   npx prisma db push
   # Start the backend server
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   # Create a .env file with VITE_API_URL pointing to your backend
   # Start the frontend dev server
   npm run dev
   ```

## 🔐 Default Credentials (Demo)

If you seed the initial database via the login screen, you can use the following default credentials to access the `ADMIN` account:

- **Username:** `admin`
- **Password:** `password123`

---
*Built with modern web technologies for a smooth, high-performance experience.*
