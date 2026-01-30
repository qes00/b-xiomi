import { supabase } from './supabase';
import { Tables, InsertTables, UpdateTables } from './database.types';

export type BlogPost = Tables<'blog_posts'>;
export type InsertBlogPost = InsertTables<'blog_posts'>;
export type UpdateBlogPost = UpdateTables<'blog_posts'>;

/**
 * Get all blog posts (admin view - includes unpublished)
 */
export async function getAllBlogPosts(): Promise<BlogPost[]> {
    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching all blog posts:', error);
        throw error;
    }

    return data || [];
}

/**
 * Get published blog posts (public view)
 */
export async function getPublishedBlogPosts(): Promise<BlogPost[]> {
    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error fetching published blog posts:', error);
        throw error;
    }

    return data || [];
}

/**
 * Get a single blog post by ID
 */
export async function getBlogPostById(id: string): Promise<BlogPost | null> {
    const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        console.error('Error fetching blog post:', error);
        return null;
    }

    return data;
}

/**
 * Create a new blog post
 */
export async function createBlogPost(post: InsertBlogPost): Promise<BlogPost> {
    const { data, error } = await supabase
        .from('blog_posts')
        .insert({
            ...post,
            updated_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating blog post:', error);
        throw error;
    }

    return data;
}

/**
 * Update an existing blog post
 */
export async function updateBlogPost(id: string, updates: UpdateBlogPost): Promise<BlogPost> {
    const { data, error } = await supabase
        .from('blog_posts')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating blog post:', error);
        throw error;
    }

    return data;
}

/**
 * Delete a blog post
 */
export async function deleteBlogPost(id: string): Promise<void> {
    const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting blog post:', error);
        throw error;
    }
}

/**
 * Toggle published status
 */
export async function toggleBlogPostPublished(id: string, published: boolean): Promise<BlogPost> {
    return updateBlogPost(id, { published });
}
