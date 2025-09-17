// Supabase Authentication Handler for PlayInMo
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.supabase = window.supabaseClient;
        this.init();
    }

    async init() {
        console.log('AuthManager init started');
        await this.checkAuthState();
        this.bindEvents();
        this.setupAuthStateListener();
        
        // Force initial UI update with delay to ensure DOM is ready
        setTimeout(() => {
            this.updateUI();
            console.log('AuthManager UI update completed');
        }, 100);
        
        console.log('AuthManager init completed');
    }

    // Set up auth state listener
    setupAuthStateListener() {
        this.supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event, session);
            
            if (event === 'SIGNED_IN' && session) {
                this.handleAuthStateChange(session);
            } else if (event === 'SIGNED_OUT') {
                this.currentUser = null;
                this.updateUI();
            }
        });
    }

    async handleAuthStateChange(session) {
        if (session?.user) {
            // Get or create user profile
            const userProfile = await this.getOrCreateUserProfile(session.user);
            this.currentUser = userProfile;
            this.updateUI();
            this.trackUserActivity('login');
            
            // If on chat page, trigger chat setup
            if (window.location.pathname.includes('chat.html') && window.chatManager) {
                window.chatManager.currentUser = userProfile;
                window.chatManager.showChatRoom();
                window.chatManager.setupChat();
            }
            
            
            // Force UI update after a small delay to ensure it overrides any other handlers
            setTimeout(() => {
                this.updateUI();
            }, 150);
        }
    }

    // Get or create user profile in database
    async getOrCreateUserProfile(user) {
        try {
            // Check if user profile exists
            const { data: existingProfile, error: fetchError } = await this.supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (existingProfile && !fetchError) {
                return existingProfile;
            }

            // Create new user profile
            const username = this.generateUsername(user.email, user.user_metadata?.full_name);
            const profileData = {
                user_id: user.id,
                email: user.email,
                username: username,
                full_name: user.user_metadata?.full_name || '',
                avatar_url: user.user_metadata?.avatar_url || '',
                provider: user.app_metadata?.provider || 'email',
                created_at: new Date().toISOString()
            };

            const { data: newProfile, error: createError } = await this.supabase
                .from('user_profiles')
                .insert([profileData])
                .select()
                .single();

            if (createError) {
                console.error('Error creating user profile:', createError);
                throw createError;
            }

            // Track new user registration
            this.trackUserActivity('signup');
            
            return newProfile;
        } catch (error) {
            console.error('Error managing user profile:', error);
            throw error;
        }
    }

    // Generate unique username
    generateUsername(email, name = '') {
        let baseUsername = '';
        
        if (name) {
            baseUsername = name.toLowerCase()
                .replace(/[^a-z0-9]/g, '')
                .substring(0, 15);
        } else {
            baseUsername = email.split('@')[0]
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '')
                .substring(0, 15);
        }

        // Add random suffix to ensure uniqueness
        const randomSuffix = Math.floor(Math.random() * 1000);
        return baseUsername + randomSuffix;
    }

    // Sign in with email and password
    async signInWithEmail(email, password) {
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;
            
            this.showSuccessMessage('Signed in successfully!');
            this.closeModals();
            
            // The handleAuthStateChange will be triggered automatically
            
        } catch (error) {
            console.error('Email sign-in error:', error);
            this.showError(error.message);
        }
    }

    // Sign up with email and password
    async signUpWithEmail(username, email, password) {
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        username: username
                    }
                }
            });

            if (error) throw error;
            
            if (data.user && !data.session) {
                this.showSuccessMessage('Please check your email to confirm your account!');
            } else {
                this.showSuccessMessage('Account created successfully!');
            }
            
            this.closeModals();
            
        } catch (error) {
            console.error('Email sign-up error:', error);
            this.showError(error.message);
        }
    }

    // Sign in with Google
    async signInWithGoogle() {
        try {
            const { data, error } = await this.supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.hostname === 'localhost' 
                        ? `http://localhost:${window.location.port}`
                        : 'https://playinmo.com'
                }
            });

            if (error) throw error;
            
        } catch (error) {
            console.error('Google sign-in error:', error);
            this.showError('Failed to sign in with Google');
        }
    }

    // Sign out
    async signOut() {
        console.log('signOut method called');
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            
            this.currentUser = null;
            console.log('User signed out, current user set to null');
            
            
            this.updateUI();
            this.showSuccessMessage('Signed out successfully!');
            
        } catch (error) {
            console.error('Sign out error:', error);
            this.showError('Failed to sign out');
        }
    }

    // Check current auth state
    async checkAuthState() {
        try {
            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error) throw error;
            
            if (session?.user) {
                const userProfile = await this.getOrCreateUserProfile(session.user);
                this.currentUser = userProfile;
                this.updateUI();
            }
        } catch (error) {
            console.error('Error checking auth state:', error);
        }
    }

    // Track user activity
    async trackUserActivity(activityType, metadata = {}) {
        if (!this.currentUser) return;

        try {
            const activityData = {
                user_id: this.currentUser.user_id,
                activity_type: activityType,
                metadata: metadata,
                created_at: new Date().toISOString()
            };

            const { error } = await this.supabase
                .from('user_activities')
                .insert([activityData]);

            if (error) {
                console.error('Error tracking activity:', error);
            }
        } catch (error) {
            console.error('Error tracking user activity:', error);
        }
    }

    // Update UI based on auth state
    updateUI() {
        console.log('updateUI called, currentUser:', this.currentUser);
        const loginBtn = document.getElementById('loginBtn');
        const signupBtn = document.getElementById('signupBtn');
        
        console.log('Found loginBtn:', !!loginBtn, 'signupBtn:', !!signupBtn);
        
        if (!loginBtn || !signupBtn) {
            console.error('Login/Signup buttons not found in DOM');
            return;
        }
        
        if (this.currentUser) {
            // User is logged in
            loginBtn.textContent = this.currentUser.username;
            loginBtn.onclick = () => this.viewProfile(); // Direct to profile instead of menu
            signupBtn.textContent = 'Logout';
            signupBtn.onclick = () => {
                console.log('Logout button clicked by AuthManager');
                this.signOut();
            };
            console.log('UI updated for logged in user:', this.currentUser.username);
            
        } else {
            // User is not logged in
            loginBtn.textContent = 'Login';
            loginBtn.onclick = () => {
                console.log('Login button clicked');
                document.getElementById('loginModal').classList.add('is-active');
            };
            signupBtn.textContent = 'Sign Up';
            signupBtn.onclick = () => {
                console.log('Signup button clicked');
                document.getElementById('signupModal').classList.add('is-active');
            };
            console.log('UI updated for anonymous user');
        }

    }

    showUserMenu() {
        const user = this.currentUser;
        const menu = `
            <div class="dropdown is-active" id="userDropdown" style="position: fixed; top: 60px; right: 20px; z-index: 1000;">
                <div class="dropdown-menu">
                    <div class="dropdown-content">
                        <div class="dropdown-item">
                            <strong>${user.username}</strong><br>
                            <small>${user.email}</small>
                        </div>
                        <hr class="dropdown-divider">
                        <a class="dropdown-item" onclick="authManager.viewProfile()">
                            Profile
                        </a>
                        <a class="dropdown-item" onclick="authManager.viewActivity()">
                            Activity
                        </a>
                        <hr class="dropdown-divider">
                        <a class="dropdown-item" onclick="authManager.signOut()">
                            Sign Out
                        </a>
                    </div>
                </div>
            </div>
        `;
        
        // Remove existing dropdown
        const existingDropdown = document.getElementById('userDropdown');
        if (existingDropdown) {
            existingDropdown.remove();
        }
        
        document.body.insertAdjacentHTML('beforeend', menu);
        
        // Close dropdown when clicking outside
        setTimeout(() => {
            document.addEventListener('click', this.closeUserMenu, { once: true });
        }, 100);
    }

    closeUserMenu(event) {
        const dropdown = document.getElementById('userDropdown');
        if (dropdown && !dropdown.contains(event.target)) {
            dropdown.remove();
        }
    }

    async viewProfile() {
        console.log('Opening profile for user:', this.currentUser.username);
        // Track activity
        await this.trackUserActivity('view_profile');
        this.showProfileModal();
    }

    showProfileModal() {
        const user = this.currentUser;
        const joinDate = new Date(user.created_at).toLocaleDateString();
        
        const profileModal = `
            <div class="modal is-active" id="profileModal">
                <div class="modal-background" onclick="document.getElementById('profileModal').remove()"></div>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <p class="modal-card-title">
                            <span class="icon"><i class="fas fa-user"></i></span>
                            User Profile
                        </p>
                        <button class="delete" onclick="document.getElementById('profileModal').remove()"></button>
                    </header>
                    <section class="modal-card-body">
                        <div class="content">
                            <div class="field">
                                <label class="label">Username</label>
                                <div class="control">
                                    <input class="input" type="text" value="${user.username}" readonly>
                                </div>
                            </div>
                            <div class="field">
                                <label class="label">Email</label>
                                <div class="control">
                                    <input class="input" type="email" value="${user.email}" readonly>
                                </div>
                            </div>
                            <div class="field">
                                <label class="label">Full Name</label>
                                <div class="control">
                                    <input class="input" type="text" value="${user.full_name || 'Not provided'}" readonly>
                                </div>
                            </div>
                            <div class="field">
                                <label class="label">Provider</label>
                                <div class="control">
                                    <span class="tag is-primary">${user.provider}</span>
                                </div>
                            </div>
                            <div class="field">
                                <label class="label">Member Since</label>
                                <div class="control">
                                    <input class="input" type="text" value="${joinDate}" readonly>
                                </div>
                            </div>
                        </div>
                    </section>
                    <footer class="modal-card-foot">
                        <button class="button is-primary" onclick="document.getElementById('profileModal').remove()">Close</button>
                        <button class="button is-danger" onclick="document.getElementById('profileModal').remove(); window.authManager.signOut();">Logout</button>
                    </footer>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', profileModal);
    }

    async viewActivity() {
        this.closeUserMenu();
        try {
            const { data: activities, error } = await this.supabase
                .from('user_activities')
                .select('*')
                .eq('user_id', this.currentUser.user_id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) throw error;

            await this.trackUserActivity('view_activity');
            
            const activityList = activities.map(activity => 
                `${activity.activity_type} - ${new Date(activity.created_at).toLocaleString()}`
            ).join('\n');
            
            alert(`Recent Activity:\n\n${activityList || 'No recent activity'}`);
        } catch (error) {
            console.error('Error fetching activities:', error);
            this.showError('Failed to load activity');
        }
    }

    showSuccessMessage(message) {
        this.showNotification(message, 'is-success');
    }

    showError(message) {
        this.showNotification(message, 'is-danger');
    }

    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type} is-light`;
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 2000;
            max-width: 350px;
            animation: slideIn 0.3s ease;
        `;
        notification.innerHTML = `
            <button class="delete" onclick="this.parentElement.remove()"></button>
            <strong>${type === 'is-success' ? 'Success!' : 'Error!'}</strong><br>
            ${message}
        `;

        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);

        // Add CSS animation if not exists
        if (!document.querySelector('#notification-animation')) {
            const style = document.createElement('style');
            style.id = 'notification-animation';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('is-active');
        });
    }

    bindEvents() {
        // Modal close events
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-background') || 
                e.target.classList.contains('delete')) {
                this.closeModals();
            }
        });

        // Track page views
        this.trackUserActivity('page_view', { 
            page: window.location.pathname,
            timestamp: new Date().toISOString()
        });
    }
}

// Initialize authentication when Supabase is ready
function initializeAuth() {
    if (window.supabaseClient) {
        window.authManager = new AuthManager();
        console.log('AuthManager initialized successfully');
    } else {
        console.log('Waiting for Supabase client...');
        // Wait for Supabase to be ready
        window.addEventListener('supabaseReady', () => {
            window.authManager = new AuthManager();
            console.log('AuthManager initialized after Supabase ready');
        }, { once: true });
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAuth);
} else {
    initializeAuth();
}