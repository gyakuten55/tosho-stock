#!/usr/bin/env node

/**
 * MCP Server Connection Test
 * Tests Supabase connection and basic MCP functionality
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

console.log('🔧 Testing MCP Server Connection...\n');

// Test environment variables
console.log('📋 Environment Variables Check:');
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials in environment variables');
    console.log('Expected:');
    console.log('- NEXT_PUBLIC_SUPABASE_URL');
    console.log('- SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

console.log('✅ NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
console.log('✅ SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey.substring(0, 20) + '...');

// Test Supabase connection
console.log('\n🔌 Testing Supabase Connection:');
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function testSupabaseConnection() {
    try {
        // Test basic connection
        console.log('📡 Testing basic connection...');
        const { data, error } = await supabase.from('profiles').select('count').single();
        
        if (error && error.code !== 'PGRST116') {
            console.log('⚠️  Profiles table may not exist yet:', error.message);
        } else {
            console.log('✅ Basic connection successful');
        }

        // Test database structure
        console.log('📊 Checking database tables...');
        const { data: tables, error: tablesError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .in('table_name', ['profiles', 'categories', 'files']);

        if (tablesError) {
            console.log('⚠️  Could not check tables:', tablesError.message);
        } else {
            console.log('📋 Available tables:', tables?.map(t => t.table_name).join(', ') || 'None');
        }

        // Test storage bucket
        console.log('💾 Checking storage bucket...');
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        
        if (bucketError) {
            console.log('⚠️  Could not check storage buckets:', bucketError.message);
        } else {
            const filesBucket = buckets?.find(b => b.id === 'files');
            if (filesBucket) {
                console.log('✅ Files storage bucket exists');
            } else {
                console.log('⚠️  Files storage bucket not found');
                console.log('📋 Available buckets:', buckets?.map(b => b.id).join(', ') || 'None');
            }
        }

    } catch (error) {
        console.error('❌ Supabase connection test failed:', error.message);
        return false;
    }
    
    return true;
}

async function main() {
    const connectionSuccess = await testSupabaseConnection();
    
    console.log('\n🎯 Test Results Summary:');
    if (connectionSuccess) {
        console.log('✅ MCP Server is ready for Supabase integration');
        console.log('');
        console.log('📝 Next Steps:');
        console.log('1. Execute final_supabase_setup.sql in Supabase Dashboard');
        console.log('2. Execute storage_bucket_setup.sql in Supabase Dashboard');
        console.log('3. Start MCP server: node mcp-server.js');
        console.log('4. Configure Claude Desktop with MCP server');
    } else {
        console.log('❌ MCP Server setup needs attention');
        console.log('');
        console.log('🔧 Troubleshooting:');
        console.log('1. Check Supabase project status');
        console.log('2. Verify environment variables in .env.local');
        console.log('3. Ensure Supabase project URL is accessible');
    }
}

main().catch(console.error);