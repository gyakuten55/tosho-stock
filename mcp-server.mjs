#!/usr/bin/env node

/**
 * MCP Server for Document Stock Management System
 * Provides direct Supabase integration for Claude
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

// Create MCP server with proper capabilities
const server = new Server({
    name: 'document-stock-mcp',
    version: '1.0.0'
}, {
    capabilities: {
        tools: {}
    }
});

// Schema definitions for tool parameters
const FileSchema = z.object({
    name: z.string(),
    original_name: z.string(),
    size: z.number(),
    category: z.string(),
    description: z.string().optional(),
    file_path: z.string(),
    mime_type: z.string().optional(),
    uploaded_by: z.string().uuid()
});

const CategorySchema = z.object({
    name: z.string(),
    description: z.string().optional()
});

const UpdateFileSchema = z.object({
    id: z.string().uuid(),
    name: z.string().optional(),
    category: z.string().optional(),
    description: z.string().optional(),
    is_deleted: z.boolean().optional()
});

// Register available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            // File management tools
            {
                name: 'list_files',
                description: 'List all files in the system with optional filtering',
                inputSchema: {
                    type: 'object',
                    properties: {
                        category: { type: 'string', description: 'Filter by category' },
                        search: { type: 'string', description: 'Search in file names and descriptions' },
                        limit: { type: 'number', description: 'Maximum number of files to return', default: 100 },
                        offset: { type: 'number', description: 'Number of files to skip', default: 0 }
                    }
                }
            },
            {
                name: 'get_file',
                description: 'Get detailed information about a specific file',
                inputSchema: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', description: 'File ID (UUID)' }
                    },
                    required: ['id']
                }
            },
            {
                name: 'create_file',
                description: 'Create a new file record in the database',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: 'Display name of the file' },
                        original_name: { type: 'string', description: 'Original filename' },
                        size: { type: 'number', description: 'File size in bytes' },
                        category: { type: 'string', description: 'Category name' },
                        description: { type: 'string', description: 'File description' },
                        file_path: { type: 'string', description: 'Storage path' },
                        mime_type: { type: 'string', description: 'MIME type' },
                        uploaded_by: { type: 'string', description: 'User ID who uploaded the file' }
                    },
                    required: ['name', 'original_name', 'size', 'category', 'file_path', 'uploaded_by']
                }
            },
            {
                name: 'update_file',
                description: 'Update file information or mark as deleted',
                inputSchema: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', description: 'File ID (UUID)' },
                        name: { type: 'string', description: 'New display name' },
                        category: { type: 'string', description: 'New category' },
                        description: { type: 'string', description: 'New description' },
                        is_deleted: { type: 'boolean', description: 'Mark as deleted' }
                    },
                    required: ['id']
                }
            },
            {
                name: 'delete_file',
                description: 'Soft delete a file (mark as deleted)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', description: 'File ID (UUID)' }
                    },
                    required: ['id']
                }
            },
            
            // Category management tools
            {
                name: 'list_categories',
                description: 'List all categories in the system',
                inputSchema: {
                    type: 'object',
                    properties: {
                        limit: { type: 'number', description: 'Maximum number of categories to return', default: 100 }
                    }
                }
            },
            {
                name: 'get_category',
                description: 'Get detailed information about a specific category',
                inputSchema: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', description: 'Category ID (UUID)' },
                        name: { type: 'string', description: 'Category name' }
                    }
                }
            },
            {
                name: 'create_category',
                description: 'Create a new category',
                inputSchema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: 'Category name' },
                        description: { type: 'string', description: 'Category description' }
                    },
                    required: ['name']
                }
            },
            {
                name: 'update_category',
                description: 'Update category information',
                inputSchema: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', description: 'Category ID (UUID)' },
                        name: { type: 'string', description: 'New category name' },
                        description: { type: 'string', description: 'New category description' }
                    },
                    required: ['id']
                }
            },
            {
                name: 'delete_category',
                description: 'Delete a category (only if no files are using it)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', description: 'Category ID (UUID)' }
                    },
                    required: ['id']
                }
            },

            // User management tools
            {
                name: 'list_users',
                description: 'List all user profiles',
                inputSchema: {
                    type: 'object',
                    properties: {
                        user_type: { type: 'string', enum: ['admin', 'user'], description: 'Filter by user type' },
                        limit: { type: 'number', description: 'Maximum number of users to return', default: 100 }
                    }
                }
            },
            {
                name: 'get_user',
                description: 'Get user profile information',
                inputSchema: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', description: 'User ID (UUID)' },
                        username: { type: 'string', description: 'Username' }
                    }
                }
            },

            // Analytics tools
            {
                name: 'get_file_stats',
                description: 'Get file statistics and analytics',
                inputSchema: {
                    type: 'object',
                    properties: {
                        category: { type: 'string', description: 'Filter by category' },
                        date_from: { type: 'string', description: 'Start date (ISO format)' },
                        date_to: { type: 'string', description: 'End date (ISO format)' }
                    }
                }
            },
            {
                name: 'get_category_usage',
                description: 'Get category usage statistics',
                inputSchema: {
                    type: 'object',
                    properties: {}
                }
            }
        ]
    };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
        const { name, arguments: args } = request.params;

        switch (name) {
            case 'list_files': {
                const { category, search, limit = 100, offset = 0 } = args;
                let query = supabase
                    .from('files')
                    .select('*')
                    .eq('is_deleted', false)
                    .range(offset, offset + limit - 1)
                    .order('uploaded_at', { ascending: false });

                if (category) {
                    query = query.eq('category', category);
                }

                if (search) {
                    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%,original_name.ilike.%${search}%`);
                }

                const { data, error } = await query;

                if (error) throw error;

                return {
                    content: [{
                        type: 'text',
                        text: JSON.stringify({ files: data, count: data.length }, null, 2)
                    }]
                };
            }

            case 'get_file': {
                const { id } = args;
                const { data, error } = await supabase
                    .from('files')
                    .select('*')
                    .eq('id', id)
                    .eq('is_deleted', false)
                    .single();

                if (error) throw error;

                return {
                    content: [{
                        type: 'text',
                        text: JSON.stringify(data, null, 2)
                    }]
                };
            }

            case 'create_file': {
                const fileData = FileSchema.parse(args);
                const { data, error } = await supabase
                    .from('files')
                    .insert(fileData)
                    .select()
                    .single();

                if (error) throw error;

                return {
                    content: [{
                        type: 'text',
                        text: JSON.stringify({ success: true, file: data }, null, 2)
                    }]
                };
            }

            case 'update_file': {
                const updateData = UpdateFileSchema.parse(args);
                const { id, ...updates } = updateData;

                if (updates.is_deleted) {
                    updates.deleted_at = new Date().toISOString();
                }

                const { data, error } = await supabase
                    .from('files')
                    .update(updates)
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;

                return {
                    content: [{
                        type: 'text',
                        text: JSON.stringify({ success: true, file: data }, null, 2)
                    }]
                };
            }

            case 'delete_file': {
                const { id } = args;
                const { data, error } = await supabase
                    .from('files')
                    .update({ 
                        is_deleted: true, 
                        deleted_at: new Date().toISOString() 
                    })
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;

                return {
                    content: [{
                        type: 'text',
                        text: JSON.stringify({ success: true, deleted_file: data }, null, 2)
                    }]
                };
            }

            case 'list_categories': {
                const { limit = 100 } = args;
                const { data, error } = await supabase
                    .from('categories')
                    .select('*')
                    .limit(limit)
                    .order('name');

                if (error) throw error;

                return {
                    content: [{
                        type: 'text',
                        text: JSON.stringify({ categories: data }, null, 2)
                    }]
                };
            }

            case 'get_category': {
                const { id, name } = args;
                let query = supabase.from('categories').select('*');

                if (id) {
                    query = query.eq('id', id);
                } else if (name) {
                    query = query.eq('name', name);
                } else {
                    throw new Error('Either id or name must be provided');
                }

                const { data, error } = await query.single();

                if (error) throw error;

                return {
                    content: [{
                        type: 'text',
                        text: JSON.stringify(data, null, 2)
                    }]
                };
            }

            case 'create_category': {
                const categoryData = CategorySchema.parse(args);
                const { data, error } = await supabase
                    .from('categories')
                    .insert(categoryData)
                    .select()
                    .single();

                if (error) throw error;

                return {
                    content: [{
                        type: 'text',
                        text: JSON.stringify({ success: true, category: data }, null, 2)
                    }]
                };
            }

            case 'update_category': {
                const { id, ...updates } = args;
                const { data, error } = await supabase
                    .from('categories')
                    .update(updates)
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;

                return {
                    content: [{
                        type: 'text',
                        text: JSON.stringify({ success: true, category: data }, null, 2)
                    }]
                };
            }

            case 'delete_category': {
                const { id } = args;
                
                // Check if category is being used by any files
                const { data: filesUsingCategory, error: checkError } = await supabase
                    .from('files')
                    .select('id')
                    .eq('category', id)
                    .eq('is_deleted', false);

                if (checkError) throw checkError;

                if (filesUsingCategory && filesUsingCategory.length > 0) {
                    throw new Error(`Cannot delete category: ${filesUsingCategory.length} files are still using this category`);
                }

                const { data, error } = await supabase
                    .from('categories')
                    .delete()
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;

                return {
                    content: [{
                        type: 'text',
                        text: JSON.stringify({ success: true, deleted_category: data }, null, 2)
                    }]
                };
            }

            case 'list_users': {
                const { user_type, limit = 100 } = args;
                let query = supabase
                    .from('profiles')
                    .select('*')
                    .limit(limit)
                    .order('created_at', { ascending: false });

                if (user_type) {
                    query = query.eq('user_type', user_type);
                }

                const { data, error } = await query;

                if (error) throw error;

                return {
                    content: [{
                        type: 'text',
                        text: JSON.stringify({ users: data }, null, 2)
                    }]
                };
            }

            case 'get_user': {
                const { id, username } = args;
                let query = supabase.from('profiles').select('*');

                if (id) {
                    query = query.eq('id', id);
                } else if (username) {
                    query = query.eq('username', username);
                } else {
                    throw new Error('Either id or username must be provided');
                }

                const { data, error } = await query.single();

                if (error) throw error;

                return {
                    content: [{
                        type: 'text',
                        text: JSON.stringify(data, null, 2)
                    }]
                };
            }

            case 'get_file_stats': {
                const { category, date_from, date_to } = args;
                
                let query = supabase
                    .from('files')
                    .select('id, size, category, uploaded_at')
                    .eq('is_deleted', false);

                if (category) {
                    query = query.eq('category', category);
                }

                if (date_from) {
                    query = query.gte('uploaded_at', date_from);
                }

                if (date_to) {
                    query = query.lte('uploaded_at', date_to);
                }

                const { data, error } = await query;

                if (error) throw error;

                const stats = {
                    total_files: data.length,
                    total_size: data.reduce((sum, file) => sum + file.size, 0),
                    average_file_size: data.length > 0 ? Math.round(data.reduce((sum, file) => sum + file.size, 0) / data.length) : 0,
                    files_by_category: {},
                    upload_timeline: {}
                };

                // Group by category
                data.forEach(file => {
                    if (!stats.files_by_category[file.category]) {
                        stats.files_by_category[file.category] = { count: 0, total_size: 0 };
                    }
                    stats.files_by_category[file.category].count++;
                    stats.files_by_category[file.category].total_size += file.size;
                });

                // Group by upload date
                data.forEach(file => {
                    const date = new Date(file.uploaded_at).toISOString().split('T')[0];
                    if (!stats.upload_timeline[date]) {
                        stats.upload_timeline[date] = 0;
                    }
                    stats.upload_timeline[date]++;
                });

                return {
                    content: [{
                        type: 'text',
                        text: JSON.stringify(stats, null, 2)
                    }]
                };
            }

            case 'get_category_usage': {
                const { data: categories, error: catError } = await supabase
                    .from('categories')
                    .select('*');

                if (catError) throw catError;

                const { data: files, error: filesError } = await supabase
                    .from('files')
                    .select('category')
                    .eq('is_deleted', false);

                if (filesError) throw filesError;

                const usage = categories.map(category => {
                    const fileCount = files.filter(file => file.category === category.name).length;
                    return {
                        ...category,
                        file_count: fileCount,
                        usage_percentage: files.length > 0 ? Math.round((fileCount / files.length) * 100) : 0
                    };
                });

                return {
                    content: [{
                        type: 'text',
                        text: JSON.stringify({ category_usage: usage }, null, 2)
                    }]
                };
            }

            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    } catch (error) {
        return {
            content: [{
                type: 'text',
                text: JSON.stringify({
                    error: true,
                    message: error.message,
                    details: error.details || null
                }, null, 2)
            }],
            isError: true
        };
    }
});

// Start the server
async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error('MCP Server for Document Stock Management System started');
}

main().catch(console.error);