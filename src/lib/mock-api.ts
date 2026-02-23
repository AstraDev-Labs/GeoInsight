import { BlogPost, PostRequest } from './types';

// This client-side API layer now calls our server-side API routes
// which interact with a shared DB (db.json simulating AWS)

export const api = {
    getPosts: async () => {
        const res = await fetch('/api/posts?status=published', { cache: 'no-store' });
        return res.json();
    },

    getAllPosts: async () => {
        const res = await fetch('/api/posts', { cache: 'no-store' });
        return res.json();
    },

    getPostById: async (id: string) => {
        // For single page, fetch all and find or create a specific endpoint
        const res = await fetch('/api/posts', { cache: 'no-store' });
        const posts: BlogPost[] = await res.json();
        return posts.find(p => p.id === id);
    },

    submitRequest: async (request: Omit<PostRequest, 'id' | 'submittedAt' | 'status'>) => {
        const res = await fetch('/api/requests', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        });
        return res.json();
    },

    getRequests: async () => {
        const res = await fetch('/api/requests', { cache: 'no-store' });
        return res.json();
    },

    updateRequestStatus: async (id: string, status: 'accepted' | 'denied') => {
        const res = await fetch(`/api/requests/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        return res.json();
    },

    publishPost: async (id: string, finalContent: string, images: string[], attachments: string[]) => {
        const res = await fetch(`/api/posts/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                content: finalContent,
                images,
                attachments,
                status: 'published',
                postedAt: new Date().toISOString()
            })
        });
        return res.json();
    },

    updatePostStatus: async (id: string, status: BlogPost['status']) => {
        const res = await fetch(`/api/posts/${id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        return res.json();
    },

    deletePost: async (id: string, email?: string) => {
        const res = await fetch(`/api/posts/${id}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: email ? JSON.stringify({ email }) : undefined
        });
        return res.json();
    },

    deleteRequest: async (id: string) => {
        const res = await fetch(`/api/requests/${id}`, {
            method: 'DELETE',
        });
        return res.json();
    },

    clearHistory: async () => {
        const res = await fetch('/api/admin/clear-history', {
            method: 'POST'
        });
        return res.json();
    }
};
