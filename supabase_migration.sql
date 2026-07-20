-- ============================================================
-- Crown & Crust — Supabase Database Migration
-- Run this in your Supabase SQL Editor (Settings > SQL Editor)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────
-- 1. Staff Profiles (linked to auth.users)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS staff_profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  role        TEXT NOT NULL CHECK (role IN ('admin','manager','baker','delivery')),
  email       TEXT,
  phone       TEXT,
  photo_url   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read own profile"
  ON staff_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Staff can update own profile"
  ON staff_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Allow admins to read all staff profiles
CREATE POLICY "Admins read all staff"
  ON staff_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM staff_profiles sp WHERE sp.id = auth.uid() AND sp.role = 'admin'
    )
  );

CREATE POLICY "Admins insert staff"
  ON staff_profiles FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM staff_profiles sp WHERE sp.id = auth.uid() AND sp.role = 'admin'
    )
  );

-- ─────────────────────────────────────────
-- 2. Customers (linked to auth.users)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT,
  email       TEXT,
  phone       TEXT,
  address     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers manage own record"
  ON customers FOR ALL
  USING (auth.uid() = id);

CREATE POLICY "Staff can read customers"
  ON customers FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = auth.uid())
  );

-- ─────────────────────────────────────────
-- 3. Employees
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employees (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            TEXT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('Baker','Cashier','Delivery','Manager','Admin')),
  email           TEXT,
  phone           TEXT NOT NULL,
  salary          NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_status  TEXT DEFAULT 'pending' CHECK (payment_status IN ('paid','pending')),
  joining_date    DATE NOT NULL DEFAULT CURRENT_DATE,
  photo_url       TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff manage employees"
  ON employees FOR ALL
  USING (EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = auth.uid()));

-- ─────────────────────────────────────────
-- 4. Salary History
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS salary_history (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id   UUID REFERENCES employees(id) ON DELETE CASCADE,
  month         INT NOT NULL CHECK (month BETWEEN 1 AND 12),
  year          INT NOT NULL,
  amount        NUMERIC(10,2) NOT NULL,
  paid_at       TIMESTAMPTZ DEFAULT NOW(),
  notes         TEXT
);

ALTER TABLE salary_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage salary history"
  ON salary_history FOR ALL
  USING (EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = auth.uid()));

-- ─────────────────────────────────────────
-- 5. Attendance
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS attendance (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id   UUID REFERENCES employees(id) ON DELETE CASCADE,
  date          DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in      TIME,
  check_out     TIME,
  status        TEXT DEFAULT 'present' CHECK (status IN ('present','absent','half-day')),
  UNIQUE(employee_id, date)
);

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage attendance"
  ON attendance FOR ALL
  USING (EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = auth.uid()));

-- ─────────────────────────────────────────
-- 6. Foods / Menu Items
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS foods (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT NOT NULL,
  category      TEXT NOT NULL,
  price         NUMERIC(10,2) NOT NULL,
  description   TEXT,
  ingredients   TEXT,
  prep_time     INT DEFAULT 30,  -- minutes
  stock_status  TEXT DEFAULT 'in_stock' CHECK (stock_status IN ('in_stock','out_of_stock','limited')),
  quantity      INT DEFAULT 0,
  image_url     TEXT,
  made_by       UUID REFERENCES employees(id) ON DELETE SET NULL,
  is_featured   BOOLEAN DEFAULT false,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE foods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read foods"
  ON foods FOR SELECT USING (true);

CREATE POLICY "Staff manage foods"
  ON foods FOR INSERT UPDATE DELETE
  USING (EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = auth.uid()));

-- ─────────────────────────────────────────
-- 7. Orders
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id         UUID REFERENCES customers(id) ON DELETE SET NULL,
  items               JSONB NOT NULL DEFAULT '[]',
  total_amount        NUMERIC(10,2) NOT NULL DEFAULT 0,
  delivery_charge     NUMERIC(10,2) DEFAULT 40,
  estimated_time      INT DEFAULT 45,  -- minutes
  payment_method      TEXT DEFAULT 'cod' CHECK (payment_method IN ('card','upi','netbanking','cod')),
  payment_status      TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','failed')),
  -- NOTE: payment_status is a mock flag only. Real payment integration (e.g. Razorpay/Stripe)
  -- would update this field via a webhook after actual transaction confirmation.
  status              TEXT DEFAULT 'placed' CHECK (status IN ('placed','preparing','out_for_delivery','delivered','cancelled')),
  delivery_partner_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  delivery_address    TEXT,
  notes               TEXT,
  order_date          TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers read own orders"
  ON orders FOR SELECT
  USING (auth.uid() = customer_id);

CREATE POLICY "Customers create orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Staff manage all orders"
  ON orders FOR ALL
  USING (EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = auth.uid()));

-- ─────────────────────────────────────────
-- 8. Income
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS income (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source      TEXT NOT NULL,
  amount      NUMERIC(10,2) NOT NULL,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  notes       TEXT,
  order_id    UUID REFERENCES orders(id) ON DELETE SET NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE income ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage income"
  ON income FOR ALL
  USING (EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = auth.uid()));

-- ─────────────────────────────────────────
-- 9. Expenses
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS expenses (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category    TEXT NOT NULL,
  amount      NUMERIC(10,2) NOT NULL,
  date        DATE NOT NULL DEFAULT CURRENT_DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff manage expenses"
  ON expenses FOR ALL
  USING (EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = auth.uid()));

-- ─────────────────────────────────────────
-- 10. Feedback
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id    UUID REFERENCES orders(id) ON DELETE CASCADE,
  food_id     UUID REFERENCES foods(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  rating      INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  is_flagged  BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read feedback"
  ON feedback FOR SELECT USING (true);

CREATE POLICY "Customers submit feedback"
  ON feedback FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Staff manage feedback"
  ON feedback FOR UPDATE DELETE
  USING (EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = auth.uid()));

-- ─────────────────────────────────────────
-- Storage bucket for food images
-- ─────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public) VALUES ('food-images', 'food-images', true)
ON CONFLICT DO NOTHING;

CREATE POLICY "Public read food images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'food-images');

CREATE POLICY "Staff upload food images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'food-images'
    AND EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = auth.uid())
  );

CREATE POLICY "Staff delete food images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'food-images'
    AND EXISTS (SELECT 1 FROM staff_profiles sp WHERE sp.id = auth.uid())
  );

-- ─────────────────────────────────────────
-- Trigger: auto-create staff_profile on signup
-- (Optional — can also be done in app code)
-- ─────────────────────────────────────────
-- Note: For staff signup flow, the app inserts into staff_profiles after auth.signUp

-- ─────────────────────────────────────────
-- Seed: Sample data (optional, for dev)
-- ─────────────────────────────────────────
-- Uncomment to seed sample employees
-- INSERT INTO employees (name, role, phone, salary, joining_date) VALUES
--   ('Priya Sharma', 'Baker', '9876543210', 25000, '2023-01-15'),
--   ('Rahul Mehta', 'Manager', '9876543211', 45000, '2022-06-01'),
--   ('Anita Patel', 'Delivery', '9876543212', 18000, '2023-03-20');
