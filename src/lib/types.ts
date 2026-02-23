export type PostStatus = 'pending' | 'approved' | 'rejected' | 'published';

export interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    content: string;
    author: string;
    category: string;
    date: string;
    postedAt?: string; // ISO string with time
    images?: string[]; // Multiple image URLs
    status: PostStatus;
    reviewerNotes?: string;
    attachments?: string[]; // Links to documents, PDFs, etc.
    authorPassword?: string; // Hashed password for author to delete the post
    authorEmail?: string; // Author email for deletion
    satellite?: string; // e.g. Sentinel-2, Landsat 8
    areaOfInterest?: string; // e.g. Amazon Rainforest, New York City
}

export interface PostRequest {
    id: string;
    title: string;
    author: string;
    email: string;
    abstract?: string;
    content: string;  // Full blog content written by the author
    category: string;
    submittedAt: string;
    status: 'pending' | 'accepted' | 'denied';
    images?: string[]; // Author can provide evidence images
    attachments?: string[]; // Links to documents, proofs, etc.
    authorPassword?: string; // Hashed password for author to delete the post
    satellite?: string;
    areaOfInterest?: string;
}

export interface PostComment {
    id: string;
    postId: string;
    parentId?: string;
    authorName: string;
    commenterId?: string;
    commenterKey?: string;
    message: string;
    createdAt: string;
    status?: 'visible' | 'hidden';
    moderatedBy?: string;
    moderatedAt?: string;
    moderationReason?: string;
}

export type CommentRole = 'user' | 'bot' | 'admin';

export interface CommentUser {
    userId: string;
    commenterKey: string;
    name: string;
    email: string;
    emailVerified: boolean;
    role: CommentRole;
    passwordHash: string;
    emailVerificationCodeHash?: string;
    emailVerificationExpiresAt?: string;
    createdAt: string;
}

export interface CommentSanction {
    subjectId: string;
    commenterKey: string;
    commenterName: string;
    strikes: number;
    mutedUntil?: string;
    banned?: boolean;
    lastViolationAt?: string;
    lastReason?: string;
}

export interface BotSettings {
    autoModerationEnabled: boolean;
    violationTerms: string[];
    severeTerms: string[];
    violationMuteHours: number;
    autoBanOnSevere: boolean;
}

export interface EditPostResponse {
    success: boolean;
    error?: string;
}
