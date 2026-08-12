# Mini ERP - Project Submission

## 1. GitHub Repository Link
[https://github.com/kumarom-arya/mini-erp](https://github.com/kumarom-arya/mini-erp)

## 2. Live Frontend URL
[https://mini-erp-git-main-om-portfolio1.vercel.app/](https://mini-erp-git-main-om-portfolio1.vercel.app/)

## 3. Live Backend API URL
[https://mini-erp-backend-b31s.onrender.com/api](https://mini-erp-backend-b31s.onrender.com/api) *(Note: If your Render URL is different, please update this link before submitting).*

## 4. Test Login Credentials
*(If the database is fresh, click the **"Initialize Demo Users"** button on the login screen first).*

**Password for all roles:** `password123`

- **Admin Role:** `admin` (Full access to all pages and settings)
- **Sales Role:** `sales` (Access to Dashboard, Customers, Products, Challans, Invoices)
- **Warehouse Role:** `warehouse` (Access to Dashboard, Products)
- **Accounts Role:** `accounts` (Access to Dashboard, Customers, Invoices, Payments)

## 5. Postman Collection
A complete Postman collection has been included in the repository root as `mini_erp_postman_collection.json`. 
You can import this file directly into Postman to test the API endpoints.

## 6. README with Setup Instructions
The root `README.md` file contains complete setup and deployment instructions for both frontend and backend.

## 7. Short Explanation of Architecture
The Mini ERP is built using a modern **Monolithic API + SPA** architecture:
- **Frontend (SPA):** Built with React 19 and Vite. Uses `react-router-dom` for client-side routing. The UI is completely custom, using pure CSS variables, glassmorphism, and GPU-accelerated keyframe animations. It communicates with the backend via Axios, using JWTs attached to the `Authorization` header.
- **Backend (REST API):** A Node.js and Express server that handles authentication, business logic, and database operations.
- **Database (ORM):** Uses Prisma ORM connected to a LibSQL/SQLite database (designed to work with Turso for edge deployment). 
- **Security:** Passwords are hashed with `bcryptjs`. Stateless authentication is implemented via JSON Web Tokens (JWT).

## 8. Known Limitations or Incomplete Parts
- **SQLite Concurrency:** As it uses SQLite, it is optimized for small to medium workloads but might experience database locks if many users attempt to write simultaneously at extremely high volumes.
- **Reporting & Exports:** While Challans and Invoices can be printed or saved to PDF natively through the browser, raw CSV/Excel export functionality is not yet implemented.
- **Image Uploads:** The system accepts external Image URLs for company logos, but does not natively host image uploads via AWS S3 or a local storage mechanism yet.
