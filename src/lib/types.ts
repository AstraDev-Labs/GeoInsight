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
