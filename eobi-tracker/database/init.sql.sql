-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('Super Admin', 'BTS', 'Beat Officer', 'DDG', 'RH', 'Chairman')),
  region VARCHAR(50),
  assigned_beat_code VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
  id SERIAL PRIMARY KEY,
  tracking_id VARCHAR(50) UNIQUE NOT NULL,
  fir_number VARCHAR(100) NOT NULL,
  claimant_name VARCHAR(100) NOT NULL,
  cnic VARCHAR(15) UNIQUE NOT NULL,
  employer_details TEXT NOT NULL,
  region VARCHAR(50) NOT NULL,
  beat_code VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
  rejection_reason TEXT,
  assigned_officer_id INTEGER REFERENCES users(id),
  drive_file_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id INTEGER,
  details JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_certificates_region_beat ON certificates(region, beat_code);
CREATE INDEX idx_certificates_status ON certificates(status);
CREATE INDEX idx_users_region_beat ON users(region, assigned_beat_code);