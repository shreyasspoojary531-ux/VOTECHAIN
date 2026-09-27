-- VoteChain Sample Database Seed Script
-- Execute with psql: psql -U postgres -d votechain -f sample_seed.sql

-- 1. Insert Default Accounts (Passwords hashed with bcrypt)
-- Admin: admin@votechain.demo (Password: Admin@123)
-- Registrar: registrar@votechain.demo (Password: Registrar@123)
-- Auditor: auditor@votechain.demo (Password: Auditor@123)
-- Voter: voter@votechain.demo (Password: Voter@123)

INSERT INTO "User" ("id", "email", "passwordHash", "role", "isActive", "createdAt", "updatedAt")
VALUES
  ('usr_admin_001', 'admin@votechain.demo', '$2a$10$wE0v7sVf.gJgWl8Nl6.OeuU9YfC2F.m7K9K1Qn6G3X4b5c6d7e8f9', 'ADMIN', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('usr_reg_001', 'registrar@votechain.demo', '$2a$10$x1234567890abcdef1234567890abcdef1234567890abcdef12', 'REGISTRAR', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('usr_aud_001', 'auditor@votechain.demo', '$2a$10$y1234567890abcdef1234567890abcdef1234567890abcdef12', 'AUDITOR', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("email") DO NOTHING;

-- 2. Insert Sample Mock Aadhaar Citizens
INSERT INTO "MockAadhaar" ("id", "aadhaarNumber", "fullName", "dateOfBirth", "gender", "address", "phone", "createdAt", "updatedAt")
VALUES
  ('aad_999988887777', '999988887777', 'Rajesh Sharma', '1990-05-15 00:00:00', 'Male', '#123, Sector 4, MG Road, Bengaluru, Karnataka', '9876543210', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('aad_999910000001', '999910000001', 'Aarav Patel', '1985-08-20 00:00:00', 'Male', '#101, Sector 1, Mumbai, Maharashtra', '9876510001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('aad_999910000002', '999910000002', 'Priya Verma', '1994-11-03 00:00:00', 'Female', '#102, Sector 2, Delhi, NCR', '9876510002', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("aadhaarNumber") DO NOTHING;

-- 3. Insert Sample Election
INSERT INTO "Election" ("id", "title", "description", "status", "startDate", "endDate", "createdByUserId", "createdAt", "updatedAt")
VALUES
  ('elec_demo_2026', '2026 General Legislative Assembly Election', 'City-wide general election for legislative assembly representatives.', 'PUBLISHED', CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '7 days', 'usr_admin_001', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;

-- 4. Insert Candidates
INSERT INTO "Candidate" ("id", "electionId", "name", "party", "symbolUrl", "createdAt", "updatedAt")
VALUES
  ('cand_001', 'elec_demo_2026', 'Aarav Patel', 'Progressive Alliance Party', '/symbols/pap.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cand_002', 'elec_demo_2026', 'Priya Sharma', 'National Reform Coalition', '/symbols/nrc.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('cand_003', 'elec_demo_2026', 'Vikram Singh', 'Independent Citizens Front', '/symbols/icf.png', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("id") DO NOTHING;
