// Community Chat System for moplay
class ChatManager {
    constructor() {
        this.supabase = window.supabaseClient;
        this.currentUser = null;
        this.messageSubscription = null;
        this.userSubscription = null;
        this.onlineUsers = new Map();
        this.isPageVisible = true;
        this.init();
    }

    async init() {
        console.log('ChatManager init started');
        
        // Only initialize on chat page
        if (!window.location.pathname.includes('chat.html')) {
            return;
        }

        // Always bind events first
        this.bindChatEvents();

        // Check if user is logged in - wait a bit for auth to complete
        console.log('Starting initial user check...');
        setTimeout(() => {
            console.log('AuthManager available:', !!window.authManager);
            console.log('Current user:', window.authManager?.currentUser);
            
            if (window.authManager && window.authManager.currentUser) {
                console.log('Initial user check: User found', window.authManager.currentUser);
                this.currentUser = window.authManager.currentUser;
                this.showChatRoom();
                this.setupChat();
            } else {
                console.log('Initial user check: No user found, showing login');
                this.showLoginRequired();
            }
        }, 2000); // Increased timeout to 2 seconds

        // Listen for auth state changes
        this.setupAuthListener();
        
        // Track page visibility for online status
        this.setupVisibilityTracking();
    }

    setupAuthListener() {
        // Listen for auth state changes via a custom event or polling
        const checkAuthState = () => {
            const hasAuthManager = !!window.authManager;
            const hasCurrentUser = !!window.authManager?.currentUser;
            const chatHasUser = !!this.currentUser;
            
            // Only log every 10th check to avoid spam
            if (Math.random() < 0.1) {
                console.log('Auth check - AuthManager:', hasAuthManager, 'User:', hasCurrentUser, 'Chat has user:', chatHasUser);
            }
            
            if (window.authManager && window.authManager.currentUser && !this.currentUser) {
                console.log('Auth state changed: User logged in', window.authManager.currentUser);
                this.currentUser = window.authManager.currentUser;
                this.showChatRoom();
                this.setupChat();
            } else if (!window.authManager?.currentUser && this.currentUser) {
                console.log('Auth state changed: User logged out');
                this.currentUser = null;
                this.showLoginRequired();
                this.cleanup();
            }
        };

        // Check immediately and then every second
        checkAuthState();
        setInterval(checkAuthState, 1000);
    }

    setupVisibilityTracking() {
        document.addEventListener('visibilitychange', () => {
            this.isPageVisible = !document.hidden;
            if (this.currentUser) {
                this.updateOnlineStatus();
            }
        });

        // Update status when page loads/unloads
        window.addEventListener('beforeunload', () => {
            if (this.currentUser) {
                this.setOfflineStatus();
            }
        });
    }

    showLoginRequired() {
        const loginSection = document.getElementById('loginRequired');
        const chatSection = document.getElementById('chatRoom');
        
        if (loginSection) loginSection.style.display = 'flex';
        if (chatSection) chatSection.style.display = 'none';
    }

    showChatRoom() {
        const loginSection = document.getElementById('loginRequired');
        const chatSection = document.getElementById('chatRoom');
        
        console.log('showChatRoom called');
        console.log('loginSection found:', !!loginSection);
        console.log('chatSection found:', !!chatSection);
        
        if (loginSection) {
            loginSection.style.display = 'none';
            console.log('Login section hidden');
        }
        if (chatSection) {
            chatSection.style.display = 'block';
            console.log('Chat section shown');
        }
        
        // Force a check that elements are visible
        setTimeout(() => {
            const chatVisible = chatSection && window.getComputedStyle(chatSection).display !== 'none';
            console.log('Chat section visible after timeout:', chatVisible);
        }, 100);
    }

    async setupChat() {
        console.log('Setting up chat for user:', this.currentUser?.username);
        
        await this.loadRecentMessages();
        
        // Force set online status multiple times to ensure it sticks
        await this.setOnlineStatus();
        await this.forceOnlineStatus(); // Additional force update
        
        await this.loadOnlineUsers();
        
        // Set up subscriptions after a delay to ensure user is properly registered
        setTimeout(() => {
            console.log('Setting up realtime subscriptions...');
            this.subscribeToMessages();
            this.subscribeToUserStatus();
            
            // Test realtime connection
            this.testRealtimeConnection();
        }, 2000);
        
        // Refresh online users more frequently (every 3 seconds)
        setInterval(() => {
            this.loadOnlineUsers();
        }, 3000);
        
        // Also refresh messages every 10 seconds as fallback
        setInterval(() => {
            this.loadRecentMessages();
        }, 10000);
        
        // Aggressive status updates every 5 seconds
        setInterval(() => {
            if (this.currentUser) {
                this.forceOnlineStatus();
            }
        }, 5000);
        
        // Additional polling for user status updates
        setInterval(() => {
            if (this.currentUser) {
                this.updateOnlineStatus();
            }
        }, 15000);
    }

