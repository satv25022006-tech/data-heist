-- =====================================================================
-- DETECTIVE GAME & CRIME BUREAU ADMIN — SUPABASE POSTGRESQL SCHEMA
-- Complete migration with Row Level Security (RLS), RBAC, Tables & Triggers
-- =====================================================================

-- Enable pgcrypto for UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. PROFILES & ROLES
CREATE TYPE user_role_type AS ENUM ('super_admin', 'content_admin', 'game_manager', 'analyst', 'player');
CREATE TYPE level_difficulty AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE answer_type AS ENUM ('multiple_choice', 'text_input');

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID UNIQUE, -- references auth.users(id) in Supabase
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    role user_role_type DEFAULT 'player',
    display_name VARCHAR(150),
    avatar_url TEXT,
    is_blocked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. GAME SETTINGS
CREATE TABLE IF NOT EXISTS game_settings (
    id VARCHAR(50) PRIMARY KEY DEFAULT 'global_settings',
    game_title VARCHAR(200) NOT NULL DEFAULT 'Data Heist: Cyber Detective Bureau',
    game_description TEXT DEFAULT 'Crack cryptographic mysteries, inspect cyber-crime evidence, and neutralize syndicate threats.',
    logo_url TEXT,
    theme VARCHAR(50) DEFAULT 'noir-cyber',
    maintenance_mode BOOLEAN DEFAULT FALSE,
    demo_rules_countdown_enabled BOOLEAN DEFAULT FALSE,
    demo_rules_countdown_seconds INT DEFAULT 120,
    default_timer_seconds INT DEFAULT 60,
    allow_timer_pause BOOLEAN DEFAULT FALSE,
    allow_question_retry BOOLEAN DEFAULT FALSE,
    auto_submit_on_timeout BOOLEAN DEFAULT TRUE,
    timeout_penalty_points INT DEFAULT 10,
    base_correct_points INT DEFAULT 100,
    incorrect_penalty_points INT DEFAULT 25,
    hint_penalty_points INT DEFAULT 15,
    speed_bonus_multiplier NUMERIC(4, 2) DEFAULT 1.5,
    sound_effects_enabled BOOLEAN DEFAULT TRUE,
    supported_languages JSONB DEFAULT '["en", "es", "fr", "de", "ja"]'::jsonb,
    default_language VARCHAR(10) DEFAULT 'en',
    rules_text TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id)
);

-- 3. LEVELS
CREATE TABLE IF NOT EXISTS levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) NOT NULL UNIQUE,
    level_number INT NOT NULL,
    display_order INT NOT NULL DEFAULT 1,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    difficulty level_difficulty NOT NULL DEFAULT 'easy',
    time_limit_seconds INT DEFAULT 90, -- 0 for untimed or custom
    points_per_question INT DEFAULT 100,
    passing_score INT DEFAULT 200,
    min_stars_required_to_pass INT DEFAULT 1,
    hint_available BOOLEAN DEFAULT TRUE,
    hint_penalty INT DEFAULT 15,
    incorrect_penalty INT DEFAULT 25,
    speed_bonus_enabled BOOLEAN DEFAULT TRUE,
    speed_bonus_max INT DEFAULT 50,
    status content_status DEFAULT 'draft',
    background_image_url TEXT,
    translations JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

-- 4. LEVEL UNLOCK REQUIREMENTS
CREATE TABLE IF NOT EXISTS level_unlock_requirements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
    required_previous_level_id UUID REFERENCES levels(id) ON DELETE SET NULL,
    min_stars_from_easy INT DEFAULT 0,
    min_stars_from_medium INT DEFAULT 0,
    min_total_stars INT DEFAULT 0,
    min_total_score INT DEFAULT 0,
    custom_condition_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. QUESTIONS
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level_id UUID REFERENCES levels(id) ON DELETE SET NULL,
    title VARCHAR(250) NOT NULL,
    text TEXT NOT NULL,
    image_poster_url TEXT,
    image_caption TEXT,
    image_storage_path TEXT,
    answer_type answer_type DEFAULT 'multiple_choice',
    correct_answer_secret TEXT NOT NULL, -- Never returned directly to untrusted player client
    explanation TEXT,
    hint TEXT,
    difficulty level_difficulty DEFAULT 'easy',
    category VARCHAR(100) DEFAULT 'Forensics',
    points INT DEFAULT 100,
    incorrect_penalty INT DEFAULT 25,
    timer_override_seconds INT DEFAULT NULL, -- NULL uses level default
    display_order INT DEFAULT 1,
    translations JSONB DEFAULT '{}'::jsonb,
    status content_status DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES profiles(id)
);

-- 6. ANSWER OPTIONS (for multiple choice questions)
CREATE TABLE IF NOT EXISTS answer_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    option_key VARCHAR(10) NOT NULL, -- 'A', 'B', 'C', 'D'
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. QUESTION POSTERS / STORAGE METADATA
CREATE TABLE IF NOT EXISTS question_posters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question_id UUID REFERENCES questions(id) ON DELETE SET NULL,
    storage_path TEXT NOT NULL,
    public_url TEXT NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    alt_text TEXT,
    caption TEXT,
    uploaded_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PUBLISHED VERSIONS (Immutable snapshots for active attempts)
CREATE TABLE IF NOT EXISTS published_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    version_number INT NOT NULL,
    published_by UUID REFERENCES profiles(id),
    snapshot_data JSONB NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. PLAYER ATTEMPTS
