// Supabase configuration
const SUPABASE_URL = 'https://fwijwjrbvbqavfoanjfd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ3aWp3anJidmJxYXZmb2FuamZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzOTIwNjQsImV4cCI6MjA2Njk2ODA2NH0.T6H7hzTNsy8rNz5m_DUZbQvVpfY1KdQdACJkPe4hXrc';

// Wait for Supabase library to load, then initialize client
function initializeSupabase() {
    if (typeof window.supabase !== 'undefined') {
        const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.supabaseClient = supabaseClient;
        console.log('Supabase client initialized successfully');
        
        // Dispatch event to notify other scripts
        window.dispatchEvent(new CustomEvent('supabaseReady'));
    } else {
        console.error('Supabase library not loaded yet');
        // Retry after a short delay
        setTimeout(initializeSupabase, 100);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSupabase);
} else {
    initializeSupabase();
}