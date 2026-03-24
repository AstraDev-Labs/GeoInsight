-- Posts table
CREATE TABLE IF NOT EXISTS posts (
    id TEXT PRIMARY KEY,
    requestId TEXT,
    editOfId TEXT,
    title TEXT NOT NULL,
    excerpt TEXT,
    content TEXT,
    author TEXT,
    category TEXT,
    date TEXT,
    postedAt TEXT,
    images TEXT, -- Store as JSON array string
    status TEXT,
    reviewerNotes TEXT,
    attachments TEXT, -- Store as JSON array string
    authorPassword TEXT,
    authorEmail TEXT,
    satellite TEXT,
    areaOfInterest TEXT
);

-- Requests table
CREATE TABLE IF NOT EXISTS requests (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT,
    email TEXT,
    abstract TEXT,
    content TEXT,
    category TEXT,
    submittedAt TEXT,
    status TEXT,
    images TEXT, -- Store as JSON array string
    attachments TEXT, -- Store as JSON array string
    authorPassword TEXT,
    satellite TEXT,
    areaOfInterest TEXT
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
    id TEXT PRIMARY KEY,
    postId TEXT NOT NULL,
    parentId TEXT,
    authorName TEXT,
    commenterId TEXT,
    commenterKey TEXT,
    message TEXT,
    createdAt TEXT,
    status TEXT DEFAULT 'visible',
    moderatedBy TEXT,
    moderatedAt TEXT,
    moderationReason TEXT,
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE
);

-- Comment Users table
CREATE TABLE IF NOT EXISTS comment_users (
    userId TEXT PRIMARY KEY,
    commenterKey TEXT UNIQUE NOT NULL,
    name TEXT,
    email TEXT UNIQUE,
    emailVerified INTEGER DEFAULT 0,
    role TEXT DEFAULT 'user',
    passwordHash TEXT,
    emailVerificationCodeHash TEXT,
    emailVerificationExpiresAt TEXT,
    createdAt TEXT
);

-- Comment Sanctions table
CREATE TABLE IF NOT EXISTS comment_sanctions (
    subjectId TEXT PRIMARY KEY,
    commenterKey TEXT,
    commenterName TEXT,
    strikes INTEGER DEFAULT 0,
    mutedUntil TEXT,
    banned INTEGER DEFAULT 0,
    lastViolationAt TEXT,
    lastReason TEXT
);

-- Site/Bot Settings (Key-Value)
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT -- Store as JSON object string
);