    bindChatEvents() {
        const chatInput = document.getElementById('chatInput');
        const sendButton = document.getElementById('sendButton');
        const loginForm = document.getElementById('loginForm');
        const signupForm = document.getElementById('signupForm');
        const googleLoginBtn = document.getElementById('googleLoginBtn');
        const googleSignupBtn = document.getElementById('googleSignupBtn');
        const showLoginModal = document.getElementById('showLoginModal');
        const showSignupModal = document.getElementById('showSignupModal');

        if (chatInput && sendButton) {
            chatInput.disabled = false;
            sendButton.disabled = false;

            // Send message on button click
            sendButton.addEventListener('click', () => this.sendMessage());

            // Send message on Enter key
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    this.sendMessage();
                }
            });

            // Character count
            chatInput.addEventListener('input', () => {
                const charCount = document.getElementById('charCount');
                if (charCount) {
                    charCount.textContent = chatInput.value.length;
                }
            });
        }

        // Auth form handlers
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const email = document.getElementById('loginEmail').value;
                const password = document.getElementById('loginPassword').value;
                await window.authManager.signInWithEmail(email, password);
                
                // Close modal and check auth state after a short delay
                setTimeout(() => {
                    this.closeModals();
                    if (window.authManager && window.authManager.currentUser) {
                        console.log('Login success, setting up chat');
                        this.currentUser = window.authManager.currentUser;
                        this.showChatRoom();
                        this.setupChat();
                    }
                }, 1500);
            });
        }

        if (signupForm) {
            signupForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const username = document.getElementById('signupUsername').value;
                const email = document.getElementById('signupEmail').value;
                const password = document.getElementById('signupPassword').value;
                await window.authManager.signUpWithEmail(username, email, password);
            });
        }

        if (googleLoginBtn) {
            googleLoginBtn.addEventListener('click', () => {
                console.log('Google login clicked, authManager available:', !!window.authManager);
                if (window.authManager) {
                    window.authManager.signInWithGoogle();
                } else {
                    console.error('AuthManager not available');
                    this.showError('Authentication system not loaded. Please refresh the page.');
                }
            });
        }

        if (googleSignupBtn) {
            googleSignupBtn.addEventListener('click', () => {
                console.log('Google signup clicked, authManager available:', !!window.authManager);
                if (window.authManager) {
                    window.authManager.signInWithGoogle();
                } else {
                    console.error('AuthManager not available');
                    this.showError('Authentication system not loaded. Please refresh the page.');
                }
            });
        }

        // Modal show/hide handlers
        if (showLoginModal) {
            showLoginModal.addEventListener('click', () => {
                this.showModal('loginModal');
            });
        }

        if (showSignupModal) {
            showSignupModal.addEventListener('click', () => {
                this.showModal('signupModal');
            });
        }

        // Modal close handlers
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-background') || 
                e.target.classList.contains('delete')) {
                this.closeModals();
            }
        });
    }

    async sendMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (!message || !this.currentUser) return;

        // Basic text sanitization
        const sanitizedMessage = this.sanitizeMessage(message);
        
        if (sanitizedMessage.length === 0) {
            this.showError('Message cannot be empty or contain only special characters');
            return;
        }

        try {
            const messageData = {
                user_id: this.currentUser.user_id,
                username: this.currentUser.username,
                message: sanitizedMessage,
                created_at: new Date().toISOString()
            };

            const { error } = await this.supabase
                .from('chat_messages')
                .insert([messageData]);

            if (error) throw error;

            chatInput.value = '';
            document.getElementById('charCount').textContent = '0';
            
            // Track chat activity
            if (window.authManager) {
                await window.authManager.trackUserActivity('send_message', {
                    message_length: sanitizedMessage.length
                });
            }

        } catch (error) {
            console.error('Error sending message:', error);
            this.showError('Failed to send message');
        }
    }

    sanitizeMessage(message) {
        // Remove HTML tags and excessive whitespace
        return message
            .replace(/<[^>]*>/g, '')
            .replace(/\s+/g, ' ')
            .trim();
    }

    async loadRecentMessages() {
        try {
            const { data: messages, error } = await this.supabase
                .from('chat_messages')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) throw error;

            const chatMessages = document.getElementById('chatMessages');
            if (chatMessages) {
                chatMessages.innerHTML = '';
                messages.reverse().forEach(message => {
                    this.displayMessage(message);
                });
                this.scrollToBottom();
            }

        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    subscribeToMessages() {
        if (this.messageSubscription) {
            this.supabase.removeChannel(this.messageSubscription);
        }

        this.messageSubscription = this.supabase
            .channel('chat_messages_' + Date.now(), {
                config: {
                    broadcast: { self: false }
                }
            })
            .on('postgres_changes', 
                { event: 'INSERT', schema: 'public', table: 'chat_messages' },
                (payload) => {
                    console.log('New message received via subscription:', payload.new);
                    console.log('Message content:', payload.new.message);
                    console.log('Message username:', payload.new.username);
                    this.displayMessage(payload.new);
                    this.scrollToBottom();
                }
            )
            .subscribe((status) => {
                console.log('Message subscription status:', status);
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Message subscription active');
                } else if (status === 'CHANNEL_ERROR') {
                    console.log('❌ Message subscription failed');
                }
            });
    }

    displayMessage(message) {
        const chatMessages = document.getElementById('chatMessages');
        if (!chatMessages) {
            console.error('Chat messages container not found');
            return;
        }

        if (!message || !message.message) {
            console.error('Invalid message data:', message);
            return;
        }

        const isOwnMessage = this.currentUser && message.user_id === this.currentUser.user_id;
        const messageTime = new Date(message.created_at).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        const messageElement = document.createElement('div');
        messageElement.className = `message ${isOwnMessage ? 'own' : 'other'}`;

        const safeMessage = this.escapeHtml(message.message) || '[Empty message]';
        const safeUsername = this.escapeHtml(message.username) || 'Unknown';

        messageElement.innerHTML = `
            <div class="message-header">
                ${isOwnMessage ? 'You' : safeUsername}
            </div>
            <div class="message-content">
                ${safeMessage}
            </div>
            <div class="message-time">
                ${messageTime}
            </div>
        `;

        console.log('Displaying message:', {
            username: message.username,
            content: message.message,
            isOwn: isOwnMessage,
            element: messageElement
        });

        chatMessages.appendChild(messageElement);
    }

    async setOnlineStatus() {
        if (!this.currentUser) return;

        try {
            const statusData = {
                user_id: this.currentUser.user_id,
                username: this.currentUser.username,
                is_online: true,
                last_seen: new Date().toISOString()
            };

            console.log('Setting online status for user:', this.currentUser.username);

            // Use upsert (insert or update) to handle both cases
            const { data, error } = await this.supabase
                .from('user_online_status')
                .upsert(statusData, {
                    onConflict: 'user_id',
                    ignoreDuplicates: false
                })
                .select();

            if (error) {
                console.error('Upsert failed, trying separate insert/update:', error);
                
                // Fallback: try update first, then insert
                const { error: updateError } = await this.supabase
                    .from('user_online_status')
                    .update({
                        is_online: true,
                        last_seen: new Date().toISOString()
                    })
                    .eq('user_id', this.currentUser.user_id);

                if (updateError) {
                    // Try insert
                    const { error: insertError } = await this.supabase
                        .from('user_online_status')
                        .insert([statusData]);
                    
                    if (insertError) throw insertError;
                    console.log('User online status inserted (fallback)');
                } else {
                    console.log('User online status updated (fallback)');
                }
            } else {
                console.log('User online status upserted successfully:', data);
            }

            // Force refresh the user list after setting status
            setTimeout(() => {
                this.loadOnlineUsers();
            }, 1000);

        } catch (error) {
            console.error('Error setting online status:', error);
        }
    }

    async forceOnlineStatus() {
        if (!this.currentUser) return;

        try {
            console.log('FORCE updating online status for user:', this.currentUser.username);
            
            // Delete existing record first, then insert fresh
            await this.supabase
                .from('user_online_status')
                .delete()
                .eq('user_id', this.currentUser.user_id);
            
            // Insert fresh record
            const statusData = {
                user_id: this.currentUser.user_id,
                username: this.currentUser.username,
                is_online: true,
                last_seen: new Date().toISOString()
            };

            const { data, error } = await this.supabase
                .from('user_online_status')
                .insert([statusData])
                .select();

            if (error) {
                console.error('Force insert failed:', error);
                throw error;
            }

            console.log('Force online status inserted successfully:', data);
            
            // Immediate refresh of user list
            setTimeout(() => {
                this.loadOnlineUsers();
            }, 500);

        } catch (error) {
            console.error('Error force-setting online status:', error);
        }
    }

    async setOfflineStatus() {
        if (!this.currentUser) return;

        try {
            const { error } = await this.supabase
                .from('user_online_status')
                .update({ 
                    is_online: false,
                    last_seen: new Date().toISOString()
                })
                .eq('user_id', this.currentUser.user_id);

            if (error) throw error;

        } catch (error) {
            console.error('Error setting offline status:', error);
        }
    }

    async updateOnlineStatus() {
        if (!this.currentUser) return;

        const isOnline = this.isPageVisible;
        
        try {
            const { error } = await this.supabase
                .from('user_online_status')
                .update({ 
                    is_online: isOnline,
                    last_seen: new Date().toISOString()
                })
                .eq('user_id', this.currentUser.user_id);

            if (error) throw error;

        } catch (error) {
            console.error('Error updating online status:', error);
        }
    }

    subscribeToUserStatus() {
        if (this.userSubscription) {
            this.supabase.removeChannel(this.userSubscription);
        }

        const channelName = 'user_status_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        console.log('Creating user status subscription:', channelName);

        this.userSubscription = this.supabase
            .channel(channelName, {
                config: {
                    broadcast: { self: false }
                }
            })
            .on('postgres_changes', 
                { event: '*', schema: 'public', table: 'user_online_status' },
                (payload) => {
                    console.log('User status changed via subscription:', payload);
                    console.log('Event type:', payload.eventType);
                    console.log('Changed record:', payload.new || payload.old);
                    
                    // Immediate update for INSERT/UPDATE events
                    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                        setTimeout(() => {
                            console.log('Refreshing user list due to status change...');
                            this.loadOnlineUsers();
                        }, 500);
                    }
                    
                    // Also update on DELETE events (user going offline)
                    if (payload.eventType === 'DELETE') {
                        setTimeout(() => {
                            console.log('Refreshing user list due to user going offline...');
                            this.loadOnlineUsers();
                        }, 500);
                    }
                }
            )
            .subscribe((status) => {
                console.log('User status subscription status:', status);
                if (status === 'SUBSCRIBED') {
                    console.log('✅ User status subscription active');
                } else if (status === 'CHANNEL_ERROR') {
                    console.log('❌ User status subscription failed');
                }
            });
    }

    async loadOnlineUsers() {
        try {
            console.log('Loading online users...');
            
            // Add a small delay to ensure other users' status updates have propagated
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // First, let's see ALL records in the table for debugging
            const { data: allUsers, error: allError } = await this.supabase
                .from('user_online_status')
                .select('*')
                .order('username');

            console.log('All users in online_status table:', allUsers);
            console.log('Total records in table:', allUsers?.length || 0);
            
            if (allUsers) {
                allUsers.forEach((user, index) => {
                    console.log(`User ${index + 1}:`, {
                        username: user.username,
                        user_id: user.user_id,
                        is_online: user.is_online,
                        last_seen: user.last_seen
                    });
                });
            }
            
            // Get online users with more lenient filtering
            const { data: users, error } = await this.supabase
                .from('user_online_status')
                .select('*')
                .eq('is_online', true)
                .order('username');

            if (error) {
                console.error('Error fetching online users:', error);
                throw error;
            }

            console.log('Raw online users query result:', users);
            console.log('Number of online users found:', users?.length || 0);
            
            // Filter out any null/undefined users and ensure they have valid data
            const validUsers = (users || []).filter(user => {
                const isValid = user && user.username && user.user_id && user.is_online === true;
                if (!isValid && user) {
                    console.log('Filtering out invalid user:', user);
                }
                return isValid;
            });
            
            console.log('Valid online users after filtering:', validUsers);
            console.log('Final count of valid users:', validUsers.length);
            
            this.updateUsersList(validUsers);
            this.updateOnlineCount(validUsers.length);

        } catch (error) {
            console.error('Error loading online users:', error);
            
            // If there's an error but we have a current user, show at least them
            if (this.currentUser) {
                console.log('Fallback: showing current user only due to error');
                this.updateUsersList([]);
                this.updateOnlineCount(1);
            } else {
                this.updateOnlineCount(0);
            }
        }
    }

    updateUsersList(users) {
        const usersList = document.getElementById('usersList');
        console.log('Updating users list. Users:', users, 'Element found:', !!usersList);
        
        if (!usersList) {
            console.error('usersList element not found');
            return;
        }

        usersList.innerHTML = '';
        
        // If no users from database but we have a current user, show them
        if (users.length === 0 && this.currentUser) {
            console.log('No users in DB, showing current user only');
            const userElement = document.createElement('div');
            userElement.className = 'user-item';
            userElement.innerHTML = `
                <div class="user-status"></div>
                <span>${this.escapeHtml(this.currentUser.username)} (you)</span>
            `;
            usersList.appendChild(userElement);
            // Update count to show 1 since we're showing the current user
            this.updateOnlineCount(1);
            return;
        }
        
        console.log('Adding', users.length, 'users to the list');
        users.forEach((user, index) => {
            const userElement = document.createElement('div');
            userElement.className = 'user-item';
            
            const isCurrentUser = this.currentUser && user.user_id === this.currentUser.user_id;
            const displayName = isCurrentUser ? `${user.username} (you)` : user.username;
            
            userElement.innerHTML = `
                <div class="user-status"></div>
                <span>${this.escapeHtml(displayName)}</span>
            `;
            
            console.log('Adding user', index + 1, ':', displayName);
            usersList.appendChild(userElement);
        });
        
        console.log('Users list updated. Total users shown:', users.length);
    }

    updateOnlineCount(count) {
        const onlineCount = document.getElementById('onlineCount');
        console.log('Updating online count to:', count, 'Element found:', !!onlineCount);
        if (onlineCount) {
            onlineCount.textContent = `${count} online`;
            console.log('Online count updated to:', onlineCount.textContent);
        } else {
            console.error('onlineCount element not found');
        }
    }

    scrollToBottom() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('is-active');
        }
    }

    closeModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('is-active');
        });
    }

    showError(message) {
        // Create a temporary error message
        const errorElement = document.createElement('div');
        errorElement.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: #fee;
            border: 1px solid #fcc;
            color: #c33;
            padding: 1rem;
            border-radius: 8px;
            z-index: 2000;
            max-width: 300px;
        `;
        errorElement.textContent = message;
        
        document.body.appendChild(errorElement);
        
        setTimeout(() => {
            if (errorElement.parentElement) {
                errorElement.remove();
            }
        }, 3000);
    }

    testRealtimeConnection() {
        console.log('Testing realtime connection...');
        const testChannel = this.supabase
            .channel('test_' + Math.random())
            .on('presence', { event: 'sync' }, () => {
                console.log('Realtime presence sync working');
            })
            .subscribe((status) => {
                console.log('Test channel status:', status);
                if (status === 'SUBSCRIBED') {
                    console.log('✅ Realtime connection is working');
                } else if (status === 'CHANNEL_ERROR') {
                    console.log('❌ Realtime connection failed');
                }
                // Clean up test channel
                setTimeout(() => {
                    this.supabase.removeChannel(testChannel);
                }, 3000);
            });
    }

    cleanup() {
        // Set offline status
        if (this.currentUser) {
            this.setOfflineStatus();
        }

        // Clean up subscriptions
        if (this.messageSubscription) {
            this.supabase.removeChannel(this.messageSubscription);
            this.messageSubscription = null;
        }

        if (this.userSubscription) {
            this.supabase.removeChannel(this.userSubscription);
            this.userSubscription = null;
        }

        // Clear current user
        this.currentUser = null;
    }
}

// Initialize chat when dependencies are ready
function initializeChat() {
    if (window.supabaseClient && window.authManager) {
        window.chatManager = new ChatManager();
        console.log('ChatManager initialized successfully');
    } else {
        console.log('Waiting for dependencies... Supabase:', !!window.supabaseClient, 'AuthManager:', !!window.authManager);
        setTimeout(initializeChat, 500);
    }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChat);
} else {
    initializeChat();
}

// Debug functions for manual testing
window.debugChat = {
    forceOnlineStatus: () => {
        if (window.chatManager && window.chatManager.currentUser) {
            console.log('Manual force online status triggered');
            window.chatManager.forceOnlineStatus();
        } else {
            console.log('No chat manager or user available');
        }
    },
    
    loadUsers: () => {
        if (window.chatManager) {
            console.log('Manual load users triggered');
            window.chatManager.loadOnlineUsers();
        } else {
            console.log('No chat manager available');
        }
    },
    
    checkCurrentUser: () => {
        console.log('Current user:', window.chatManager?.currentUser);
        console.log('Auth manager user:', window.authManager?.currentUser);
    },
    
    testStatus: async () => {
        if (window.chatManager && window.chatManager.currentUser) {
            console.log('Testing status update...');
            await window.chatManager.forceOnlineStatus();
            setTimeout(() => {
                window.chatManager.loadOnlineUsers();
            }, 1000);
        }
    }
};

console.log('Debug functions available:');
console.log('- window.debugChat.forceOnlineStatus()');
console.log('- window.debugChat.loadUsers()'); 
console.log('- window.debugChat.checkCurrentUser()');
console.log('- window.debugChat.testStatus()');