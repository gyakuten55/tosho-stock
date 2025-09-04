#!/usr/bin/env node

/**
 * Test script for MCP Server functionality
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Test Supabase connection
async function testSupabaseConnection() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        console.error('❌ Missing Supabase credentials');
        return false;
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    });

    try {
        // Test connection by querying categories
        const { data, error } = await supabase
            .from('categories')
            .select('count')
            .limit(1);

        if (error) {
            console.error('❌ Supabase connection failed:', error.message);
            return false;
        }

        console.log('✅ Supabase connection successful');
        return true;
    } catch (error) {
        console.error('❌ Supabase connection error:', error.message);
        return false;
    }
}

// Test categories table
async function testCategoriesTable() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    try {
        const { data, error } = await supabase
            .from('categories')
            .select('*');

        if (error) {
            console.error('❌ Categories table error:', error.message);
            return false;
        }

        console.log(`✅ Categories table exists with ${data.length} categories`);
        if (data.length > 0) {
            console.log('   Sample categories:', data.map(cat => cat.name).join(', '));
        }
        return true;
    } catch (error) {
        console.error('❌ Categories table test failed:', error.message);
        return false;
    }
}

// Test files table
async function testFilesTable() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    try {
        const { data, error } = await supabase
            .from('files')
            .select('count')
            .limit(1);

        if (error) {
            console.error('❌ Files table error:', error.message);
            return false;
        }

        console.log('✅ Files table exists and is accessible');
        return true;
    } catch (error) {
        console.error('❌ Files table test failed:', error.message);
        return false;
    }
}

// Test storage bucket
async function testStorageBucket() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    try {
        const { data, error } = await supabase
            .storage
            .listBuckets();

        if (error) {
            console.error('❌ Storage bucket test error:', error.message);
            return false;
        }

        const filesBucket = data.find(bucket => bucket.id === 'files');
        if (filesBucket) {
            console.log('✅ Storage bucket "files" exists');
            return true;
        } else {
            console.error('❌ Storage bucket "files" not found');
            return false;
        }
    } catch (error) {
        console.error('❌ Storage bucket test failed:', error.message);
        return false;
    }
}

// Main test function
async function runTests() {
    console.log('🔍 Testing MCP Server Database Setup...');
    console.log('==========================================');
    
    const results = {
        connection: await testSupabaseConnection(),
        categories: await testCategoriesTable(),
        files: await testFilesTable(),
        storage: await testStorageBucket()
    };
    
    console.log('==========================================');
    console.log('📊 Test Results Summary:');
    console.log(`   Supabase Connection: ${results.connection ? '✅' : '❌'}`);
    console.log(`   Categories Table: ${results.categories ? '✅' : '❌'}`);
    console.log(`   Files Table: ${results.files ? '✅' : '❌'}`);
    console.log(`   Storage Bucket: ${results.storage ? '✅' : '❌'}`);
    
    const allPassed = Object.values(results).every(result => result);
    
    if (allPassed) {
        console.log('🎉 All tests passed! MCP Server setup is ready.');
    } else {
        console.log('⚠️  Some tests failed. Please run the SQL setup script in Supabase.');
    }
    
    return allPassed;
}

runTests().catch(console.error);