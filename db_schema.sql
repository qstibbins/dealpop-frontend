-- Users table (extends Firebase Auth)
CREATE TABLE IF NOT EXISTS users (
  firebase_uid VARCHAR PRIMARY KEY,  -- From Firebase Auth
  email VARCHAR NOT NULL,
  display_name VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enhanced tracked products table
CREATE TABLE IF NOT EXISTS tracked_products (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(firebase_uid) ON DELETE CASCADE,
  product_url TEXT NOT NULL,
  product_name VARCHAR NOT NULL,
  product_image_url TEXT,
  brand VARCHAR,
  color VARCHAR,
  capacity VARCHAR,
  vendor VARCHAR,
  current_price DECIMAL(10,2),
  target_price DECIMAL(10,2),
  status VARCHAR DEFAULT 'tracking',  -- 'tracking', 'paused', 'completed'
  expires_at TIMESTAMP,
  extracted_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Comprehensive alerts system
CREATE TABLE IF NOT EXISTS alerts (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(firebase_uid) ON DELETE CASCADE,
  product_id INTEGER REFERENCES tracked_products(id) ON DELETE CASCADE,
  product_name VARCHAR NOT NULL,
  product_url TEXT NOT NULL,
  product_image_url TEXT,
  current_price DECIMAL(10,2) NOT NULL,
  target_price DECIMAL(10,2) NOT NULL,
  alert_type VARCHAR NOT NULL, -- 'price_drop', 'price_increase', 'stock_alert', 'expiry_alert'
  status VARCHAR DEFAULT 'active', -- 'active', 'triggered', 'dismissed', 'expired'
  notification_preferences JSONB NOT NULL DEFAULT '{"email": true, "push": true, "sms": false}',
  thresholds JSONB NOT NULL DEFAULT '{"priceDropPercentage": 10, "absolutePriceDrop": 10}',
  expires_at TIMESTAMP,
  triggered_at TIMESTAMP,
  last_checked_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Alert history for tracking all alert events
CREATE TABLE IF NOT EXISTS alert_history (
  id SERIAL PRIMARY KEY,
  alert_id INTEGER REFERENCES alerts(id) ON DELETE CASCADE,
  event_type VARCHAR NOT NULL, -- 'created', 'triggered', 'dismissed', 'updated', 'expired'
  old_price DECIMAL(10,2),
  new_price DECIMAL(10,2),
  price_change DECIMAL(10,2),
  price_change_percentage DECIMAL(5,2),
  message TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- User alert preferences
CREATE TABLE IF NOT EXISTS user_alert_preferences (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(firebase_uid) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  sms_notifications BOOLEAN DEFAULT FALSE,
  default_price_drop_percentage DECIMAL(5,2) DEFAULT 10.0,
  default_absolute_price_drop DECIMAL(10,2) DEFAULT 10.0,
  check_frequency VARCHAR DEFAULT 'daily', -- 'hourly', 'daily', 'weekly'
  quiet_hours JSONB DEFAULT '{"enabled": false, "start": "22:00", "end": "08:00"}',
  timezone VARCHAR DEFAULT 'UTC',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Price history tracking
CREATE TABLE IF NOT EXISTS price_history (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES tracked_products(id) ON DELETE CASCADE,
  price DECIMAL(10,2) NOT NULL,
  in_stock BOOLEAN DEFAULT TRUE,
  recorded_at TIMESTAMP DEFAULT NOW()
);

-- Saved searches
CREATE TABLE IF NOT EXISTS saved_searches (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(firebase_uid) ON DELETE CASCADE,
  name VARCHAR NOT NULL,
  search_query TEXT NOT NULL, -- JSON or search params
  category VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- A/B Testing analytics
CREATE TABLE IF NOT EXISTS ab_test_events (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR REFERENCES users(firebase_uid) ON DELETE SET NULL,
  session_id VARCHAR NOT NULL,
  test_name VARCHAR NOT NULL, -- 'login_page', 'product_card', etc.
  variant VARCHAR NOT NULL, -- 'original', 'v2', etc.
  event_type VARCHAR NOT NULL, -- 'view', 'signup', 'click', etc.
  event_data JSONB,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_tracked_products_user_id ON tracked_products(user_id);
CREATE INDEX IF NOT EXISTS idx_tracked_products_status ON tracked_products(status);
CREATE INDEX IF NOT EXISTS idx_tracked_products_vendor ON tracked_products(vendor);
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_product_id ON alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_product_id ON price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_price_history_recorded_at ON price_history(recorded_at);
CREATE INDEX IF NOT EXISTS idx_alert_history_alert_id ON alert_history(alert_id);
CREATE INDEX IF NOT EXISTS idx_ab_test_events_test_variant ON ab_test_events(test_name, variant);
CREATE INDEX IF NOT EXISTS idx_ab_test_events_timestamp ON ab_test_events(timestamp);

-- Full-text search indexes
CREATE INDEX IF NOT EXISTS idx_tracked_products_search ON tracked_products USING gin(to_tsvector('english', product_name || ' ' || COALESCE(brand, '') || ' ' || COALESCE(vendor, '')));