// ============================================
// SUPABASE CONFIGURATION
// ============================================

const SUPABASE_URL = 'https://jdgioffanijemrrrykkp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZ2lvZmZhbmlqZW1ycnJ5a2twIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMTM5MjEsImV4cCI6MjA4NDY4OTkyMX0.8NQnxAW0fj3atAdp0361qPcCfgV5FjkbRguBFnPf-lc';

// Wait for Supabase library to load
function initializeSupabase() {
    if (typeof window.supabase === 'undefined') {
        console.warn('⏳ Waiting for Supabase library to load...');
        setTimeout(initializeSupabase, 100);
        return;
    }

    // Initialize Supabase client
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Make globally available
    window.supabaseClient = supabaseClient;
    
    console.log('✅ Supabase initialized successfully');
    console.log('📊 Project URL:', SUPABASE_URL);
    
    // Dispatch event to notify other scripts
    window.dispatchEvent(new Event('supabase-ready'));
}

// Start initialization
initializeSupabase();
