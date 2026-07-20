# Crown & Crust —  Bakery Management Web Application

An elegant, full-stack demonstration web application for a premium patisserie and bakery brand, designed for a college portfolio. 

## Tech Stack
*   **Frontend:** React 19 + Vite (React Router v7, Tailwind CSS v3, Framer Motion)
*   **Backend/Database:** Supabase (Auth, Postgres DB, Storage buckets)
*   **State Management:** Zustand (for shopping cart) + React Context (for authentication)
*   **Charts:** Recharts (sandalwood/espresso themed area/bar graphs)
*   **Data Fetching/Cache:** React Query (@tanstack/react-query)

---

## Design Theme & Visuals
*   **Palette:** Rich sandalwood (primary warm tan `#C2A177`), deep espresso brown, soft ivory/cream backgrounds, and muted gold highlights/badges.
*   **Typography:** Playfair Display (Serif) for headings, Inter (Sans-serif) for body text.
*   **Motion:** Lightweight, smooth Framer Motion page transitions, card hover scale effects, and animated status badges.

---

## Features
1.  **Dual Authentication Flows (Supabase Auth):**
    *   **Staff/Owner:** Portal at `/login`. Sign up/in for bakers, managers, and admins. Redirects to `/dashboard` internally.
    *   **Customer:** Portal at `/customer/login`. Manage default address, phone number, cart, checkout, and order history.
2.  **Dashboard:** Counters for total products, employees, active orders, and profit trend. Interlinked Recharts financial visualizations.
3.  **Food Management:** CRUD operations for menu items, categorized listing, stock level badge status, and image uploads to Supabase Storage.
4.  **Employee Management:** CRUD operations for employees, role selection, salary settings, and historical salary payments.
5.  **Finance/Accounting:** Income tracking (auto-populated from order totals) and manual expense tracking. Real-time net profit calculation.
6.  **Customer Site:** Elegant home page with reviews carousel, menu view with filters, checkout with mock payment validation, and real-time order status tracking with a visual stepper.
7.  **Feedback/Ratings:** 1-5 star customer ratings, review submissions, and a flagged-review moderation board for staff.

---

## 🔑 Demo Login Credentials

### Live Demo
🔗 [https://crown-and-crust.vercel.app](https://crown-and-crust.vercel.app)
*(replace with your actual Vercel URL)*

### Staff / Admin Dashboard
Access at: `/login`

| Field    | Value                        |
|----------|------------------------------|
| Email    | admin@crownandcrust.com     |
| Password | Admin@123                    |

Once logged in, you'll be redirected to `/dashboard`, which includes:
- **Overview** — stat cards for foods, employees, orders, income, expense, profit
- **Foods** — add/edit/delete menu items
- **Employees** — manage staff and salaries
- **Finance** — income vs expense tracking
- **Orders** — view and update order statuses
- **Feedback** — view and moderate customer reviews

### Customer Storefront
Access at: `/customer/login`

| Field    | Value                    |
|----------|--------------------------|
| Email    | customer@test.com       |
| Password | Customer@123              |

Browse the menu at `/customer/menu`, filter by category, add items to cart, checkout (simulated payment), and view order history at `/customer/orders`.

---

## Setup Instructions

### 1. Database Setup (Supabase)
1.  Create a free project on [Supabase](https://supabase.com).
2.  Go to the **SQL Editor** in your Supabase Dashboard.
3.  Copy the contents of `supabase_migration.sql` from this repository and paste it into the editor.
4.  Click **Run** to set up the tables, policies, triggers, and the public storage bucket.

### 2. Environment Configuration
Create a `.env` file in the root of the project (template available in `.env.example`) and fill in your Supabase URL and Anon Key:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anonymous-key
```

### 3. Installation & Run
Run the following commands in your terminal:
```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

---

## Folder Structure
