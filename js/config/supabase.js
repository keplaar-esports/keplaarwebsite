// ============================================
// SUPABASE CONFIGURATION - CRITICAL!
// ============================================

console.log('🔧 Loading Supabase configuration...');

const SUPABASE_URL = 'https://jdgioffanijemrrrykkp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZ2lvZmZhbmlqZW1ycnJ5a2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMTM5MjEsImV4cCI6MjA4NDY4OTkyMX0.8NQnxAW0fj3atAdp0361qPcCfgV5FjkbRguBFnPf-lc';

// Wait for Supabase library to load
let initAttempts = 0;
const maxAttempts = 50; // 5 seconds max

function initializeSupabase() {
    initAttempts++;
    
    console.log(`🔄 Attempt ${initAttempts}/${maxAttempts}: Checking for Supabase SDK...`);
    
    if (typeof window.supabase === 'undefined') {
        if (initAttempts < maxAttempts) {
            console.warn('⏳ Waiting for Supabase library to load...');
            setTimeout(initializeSupabase, 100);
            return;
        } else {
            console.error('❌ CRITICAL: Supabase SDK failed to load after 5 seconds!');
            console.error('❌ Check if CDN is accessible: https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2');
            console.error('❌ Form submissions will NOT work!');
            
            // Create a dummy client that shows error
            window.supabaseClient = null;
            window.supabaseLoadError = 'Supabase SDK failed to load from CDN';
            return;
        }
    }

    try {
        // Initialize Supabase client
        const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Make globally available
        window.supabaseClient = supabaseClient;
        
        console.log('✅ Supabase initialized successfully');
        console.log('📊 Project URL:', SUPABASE_URL);
        console.log('🔑 Client ready:', !!window.supabaseClient);
        
        // Dispatch event to notify other scripts
        window.dispatchEvent(new CustomEvent('supabase-ready', { 
            detail: { client: supabaseClient } 
        }));
        
    } catch (error) {
        console.error('❌ Error initializing Supabase:', error);
        window.supabaseClient = null;
        window.supabaseLoadError = error.message;
    }
}

// Start initialization immediately
console.log('🚀 Starting Supabase initialization...');
initializeSupabase();
