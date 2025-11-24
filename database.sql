-- Database Schema for CoachMe App
-- Compatible with PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(20) DEFAULT 'student' CHECK (role IN ('student', 'admin', 'instructor')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Instructors Table
CREATE TABLE instructors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(100) NOT NULL,
    title VARCHAR(100),
    bio TEXT,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Courses Table
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    subtitle TEXT,
    price DECIMAL(10, 2) NOT NULL,
    original_price DECIMAL(10, 2),
    rating DECIMAL(3, 2) DEFAULT 0.00,
    students_count INTEGER DEFAULT 0,
    last_updated VARCHAR(50),
    thumbnail_url VARCHAR(255),
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Course Instructors (Many-to-Many)
CREATE TABLE course_instructors (
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    instructor_id UUID REFERENCES instructors(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, instructor_id)
);

-- 5. Course Benefits (What you will learn)
CREATE TABLE course_benefits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon_name VARCHAR(50), -- e.g., 'Star', 'Users' (Lucide icon names)
    order_index INTEGER DEFAULT 0
);

-- 6. Modules (Curriculum)
CREATE TABLE modules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Lessons
CREATE TABLE lessons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    duration VARCHAR(50), -- e.g., "10:30"
    video_url VARCHAR(255),
    is_free_preview BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Testimonials
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100),
    content TEXT NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    avatar_url VARCHAR(255),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. Bookings / Services
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL, -- Can be null if guest booking
    guest_email VARCHAR(255),
    guest_name VARCHAR(100),
    service_type VARCHAR(50) NOT NULL, -- 'discovery', 'flash', 'mentoring'
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    booking_date TIMESTAMP WITH TIME ZONE,
    calendly_event_uri VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Newsletter Subscribers
CREATE TABLE newsletter_subscribers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_lessons_module_id ON lessons(module_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_email ON bookings(guest_email);

-- Seed Data (Optional - for testing)
INSERT INTO instructors (id, full_name, title, bio, avatar_url) 
VALUES 
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Jean Dupont', 'Coach Exécutif & Conférencier', 'Expert en leadership avec 15 ans d''expérience.', '/img/profile.jpg');

INSERT INTO courses (id, slug, title, subtitle, price, original_price, rating, students_count, last_updated, thumbnail_url, is_published)
VALUES 
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'masterclass-leadership', 'Masterclass Leadership & Influence', 'Devenez le leader que tout le monde veut suivre.', 497.00, 997.00, 4.9, 1240, 'Novembre 2025', '/img/hero.jpg', true);

INSERT INTO course_instructors (course_id, instructor_id)
VALUES ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11');

INSERT INTO course_benefits (course_id, title, description, icon_name)
VALUES 
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Communication Persuasive', 'Maîtrisez l''art de convaincre sans manipuler.', 'Users'),
('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Intelligence Émotionnelle', 'Décodez les émotions de vos équipes.', 'Star');

INSERT INTO modules (id, course_id, title, order_index)
VALUES 
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Module 1: Les Fondations', 1);

INSERT INTO lessons (module_id, title, duration, order_index)
VALUES 
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Définir son style', '10:00', 1),
('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'La psychologie de l''influence', '15:30', 2);