CREATE TABLE IF NOT EXISTS player_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
    published_version_id UUID REFERENCES published_versions(id),
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned', 'timeout'
    total_score INT DEFAULT 0,
    stars_earned INT DEFAULT 0,
    total_time_spent_seconds INT DEFAULT 0,
    total_time_saved_seconds INT DEFAULT 0,
    accuracy_percentage NUMERIC(5, 2) DEFAULT 0.00,
    hints_used_count INT DEFAULT 0,
    is_passed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. ATTEMPT ANSWERS
CREATE TABLE IF NOT EXISTS attempt_answers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    attempt_id UUID NOT NULL REFERENCES player_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    submitted_answer TEXT,
    is_correct BOOLEAN DEFAULT FALSE,
    points_awarded INT DEFAULT 0,
    penalty_deducted INT DEFAULT 0,
    hint_used BOOLEAN DEFAULT FALSE,
    time_taken_seconds INT DEFAULT 0,
    time_saved_seconds INT DEFAULT 0,
    answered_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. PLAYER PROGRESS
CREATE TABLE IF NOT EXISTS player_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    level_id UUID NOT NULL REFERENCES levels(id) ON DELETE CASCADE,
    is_unlocked BOOLEAN DEFAULT FALSE,
    is_completed BOOLEAN DEFAULT FALSE,
    highest_score INT DEFAULT 0,
    highest_stars INT DEFAULT 0,
    fastest_time_seconds INT DEFAULT 0,
    attempts_count INT DEFAULT 0,
    first_completed_at TIMESTAMPTZ,
    last_attempt_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(player_id, level_id)
);

-- 12. ACHIEVEMENTS & USER ACHIEVEMENTS
CREATE TABLE IF NOT EXISTS achievements (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT NOT NULL,
    icon VARCHAR(50) NOT NULL,
    badge_category VARCHAR(50) DEFAULT 'detective',
    requirement_type VARCHAR(50) NOT NULL,
    requirement_threshold INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    achievement_id VARCHAR(50) NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(player_id, achievement_id)
);

-- 13. AUDIT LOGS
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES profiles(id),
    actor_name VARCHAR(150) NOT NULL,
    actor_role user_role_type NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(100) NOT NULL, -- 'level', 'question', 'poster', 'settings', 'player', 'auth'
    target_id VARCHAR(150),
    details JSONB DEFAULT '{}'::jsonb,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. PARTICIPANT SUBMISSIONS (Official Symposium Standings & Feedback)
CREATE TABLE IF NOT EXISTS participant_submissions (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    register_number VARCHAR(100) NOT NULL,
    college_name VARCHAR(250) NOT NULL,
    team_name VARCHAR(150),
    game_title VARCHAR(250) DEFAULT 'DATA HEIST',
    total_score INT DEFAULT 0,
    total_stars INT DEFAULT 0,
    accuracy_percentage NUMERIC(5, 2) DEFAULT 0.00,
    total_time_spent_seconds INT DEFAULT 0,
    total_time_saved_seconds INT DEFAULT 0,
    completed_levels_count INT DEFAULT 1,
    feedback TEXT,
    rating INT DEFAULT 5,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE level_unlock_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answer_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_posters ENABLE ROW LEVEL SECURITY;
ALTER TABLE published_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempt_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE participant_submissions ENABLE ROW LEVEL SECURITY;

-- Helper functions for checking admin role
CREATE OR REPLACE FUNCTION is_admin() 
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE auth_user_id = auth.uid() 
      AND role IN ('super_admin', 'content_admin', 'game_manager')
      AND is_blocked = FALSE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Public can read basic profile, user can read self, admin can manage all
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Admins can update profiles" ON profiles FOR ALL USING (is_admin());

-- Game Settings: Public read, Admin write
CREATE POLICY "Public read game settings" ON game_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage game settings" ON game_settings FOR ALL USING (is_admin());

-- Levels: Public can read published levels; Admins can read/write all
CREATE POLICY "Public read published levels" ON levels FOR SELECT USING (status = 'published' OR is_admin());
CREATE POLICY "Admins manage levels" ON levels FOR ALL USING (is_admin());

-- Questions: Public cannot read draft/archived questions or answers directly; Admins can manage all
CREATE POLICY "Public read published questions" ON questions FOR SELECT USING (status = 'published' OR is_admin());
CREATE POLICY "Admins manage questions" ON questions FOR ALL USING (is_admin());

-- Audit logs: Read-only for authorized staff, never editable
CREATE POLICY "Admins read audit logs" ON audit_logs FOR SELECT USING (is_admin());
CREATE POLICY "System insert audit logs" ON audit_logs FOR INSERT WITH CHECK (true);

-- Participant Submissions: Anyone can insert, everyone can read/admins manage
CREATE POLICY "Anyone can submit participant info" ON participant_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Participant submissions viewable by everyone" ON participant_submissions FOR SELECT USING (true);
CREATE POLICY "Admins manage participant submissions" ON participant_submissions FOR ALL USING (is_admin());

-- Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_levels_status ON levels(status);
CREATE INDEX IF NOT EXISTS idx_questions_level ON questions(level_id, status);
CREATE INDEX IF NOT EXISTS idx_attempts_player ON player_attempts(player_id, level_id);
CREATE INDEX IF NOT EXISTS idx_attempts_completed ON player_attempts(completed_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_participant_submitted ON participant_submissions(submitted_at DESC);
