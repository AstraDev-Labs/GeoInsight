-- GeoInsight D1 Migration Script
-- This script seeds the Cloudflare D1 database with existing data from DynamoDB (via local db.json).

-- 1. Seed Posts
INSERT INTO posts (id, title, excerpt, content, author, category, date, postedAt, status, images)
VALUES (
    'post-vb71s5rzp',
    'Persistent GIS',
    'Persistent testing',
    'Test persistent content',
    'Dr. Persist',
    'Land Cover Change',
    '21/2/2026',
    '2026-02-21T06:47:25.975Z',
    'published',
    '[]'
);

-- 2. Seed Settings
-- Bot Settings
INSERT INTO settings (key, value)
VALUES (
    'bot-settings',
    '{"autoModerationEnabled":true,"violationTerms":["slur","hate speech","porn","xxx","nude","nsfw","sex video","racist"],"severeTerms":["child porn","sexual assault","rape","kill yourself","terror attack"],"violationMuteHours":24,"autoBanOnSevere":true}'
);

-- Site Settings
INSERT INTO settings (key, value)
VALUES (
    'site-settings',
    '{"lockdownMode":"none"}'
);

-- 3. Note for other tables (requests, comments, comment_users, comment_sanctions)
-- These were empty in the current local database state.
-- If you have more data in DynamoDB, you can add more INSERT statements here.
