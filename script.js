// NEXUSMIND - Clean & Modular Architecture
// Optimized for performance and maintainability

// IMMEDIATE SESSION RESTORE - Run before everything
(function() {
    console.log('🚀 IMMEDIATE SESSION CHECK');
    
    // Check localStorage right now with backup
    let storedUser = localStorage.getItem('nexusmind_current_user');
    if (!storedUser) {
        storedUser = localStorage.getItem('nexusmind_user_backup');
        console.log('🔄 Using backup storage');
    }
    
    console.log('📦 Found user data:', !!storedUser);
    
    if (storedUser) {
        try {
            const user = JSON.parse(storedUser);
            console.log('✅ User parsed:', user.username);
            
            // Store globally for immediate use
            window.NEXUSMIND_SESSION = user;
            console.log('💾 Session stored globally');
            
            // Restore to primary storage if using backup
            if (!localStorage.getItem('nexusmind_current_user')) {
                localStorage.setItem('nexusmind_current_user', storedUser);
                console.log('🔄 Restored to primary storage');
            }
        } catch (e) {
            console.error('❌ Parse error:', e);
            localStorage.removeItem('nexusmind_current_user');
            localStorage.removeItem('nexusmind_user_backup');
        }
    }
})();

document.addEventListener('DOMContentLoaded', function() {
    const loadingScreen = document.getElementById('loadingScreen');
    
    if (loadingScreen) {
        // ALWAYS show for 5 seconds - no exceptions
        console.log('🚀 Loading screen - 5 seconds');
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                checkAuthentication();
            }, 300);
        }, 5000);
    }
});

// ==================== GLOBAL MEDIA STORAGE ====================

// Global media storage for posting system
let uploadedMedia = []; // This will store captured photos/videos
let currentPostMedia = []; // Media for the current post being created

// ==================== AUTHENTICATION SYSTEM ====================

const authSystem = {
    currentUser: null,
    
    STORAGE_KEYS: {
        USERS: 'nexusmind_users',
        CURRENT_USER: 'nexusmind_current_user',
        REMEMBER_ME: 'nexusmind_remember_me',
        COVER_PHOTO: 'nexusmind_cover_photo',
        PROFILE_PHOTO: 'nexusmind_profile_photo',
        USER_DATA: 'nexusmind_user_data'
    },
    
    init() {
        this.checkExistingSession();
        this.setupAuthListeners();
    },
    
    checkExistingSession() {
        try {
            console.log('🔍 Checking for existing session...');
            
            // First check if we have immediate session
            if (window.NEXUSMIND_SESSION) {
                console.log('⚡ Using immediate session!');
                this.currentUser = window.NEXUSMIND_SESSION;
                this.showApp();
                return;
            }
            
            // Check localStorage first (permanent storage)
            let storedUser = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
            console.log('📦 localStorage user found:', !!storedUser);
            
            if (storedUser) {
                try {
                    this.currentUser = JSON.parse(storedUser);
                    console.log('✅ Session restored for:', this.currentUser.username);
                    
                    if (this.currentUser && this.currentUser.username) {
                        this.showApp();
                    } else {
                        console.error('❌ Invalid user data, clearing session');
                        localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
                        this.showAuth();
                    }
                } catch (parseError) {
                    console.error('❌ Failed to parse user data:', parseError);
                    localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
                    this.showAuth();
                }
            } else {
                console.log('❌ No session found, showing auth');
                this.showAuth();
            }
        } catch (error) {
            console.error('❌ Session check failed:', error);
            this.showAuth();
        }
    },
    
    showAuth() {
        const authContainer = document.getElementById('authContainer');
        const appContainer = document.getElementById('appContainer');
        
        if (authContainer && appContainer) {
            authContainer.style.display = 'flex';
            appContainer.style.display = 'none';
            this.resetAuthForms();
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('signupForm').style.display = 'none';
            
            setTimeout(() => {
                const loginInput = document.getElementById('loginUsername');
                if (loginInput) loginInput.focus();
            }, 100);
        }
    },
    
    showApp() {
        const authContainer = document.getElementById('authContainer');
        const appContainer = document.getElementById('appContainer');
        
        if (authContainer && appContainer) {
            authContainer.style.display = 'none';
            appContainer.style.display = 'block';
            
            this.updateUserInterface();
            initializeApp();
        }
    },
    
    updateUserInterface() {
        if (!this.currentUser) return;
        
        const userNameElements = document.querySelectorAll('#currentUserName, #profileName');
        userNameElements.forEach(el => {
            if (el) el.textContent = this.currentUser.name;
        });
        
        const userRoleElements = document.querySelectorAll('#currentUserRole, #profileTitle');
        userRoleElements.forEach(el => {
            if (el) el.textContent = this.currentUser.title || 'Problem Solver';
        });
        
        const postInput = document.getElementById('postInput');
        if (postInput) {
            postInput.placeholder = `What problem are you facing today, ${this.currentUser.name.split(' ')[0]}?`;
        }
        
        const profileStats = document.querySelector('.profile-stats');
        if (profileStats) {
            document.getElementById('solvedCount').textContent = this.currentUser.stats?.solved || 24;
            document.getElementById('successRate').textContent = this.currentUser.stats?.success || '72%';
            document.getElementById('helpedCount').textContent = this.currentUser.stats?.helped || 18;
        }
        
        const connectionCount = document.querySelector('.link-meta');
        if (connectionCount) {
            connectionCount.textContent = `${this.currentUser.connections || 87} connections`;
        }
        
        this.updateProfileImage();
    },
    
    updateProfileImage() {
        const savedProfile = localStorage.getItem(this.STORAGE_KEYS.PROFILE_PHOTO);
        if (savedProfile) {
            document.querySelectorAll('.avatar, .user-avatar-small img, #profileImage, #headerProfileImage, #editProfileImage').forEach(img => {
                img.src = savedProfile;
            });
        }
    },
    
    setupAuthListeners() {
        const switchToSignup = document.getElementById('switchToSignup');
        const switchToLogin = document.getElementById('switchToLogin');
        
        if (switchToSignup) {
            switchToSignup.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('loginForm').style.display = 'none';
                document.getElementById('signupForm').style.display = 'block';
                setTimeout(() => {
                    const nameInput = document.getElementById('signupName');
                    if (nameInput) nameInput.focus();
                }, 100);
            });
        }
        
        if (switchToLogin) {
            switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                document.getElementById('signupForm').style.display = 'none';
                document.getElementById('loginForm').style.display = 'block';
                setTimeout(() => {
                    const loginInput = document.getElementById('loginUsername');
                    if (loginInput) loginInput.focus();
                }, 100);
            });
        }
        
        const loginForm = document.getElementById('loginFormElements');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        const signupForm = document.getElementById('signupFormElements');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup();
            });
        }
        
        document.querySelectorAll('.form-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (document.getElementById('loginForm').style.display !== 'none') {
                        this.handleLogin();
                    } else {
                        this.handleSignup();
                    }
                }
            });
        });
    },
    
    async handleLogin() {
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        const rememberMe = document.getElementById('rememberMe').checked;
        
        this.hideAllErrors();
        
        let isValid = true;
        
        if (!username) {
            this.showError('loginUsernameError', 'Please enter your username or email');
            isValid = false;
        }
        
        if (!password) {
            this.showError('loginPasswordError', 'Please enter your password');
            isValid = false;
        }
        
        if (!isValid) return;
        
        const loginBtn = document.getElementById('loginBtn');
        const originalText = loginBtn.innerHTML;
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Signing In...</span>';
        loginBtn.disabled = true;
        
        const storedUsers = this.getStoredUsers();
        const user = storedUsers.find(u => 
            u.username.toLowerCase() === username.toLowerCase() || 
            u.email.toLowerCase() === username.toLowerCase()
        );
        
        if (!user) {
            this.showError('loginUsernameError', 'User not found');
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
            return;
        }
        
        if (user.password !== password) {
            this.showError('loginPasswordError', 'Incorrect password');
            loginBtn.innerHTML = originalText;
            loginBtn.disabled = false;
            return;
        }
        
        this.currentUser = {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            title: user.title || 'Problem Solver',
            stats: user.stats || { solved: 24, success: "72%", helped: 18 },
            connections: user.connections || 87,
            bio: user.bio || '',
            location: user.location || '',
            social: user.social || {},
            tags: user.tags || ['JavaScript', 'Problem Solving', 'UI/UX'],
            privacy: user.privacy || { profile: 'public', activity: 'public', emailNotifications: true }
        };
        
        this.saveUserSession(true); // Always save permanently
        this.updateUserInterface();
        this.showApp();
        
        loginBtn.innerHTML = originalText;
        loginBtn.disabled = false;
    },
    
    async handleSignup() {
        const name = document.getElementById('signupName').value.trim();
        const username = document.getElementById('signupUsername').value.trim();
        const email = document.getElementById('signupEmail').value.trim();
        const password = document.getElementById('signupPassword').value.trim();
        const confirmPassword = document.getElementById('signupConfirmPassword').value.trim();
        
        this.hideAllErrors();
        
        let isValid = true;
        
        if (!name) {
            this.showError('signupNameError', 'Please enter your name');
            isValid = false;
        }
        
        if (!username || username.length < 3) {
            this.showError('signupUsernameError', 'Username must be at least 3 characters');
            isValid = false;
        }
        
        if (!email || !this.isValidEmail(email)) {
            this.showError('signupEmailError', 'Please enter a valid email');
            isValid = false;
        }
        
        if (!password || password.length < 6) {
            this.showError('signupPasswordError', 'Password must be at least 6 characters');
            isValid = false;
        }
        
        if (password !== confirmPassword) {
            this.showError('signupConfirmError', 'Passwords do not match');
            isValid = false;
        }
        
        if (!isValid) return;
        
        const storedUsers = this.getStoredUsers();
        
        if (storedUsers.find(u => u.username.toLowerCase() === username.toLowerCase())) {
            this.showError('signupUsernameError', 'Username already taken');
            return;
        }
        
        if (storedUsers.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            this.showError('signupEmailError', 'Email already registered');
            return;
        }
        
        const signupBtn = document.getElementById('signupBtn');
        const originalText = signupBtn.innerHTML;
        signupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i><span>Creating Account...</span>';
        signupBtn.disabled = true;
        
        const newUser = {
            id: Date.now(),
            name: name,
            username: username,
            email: email,
            password: password,
            title: 'Problem Solver',
            stats: { solved: 0, success: "0%", helped: 0 },
            connections: 0,
            bio: '',
            location: '',
            social: {},
            tags: [],
            privacy: { profile: 'public', activity: 'public', emailNotifications: true },
            joinedDate: new Date().toISOString()
        };
        
        storedUsers.push(newUser);
        localStorage.setItem(this.STORAGE_KEYS.USERS, JSON.stringify(storedUsers));
        
        this.currentUser = {
            id: newUser.id,
            name: newUser.name,
            username: newUser.username,
            email: newUser.email,
            title: newUser.title,
            stats: newUser.stats,
            connections: newUser.connections,
            bio: newUser.bio,
            location: newUser.location,
            social: newUser.social,
            tags: newUser.tags,
            privacy: newUser.privacy
        };
        
        this.saveUserSession(true); // Always save permanently
        appData.currentUser = this.currentUser;
        
        // Reset button state first
        signupBtn.innerHTML = originalText;
        signupBtn.disabled = false;
        
        console.log('🔥 About to call showApp() from signup');
        showToast(`Welcome to NexusMind, ${name}!`, 'success');
        this.showApp();
        console.log('🔥 showApp() call completed from signup');
    },
    
    saveUserSession(rememberMe) {
        try {
            console.log('💾 Saving session for:', this.currentUser?.username);
            
            // Create the user data string
            const userData = JSON.stringify(this.currentUser);
            console.log('📝 User data length:', userData.length);
            
            // Save to localStorage multiple times for bulletproof storage
            localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, userData);
            localStorage.setItem('nexusmind_user_backup', userData); // Backup key
            localStorage.setItem(this.STORAGE_KEYS.REMEMBER_ME, 'true');
            
            // Also save to global variable
            window.NEXUSMIND_SESSION = this.currentUser;
            
            // Verify it was saved
            const saved = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
            const backup = localStorage.getItem('nexusmind_user_backup');
            
            console.log('✅ Session saved successfully!');
            console.log('📊 Primary saved:', !!saved);
            console.log('📊 Backup saved:', !!backup);
            console.log('📊 Global set:', !!window.NEXUSMIND_SESSION);
            
        } catch (error) {
            console.error('❌ Error saving session:', error);
        }
    },
    
    getStoredUsers() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEYS.USERS);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Error getting stored users:', error);
        }
        
        return [
            {
                id: 1,
                name: "Alex Johnson",
                username: "alexj",
                email: "alex@example.com",
                password: "password123",
                title: "Software Engineer & Problem Solver",
                stats: { solved: 24, success: "72%", helped: 18 },
                connections: 87,
                bio: "Passionate about solving complex problems with elegant code. Love connecting with other problem solvers!",
                location: "San Francisco, CA",
                social: {
                    twitter: "https://twitter.com/alexj",
                    linkedin: "https://linkedin.com/in/alexjohnson",
                    github: "https://github.com/alexj",
                    website: "https://alexjohnson.dev"
                },
                tags: ["JavaScript", "React", "Node.js", "Problem Solving", "UI/UX"],
                privacy: { profile: 'public', activity: 'public', emailNotifications: true },
                joinedDate: "2024-01-15T10:30:00Z"
            },
            {
                id: 2,
                name: "Sarah Johnson",
                username: "sarahj",
                email: "sarah@example.com",
                password: "password123",
                title: "Business Consultant",
                stats: { solved: 42, success: "85%", helped: 31 },
                connections: 124,
                bio: "Helping businesses grow through strategic problem solving and innovative solutions.",
                location: "New York, NY",
                social: {
                    twitter: "https://twitter.com/sarahj",
                    linkedin: "https://linkedin.com/in/sarahjohnson",
                    website: "https://sarahjohnsonconsulting.com"
                },
                tags: ["Business Strategy", "Marketing", "E-commerce", "Consulting"],
                privacy: { profile: 'public', activity: 'connections', emailNotifications: true },
                joinedDate: "2024-02-20T14:45:00Z"
            }
        ];
    },
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.style.display = 'block';
        }
    },
    
    hideAllErrors() {
        document.querySelectorAll('.auth-error').forEach(error => {
            error.style.display = 'none';
        });
    },
    
    resetAuthForms() {
        document.querySelectorAll('.form-input').forEach(input => {
            input.value = '';
        });
        this.hideAllErrors();
        const rememberMe = document.getElementById('rememberMe');
        if (rememberMe) rememberMe.checked = true; // Always checked by default
    }
};

// ==================== UTILITY FUNCTIONS ====================

const utils = {
    showToast(message, type = 'info') {
        const existingToast = document.querySelector('.toast');
        if (existingToast) existingToast.remove();
        
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('show'), 100);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        
        if (hours < 1) return 'Just now';
        if (hours < 24) return `${hours}h ago`;
        if (hours < 48) return 'Yesterday';
        return date.toLocaleDateString();
    }
};

// Global showToast for backward compatibility
function showToast(message, type) {
    utils.showToast(message, type);
}

// ==================== DATA MANAGEMENT ====================

const dataManager = {
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Save failed:', error);
        }
    },
    
    load(key, defaultValue = null) {
        try {
            const stored = localStorage.getItem(key);
            return stored ? JSON.parse(stored) : defaultValue;
        } catch (error) {
            console.error('Load failed:', error);
            return defaultValue;
        }
    },
    
    saveAll() {
        this.save('nexusmind_posts', appData.posts);
        this.save('nexusmind_solutions', appData.solutions);
        this.save('nexusmind_network', appData.networkData);
    }
};

const appData = {
    currentUser: null,
    
    posts: [
        {
            id: 1,
            author: {
                name: "Sarah Johnson",
                role: "Business Consultant",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b786d4d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                badge: "PRO"
            },
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            content: "My online boutique gets 500+ visitors daily but only 2-3 sales. Looking for actionable solutions!",
            title: "🚀 Need Help: E-commerce Conversion Too Low!",
            likes: 18,
            comments: 7,
            solutions: 2,
            liked: false,
            offered: false,
            tags: ["business", "ecommerce"],
            media: [
                {
                    type: "image",
                    url: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    name: "ecommerce-dashboard.jpg"
                },
                {
                    type: "image", 
                    url: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
                    name: "product-page.jpg"
                }
            ]
        }
    ],
    
    stats: {
        totalProblems: 847,
        problemsBadge: 3,
        messagesBadge: 2,
        notificationsBadge: 5
    },
    
    solutions: [],
    
    // Comments data storage
    comments: {
        '1': [ // Post ID 1 (example post)
            {
                id: 'c1',
                author: {
                    name: 'Sarah Johnson',
                    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b786d4d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
                },
                text: 'Try optimizing your product images and adding customer reviews!',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                likes: 0,
                likedByUser: false,
                replies: []
            }
        ]
    },
    
    networkData: {
        connections: [
            {
                id: 1,
                name: "Emma Wilson",
                title: "Product Manager",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b786d4d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                status: "online",
                lastActive: "2 min ago",
                mutualConnections: 12
            },
            {
                id: 2,
                name: "Michael Chen",
                title: "Data Scientist",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                status: "away",
                lastActive: "30 min ago",
                mutualConnections: 8
            },
            {
                id: 3,
                name: "David Kim",
                title: "Full Stack Developer",
                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                status: "online",
                lastActive: "5 min ago",
                mutualConnections: 15
            },
            {
                id: 4,
                name: "Lisa Wang",
                title: "UX Designer",
                avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                status: "offline",
                lastActive: "2 hours ago",
                mutualConnections: 6
            }
        ],
        
        requests: [
            {
                id: 101,
                name: "James Wilson",
                title: "Startup Founder",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                message: "Would love to connect and discuss tech trends!",
                mutualConnections: 5
            },
            {
                id: 102,
                name: "Sophia Martinez",
                title: "Marketing Director",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b786d4d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                message: "Interested in your problem-solving approach",
                mutualConnections: 3
            }
        ],
        
        suggestions: [
            {
                id: 201,
                name: "Robert Brown",
                title: "AI Researcher",
                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                mutualConnections: 3,
                commonTags: ["AI", "Machine Learning"]
            },
            {
                id: 202,
                name: "Maria Garcia",
                title: "Business Analyst",
                avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                mutualConnections: 7,
                commonTags: ["Business", "Data Analysis"]
            }
        ],
        
        groups: [
            {
                id: 301,
                name: "Tech Innovators",
                description: "For technology enthusiasts and innovators",
                members: 245,
                icon: "fas fa-code"
            },
            {
                id: 302,
                name: "Startup Founders",
                description: "Entrepreneurship community",
                members: 189,
                icon: "fas fa-rocket"
            }
        ],
        
        messages: [
            {
                id: 401,
                userId: 1,
                name: "Emma Wilson",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b786d4d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                lastMessage: "Thanks for the help on my project!",
                time: "2:30 PM",
                unread: true
            },
            {
                id: 402,
                userId: 2,
                name: "Michael Chen",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                lastMessage: "Can you review my approach?",
                time: "1:15 PM",
                unread: false
            }
        ]
    },
    
    topSolversData: {
        weekly: [
            {
                id: 1,
                name: "Sarah Johnson",
                title: "Business Consultant",
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b786d4d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                score: 245,
                solutions: 12,
                category: "business",
                badges: ["gold", "expert"]
            },
            {
                id: 2,
                name: "Michael Chen",
                title: "Data Scientist",
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                score: 189,
                solutions: 8,
                category: "tech",
                badges: ["silver"]
            },
            {
                id: 3,
                name: "Emma Wilson",
                title: "Product Manager",
                avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                score: 176,
                solutions: 7,
                category: "tech",
                badges: ["bronze"]
            },
            {
                id: 4,
                name: "David Kim",
                title: "Full Stack Developer",
                avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                score: 162,
                solutions: 6,
                category: "tech",
                badges: ["expert"]
            }
        ],
        
        achievements: [
            {
                id: 1,
                name: "Problem Solver",
                description: "Solved 10+ problems",
                icon: "fas fa-lightbulb",
                rarity: "common"
            },
            {
                id: 2,
                name: "Helping Hand",
                description: "Helped 5+ users",
                icon: "fas fa-hands-helping",
                rarity: "common"
            },
            {
                id: 3,
                name: "Expert Contributor",
                description: "Top 10 solver this week",
                icon: "fas fa-crown",
                rarity: "rare"
            },
            {
                id: 4,
                name: "Community Legend",
                description: "100+ solutions provided",
                icon: "fas fa-star",
                rarity: "legendary"
            }
        ]
    }
};

// ==================== MAIN INITIALIZATION ====================

function checkAuthentication() {
    console.log('🔐 AUTHENTICATION CHECK');
    
    // Check if we already have a session from immediate restore
    if (window.NEXUSMIND_SESSION) {
        console.log('⚡ Using immediate session:', window.NEXUSMIND_SESSION.username);
        authSystem.currentUser = window.NEXUSMIND_SESSION;
        authSystem.showApp();
        return;
    }
    
    // Fallback to normal auth system
    authSystem.init();
}

function initializeApp() {
    console.log('🧠 Initializing NexusMind...');
    
    appData.currentUser = authSystem.currentUser;
    
    loadSavedData();
    setupTooltips();
    setupNavigation();
    setupPosting();
    setupInteractions();
    setupProfileMenu();
    setupPhotoUploads();
    setupEditProfile();
    setupViewProfileModal();
    setupSettingsModal();
    setupHelpModal();
    setupNetworkFeatures();
    setupTopSolvers();
    setupLiveUpdates();
    initializeProblemsHighlights();
    initializeEnhancedComposer();
    initializeVideoDurations();
    realStats.init();
    loadSavedPhotos();
    updateUIFromData();
    setupFacebookStylePosts();
    setupCommentsSystem();
    
    showToast('NexusMind is ready!', 'success');
}

function loadSavedData() {
    appData.posts = dataManager.load('nexusmind_posts', appData.posts);
    appData.solutions = dataManager.load('nexusmind_solutions', []);
    appData.networkData = dataManager.load('nexusmind_network', appData.networkData);
}

function saveData() {
    dataManager.saveAll();
}

function updateUIFromData() {
    updateStatsWidget();
    updateConnectionCount();
}

function updateStatsWidget() {
    const totalProblemsElement = document.querySelector('.stat-info h4');
    if (totalProblemsElement) {
        totalProblemsElement.textContent = appData.stats.totalProblems.toLocaleString();
    }
}

function updateConnectionCount() {
    const connectionTab = document.querySelector('.network-tab[data-tab="connections"]');
    if (connectionTab) {
        const count = appData.networkData.connections.length;
        connectionTab.textContent = `Connections (${count})`;
    }
    
    const requestTab = document.querySelector('.network-tab[data-tab="requests"]');
    if (requestTab) {
        const count = appData.networkData.requests.length;
        requestTab.textContent = `Requests (${count})`;
        if (count > 0) {
            requestTab.classList.add('has-notification');
        } else {
            requestTab.classList.remove('has-notification');
        }
    }
    
    const linkMeta = document.querySelector('.link-meta');
    if (linkMeta) {
        linkMeta.textContent = `${appData.networkData.connections.length} connections`;
    }
}

// ==================== PHOTO UPLOAD FUNCTIONALITY ====================

function setupPhotoUploads() {
    const setupUpload = (btnId, inputId, imgId, storageKey, successMsg) => {
        const btn = document.getElementById(btnId);
        const input = document.getElementById(inputId);
        const img = document.getElementById(imgId);
        
        if (!btn || !input || !img) return;
        
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            input.click();
        });
        
        input.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (!file?.type.match('image.*')) {
                showToast('Please select an image file', 'error');
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) {
                showToast('Image must be less than 5MB', 'error');
                return;
            }
            
            const reader = new FileReader();
            reader.onload = function(event) {
                img.src = event.target.result;
                
                if (storageKey === authSystem.STORAGE_KEYS.PROFILE_PHOTO) {
                    document.querySelectorAll('.avatar, .user-avatar-small img, #headerProfileImage, #editProfileImage').forEach(el => {
                        el.src = event.target.result;
                    });
                }
                
                try {
                    localStorage.setItem(storageKey, event.target.result);
                    showToast(successMsg, 'success');
                } catch (error) {
                    showToast(`${successMsg} (not saved locally)`, 'info');
                }
            };
            reader.readAsDataURL(file);
        });
    };
    
    setupUpload('coverUploadBtn', 'coverUpload', 'coverImage', authSystem.STORAGE_KEYS.COVER_PHOTO, 'Cover photo updated successfully!');
    setupUpload('avatarUploadBtn', 'avatarUpload', 'profileImage', authSystem.STORAGE_KEYS.PROFILE_PHOTO, 'Profile photo updated successfully!');
}

function loadSavedPhotos() {
    try {
        const savedCover = localStorage.getItem(authSystem.STORAGE_KEYS.COVER_PHOTO);
        const savedProfile = localStorage.getItem(authSystem.STORAGE_KEYS.PROFILE_PHOTO);
        
        if (savedCover) {
            const coverImage = document.getElementById('coverImage');
            if (coverImage) coverImage.src = savedCover;
        }
        
        if (savedProfile) {
            document.querySelectorAll('.avatar, .user-avatar-small img, #profileImage, #headerProfileImage, #editProfileImage').forEach(img => {
                img.src = savedProfile;
            });
        }
    } catch (error) {
        console.log('No saved photos found');
    }
}

// ==================== PROFILE MENU FUNCTIONALITY ====================

function setupProfileMenu() {
    const userProfileMenu = document.getElementById('userProfileMenu');
    const profileMenu = document.getElementById('profileMenu');
    const profileLogoutBtn = document.getElementById('profileLogoutBtn');
    
    if (userProfileMenu && profileMenu) {
        userProfileMenu.addEventListener('click', (e) => {
            e.stopPropagation();
            profileMenu.classList.toggle('show');
        });
        
        document.addEventListener('click', () => {
            profileMenu.classList.remove('show');
        });
        
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const action = item.getAttribute('data-action');
                profileMenu.classList.remove('show');
                
                switch(action) {
                    case 'profile':
                        openViewProfileModal();
                        break;
                    case 'edit-profile':
                        openEditProfileModal();
                        break;
                    case 'settings':
                        openSettingsModal();
                        break;
                    case 'help':
                        openHelpModal();
                        break;
                    case 'logout':
                        handleLogout();
                        break;
                }
            });
        });
    }
    
    if (profileLogoutBtn) {
        profileLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            handleLogout();
        });
    }
    
    // Edit profile button in sidebar
    const editProfileSidebarBtn = document.getElementById('editProfileSidebarBtn');
    if (editProfileSidebarBtn) {
        editProfileSidebarBtn.addEventListener('click', (e) => {
            e.preventDefault();
            openEditProfileModal();
        });
    }
    
    // Share profile button
    const shareProfileBtn = document.getElementById('shareProfileBtn');
    if (shareProfileBtn) {
        shareProfileBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showToast('Profile shared to your network!', 'success');
        });
    }
}

function handleLogout() {
    localStorage.removeItem(authSystem.STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(authSystem.STORAGE_KEYS.REMEMBER_ME);
    sessionStorage.removeItem(authSystem.STORAGE_KEYS.CURRENT_USER);
    authSystem.currentUser = null;
    appData.currentUser = null;
    authSystem.showAuth();
    showToast('You have been logged out successfully', 'info');
}

// ==================== VIEW PROFILE FUNCTIONALITY ====================

// Global function for opening View Profile modal
function openViewProfileModal() {
    console.log('Opening View Profile modal...');
    
    const viewProfileModal = document.getElementById('viewProfileModal');
    if (!viewProfileModal) {
        console.error('View Profile modal not found!');
        showToast('Profile modal not found', 'error');
        return;
    }
    
    // Get current user data
    const currentUser = authSystem.currentUser || appData.currentUser;
    console.log('Current user:', currentUser);
    
    if (!currentUser) {
        console.error('No current user found!');
        showToast('User not logged in', 'error');
        return;
    }
    
    // Populate profile data
    populateViewProfileData(currentUser);
    
    // Load user's posts
    loadUserPosts(currentUser);
    
    // Show modal
    viewProfileModal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    console.log('View Profile modal opened successfully');
}

function populateViewProfileData(user) {
    console.log('Populating profile data for user:', user);
    
    try {
        // Set profile image
        const profileImage = document.getElementById('viewProfileImage');
        if (profileImage) {
            const savedProfile = localStorage.getItem(authSystem.STORAGE_KEYS.PROFILE_PHOTO);
            profileImage.src = savedProfile || user.avatar || "https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80";
        } else {
            console.error('Profile image element not found!');
        }
        
        // Set cover image
        const coverImage = document.getElementById('viewCoverImage');
        if (coverImage) {
            const savedCover = localStorage.getItem(authSystem.STORAGE_KEYS.COVER_PHOTO);
            coverImage.src = savedCover || "https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80";
        } else {
            console.error('Cover image element not found!');
        }
        
        // Set basic info
        const nameElement = document.getElementById('viewProfileName');
        if (nameElement) nameElement.textContent = user.name || 'Unknown User';
        
        const titleElement = document.getElementById('viewProfileTitle');
        if (titleElement) titleElement.textContent = user.title || 'Problem Solver';
        
        const bioElement = document.getElementById('viewProfileBio');
        if (bioElement) bioElement.textContent = user.bio || 'No bio available';
        
        // Set stats
        const solvedElement = document.getElementById('viewSolvedCount');
        if (solvedElement) solvedElement.textContent = user.stats?.solved || 24;
        
        const helpedElement = document.getElementById('viewHelpedCount');
        if (helpedElement) helpedElement.textContent = user.stats?.helped || 18;
        
        const connectionsElement = document.getElementById('viewConnectionsCount');
        if (connectionsElement) connectionsElement.textContent = user.connections || 87;
        
        // Set about info
        const locationElement = document.getElementById('viewLocation');
        if (locationElement) locationElement.textContent = user.location || 'Location not specified';
        
        const emailElement = document.getElementById('viewEmail');
        if (emailElement) emailElement.textContent = user.email || 'Email not available';
        
        // Set joined date
        const joinedElement = document.getElementById('viewJoinedDate');
        if (joinedElement) {
            const joinedDate = user.joinedDate ? new Date(user.joinedDate).toLocaleDateString() : 'Recently';
            joinedElement.textContent = `Joined ${joinedDate}`;
        }
        
        console.log('Profile data populated successfully');
    } catch (error) {
        console.error('Error populating profile data:', error);
        showToast('Error loading profile data', 'error');
    }
}

function loadUserPosts(user) {
    console.log('Loading posts for user:', user.name);
    
    const userPostsList = document.getElementById('userPostsList');
    if (!userPostsList) {
        console.error('User posts list element not found!');
        return;
    }
    
    try {
        // Get posts by current user
        const userPosts = appData.posts.filter(post => 
            post.author.name === user.name
        );
        
        console.log('Found user posts:', userPosts.length);
        
        if (userPosts.length === 0) {
            userPostsList.innerHTML = `
                <div class="no-posts">
                    <i class="fas fa-inbox" style="font-size: 48px; color: var(--gray-400); margin-bottom: 16px;"></i>
                    <p style="color: var(--gray-600);">No posts yet</p>
                </div>
            `;
            return;
        }
        
        // Render user posts
        userPostsList.innerHTML = userPosts.map(post => `
            <div class="user-post-item">
                <div class="user-post-title">${post.title}</div>
                <div class="user-post-content">${post.content}</div>
                <div class="user-post-meta">
                    <span><i class="fas fa-lightbulb"></i> ${post.solutions} solutions</span>
                    <span><i class="fas fa-thumbs-up"></i> ${post.likes} likes</span>
                    <span><i class="fas fa-comment"></i> ${post.comments} comments</span>
                    <span><i class="fas fa-clock"></i> ${new Date(post.timestamp).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');
        
        console.log('User posts loaded successfully');
    } catch (error) {
        console.error('Error loading user posts:', error);
        userPostsList.innerHTML = `
            <div class="no-posts">
                <i class="fas fa-exclamation-triangle" style="font-size: 48px; color: var(--red-500); margin-bottom: 16px;"></i>
                <p style="color: var(--gray-600);">Error loading posts</p>
            </div>
        `;
    }
}

function setupViewProfileModal() {
    console.log('Setting up View Profile modal...');
    
    const viewProfileModal = document.getElementById('viewProfileModal');
    const closeBtn = document.getElementById('closeViewProfileBtn');
    const profileTabs = document.querySelectorAll('.profile-tab');
    
    console.log('View Profile modal element:', viewProfileModal);
    console.log('Close button element:', closeBtn);
    console.log('Profile tabs found:', profileTabs.length);
    
    // Close modal
    if (closeBtn) {
        closeBtn.addEventListener('click', closeViewProfileModal);
        console.log('Close button event listener added');
    } else {
        console.error('Close button not found!');
    }
    
    // Remove backdrop click auto-close to prevent automatic closing
    // Users must now use the X button to close modal
    // viewProfileModal.addEventListener('click', (e) => {
    //     if (e.target === viewProfileModal) {
    //         closeViewProfileModal();
    //     }
    // });
    
    if (viewProfileModal) {
        console.log('View Profile modal found during setup');
    } else {
        console.error('View Profile modal not found during setup!');
    }
    
    // Tab switching
    profileTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            console.log('Switching to tab:', tabName);
            
            // Update active tab
            profileTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Update active content
            document.querySelectorAll('.profile-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            const targetContent = document.getElementById(`${tabName}-tab`);
            if (targetContent) {
                targetContent.classList.add('active');
            } else {
                console.error('Tab content not found:', tabName);
            }
        });
    });
    
    console.log('Profile tab event listeners added');
    
    // Remove Escape key auto-close to prevent automatic closing
    // Users must now use the X button to close modal
    
    console.log('View Profile modal setup completed');
}

function closeViewProfileModal() {
    const viewProfileModal = document.getElementById('viewProfileModal');
    if (viewProfileModal) {
        viewProfileModal.classList.remove('active');
        document.body.style.overflow = ''; // Restore scrolling
    }
}

// ==================== EDIT PROFILE FUNCTIONALITY ====================

// Global function for opening Edit Profile modal - shared entry point
function openEditProfileModal() {
    // Close profile menu if open
    const profileMenu = document.getElementById('profileMenu');
    if (profileMenu) profileMenu.classList.remove('show');
    
    // Get modal element
    const editProfileModal = document.getElementById('editProfileModal');
    if (!editProfileModal) return;
    
    // Load current user data
    const currentUser = authSystem.currentUser || appData.currentUser;
    
    document.getElementById('editName').value = currentUser.name;
    document.getElementById('editTitle').value = currentUser.title || '';
    document.getElementById('editBio').value = currentUser.bio || '';
    document.getElementById('editLocation').value = currentUser.location || '';
    document.getElementById('editTwitter').value = currentUser.social?.twitter || '';
    document.getElementById('editLinkedin').value = currentUser.social?.linkedin || '';
    document.getElementById('editGithub').value = currentUser.social?.github || '';
    document.getElementById('editWebsite').value = currentUser.social?.website || '';
    
    // Set bio character counter
    const editBio = document.getElementById('editBio');
    const bioCounter = document.getElementById('bioCounter');
    if (editBio && bioCounter) {
        bioCounter.textContent = `${currentUser.bio?.length || 0}/250`;
    }
    
    // Load privacy settings
    document.getElementById('profileVisibility').value = currentUser.privacy?.profile || 'public';
    document.getElementById('activityVisibility').value = currentUser.privacy?.activity || 'public';
    document.getElementById('emailNotifications').checked = currentUser.privacy?.emailNotifications !== false;
    
    // Load tags
    const tags = currentUser.tags || ['JavaScript', 'Problem Solving', 'UI/UX'];
    const tagsContainer = document.getElementById('tagsContainer');
    if (tagsContainer) {
        tagsContainer.innerHTML = '';
        tags.forEach(tag => addTagToContainer(tag));
    }
    
    // Show modal
    editProfileModal.classList.add('active');
}

function setupEditProfile() {
    const editProfileModal = document.getElementById('editProfileModal');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const cancelEditBtn = document.getElementById('cancelEditBtn');
    const changePhotoBtn = document.getElementById('changePhotoBtn');
    const profileImageInput = document.getElementById('profileImageInput');
    const editProfileImage = document.getElementById('editProfileImage');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const newPasswordInput = document.getElementById('newPassword');
    const passwordStrength = document.getElementById('passwordStrength');
    const editTagsInput = document.getElementById('editTags');
    const tagsContainer = document.getElementById('tagsContainer');
    const editBio = document.getElementById('editBio');
    const bioCounter = document.getElementById('bioCounter');
    const closeModalBtn = editProfileModal?.querySelector('.close-modal');
    
    // Tab functionality
    document.querySelectorAll('.edit-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            
            // Update active tab
            document.querySelectorAll('.edit-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding content
            document.querySelectorAll('.edit-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Edit profile button event listener is handled in setupProfileMenu()
    // to avoid duplication and ensure single shared function
    
    // Close modal function
    function closeEditProfileModal() {
        editProfileModal.classList.remove('active');
    }
    
    // Profile image upload
    if (changePhotoBtn && profileImageInput) {
        changePhotoBtn.addEventListener('click', () => {
            profileImageInput.click();
        });
        
        profileImageInput.addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file && file.type.match('image.*')) {
                if (file.size > 5 * 1024 * 1024) {
                    showToast('Image must be less than 5MB', 'error');
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(event) {
                    editProfileImage.src = event.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Bio character counter
    if (editBio && bioCounter) {
        editBio.addEventListener('input', function() {
            const length = this.value.length;
            bioCounter.textContent = `${length}/250`;
            if (length > 250) {
                bioCounter.style.color = '#E53935';
            } else {
                bioCounter.style.color = '#757575';
            }
        });
    }
    
    // Password strength meter
    if (newPasswordInput && passwordStrength) {
        newPasswordInput.addEventListener('input', function() {
            const password = this.value;
            let strength = 'weak';
            
            if (password.length >= 8 && /[A-Z]/.test(password) && /[0-9]/.test(password)) {
                strength = 'strong';
            } else if (password.length >= 6) {
                strength = 'medium';
            }
            
            passwordStrength.className = 'password-strength ' + strength;
        });
    }
    
    // Tags functionality
    if (editTagsInput) {
        editTagsInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.value.trim()) {
                e.preventDefault();
                addTagToContainer(this.value.trim());
                this.value = '';
            }
        });
    }
    
    function addTagToContainer(tagText) {
        if (!tagText) return;
        
        const tag = document.createElement('div');
        tag.className = 'profile-tag';
        tag.innerHTML = `
            ${tagText}
            <span class="remove-tag">&times;</span>
        `;
        
        tag.querySelector('.remove-tag').addEventListener('click', () => {
            tag.remove();
        });
        
        tagsContainer.appendChild(tag);
    }
    
    // Get all tags
    function getAllTags() {
        return Array.from(tagsContainer.querySelectorAll('.profile-tag')).map(tag => 
            tag.textContent.replace('×', '').trim()
        );
    }
    
    // Save profile
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', saveProfileChanges);
    }
    
    // Change password
    if (changePasswordBtn) {
        changePasswordBtn.addEventListener('click', changePassword);
    }
    
    // Cancel button
    if (cancelEditBtn) {
        cancelEditBtn.addEventListener('click', closeEditProfileModal);
    }
    
    // Close modal on X button
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeEditProfileModal);
    }
    
    // Remove backdrop click auto-close to prevent automatic closing
    // Users must now use the X button to close modal
    // editProfileModal.addEventListener('click', function(e) {
    //     if (e.target === this) {
    //         closeEditProfileModal();
    //     }
    // });
}

function saveProfileChanges() {
    const currentUser = authSystem.currentUser || appData.currentUser;
    
    // Update user data
    currentUser.name = document.getElementById('editName').value.trim();
    currentUser.title = document.getElementById('editTitle').value.trim();
    currentUser.bio = document.getElementById('editBio').value.trim();
    currentUser.location = document.getElementById('editLocation').value.trim();
    currentUser.tags = getAllTags();
    
    // Update social links
    if (!currentUser.social) currentUser.social = {};
    currentUser.social.twitter = document.getElementById('editTwitter').value.trim();
    currentUser.social.linkedin = document.getElementById('editLinkedin').value.trim();
    currentUser.social.github = document.getElementById('editGithub').value.trim();
    currentUser.social.website = document.getElementById('editWebsite').value.trim();
    
    // Update privacy settings
    if (!currentUser.privacy) currentUser.privacy = {};
    currentUser.privacy.profile = document.getElementById('profileVisibility').value;
    currentUser.privacy.activity = document.getElementById('activityVisibility').value;
    currentUser.privacy.emailNotifications = document.getElementById('emailNotifications').checked;
    
    // Update profile image if changed
    const newProfileImage = document.getElementById('editProfileImage').src;
    if (newProfileImage.startsWith('data:image')) {
        localStorage.setItem(authSystem.STORAGE_KEYS.PROFILE_PHOTO, newProfileImage);
        document.querySelectorAll('.avatar, #profileImage, #headerProfileImage').forEach(img => {
            img.src = newProfileImage;
        });
    }
    
    // Save to localStorage
    if (authSystem.currentUser) {
        localStorage.setItem(authSystem.STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
    }
    
    // Update UI
    document.getElementById('profileName').textContent = currentUser.name;
    document.getElementById('profileTitle').textContent = currentUser.title;
    document.getElementById('currentUserName').textContent = currentUser.name;
    document.getElementById('currentUserRole').textContent = currentUser.title;
    
    // Update post input placeholder
    const postInput = document.getElementById('postInput');
    if (postInput) {
        postInput.placeholder = `What problem are you facing today, ${currentUser.name.split(' ')[0]}?`;
    }
    
    showToast('Profile updated successfully!', 'success');
    document.getElementById('editProfileModal').classList.remove('active');
}

function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!currentPassword) {
        showToast('Please enter current password', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showToast('New password must be at least 6 characters', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showToast('Passwords do not match', 'error');
        return;
    }
    
    // In a real app, you would verify current password with server
    // For demo, we'll just check if it's not empty
    if (currentPassword) {
        showToast('Password changed successfully!', 'success');
        
        // Clear password fields
        document.getElementById('currentPassword').value = '';
        document.getElementById('newPassword').value = '';
        document.getElementById('confirmPassword').value = '';
        document.getElementById('passwordStrength').className = 'password-strength';
    } else {
        showToast('Current password is incorrect', 'error');
    }
}

// ==================== SETTINGS FUNCTIONALITY ====================

// Settings data storage key
const SETTINGS_STORAGE_KEY = 'nexusmind_settings';

// Default settings
const defaultSettings = {
    notifications: {
        enabled: true,
        emailEnabled: true
    },
    privacy: {
        profileVisibility: 'public',
        activityVisibility: 'public'
    }
};

// Global function for opening Settings modal
function openSettingsModal() {
    console.log('Opening Settings modal...');
    
    const settingsModal = document.getElementById('settingsModal');
    if (!settingsModal) {
        console.error('Settings modal not found!');
        showToast('Settings modal not found', 'error');
        return;
    }
    
    // Load current settings
    loadSettings();
    
    // Show modal
    settingsModal.classList.add('active');
    
    console.log('Settings modal opened successfully');
}

function loadSettings() {
    try {
        const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
        const settings = savedSettings ? JSON.parse(savedSettings) : defaultSettings;
        
        // Load notification settings
        document.getElementById('notificationToggle').checked = settings.notifications.enabled;
        document.getElementById('emailNotificationToggle').checked = settings.notifications.emailEnabled;
        
        // Load privacy settings
        document.getElementById('profileVisibilityToggle').value = settings.privacy.profileVisibility;
        document.getElementById('activityVisibilityToggle').value = settings.privacy.activityVisibility;
        
        console.log('Settings loaded:', settings);
    } catch (error) {
        console.error('Error loading settings:', error);
        // Use default settings on error
        loadDefaultSettings();
    }
}

function loadDefaultSettings() {
    document.getElementById('notificationToggle').checked = defaultSettings.notifications.enabled;
    document.getElementById('emailNotificationToggle').checked = defaultSettings.notifications.emailEnabled;
    document.getElementById('profileVisibilityToggle').value = defaultSettings.privacy.profileVisibility;
    document.getElementById('activityVisibilityToggle').value = defaultSettings.privacy.activityVisibility;
}

function saveSettings() {
    try {
        const settings = {
            notifications: {
                enabled: document.getElementById('notificationToggle').checked,
                emailEnabled: document.getElementById('emailNotificationToggle').checked
            },
            privacy: {
                profileVisibility: document.getElementById('profileVisibilityToggle').value,
                activityVisibility: document.getElementById('activityVisibilityToggle').value
            }
        };
        
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
        
        // Update user privacy settings in auth system
        if (authSystem.currentUser) {
            if (!authSystem.currentUser.privacy) authSystem.currentUser.privacy = {};
            authSystem.currentUser.privacy.profile = settings.privacy.profileVisibility;
            authSystem.currentUser.privacy.activity = settings.privacy.activityVisibility;
            authSystem.currentUser.privacy.emailNotifications = settings.notifications.emailEnabled;
            
            // Save updated user data
            authSystem.saveUserSession(true);
        }
        
        console.log('Settings saved:', settings);
        showToast('Settings saved successfully!', 'success');
        
        // Close modal
        closeSettingsModal();
        
    } catch (error) {
        console.error('Error saving settings:', error);
        showToast('Error saving settings', 'error');
    }
}

function closeSettingsModal() {
    const settingsModal = document.getElementById('settingsModal');
    if (settingsModal) {
        settingsModal.classList.remove('active');
    }
}

function setupSettingsModal() {
    console.log('Setting up Settings modal...');
    
    const settingsModal = document.getElementById('settingsModal');
    if (!settingsModal) {
        console.error('Settings modal not found in DOM!');
        return;
    }
    
    // Close button
    const closeSettingsBtn = document.querySelector('.close-settings');
    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeSettingsModal();
        });
    }
    
    // Cancel button
    const cancelSettingsBtn = document.getElementById('cancelSettingsBtn');
    if (cancelSettingsBtn) {
        cancelSettingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeSettingsModal();
        });
    }
    
    // Save button
    const saveSettingsBtn = document.getElementById('saveSettingsBtn');
    if (saveSettingsBtn) {
        saveSettingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            saveSettings();
        });
    }
    
    // Remove backdrop click auto-close to prevent automatic closing
    // Users must now use the X button to close modal
    // settingsModal.addEventListener('click', (e) => {
    //     if (e.target === settingsModal) {
    //         closeSettingsModal();
    //     }
    // });
    
    // Remove Escape key auto-close to prevent automatic closing
    // Users must now use the X button to close modal
    // document.addEventListener('keydown', (e) => {
    //     if (e.key === 'Escape' && settingsModal.classList.contains('active')) {
    //         closeSettingsModal();
    //     }
    // });
    
    console.log('Settings modal setup completed');
}

// ==================== HELP & SUPPORT FUNCTIONALITY ====================

// Feedback data storage key
const FEEDBACK_STORAGE_KEY = 'nexusmind_feedback';

// Global function for opening Help & Support modal
function openHelpModal() {
    console.log('Opening Help & Support modal...');
    
    const helpModal = document.getElementById('helpModal');
    if (!helpModal) {
        console.error('Help modal not found!');
        showToast('Help modal not found', 'error');
        return;
    }
    
    // Show modal
    helpModal.classList.add('active');
    
    console.log('Help & Support modal opened successfully');
}

function closeHelpModal() {
    const helpModal = document.getElementById('helpModal');
    if (helpModal) {
        helpModal.classList.remove('active');
    }
}

function submitFeedback(event) {
    event.preventDefault();
    
    try {
        const feedbackData = {
            id: Date.now(),
            type: document.getElementById('feedbackType').value,
            subject: document.getElementById('feedbackSubject').value,
            message: document.getElementById('feedbackMessage').value,
            email: document.getElementById('feedbackEmail').value,
            timestamp: new Date().toISOString(),
            status: 'pending',
            userId: authSystem.currentUser?.id || null
        };
        
        // Get existing feedback or create new array
        const existingFeedback = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || '[]');
        existingFeedback.push(feedbackData);
        
        // Save to localStorage
        localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify(existingFeedback));
        
        console.log('Feedback submitted:', feedbackData);
        showToast('Your feedback has been submitted successfully! We\'ll get back to you soon.', 'success');
        
        // Reset form
        document.getElementById('feedbackForm').reset();
        
        // Close modal
        closeHelpModal();
        
    } catch (error) {
        console.error('Error submitting feedback:', error);
        showToast('Error submitting feedback. Please try again.', 'error');
    }
}

function setupFAQInteractions() {
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const isActive = faqItem.classList.contains('active');
            
            // Close all FAQ items
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                faqItem.classList.add('active');
            }
        });
    });
}

function setupHelpModal() {
    console.log('Setting up Help & Support modal...');
    
    const helpModal = document.getElementById('helpModal');
    if (!helpModal) {
        console.error('Help modal not found in DOM!');
        return;
    }
    
    // Close button
    const closeHelpBtn = document.querySelector('.close-help');
    if (closeHelpBtn) {
        closeHelpBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeHelpModal();
        });
    }
    
    // Close button in footer
    const closeHelpFooterBtn = document.getElementById('closeHelpBtn');
    if (closeHelpFooterBtn) {
        closeHelpFooterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeHelpModal();
        });
    }
    
    // Feedback form submission
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm) {
        feedbackForm.addEventListener('submit', submitFeedback);
    }
    
    // FAQ interactions
    setupFAQInteractions();
    
    // Remove backdrop click auto-close to prevent automatic closing
    // Users must now use the X button to close modal
    // helpModal.addEventListener('click', (e) => {
    //     if (e.target === helpModal) {
    //         closeHelpModal();
    //     }
    // });
    
    // Remove Escape key auto-close to prevent automatic closing
    // Users must now use the X button to close modal
    // document.addEventListener('keydown', (e) => {
    //     if (e.key === 'Escape' && helpModal.classList.contains('active')) {
    //         closeHelpModal();
    //     }
    // });
    
    console.log('Help & Support modal setup completed');
}

// ==================== NETWORK FEATURES ====================

function setupNetworkFeatures() {
    // Tab switching for network page
    document.querySelectorAll('.network-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            
            // Update active tab
            document.querySelectorAll('.network-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Show corresponding content
            document.querySelectorAll('.edit-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabId}-tab`).classList.add('active');
            
            // Load data for the tab
            if (tabId === 'connections') loadConnections();
            else if (tabId === 'requests') loadConnectionRequests();
            else if (tabId === 'suggestions') loadSuggestions();
            else if (tabId === 'groups') loadGroups();
        });
    });
    
    // Search functionality
    const networkSearch = document.getElementById('networkSearch');
    if (networkSearch) {
        networkSearch.addEventListener('input', debounce(function() {
            const searchTerm = this.value.toLowerCase();
            filterConnections(searchTerm);
        }, 300));
    }
    
    // Sort functionality
    const sortConnectionsBtn = document.getElementById('sortConnections');
    if (sortConnectionsBtn) {
        sortConnectionsBtn.addEventListener('click', () => {
            const currentSort = sortConnectionsBtn.textContent;
            let newSort = 'Recent';
            
            if (currentSort.includes('Recent')) newSort = 'Name A-Z';
            else if (currentSort.includes('Name')) newSort = 'Most Active';
            else newSort = 'Recent';
            
            sortConnectionsBtn.innerHTML = `<i class="fas fa-sort"></i> Sort by: ${newSort}`;
            sortConnections(newSort);
        });
    }
    
    // Filter functionality
    const filterConnectionsBtn = document.getElementById('filterConnections');
    if (filterConnectionsBtn) {
        filterConnectionsBtn.addEventListener('click', () => {
            showToast('Filter options coming soon!', 'info');
        });
    }
    
    // Message search functionality
    const messageSearch = document.getElementById('messageSearch');
    if (messageSearch) {
        messageSearch.addEventListener('focus', function() {
            const messageCompose = document.getElementById('messageCompose');
            if (messageCompose) {
                messageCompose.style.display = 'block';
            }
        });
    }
    
    // Send message button
    const sendMessageBtn = document.getElementById('sendMessageBtn');
    if (sendMessageBtn) {
        sendMessageBtn.addEventListener('click', sendMessage);
    }
    
    // My Network link in sidebar
    const myNetworkLink = document.getElementById('myNetworkLink');
    if (myNetworkLink) {
        myNetworkLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Navigate to network page
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            document.getElementById('nav-network')?.classList.add('active');
            showPage('network');
        });
    }
}

function loadNetworkPage() {
    loadConnections();
    loadActiveConversations();
    updateConnectionCount();
}

function loadConnections() {
    const connectionsGrid = document.getElementById('connectionsGrid');
    if (!connectionsGrid) return;
    
    connectionsGrid.innerHTML = appData.networkData.connections.map(conn => `
        <div class="connection-card">
            <div class="connection-status ${conn.status}"></div>
            <div class="connection-avatar">
                <img src="${conn.avatar}" alt="${conn.name}">
            </div>
            <div class="connection-name">${conn.name}</div>
            <div class="connection-role">${conn.title}</div>
            <div class="connection-meta">${conn.mutualConnections} mutual connections</div>
            <div class="connection-status-text">${conn.status === 'online' ? 'Online now' : `Active ${conn.lastActive}`}</div>
            <div class="connection-actions">
                <button class="connection-action-btn message-btn" data-user-id="${conn.id}">
                    <i class="fas fa-comment"></i> Message
                </button>
                <button class="connection-action-btn remove-btn" data-user-id="${conn.id}">
                    <i class="fas fa-user-minus"></i> Remove
                </button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners
    document.querySelectorAll('.message-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const userId = e.currentTarget.dataset.userId;
            startNewMessage(userId);
        });
    });
    
    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const userId = e.currentTarget.dataset.userId;
            removeConnection(userId);
        });
    });
}

function loadConnectionRequests() {
    const requestsList = document.getElementById('requestsList');
    if (!requestsList) return;
    
    requestsList.innerHTML = appData.networkData.requests.map(req => `
        <div class="request-item">
            <div class="request-avatar">
                <img src="${req.avatar}" alt="${req.name}">
            </div>
            <div class="request-info">
                <h4>${req.name}</h4>
                <p>${req.title}</p>
                <p class="request-message">"${req.message}"</p>
                <div class="mutual-info">${req.mutualConnections} mutual connections</div>
            </div>
            <div class="request-actions">
                <button class="btn btn-primary accept-btn" data-request-id="${req.id}">
                    Accept
                </button>
                <button class="btn btn-secondary decline-btn" data-request-id="${req.id}">
                    Decline
                </button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners
    document.querySelectorAll('.accept-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const requestId = e.currentTarget.dataset.requestId;
            acceptConnectionRequest(requestId);
        });
    });
    
    document.querySelectorAll('.decline-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const requestId = e.currentTarget.dataset.requestId;
            declineConnectionRequest(requestId);
        });
    });
}

function loadSuggestions() {
    const suggestionsGrid = document.getElementById('suggestionsGrid');
    if (!suggestionsGrid) return;
    
    suggestionsGrid.innerHTML = appData.networkData.suggestions.map(sugg => `
        <div class="suggestion-card">
            <div class="connection-avatar">
                <img src="${sugg.avatar}" alt="${sugg.name}">
            </div>
            <div class="connection-name">${sugg.name}</div>
            <div class="connection-role">${sugg.title}</div>
            <div class="common-connections">${sugg.mutualConnections} mutual connections</div>
            <div class="common-tags">
                ${sugg.commonTags?.map(tag => `<span class="tag tag-small">${tag}</span>`).join('') || ''}
            </div>
            <div class="connection-actions">
                <button class="btn btn-primary connect-btn" data-user-id="${sugg.id}">
                    Connect
                </button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners for connect buttons
    document.querySelectorAll('.connect-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const userId = e.currentTarget.dataset.userId;
            sendConnectionRequest(userId);
        });
    });
}

function loadGroups() {
    const groupsList = document.getElementById('groupsList');
    if (!groupsList) return;
    
    groupsList.innerHTML = appData.networkData.groups.map(group => `
        <div class="group-item">
            <div class="group-icon">
                <i class="${group.icon}"></i>
            </div>
            <div class="group-info">
                <h4>${group.name}</h4>
                <p>${group.description}</p>
                <div class="group-members">
                    <i class="fas fa-users"></i> ${group.members} members
                </div>
            </div>
            <div class="group-actions">
                <button class="btn btn-primary" data-group-id="${group.id}">
                    Join Group
                </button>
            </div>
        </div>
    `).join('');
    
    // Add event listeners for group join buttons
    document.querySelectorAll('.group-actions .btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const groupId = e.currentTarget.dataset.groupId;
            const group = appData.networkData.groups.find(g => g.id == groupId);
            if (group) {
                showToast(`Request to join "${group.name}" sent!`, 'success');
            }
        });
    });
}

function loadActiveConversations() {
    const messagesContainer = document.getElementById('messagesContainer');
    if (!messagesContainer) return;
    
    messagesContainer.innerHTML = appData.networkData.messages.map(msg => `
        <div class="conversation-item ${msg.unread ? 'unread' : ''}" data-user-id="${msg.userId}">
            <div class="conversation-avatar">
                <img src="${msg.avatar}" alt="${msg.name}">
            </div>
            <div class="conversation-preview">
                <h4>${msg.name}</h4>
                <p>${msg.lastMessage}</p>
            </div>
            <div class="conversation-time">${msg.time}</div>
        </div>
    `).join('');
    
    // Add click handlers for conversations
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.addEventListener('click', () => {
            const userId = item.dataset.userId;
            openConversation(userId);
        });
    });
}

function startNewMessage(userId) {
    const messageSearch = document.getElementById('messageSearch');
    const messageCompose = document.getElementById('messageCompose');
    
    if (messageSearch && messageCompose) {
        const user = appData.networkData.connections.find(c => c.id == userId);
        if (user) {
            messageSearch.value = user.name;
            messageCompose.style.display = 'block';
            messageSearch.disabled = true;
        }
    }
}

function sendMessage() {
    const messageText = document.getElementById('messageText');
    if (!messageText || !messageText.value.trim()) {
        showToast('Please enter a message', 'error');
        return;
    }
    
    showToast('Message sent!', 'success');
    messageText.value = '';
    
    // Reset message form
    const messageSearch = document.getElementById('messageSearch');
    const messageCompose = document.getElementById('messageCompose');
    if (messageSearch && messageCompose) {
        messageSearch.value = '';
        messageSearch.disabled = false;
        messageCompose.style.display = 'none';
    }
}

function acceptConnectionRequest(requestId) {
    const request = appData.networkData.requests.find(r => r.id == requestId);
    if (request) {
        // Move from requests to connections
        appData.networkData.connections.push({
            id: request.id,
            name: request.name,
            title: request.title,
            avatar: request.avatar,
            status: 'online',
            lastActive: 'Just now',
            mutualConnections: request.mutualConnections
        });
        
        // Remove from requests
        appData.networkData.requests = appData.networkData.requests.filter(r => r.id != requestId);
        
        // Update counts
        updateConnectionCount();
        saveData();
        
        showToast(`Connected with ${request.name}!`, 'success');
        loadConnectionRequests();
    }
}

function declineConnectionRequest(requestId) {
    const request = appData.networkData.requests.find(r => r.id == requestId);
    if (request) {
        appData.networkData.requests = appData.networkData.requests.filter(r => r.id != requestId);
        updateConnectionCount();
        saveData();
        showToast(`Connection request from ${request.name} declined`, 'info');
        loadConnectionRequests();
    }
}

function removeConnection(userId) {
    const connection = appData.networkData.connections.find(c => c.id == userId);
    if (connection && confirm(`Remove ${connection.name} from your connections?`)) {
        appData.networkData.connections = appData.networkData.connections.filter(c => c.id != userId);
        updateConnectionCount();
        saveData();
        showToast(`Removed ${connection.name} from connections`, 'info');
        loadConnections();
    }
}

function sendConnectionRequest(userId) {
    const suggestion = appData.networkData.suggestions.find(s => s.id == userId);
    if (suggestion) {
        showToast(`Connection request sent to ${suggestion.name}!`, 'success');
        // In a real app, this would send a request to the server
    }
}

function openConversation(userId) {
    const conversation = appData.networkData.messages.find(m => m.userId == userId);
    if (conversation) {
        // Mark as read
        conversation.unread = false;
        loadActiveConversations();
        
        // Start messaging with this user
        startNewMessage(userId);
    }
}

function filterConnections(searchTerm) {
    const filtered = appData.networkData.connections.filter(conn =>
        conn.name.toLowerCase().includes(searchTerm) ||
        conn.title.toLowerCase().includes(searchTerm)
    );
    
    const connectionsGrid = document.getElementById('connectionsGrid');
    if (connectionsGrid) {
        connectionsGrid.innerHTML = filtered.map(conn => `
            <div class="connection-card">
                <div class="connection-status ${conn.status}"></div>
                <div class="connection-avatar">
                    <img src="${conn.avatar}" alt="${conn.name}">
                </div>
                <div class="connection-name">${conn.name}</div>
                <div class="connection-role">${conn.title}</div>
                <div class="connection-meta">${conn.mutualConnections} mutual connections</div>
                <div class="connection-status-text">${conn.status === 'online' ? 'Online now' : `Active ${conn.lastActive}`}</div>
                <div class="connection-actions">
                    <button class="connection-action-btn message-btn" data-user-id="${conn.id}">
                        <i class="fas fa-comment"></i> Message
                    </button>
                    <button class="connection-action-btn remove-btn" data-user-id="${conn.id}">
                        <i class="fas fa-user-minus"></i> Remove
                    </button>
                </div>
            </div>
        `).join('');
    }
}

function sortConnections(sortBy) {
    switch(sortBy) {
        case 'Name A-Z':
            appData.networkData.connections.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'Most Active':
            appData.networkData.connections.sort((a, b) => {
                const statusOrder = { 'online': 0, 'away': 1, 'offline': 2 };
                return statusOrder[a.status] - statusOrder[b.status];
            });
            break;
        case 'Recent':
        default:
            appData.networkData.connections.sort((a, b) => b.id - a.id);
            break;
    }
    
    loadConnections();
}

// ==================== TOP SOLVERS FUNCTIONALITY ====================

function setupTopSolvers() {
    const topSolversLink = document.getElementById('topSolversLink');
    const topSolversCard = document.getElementById('topSolversCard');
    const linksCard = document.querySelector('.links-card');
    
    // Toggle Top Solvers card
    if (topSolversLink && topSolversCard) {
        topSolversLink.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle visibility
            if (topSolversCard.style.display === 'none') {
                topSolversCard.style.display = 'block';
                loadTopSolvers('weekly');
                loadAchievements();
                linksCard.style.marginBottom = '0';
            } else {
                topSolversCard.style.display = 'none';
                linksCard.style.marginBottom = '';
            }
        });
    }
    
    // View controls
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const view = this.dataset.view;
            
            // Update active view
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Load data for the view
            loadTopSolvers(view);
        });
    });
    
    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            filterSolversByCategory(this.value);
        });
    }
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshRankings');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            setTimeout(() => {
                refreshRankings();
                refreshBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
                showToast('Rankings updated!', 'success');
            }, 1000);
        });
    }
}

function loadTopSolvers(timeframe = 'weekly') {
    const solversList = document.getElementById('solversList');
    if (!solversList) return;
    
    const solvers = appData.topSolversData[timeframe] || appData.topSolversData.weekly;
    
    solversList.innerHTML = solvers.map((solver, index) => `
        <div class="solver-item ${index < 3 ? 'top-3' : ''}" data-solver-id="${solver.id}">
            <div class="solver-rank">${index + 1}</div>
            <div class="solver-avatar">
                <img src="${solver.avatar}" alt="${solver.name}">
            </div>
            <div class="solver-info">
                <h4>
                    ${solver.name}
                    ${solver.badges.map(badge => 
                        `<span class="badge badge-${badge}">${badge.toUpperCase()}</span>`
                    ).join(' ')}
                </h4>
                <p>${solver.title}</p>
                <div class="solver-stats">
                    <i class="fas fa-lightbulb"></i> ${solver.solutions} solutions this week
                </div>
            </div>
            <div class="solver-score">${solver.score}</div>
        </div>
    `).join('');
    
    // Add click handlers for solver profiles
    document.querySelectorAll('.solver-item').forEach(item => {
        item.addEventListener('click', () => {
            const solverId = item.dataset.solverId;
            viewSolverProfile(solverId);
        });
    });
}

function loadAchievements() {
    const achievementsGrid = document.getElementById('achievementsGrid');
    if (!achievementsGrid) return;
    
    achievementsGrid.innerHTML = appData.topSolversData.achievements.map(achievement => `
        <div class="achievement-item ${achievement.rarity}" data-achievement-id="${achievement.id}">
            <div class="achievement-icon">
                <i class="${achievement.icon}"></i>
            </div>
            <div class="achievement-name">${achievement.name}</div>
            <div class="achievement-desc">${achievement.description}</div>
        </div>
    `).join('');
}

function filterSolversByCategory(category) {
    const activeView = document.querySelector('.view-btn.active').dataset.view;
    const solvers = appData.topSolversData[activeView] || appData.topSolversData.weekly;
    
    let filtered = solvers;
    if (category !== 'all') {
        filtered = solvers.filter(solver => solver.category === category);
    }
    
    const solversList = document.getElementById('solversList');
    if (solversList) {
        solversList.innerHTML = filtered.map((solver, index) => `
            <div class="solver-item ${index < 3 ? 'top-3' : ''}" data-solver-id="${solver.id}">
                <div class="solver-rank">${index + 1}</div>
                <div class="solver-avatar">
                    <img src="${solver.avatar}" alt="${solver.name}">
                </div>
                <div class="solver-info">
                    <h4>
                        ${solver.name}
                        ${solver.badges.map(badge => 
                            `<span class="badge badge-${badge}">${badge.toUpperCase()}</span>`
                        ).join(' ')}
                    </h4>
                    <p>${solver.title}</p>
                    <div class="solver-stats">
                        <i class="fas fa-lightbulb"></i> ${solver.solutions} solutions this week
                    </div>
                </div>
                <div class="solver-score">${solver.score}</div>
            </div>
        `).join('');
    }
}

function viewSolverProfile(solverId) {
    const solver = appData.topSolversData.weekly.find(s => s.id == solverId);
    if (solver) {
        showToast(`Viewing ${solver.name}'s profile`, 'info');
        // In a real app, this would open the solver's profile
    }
}

function refreshRankings() {
    // Simulate updating scores
    appData.topSolversData.weekly.forEach((solver, index) => {
        solver.score += Math.floor(Math.random() * 20) - 10;
        solver.solutions += Math.floor(Math.random() * 3);
        
        // Ensure scores don't go negative
        solver.score = Math.max(solver.score, 100);
    });
    
    // Re-sort by score
    appData.topSolversData.weekly.sort((a, b) => b.score - a.score);
    
    loadTopSolvers('weekly');
}

// ==================== PAGE NAVIGATION FUNCTIONALITY ====================

function setupNavigation() {
    document.getElementById('logo-home')?.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        document.getElementById('nav-home')?.classList.add('active');
        showPage('home');
    });
    
    document.querySelectorAll('[data-page]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const page = this.getAttribute('data-page');
            if (this.classList.contains('active')) return;
            
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            showPage(page);
            
            if (page === 'notifications' || page === 'messages') {
                const badge = this.querySelector('.nav-badge');
                if (badge) {
                    badge.style.display = 'none';
                }
            }
        });
    });
    
    document.querySelectorAll('.shortcut').forEach(shortcut => {
        shortcut.addEventListener('click', (e) => {
            e.stopPropagation();
            const searchInput = document.querySelector('.search-input');
            if (searchInput) {
                searchInput.value = shortcut.textContent;
                searchInput.focus();
                showToast(`Searching for ${shortcut.textContent}...`, 'info');
            }
        });
    });
}

function showPage(page) {
    document.querySelectorAll('.main-feed').forEach(section => {
        section.style.display = 'none';
    });
    
    const pageElement = document.getElementById(`${page}Page`);
    if (pageElement) {
        pageElement.style.display = 'block';
        
        if (page === 'network') loadNetworkPage();
        else if (page === 'problems') loadProblemsPage();
        else if (page === 'messages') loadMessagesPage();
        else if (page === 'notifications') loadNotificationsPage();
    }
    
    const pageNames = {
        'home': 'Home',
        'network': 'Network',
        'problems': 'Problems',
        'messages': 'Messages',
        'notifications': 'Notifications'
    };
    
    showToast(`Showing ${pageNames[page] || page} page`, 'info');
}

function loadProblemsPage() {
    const problemsList = document.getElementById('problemsList');
    if (!problemsList) return;
    
    problemsList.innerHTML = appData.posts.map(post => `
        <div class="post-card card">
            <div class="post-header">
                <div class="post-author">
                    <div class="author-avatar">
                        <img src="${post.author.avatar}" alt="${post.author.name}">
                    </div>
                    <div class="author-info">
                        <h4>${post.author.name} <span class="author-badge">${post.author.badge}</span></h4>
                        <div class="post-meta">
                            <span>${new Date(post.timestamp).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="post-content">
                <div class="problem-highlight">
                    <div class="problem-text">
                        <h3>${post.title}</h3>
                        <div class="post-text-container" id="post-text-${post.id}">
                            <div class="post-text">
                                ${post.content}
                            </div>
                            <div class="post-text-fade"></div>
                        </div>
                        ${post.media ? renderPostMedia(post.media) : ''}
                        <div class="see-more-wrapper">
                            <button class="see-more-btn" data-post-id="${post.id}" style="display: none;">
                                <span>See More</span>
                                <i class="fas fa-chevron-down"></i>
                            </button>
                        </div>
                    </div>
                </div>
                
                <div class="post-stats">
                    <div class="stats-left">
                        <span class="stats-text">${post.solutions} solutions • ${post.likes} likes • ${post.comments} comments</span>
                    </div>
                </div>
                <div class="post-interactions">
                    <button class="interaction-btn offer-btn" data-post-id="${post.id}" data-offered="${post.offered}">
                        <i class="fas fa-lightbulb"></i>
                        <span>${post.offered ? 'Solution Offered' : 'Offer Solution'}</span>
                    </button>
                    <button class="interaction-btn like-btn" data-post-id="${post.id}" data-liked="${post.liked}">
                        <i class="${post.liked ? 'fas' : 'far'} fa-thumbs-up"></i>
                        <span>${post.liked ? 'Liked' : 'Like'}</span>
                    </button>
                    <button class="interaction-btn comment-btn" data-post-id="${post.id}">
                        <i class="far fa-comment"></i>
                        <span>Comment</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    setTimeout(checkAndSetupLongPosts, 200);
    setTimeout(setupFacebookStylePosts, 100);
}

function loadMessagesPage() {
    const messagesList = document.querySelector('.messages-list');
    if (!messagesList) return;
    
    const messages = [
        { name: "Emma Wilson", message: "Thanks for the solution!", time: "2h ago", unread: true, avatar: "https://images.unsplash.com/photo-1494790108755-2616b786d4d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" },
        { name: "Michael Chen", message: "Can you review my approach?", time: "5h ago", unread: false, avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" },
        { name: "Sarah Davis", message: "Great work on the last problem!", time: "1d ago", unread: false, avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80" }
    ];
    
    messagesList.innerHTML = messages.map(msg => `
        <div class="message-item ${msg.unread ? 'unread' : ''}">
            <img src="${msg.avatar}" alt="${msg.name}">
            <div class="message-content">
                <div class="message-header">
                    <strong>${msg.name}</strong>
                    <span>${msg.time}</span>
                </div>
                <p>${msg.message}</p>
            </div>
        </div>
    `).join('');
}

function loadNotificationsPage() {
    const notificationsList = document.querySelector('.notifications-list');
    if (!notificationsList) return;
    
    const notifications = [
        { type: 'like', user: 'Emma Wilson', action: 'liked your solution', time: '10 min ago', read: false },
        { type: 'comment', user: 'Michael Chen', action: 'commented on your post', time: '1 hour ago', read: false },
        { type: 'solution', user: 'Sarah Davis', action: 'offered a solution to your problem', time: '3 hours ago', read: true },
        { type: 'connection', user: 'James Wilson', action: 'wants to connect with you', time: '1 day ago', read: true }
    ];
    
    notificationsList.innerHTML = notifications.map(notif => `
        <div class="notification-item ${notif.read ? '' : 'unread'}">
            <div class="notification-icon">
                <i class="fas fa-${notif.type === 'like' ? 'thumbs-up' : notif.type === 'comment' ? 'comment' : notif.type === 'solution' ? 'lightbulb' : 'user-plus'}"></i>
            </div>
            <div class="notification-content">
                <p><strong>${notif.user}</strong> ${notif.action}</p>
                <span>${notif.time}</span>
            </div>
        </div>
    `).join('');
    
    // Mark all as read button
    const markAllReadBtn = document.getElementById('markAllRead');
    if (markAllReadBtn) {
        markAllReadBtn.addEventListener('click', () => {
            document.querySelectorAll('.notification-item.unread').forEach(item => {
                item.classList.remove('unread');
            });
            showToast('All notifications marked as read', 'success');
        });
    }
}

// ==================== POSTING FUNCTIONALITY ====================

// Render media thumbnails for posts - Enhanced for better visual appeal
function renderPostMedia(media) {
    if (!media || !Array.isArray(media) || media.length === 0) return '';
    
    const mediaCount = media.length;
    let mediaHTML = '';
    
    if (mediaCount === 1) {
        const item = media[0];
        if (item.type === 'image') {
            mediaHTML = `
                <div class="post-media single-media" onclick="viewFullMedia('${encodeURIComponent(item.url)}')" title="Click to view full image">
                    <div class="media-thumbnail image-thumbnail">
                        <img src="${item.url}" alt="Problem image" loading="lazy" 
                             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxwYXRoIGQ9Ik0xMjUgNzVIMTc1VjEyNUgxMjVWNzVaIiBmaWxsPSIjQkRCREJEIi8+CjxwYXRoIGQ9Ik0xMzcuNSA5My43NUwxNTAgMTA2LjI1TDE2Mi41IDkzLjc1VjEwNi4yNUgxMzcuNVY5My43NVoiIGZpbGw9IiNCREJEREIiLz4KPHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIiBmaWxsPSJub25lIiBzdHlsZT0icG9zaXRpb246IGFic29sdXRlOyBsZWZ0OiAxMzBweDsgdG9wOiA4MHB4OyI+CjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjE4IiBzdHJva2U9IiNCRERCREIiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNMjAgMTJWMjBMMjggMjgiIHN0cm9rZT0iI0JEREJERSIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+'">
                        <div class="media-overlay">
                            <div class="media-icon">
                                <i class="fas fa-expand"></i>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (item.type === 'video') {
            mediaHTML = `
                <div class="post-media single-media" onclick="viewFullMedia('${encodeURIComponent(item.url)}')" title="Click to play video">
                    <div class="media-thumbnail video-thumbnail">
                        <video src="${item.url}" muted preload="metadata" 
                               onerror="this.parentElement.innerHTML='<div class=\\'media-error\\'><i class=\\'fas fa-video-slash\\'></i><span>Video unavailable</span></div>'"></video>
                        <div class="media-overlay">
                            <div class="play-button">
                                <i class="fas fa-play"></i>
                            </div>
                            <div class="video-duration">0:00</div>
                        </div>
                    </div>
                </div>
            `;
        }
    } else if (mediaCount > 1) {
        const gridClass = mediaCount <= 2 ? 'two' : mediaCount === 3 ? 'three' : 'four';
        mediaHTML = `<div class="post-media multiple ${gridClass}">`;
        
        media.forEach((item, index) => {
            if (index < 4) { // Show max 4 items
                const isLastItem = index === 3 && mediaCount > 4;
                
                if (item.type === 'image') {
                    mediaHTML += `
                        <div class="media-item" onclick="viewFullMedia('${encodeURIComponent(item.url)}')" title="View image ${index + 1}">
                            <div class="media-thumbnail image-thumbnail">
                                <img src="${item.url}" alt="Problem image ${index + 1}" loading="lazy"
                                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDE1MCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxNTAiIGhlaWdodD0iMTAwIiBmaWxsPSIjRjVGNUY1Ii8+CjxjaXJjbGUgY3g9Ijc1IiBjeT0iNTAiIHI9IjE4IiBzdHJva2U9IiNCRERCREIiIHN0cm9rZS13aWR0aD0iMiIvPgo8cGF0aCBkPSJNNjUgNDJMNzUgNTJMODUgNDJWNTJINjVWNDJaIiBmaWxsPSIjQkRCREJEIi8+Cjwvc3ZnPg=='">
                                <div class="media-overlay">
                                    <div class="media-icon">
                                        <i class="fas fa-expand"></i>
                                    </div>
                                </div>
                            </div>
                            ${isLastItem ? `<div class="media-more-overlay">+${mediaCount - 4}</div>` : ''}
                        </div>
                    `;
                } else if (item.type === 'video') {
                    mediaHTML += `
                        <div class="media-item" onclick="viewFullMedia('${encodeURIComponent(item.url)}')" title="Play video ${index + 1}">
                            <div class="media-thumbnail video-thumbnail">
                                <video src="${item.url}" muted preload="metadata"
                                       onerror="this.parentElement.innerHTML='<div class=\\'media-error\\'><i class=\\'fas fa-video-slash\\'></i></div>'"></video>
                                <div class="media-overlay">
                                    <div class="play-button small">
                                        <i class="fas fa-play"></i>
                                    </div>
                                </div>
                            </div>
                            ${isLastItem ? `<div class="media-more-overlay">+${mediaCount - 4}</div>` : ''}
                        </div>
                    `;
                }
            }
        });
        
        mediaHTML += '</div>';
    }
    
    return mediaHTML;
}

// Initialize video durations after posts are rendered
function initializeVideoDurations() {
    const videoElements = document.querySelectorAll('.video-thumbnail video');
    videoElements.forEach(video => {
        detectVideoDuration(video);
    });
}

// Enhanced video duration detection
function detectVideoDuration(videoElement) {
    videoElement.addEventListener('loadedmetadata', function() {
        const duration = videoElement.duration;
        const minutes = Math.floor(duration / 60);
        const seconds = Math.floor(duration % 60);
        const durationText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        
        const durationElement = videoElement.parentElement.querySelector('.video-duration');
        if (durationElement) {
            durationElement.textContent = durationText;
        }
    });
}

// View full media in modal/lightbox - Enhanced
function viewFullMedia(encodedUrl) {
    try {
        const url = decodeURIComponent(encodedUrl);
        
        // Create a simple modal for better media viewing
        const modal = document.createElement('div');
        modal.className = 'modal media-modal';
        modal.style.display = 'flex';
        modal.style.zIndex = '3000';
        
        const isVideo = url.includes('video') || url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov');
        
        modal.innerHTML = `
            <div class="modal-content media-modal-content" style="max-width: 90vw; max-height: 90vh;">
                <div class="modal-header">
                    <h3>${isVideo ? 'Video' : 'Image'}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body" style="padding: 0; text-align: center;">
                    ${isVideo ? 
                        `<video src="${url}" controls autoplay style="max-width: 100%; max-height: 70vh; border-radius: var(--radius-md);">Your browser does not support the video tag.</video>` :
                        `<img src="${url}" style="max-width: 100%; max-height: 70vh; object-fit: contain; border-radius: var(--radius-md);" alt="Full size image">`
                    }
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Remove backdrop click auto-close to prevent automatic closing
        // Users must now use the X button to close modal
        // modal.addEventListener('click', (e) => {
        //     if (e.target === modal) {
        //         modal.remove();
        //     }
        // });
        
        // Remove Escape key auto-close to prevent automatic closing
        // Users must now use the X button to close modal
        // const handleEscape = (e) => {
        //     if (e.key === 'Escape') {
        //         modal.remove();
        //         document.removeEventListener('keydown', handleEscape);
        //     }
        // };
        // document.addEventListener('keydown', handleEscape);
        
    } catch (error) {
        console.error('Error viewing media:', error);
        // Fallback to opening in new tab
        window.open(decodeURIComponent(encodedUrl), '_blank');
    }
}

function setupPosting() {
    const postInput = document.getElementById('postInput');
    const submitBtn = document.getElementById('submitPost');
    const mediaUploadBtn = document.querySelector('.action-option');
    const mediaInput = document.createElement('input');
    
    // Create hidden file input for media uploads
    mediaInput.type = 'file';
    mediaInput.accept = 'image/*,video/*';
    mediaInput.multiple = true;
    mediaInput.style.display = 'none';
    document.body.appendChild(mediaInput);
    
    // Initialize global uploadedMedia if not already done
    if (typeof uploadedMedia === 'undefined') {
        window.uploadedMedia = [];
    }
    
    // Handle media upload button click
    if (mediaUploadBtn) {
        mediaUploadBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // Open camera modal instead of file input
            if (window.enhancedComposer) {
                window.enhancedComposer.openCameraModal('photo');
            } else {
                // Fallback to file input if enhanced composer not available
                mediaInput.click();
            }
        });
    }
    
    // Handle file selection (fallback)
    mediaInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        
        files.forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    uploadedMedia.push({
                        type: 'image',
                        url: event.target.result,
                        name: file.name
                    });
                    
                    // Show preview indicator
                    if (uploadedMedia.length > 0) {
                        mediaUploadBtn.innerHTML = `<i class="fas fa-check" style="color: #4CAF50;"></i><span>${uploadedMedia.length} Media</span>`;
                    }
                };
                reader.readAsDataURL(file);
            } else if (file.type.startsWith('video/')) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    uploadedMedia.push({
                        type: 'video',
                        url: event.target.result,
                        name: file.name
                    });
                    
                    // Show preview indicator
                    if (uploadedMedia.length > 0) {
                        mediaUploadBtn.innerHTML = `<i class="fas fa-check" style="color: #4CAF50;"></i><span>${uploadedMedia.length} Media</span>`;
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    });
    
    if (submitBtn && postInput) {
        submitBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const problemText = postInput.value.trim();
            if (!problemText) {
                showToast('Please describe your problem first!', 'error');
                postInput.focus();
                return;
            }
            
            if (problemText.length < 10) {
                showToast('Please provide more details about your problem (at least 10 characters).', 'warning');
                return;
            }
            
            // Use global uploadedMedia for the post
            const mediaForPost = [...uploadedMedia]; // Copy the array
            
            createNewPostInData(problemText, mediaForPost);
            postInput.value = '';
            
            // Clear global uploadedMedia after posting
            uploadedMedia = [];
            
            // Reset media upload button
            mediaUploadBtn.innerHTML = '<i class="fas fa-images" style="color: #4CAF50;"></i><span>Photo/Video</span>';
            
            // Clear file input
            mediaInput.value = '';
            
            // Show success message
            showToast('Problem posted successfully! Your media has been included.', 'success');
            
            // Update stats
            updateStatsWidget();
        });
        
        postInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                submitBtn.click();
            }
        });
    }
}

function createNewPostInData(problemText, media = []) {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newPost = {
        id: Date.now(),
        author: {
            name: authSystem.currentUser ? authSystem.currentUser.name : appData.currentUser.name,
            role: authSystem.currentUser ? authSystem.currentUser.title : appData.currentUser.role,
            avatar: localStorage.getItem(authSystem.STORAGE_KEYS.PROFILE_PHOTO) || "https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
            badge: "NEW"
        },
        timestamp: now.toISOString(),
        title: "",
        content: problemText,
        likes: 0,
        comments: 0,
        solutions: 0,
        liked: false,
        offered: false,
        tags: ["help", "new"],
        timeString: timeString,
        media: media.length > 0 ? media : undefined
    };
    
    appData.posts.unshift(newPost);
    appData.stats.totalProblems++;
    saveData();
    createNewPostUI(newPost);
    
    showToast('Problem posted successfully! The community is ready to help.', 'success');
}

function createNewPostUI(post) {
    const feed = document.querySelector('.main-feed');
    if (!feed) return;
    
    let postsContainer = document.getElementById('dynamicPostsContainer');
    if (!postsContainer) {
        postsContainer = document.createElement('div');
        postsContainer.id = 'dynamicPostsContainer';
        const examplePost = document.getElementById('examplePost');
        if (examplePost) {
            feed.insertBefore(postsContainer, examplePost);
        } else {
            feed.appendChild(postsContainer);
        }
    }
    
    const newPost = document.createElement('div');
    newPost.className = 'post-card card animate__animated animate__fadeInUp';
    newPost.dataset.postId = post.id;
    newPost.innerHTML = `
        <div class="post-header">
            <div class="post-author">
                <div class="author-avatar">
                    <img src="${post.author.avatar}" alt="You">
                </div>
                <div class="author-info">
                    <h4>${post.author.name} <span class="author-badge">${post.author.badge}</span></h4>
                    <div class="post-meta">
                        <span>Just now • ${post.timeString}</span>
                        <span class="post-visibility">
                            <i class="fas fa-globe-americas"></i> Public
                        </span>
                    </div>
                </div>
            </div>
        </div>
        
        <div class="post-content">
            <div class="problem-highlight">
                <div class="problem-text">
                    ${post.title ? `<h3>${post.title}</h3>` : ''}
                    <div class="post-text-container" id="post-text-${post.id}">
                        <div class="post-text">
                            ${post.content}
                        </div>
                        <div class="post-text-fade"></div>
                    </div>
                    <div class="see-more-wrapper">
                        <button class="see-more-btn" data-post-id="${post.id}" style="display: none;">
                            <span>See More</span>
                            <i class="fas fa-chevron-down"></i>
                        </button>
                    </div>
                    ${post.media ? renderPostMedia(post.media) : ''}
                </div>
            </div>
            
            <div class="post-stats">
                <div class="stats-left">
                    <span class="stats-text">${post.solutions} solutions • ${post.likes} likes</span>
                </div>
            </div>
        </div>
        
        <div class="post-interactions">
            <button class="interaction-btn offer-btn" data-post-id="${post.id}" data-offered="false">
                <i class="fas fa-lightbulb"></i>
                <span>Offer Solution</span>
            </button>
            <button class="interaction-btn like-btn" data-post-id="${post.id}" data-liked="false">
                <i class="far fa-thumbs-up"></i>
                <span>Like</span>
            </button>
            <button class="interaction-btn comment-btn" data-post-id="${post.id}">
                <i class="far fa-comment"></i>
                <span>Comment</span>
            </button>
        </div>
        
        <div class="post-comments" style="display: none;" data-post-id="${post.id}">
            <div class="comments-list" id="comments-list-${post.id}">
                <!-- Comments will appear here -->
            </div>
            <div class="comment-input-container">
                <div class="comment-input-wrapper">
                    <img src="${post.author.avatar}" alt="You" class="comment-avatar">
                    <input type="text" class="comment-input" placeholder="Write a comment..." data-post-id="${post.id}">
                    <button class="comment-submit-btn" data-post-id="${post.id}">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
    
    postsContainer.appendChild(newPost);
    
    // Check text length for the new post (important for posts with media)
    setTimeout(() => {
        if (typeof window.checkTextLength === 'function') {
            window.checkTextLength();
        }
    }, 100);
    
    postsContainer.insertBefore(newPost, postsContainer.firstChild);
    setTimeout(checkAndSetupLongPosts, 200);
    setTimeout(setupFacebookStylePosts, 100);
    setTimeout(initializeVideoDurations, 300); // Initialize video durations
}

// ==================== INTERACTIONS FUNCTIONALITY ====================

function setupInteractions() {
    // Read more/less functionality for long posts
    document.addEventListener('click', function(e) {
        if (e.target.closest('.read-more-btn')) {
            const btn = e.target.closest('.read-more-btn');
            const postId = btn.dataset.postId;
            const textContainer = document.getElementById(`post-text-${postId}`);
            
            if (textContainer) {
                const isExpanded = textContainer.classList.contains('expanded');
                
                if (isExpanded) {
                    textContainer.classList.remove('expanded');
                    btn.innerHTML = '<span>Read more</span><i class="fas fa-chevron-down"></i>';
                    btn.classList.remove('expanded');
                } else {
                    textContainer.classList.add('expanded');
                    btn.innerHTML = '<span>Show less</span><i class="fas fa-chevron-up"></i>';
                    btn.classList.add('expanded');
                }
                
                // Save state to localStorage
                try {
                    const postStates = JSON.parse(localStorage.getItem('nexusmind_post_states') || '{}');
                    postStates[postId] = !isExpanded;
                    localStorage.setItem('nexusmind_post_states', JSON.stringify(postStates));
                } catch (error) {
                    console.log('Could not save post state');
                }
            }
        }
    });
    
    document.addEventListener('click', (e) => {
        const likeBtn = e.target.closest('.like-btn');
        if (likeBtn && !likeBtn.hasAttribute('data-processing')) {
            likeBtn.setAttribute('data-processing', 'true');
            setTimeout(() => likeBtn.removeAttribute('data-processing'), 300);
            const postId = likeBtn.dataset.postId;
            toggleLikeInData(postId, likeBtn);
        }
        
        const commentBtn = e.target.closest('.comment-btn');
        if (commentBtn) {
            const postId = commentBtn.dataset.postId;
            const postCard = commentBtn.closest('.post-card');
            const commentSection = postCard?.querySelector('.post-comments');
            
            if (commentSection) {
                if (commentSection.style.display === 'none') {
                    commentSection.style.display = 'block';
                    commentBtn.innerHTML = '<i class="far fa-comment"></i><span>Hide Comments</span>';
                    
                    // Load comments for this post if not already loaded
                    if (!commentSection.querySelector('.comments-list')) {
                        renderCommentsForPost(postId);
                    }
                } else {
                    commentSection.style.display = 'none';
                    commentBtn.innerHTML = '<i class="far fa-comment"></i><span>Comment</span>';
                }
            }
        }
        
        const offerBtn = e.target.closest('.offer-btn');
        if (offerBtn && offerBtn.getAttribute('data-offered') === 'false') {
            const postId = offerBtn.dataset.postId;
            showSolutionModal(postId);
        }
    });
}

function toggleLikeInData(postId, button) {
    const post = appData.posts.find(p => p.id == postId);
    if (!post) return;
    
    if (post.liked) {
        post.liked = false;
        post.likes = Math.max(0, post.likes - 1);
        button.setAttribute('data-liked', 'false');
        button.classList.remove('liked');
        button.innerHTML = '<i class="far fa-thumbs-up"></i><span>Like</span>';
    } else {
        post.liked = true;
        post.likes++;
        button.setAttribute('data-liked', 'true');
        button.classList.add('liked');
        button.innerHTML = '<i class="fas fa-thumbs-up"></i><span>Liked</span>';
        
        // Create enhanced heart animation
        createFacebookLikeAnimation(button);
        showToast('Problem liked! 👍', 'success');
    }
    
    saveData();
    
    const statsText = button.closest('.post-card')?.querySelector('.stats-text');
    if (statsText) {
        const currentText = statsText.textContent;
        const match = currentText.match(/(\d+)(?=\s*likes)/);
        if (match) {
            const currentLikes = parseInt(match[1]);
            const newLikes = post.likes;
            statsText.textContent = currentText.replace(/(\d+)(?=\s*likes)/, newLikes);
        }
    }
}

function createFacebookLikeAnimation(button) {
    if (!button) return;
    
    // Create multiple floating hearts
    const heartCount = 6;
    const colors = ['❤️', '💙', '💚', '💛', '💜', '🧡'];
    
    for (let i = 0; i < heartCount; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.innerHTML = colors[i % colors.length];
            heart.style.position = 'fixed';
            heart.style.fontSize = Math.random() * 10 + 15 + 'px';
            heart.style.pointerEvents = 'none';
            heart.style.zIndex = '10000';
            heart.style.fontWeight = 'bold';
            
            const rect = button.getBoundingClientRect();
            const startX = rect.left + rect.width / 2;
            const startY = rect.top + rect.height / 2;
            
            // Random explosion pattern
            const angle = (Math.PI * 2 * i) / heartCount + (Math.random() - 0.5) * 0.5;
            const velocity = Math.random() * 100 + 50;
            const endX = startX + Math.cos(angle) * velocity;
            const endY = startY + Math.sin(angle) * velocity - Math.random() * 50 - 30;
            
            heart.style.left = startX + 'px';
            heart.style.top = startY + 'px';
            
            // Apply custom animation
            heart.style.animation = `heartExplosion ${Math.random() * 0.5 + 0.8}s ease-out forwards`;
            
            document.body.appendChild(heart);
            
            setTimeout(() => {
                if (heart.parentNode) {
                    heart.remove();
                }
            }, 1500);
        }, i * 50);
    }
    
    // Add CSS animation if not exists
    if (!document.querySelector('#facebook-like-animation')) {
        const style = document.createElement('style');
        style.id = 'facebook-like-animation';
        style.textContent = `
            @keyframes heartExplosion {
                0% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(0) rotate(0deg);
                }
                15% {
                    opacity: 1;
                    transform: translate(-50%, -50%) scale(1.2) rotate(5deg);
                }
                100% {
                    opacity: 0;
                    transform: translate(calc(-50% + var(--dx, 0px)), calc(-50% + var(--dy, -100px))) scale(0.8) rotate(15deg);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Set random end positions for each heart
    setTimeout(() => {
        const hearts = document.querySelectorAll('[style*="heartExplosion"]');
        hearts.forEach((heart, index) => {
            const angle = (Math.PI * 2 * index) / heartCount + (Math.random() - 0.5) * 0.5;
            const velocity = Math.random() * 100 + 50;
            const dx = Math.cos(angle) * velocity;
            const dy = Math.sin(angle) * velocity - Math.random() * 50 - 30;
            heart.style.setProperty('--dx', dx + 'px');
            heart.style.setProperty('--dy', dy + 'px');
        });
    }, 10);
}

// ==================== SOLUTION MODAL FUNCTIONALITY ====================

function showSolutionModal(postId) {
    const modal = document.getElementById('solutionModal');
    if (!modal) {
        showToast('Solution feature is currently unavailable. Please try again later.', 'error');
        return;
    }
    
    if (modal.style.display === 'flex') {
        return;
    }
    
    modal.innerHTML = '';
    modal.style.display = 'flex';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.innerHTML = `
        <div class="modal-header" style="
            padding: 25px 30px;
            background: linear-gradient(135deg, #4A90E2, #357AE8);
            color: white;
            border-radius: 18px 18px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        ">
            <h3 style="font-size: 20px; font-weight: 700; display: flex; align-items: center; gap: 10px; line-height: 1.3;">
                <i class="fas fa-lightbulb"></i> Offer Your Solution
            </h3>
            <button class="close-modal" style="
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                font-size: 24px;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                cursor: pointer;
                transition: all 0.3s;
                display: flex;
                align-items: center;
                justify-content: center;
            ">&times;</button>
        </div>
        
        <div style="padding: 30px;">
            <div style="margin-bottom: 25px;">
                <label style="display: block; font-weight: 600; margin-bottom: 10px; color: #212121; line-height: 1.4;">
                    Share your knowledge with the community:
                </label>
                <textarea id="solutionText" placeholder="Type your detailed solution here... Be clear, helpful, and kind! ✨" 
                    style="
                        width: 100%;
                        padding: 20px;
                        border: 2px solid #EEEEEE;
                        border-radius: 14px;
                        font-size: 15px;
                        font-family: inherit;
                        resize: vertical;
                        min-height: 150px;
                        transition: all 0.3s;
                        background: #FAFAFA;
                        line-height: 1.5;
                    "></textarea>
                <div id="charCounter" style="text-align: right; font-size: 13px; color: #757575; margin-top: 8px; line-height: 1.4;">
                    0/2000 characters
                </div>
            </div>
            
            <div style="margin: 25px 0;">
                <h4 style="font-size: 15px; font-weight: 600; margin-bottom: 15px; color: #212121; line-height: 1.4;">
                    Add tags to help categorize:
                </h4>
                <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                    <span class="tag-select" data-tag="easy" style="
                        padding: 10px 20px;
                        background: #F5F5F5;
                        border-radius: 50px;
                        font-size: 14px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.3s;
                        line-height: 1.2;
                    ">Easy Fix</span>
                    <span class="tag-select" data-tag="technical" style="
                        padding: 10px 20px;
                        background: #F5F5F5;
                        border-radius: 50px;
                        font-size: 14px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.3s;
                        line-height: 1.2;
                    ">Technical</span>
                    <span class="tag-select" data-tag="creative" style="
                        padding: 10px 20px;
                        background: #F5F5F5;
                        border-radius: 50px;
                        font-size: 14px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.3s;
                        line-height: 1.2;
                    ">Creative</span>
                    <span class="tag-select" data-tag="business" style="
                        padding: 10px 20px;
                        background: #F5F5F5;
                        border-radius: 50px;
                        font-size: 14px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.3s;
                        line-height: 1.2;
                    ">Business</span>
                    <span class="tag-select" data-tag="detailed" style="
                        padding: 10px 20px;
                        background: #F5F5F5;
                        border-radius: 50px;
                        font-size: 14px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.3s;
                        line-height: 1.2;
                    ">Detailed Guide</span>
                </div>
            </div>
            
            <div style="margin: 25px 0;">
                <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; color: #212121; margin-bottom: 15px; line-height: 1.4;">
                    <input type="checkbox" id="allowComments" checked style="width: 20px; height: 20px; accent-color: #1d75e9;">
                    <span>Allow comments on my solution</span>
                </label>
                <label style="display: flex; align-items: center; gap: 12px; cursor: pointer; color: #212121; line-height: 1.4;">
                    <input type="checkbox" id="isExpert" checked style="width: 20px; height: 20px; accent-color: #1d75e9;">
                    <span>Mark as expert solution</span>
                </label>
            </div>
        </div>
        
        <div style="
            padding: 20px 30px;
            background: #F5F5F5;
            display: flex;
            justify-content: flex-end;
            gap: 15px;
            border-radius: 0 0 18px 18px;
        ">
            <button id="cancelSolution" style="
                padding: 12px 30px;
                border: none;
                border-radius: 10px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                background: #EEEEEE;
                color: #212121;
                min-height: 44px;
            ">Cancel</button>
            <button id="submitSolution" data-post-id="${postId}" style="
                padding: 12px 30px;
                border: none;
                border-radius: 10px;
                font-size: 15px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                background: #1d75e9;
                color: white;
                display: flex;
                align-items: center;
                gap: 10px;
                min-height: 44px;
            ">
                <i class="fas fa-paper-plane"></i> Submit Solution
            </button>
        </div>
    `;
    
    modal.appendChild(modalContent);
    
    const closeBtn = modalContent.querySelector('.close-modal');
    const cancelBtn = modalContent.querySelector('#cancelSolution');
    const submitBtn = modalContent.querySelector('#submitSolution');
    const solutionText = modalContent.querySelector('#solutionText');
    const charCounter = modalContent.querySelector('#charCounter');
    const tagSelects = modalContent.querySelectorAll('.tag-select');
    
    const selectedTags = new Set();
    
    if (solutionText && charCounter) {
        solutionText.addEventListener('input', function() {
            const length = this.value.length;
            charCounter.textContent = length + '/2000 characters';
            charCounter.style.color = length > 1800 ? '#E53935' : '#757575';
        });
    }
    
    tagSelects.forEach(tag => {
        tag.addEventListener('click', function() {
            const tagValue = this.getAttribute('data-tag');
            
            if (selectedTags.has(tagValue)) {
                selectedTags.delete(tagValue);
                this.style.background = '#F5F5F5';
                this.style.color = '#212121';
            } else {
                selectedTags.add(tagValue);
                this.style.background = '#1d75e9';
                this.style.color = 'white';
            }
        });
    });
    
    function closeModal() {
        modal.style.opacity = '0';
        setTimeout(() => {
            modal.style.display = 'none';
            modal.style.opacity = '1';
            modal.innerHTML = '';
        }, 300);
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeModal();
        });
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            closeModal();
            showToast('Solution cancelled', 'info');
        });
    }
    
    if (submitBtn && solutionText) {
        submitBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            
            const text = solutionText.value.trim();
            const solutionPostId = this.dataset.postId;
            
            if (!text) {
                showToast('Please write a solution before submitting!', 'error');
                solutionText.focus();
                return;
            }
            
            if (text.length < 20) {
                showToast('Solution should be at least 20 characters!', 'error');
                return;
            }
            
            const post = appData.posts.find(p => p.id == solutionPostId);
            if (post) {
                post.offered = true;
                post.solutions++;
                
                const newSolution = {
                    id: Date.now(),
                    postId: solutionPostId,
                    text: text,
                    tags: Array.from(selectedTags),
                    timestamp: new Date().toISOString(),
                    isExpert: modalContent.querySelector('#isExpert')?.checked || false,
                    allowComments: modalContent.querySelector('#allowComments')?.checked || false
                };
                
                appData.solutions.push(newSolution);
                
                if (authSystem.currentUser && authSystem.currentUser.stats) {
                    authSystem.currentUser.stats.helped++;
                    document.getElementById('helpedCount').textContent = authSystem.currentUser.stats.helped;
                }
                
                saveData();
                
                const offerButton = document.querySelector(`.offer-btn[data-post-id="${solutionPostId}"]`);
                if (offerButton) {
                    offerButton.setAttribute('data-offered', 'true');
                    offerButton.innerHTML = '<i class="fas fa-lightbulb"></i><span>Solution Offered</span>';
                    offerButton.style.background = '#1d75e9';
                    offerButton.style.color = 'white';
                    
                    const postCard = offerButton.closest('.post-card');
                    const statsText = postCard?.querySelector('.stats-text');
                    if (statsText) {
                        const currentText = statsText.textContent;
                        const match = currentText.match(/(\d+)(?=\s*solutions)/);
                        if (match) {
                            const currentSolutions = parseInt(match[1]);
                            const newSolutions = currentSolutions + 1;
                            statsText.textContent = currentText.replace(/(\d+)(?=\s*solutions)/, newSolutions);
                        } else {
                            statsText.textContent = statsText.textContent.replace('0 solutions', '1 solution');
                        }
                    }
                }
                
                showToast('Solution submitted successfully! 🎉 Thank you for helping!', 'success');
                closeModal();
            }
        });
    }
    
    // Remove backdrop click auto-close to prevent automatic closing
    // Users must now use the X button to close modal
    // modal.addEventListener('click', function(e) {
    //     if (e.target === this) {
    //         closeModal();
    //         showToast('Solution cancelled', 'info');
    //     }
    // });
    
    setTimeout(() => {
        solutionText?.focus();
    }, 100);
}

function setupFacebookStylePosts() {
    // Function to check if text is too long and needs "See More"
    function checkTextLength() {
        document.querySelectorAll('.post-text-container').forEach(container => {
            const postText = container.querySelector('.post-text');
            
            // Find the see-more button - it's now right after the text container
            const seeMoreBtn = container.nextElementSibling?.querySelector('.see-more-btn');
            
            if (postText && seeMoreBtn) {
                // Check if text is taller than the container max-height (200px on desktop, 150px on mobile)
                const maxHeight = window.innerWidth <= 600 ? 150 : 200;
                
                if (postText.scrollHeight > maxHeight) {
                    container.classList.add('long-post'); // Add long-post class for fade effect
                    seeMoreBtn.style.display = 'flex'; // Show the button
                    
                    // Check if user already expanded this post
                    try {
                        const postId = seeMoreBtn.dataset.postId;
                        const savedStates = JSON.parse(localStorage.getItem('nexusmind_expanded') || '{}');
                        
                        if (savedStates[postId]) {
                            container.classList.add('expanded');
                            seeMoreBtn.innerHTML = '<span>See Less</span><i class="fas fa-chevron-up"></i>';
                            seeMoreBtn.classList.add('expanded');
                        }
                    } catch (e) {
                        // Ignore errors
                    }
                } else {
                    seeMoreBtn.style.display = 'none'; // Hide if not needed
                    container.classList.remove('long-post'); // Remove long-post class
                }
            }
        });
    }
    
    // Make the function globally accessible
    window.checkTextLength = checkTextLength;
    window.setupFacebookStylePosts = { checkTextLength };
    
    // Handle click on "See More" / "See Less"
    document.addEventListener('click', function(e) {
        const seeMoreBtn = e.target.closest('.see-more-btn');
        if (seeMoreBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            const postId = seeMoreBtn.dataset.postId;
            const container = document.getElementById(`post-text-${postId}`);
            
            if (container) {
                const isExpanded = container.classList.contains('expanded');
                
                if (isExpanded) {
                    // Collapse it - show truncated content
                    container.classList.remove('expanded');
                    seeMoreBtn.innerHTML = '<span>See More</span><i class="fas fa-chevron-down"></i>';
                    seeMoreBtn.classList.remove('expanded');
                    
                    // Save state
                    try {
                        const savedStates = JSON.parse(localStorage.getItem('nexusmind_expanded') || '{}');
                        delete savedStates[postId];
                        localStorage.setItem('nexusmind_expanded', JSON.stringify(savedStates));
                    } catch (e) {
                        // Ignore errors
                    }
                } else {
                    // Expand it - show full content
                    container.classList.add('expanded');
                    seeMoreBtn.innerHTML = '<span>See Less</span><i class="fas fa-chevron-up"></i>';
                    seeMoreBtn.classList.add('expanded');
                    
                    // Save state
                    try {
                        const savedStates = JSON.parse(localStorage.getItem('nexusmind_expanded') || '{}');
                        savedStates[postId] = true;
                        localStorage.setItem('nexusmind_expanded', JSON.stringify(savedStates));
                    } catch (e) {
                        // Ignore errors
                    }
                }
            }
        }
    });
    
    // Check text length initially and when window resizes
    checkTextLength();
    window.addEventListener('resize', checkTextLength);
}

// ==================== COMMENTS SYSTEM ====================

function setupCommentsSystem() {
    // Load saved comments from localStorage
    loadSavedComments();
    
    // Setup comment submission
    setupCommentSubmission();
    
    // Setup comment likes
    setupCommentLikes();
    
    // Setup reply functionality
    setupReplySystem();
}

function loadSavedComments() {
    try {
        const saved = localStorage.getItem('nexusmind_comments');
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && typeof parsed === 'object') {
                // Merge with existing comments
                for (const postId in parsed) {
                    if (!appData.comments[postId]) {
                        appData.comments[postId] = [];
                    }
                    // Add new comments that don't exist yet
                    parsed[postId].forEach(newComment => {
                        const exists = appData.comments[postId].some(c => c.id === newComment.id);
                        if (!exists) {
                            appData.comments[postId].push(newComment);
                        }
                    });
                }
            }
        }
    } catch (error) {
        console.log('Using default comments data');
    }
    
    // Render comments for visible posts
    renderAllComments();
}

function saveComments() {
    try {
        localStorage.setItem('nexusmind_comments', JSON.stringify(appData.comments));
    } catch (error) {
        console.error('Error saving comments:', error);
    }
}

function renderAllComments() {
    // Render comments for all posts that have comments
    for (const postId in appData.comments) {
        renderCommentsForPost(postId);
    }
}

function renderCommentsForPost(postId) {
    console.log('🔍 renderCommentsForPost called for:', postId);
    
    const commentsList = document.getElementById(`comments-list-${postId}`);
    console.log('🔍 Comments list element:', commentsList);
    
    if (!commentsList || !appData.comments[postId]) {
        console.log('❌ No comments list or no comments for post:', postId);
        return;
    }
    
    console.log('🔍 Rendering comments:', appData.comments[postId]);
    
    commentsList.innerHTML = '';
    
    appData.comments[postId].forEach(comment => {
        const commentElement = createCommentElement(comment, postId);
        commentsList.appendChild(commentElement);
    });
    
    console.log('🔍 Comments added to DOM');
    
    // Update comment count badge
    updateCommentCount(postId);
}

function createCommentElement(comment, postId, isReply = false, replyLevel = 0) {
    const div = document.createElement('div');
    div.className = `youtube-comment ${isReply ? 'youtube-comment-reply' : ''}`;
    div.dataset.commentId = comment.id;
    div.style.marginLeft = isReply ? `${replyLevel * 40}px` : '0';
    
    const timeAgo = getTimeAgo(comment.timestamp);
    const currentUser = authSystem.currentUser || appData.currentUser;
    const isAuthor = comment.author.name === currentUser.name;
    
    // Check if comment text is long enough to need truncation
    const isLongComment = comment.text.length > 200;
    const displayText = isLongComment ? comment.text.substring(0, 200) + '...' : comment.text;
    
    div.innerHTML = `
        <div class="youtube-comment-main">
            <div class="youtube-comment-avatar">
                <img src="${comment.author.avatar}" alt="${comment.author.name}" 
                     onerror="this.src='https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'">
                ${isAuthor ? '<div class="author-badge">You</div>' : ''}
            </div>
            <div class="youtube-comment-content">
                <div class="youtube-comment-header">
                    <span class="youtube-comment-author">${comment.author.name}</span>
                    <span class="youtube-comment-time">${timeAgo}</span>
                    ${isAuthor ? '<button class="youtube-comment-edit-btn" data-comment-id="' + comment.id + '"><i class="fas fa-edit"></i></button>' : ''}
                </div>
                <div class="youtube-comment-text ${isLongComment ? 'has-more-btn' : ''}" data-comment-id="${comment.id}" data-full-text="${comment.text}">
                    ${displayText}
                </div>
                ${isLongComment ? `<button class="youtube-comment-more-btn" onclick="toggleCommentText('${comment.id}')">Show more</button>` : ''}
                <div class="youtube-comment-actions">
                    <button class="youtube-like-btn ${comment.likedByUser ? 'liked' : ''}" 
                            data-comment-id="${comment.id}" data-post-id="${postId}">
                        <i class="${comment.likedByUser ? 'fas' : 'far'} fa-thumbs-up"></i>
                        <span class="like-count">${formatLikeCount(comment.likes)}</span>
                    </button>
                    <button class="youtube-dislike-btn" data-comment-id="${comment.id}" data-post-id="${postId}">
                        <i class="far fa-thumbs-down"></i>
                    </button>
                    ${!isReply ? `<button class="youtube-reply-btn" data-comment-id="${comment.id}">Reply</button>` : ''}
                </div>
                ${!isReply ? `
                <div class="youtube-reply-section" style="display: none;">
                    <div class="youtube-reply-form">
                        <div class="youtube-reply-avatar">
                            <img src="${localStorage.getItem(authSystem.STORAGE_KEYS.PROFILE_PHOTO) || 'https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'}" 
                                 alt="Your avatar">
                        </div>
                        <div class="youtube-reply-input-wrapper">
                            <textarea class="youtube-reply-input" placeholder="Add a public reply..." rows="1"></textarea>
                            <div class="youtube-reply-actions">
                                <button class="youtube-reply-cancel-btn">Cancel</button>
                                <button class="youtube-reply-submit-btn" data-comment-id="${comment.id}" data-post-id="${postId}">Reply</button>
                            </div>
                        </div>
                    </div>
                </div>
                ` : ''}
                ${comment.replies && comment.replies.length > 0 ? `
                <div class="youtube-replies-section">
                    <button class="youtube-replies-toggle" data-comment-id="${comment.id}" data-replies-count="${comment.replies.length}">
                        <i class="fas fa-chevron-down"></i>
                        <span>${comment.replies.length} ${comment.replies.length === 1 ? 'reply' : 'replies'}</span>
                    </button>
                    <div class="youtube-replies-container" style="display: none;">
                        ${comment.replies.map(reply => createCommentElement(reply, postId, true, replyLevel + 1).outerHTML).join('')}
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    return div;
}

function updateCommentCount(postId) {
    const commentBtn = document.querySelector(`.comment-btn[data-post-id="${postId}"]`);
    if (!commentBtn || !appData.comments[postId]) return;
    
    const count = appData.comments[postId].length;
    if (count > 0) {
        // Update the badge if it exists, or create one
        let badge = commentBtn.querySelector('.comment-count-badge');
        if (!badge) {
            badge = document.createElement('span');
            badge.className = 'comment-count-badge';
            commentBtn.appendChild(badge);
        }
        badge.textContent = count;
    } else {
        // Remove badge if no comments
        const badge = commentBtn.querySelector('.comment-count-badge');
        if (badge) badge.remove();
    }
}

function getTimeAgo(timestamp) {
    const now = new Date();
    const then = new Date(timestamp);
    const diff = now - then;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    return `${days} day${days !== 1 ? 's' : ''} ago`;
}

function getShortTime(timeAgo) {
    const match = timeAgo.match(/(\d+)\s+(\w+)/);
    if (!match) return timeAgo;
    
    const num = match[1];
    const unit = match[2].charAt(0);
    
    return `${num}${unit}`;
}

function formatLikeCount(count) {
    if (count === 0) return '';
    if (count < 1000) return count.toString();
    if (count < 1000000) return (count / 1000).toFixed(1) + 'K';
    return (count / 1000000).toFixed(1) + 'M';
}

// Toggle comment text expansion
function toggleCommentText(commentId) {
    console.log('🔍 Toggling comment text for:', commentId);
    
    const commentText = document.querySelector(`.youtube-comment-text[data-comment-id="${commentId}"]`);
    const moreBtn = document.querySelector(`.youtube-comment-more-btn[onclick*="${commentId}"]`);
    
    if (commentText) {
        const isExpanded = commentText.classList.contains('expanded');
        const fullText = commentText.dataset.fullText;
        
        if (isExpanded) {
            // Collapse
            commentText.classList.remove('expanded');
            const truncatedText = fullText.length > 200 ? fullText.substring(0, 200) + '...' : fullText;
            commentText.textContent = truncatedText;
            if (moreBtn) moreBtn.textContent = 'Show more';
        } else {
            // Expand
            commentText.classList.add('expanded');
            commentText.textContent = fullText;
            if (moreBtn) moreBtn.textContent = 'Show less';
        }
    }
}

// Simple test function to verify JavaScript is working
window.testCommentSystem = function() {
    console.log('🧪 Testing comment system...');
    
    // Test submitComment function directly
    const testPostId = 'test-' + Date.now();
    
    // Create a test input element
    const testInput = document.createElement('input');
    testInput.type = 'text';
    testInput.value = 'Test comment from test function';
    testInput.id = `comment-input-${testPostId}`;
    document.body.appendChild(testInput);
    
    // Test the submitComment function
    try {
        submitComment(testPostId);
        console.log('✅ submitComment function works!');
        showToast('Test successful! Comment system is working.', 'success');
    } catch (error) {
        console.error('❌ Error in submitComment:', error);
        showToast('Test failed! Check console for errors.', 'error');
    }
    
    // Clean up
    setTimeout(() => {
        document.body.removeChild(testInput);
    }, 2000);
};

// Simple direct comment submission function
function submitComment(postId) {
    console.log('🔍 submitComment called for post:', postId);
    
    const input = document.getElementById(`comment-input-${postId}`);
    console.log('🔍 Input element:', input);
    
    if (input && input.value.trim()) {
        console.log('🔍 Submitting comment:', input.value.trim());
        addComment(postId, input.value.trim());
        input.value = '';
        input.focus();
    } else {
        console.log('❌ No comment text found');
        showToast('Please write a comment first', 'error');
    }
}

function setupCommentSubmission() {
    console.log('🔍 Setting up comment submission...');
    
    // Handle Enter key in comment input
    document.addEventListener('keypress', function(e) {
        if (e.target.classList.contains('comment-input') && e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            const postId = e.target.dataset.postId;
            if (e.target.value.trim()) {
                addComment(postId, e.target.value.trim());
                e.target.value = '';
            }
        }
    });
    
    // Auto-resize reply textareas
    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('youtube-reply-input')) {
            e.target.style.height = 'auto';
            e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
        }
    });
}

function setupCommentLikes() {
    console.log('🔍 Setting up comment likes...');
    
    document.addEventListener('click', function(e) {
        const likeBtn = e.target.closest('.youtube-like-btn');
        if (likeBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            const commentId = likeBtn.dataset.commentId;
            const postId = likeBtn.dataset.postId;
            
            console.log('🔍 Like button clicked:', { commentId, postId });
            
            if (commentId && postId && appData.comments[postId]) {
                toggleYouTubeCommentLike(postId, commentId, likeBtn);
            }
        }
        
        const dislikeBtn = e.target.closest('.youtube-dislike-btn');
        if (dislikeBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            const commentId = dislikeBtn.dataset.commentId;
            const postId = dislikeBtn.dataset.postId;
            
            console.log('🔍 Dislike button clicked:', { commentId, postId });
            
            if (commentId && postId && appData.comments[postId]) {
                toggleYouTubeCommentDislike(postId, commentId, dislikeBtn);
            }
        }
    });
}

function setupReplySystem() {
    console.log('🔍 Setting up reply system...');
    
    document.addEventListener('click', function(e) {
        const replyBtn = e.target.closest('.youtube-reply-btn');
        if (replyBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            const commentId = replyBtn.dataset.commentId;
            const commentItem = replyBtn.closest('.youtube-comment');
            const replySection = commentItem?.querySelector('.youtube-reply-section');
            
            console.log('🔍 Reply button clicked:', { commentId, replySection });
            
            if (replySection) {
                // Toggle reply form visibility
                if (replySection.style.display === 'none' || replySection.style.display === '') {
                    replySection.style.display = 'block';
                    const replyInput = replySection.querySelector('.youtube-reply-input');
                    if (replyInput) {
                        replyInput.focus();
                    }
                    
                    // Close other reply forms
                    document.querySelectorAll('.youtube-reply-section').forEach(section => {
                        if (section !== replySection) {
                            section.style.display = 'none';
                        }
                    });
                } else {
                    replySection.style.display = 'none';
                }
            }
        }
        
        // Handle replies toggle
        const repliesToggle = e.target.closest('.youtube-replies-toggle');
        if (repliesToggle) {
            e.preventDefault();
            e.stopPropagation();
            
            const commentId = repliesToggle.dataset.commentId;
            const commentItem = repliesToggle.closest('.youtube-comment');
            const repliesContainer = commentItem?.querySelector('.youtube-replies-container');
            const icon = repliesToggle.querySelector('i');
            
            console.log('🔍 Replies toggle clicked:', { commentId, repliesContainer });
            
            if (repliesContainer) {
                if (repliesContainer.style.display === 'none' || repliesContainer.style.display === '') {
                    repliesContainer.style.display = 'block';
                    icon.classList.remove('fa-chevron-down');
                    icon.classList.add('fa-chevron-up');
                } else {
                    repliesContainer.style.display = 'none';
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                }
            }
        }
        
        // Handle reply submission
        const replySubmitBtn = e.target.closest('.youtube-reply-submit-btn');
        if (replySubmitBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            const commentId = replySubmitBtn.dataset.commentId;
            const replyForm = replySubmitBtn.closest('.youtube-reply-form');
            const replyInput = replyForm?.querySelector('.youtube-reply-input');
            
            console.log('🔍 Reply submit clicked:', { commentId, replyInput, value: replyInput?.value });
            
            if (replyInput && replyInput.value.trim()) {
                addReply(commentId, replyInput.value.trim());
                replyInput.value = '';
                replyInput.style.height = 'auto';
            } else {
                showToast('Please write a reply first', 'error');
            }
        }
        
        // Handle reply cancel
        const replyCancelBtn = e.target.closest('.youtube-reply-cancel-btn');
        if (replyCancelBtn) {
            e.preventDefault();
            e.stopPropagation();
            
            const replyForm = replyCancelBtn.closest('.youtube-reply-form');
            const replyInput = replyForm?.querySelector('.youtube-reply-input');
            
            if (replyInput) {
                replyInput.value = '';
                replyInput.style.height = 'auto';
            }
            
            const replySection = replyForm.closest('.youtube-reply-section');
            if (replySection) {
                replySection.style.display = 'none';
            }
        }
    });
}

function addComment(postId, text) {
    console.log('🔍 addComment called with:', { postId, text });
    
    if (!appData.comments[postId]) {
        appData.comments[postId] = [];
    }
    
    const currentUser = authSystem.currentUser || appData.currentUser;
    const userAvatar = localStorage.getItem(authSystem.STORAGE_KEYS.PROFILE_PHOTO) || 
                      "https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80";
    
    console.log('🔍 Current user:', currentUser);
    
    const newComment = {
        id: `c${Date.now()}`,
        author: {
            name: currentUser.name,
            avatar: userAvatar
        },
        text: text,
        timestamp: new Date().toISOString(),
        likes: 0,
        likedByUser: false,
        replies: []
    };
    
    console.log('🔍 New comment created:', newComment);
    
    appData.comments[postId].unshift(newComment); // Add at beginning
    saveComments();
    
    console.log('🔍 Comments saved:', appData.comments[postId]);
    
    // Make sure comments section is visible
    const commentsSection = document.querySelector(`.post-comments[data-post-id="${postId}"]`);
    console.log('🔍 Comments section found:', commentsSection);
    
    if (commentsSection) {
        commentsSection.style.display = 'block';
        console.log('🔍 Comments section made visible');
    }
    
    renderCommentsForPost(postId);
    console.log('🔍 Comments rendered for post:', postId);
    
    showToast('Comment posted!', 'success');
}

function toggleYouTubeCommentLike(postId, commentId, likeBtn) {
    const comments = appData.comments[postId];
    if (!comments) return;
    
    const comment = findCommentById(comments, commentId);
    if (!comment) return;
    
    if (comment.likedByUser) {
        // Unlike
        comment.likedByUser = false;
        comment.likes = Math.max(0, comment.likes - 1);
        likeBtn.classList.remove('liked');
        likeBtn.innerHTML = `<i class="far fa-thumbs-up"></i><span class="like-count">${formatLikeCount(comment.likes)}</span>`;
    } else {
        // Like
        comment.likedByUser = true;
        comment.likes++;
        likeBtn.classList.add('liked');
        likeBtn.innerHTML = `<i class="fas fa-thumbs-up"></i><span class="like-count">${formatLikeCount(comment.likes)}</span>`;
        
        // Add animation
        likeBtn.style.transform = 'scale(1.1)';
        setTimeout(() => {
            likeBtn.style.transform = 'scale(1)';
        }, 150);
    }
    
    saveComments();
}

function toggleYouTubeCommentDislike(postId, commentId, dislikeBtn) {
    const comments = appData.comments[postId];
    if (!comments) return;
    
    const comment = findCommentById(comments, commentId);
    if (!comment) return;
    
    // Toggle dislike visual state
    if (dislikeBtn.classList.contains('disliked')) {
        dislikeBtn.classList.remove('disliked');
    } else {
        dislikeBtn.classList.add('disliked');
        
        // If user had liked, remove the like
        const likeBtn = dislikeBtn.parentElement.querySelector('.youtube-like-btn');
        if (likeBtn && comment.likedByUser) {
            comment.likedByUser = false;
            comment.likes = Math.max(0, comment.likes - 1);
            likeBtn.classList.remove('liked');
            likeBtn.innerHTML = `<i class="far fa-thumbs-up"></i><span class="like-count">${formatLikeCount(comment.likes)}</span>`;
        }
    }
    
    saveComments();
}

function findCommentById(comments, commentId) {
    for (const comment of comments) {
        if (comment.id === commentId) return comment;
        if (comment.replies) {
            const found = findCommentById(comment.replies, commentId);
            if (found) return found;
        }
    }
    return null;
}

function addReply(commentId, text) {
    const currentUser = authSystem.currentUser || appData.currentUser;
    const userAvatar = localStorage.getItem(authSystem.STORAGE_KEYS.PROFILE_PHOTO) || 
                      "https://images.unsplash.com/photo-1512485694743-9c9538b4e6e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80";
    
    // Find the comment in any post
    for (const postId in appData.comments) {
        const comments = appData.comments[postId];
        const comment = findCommentById(comments, commentId);
        
        if (comment) {
            if (!comment.replies) comment.replies = [];
            
            const newReply = {
                id: `r${Date.now()}`,
                author: {
                    name: currentUser.name,
                    avatar: userAvatar
                },
                text: text,
                timestamp: new Date().toISOString(),
                likes: 0,
                likedByUser: false
            };
            
            comment.replies.push(newReply);
            saveComments();
            renderCommentsForPost(postId);
            showToast('Reply posted!', 'success');
            return;
        }
    }
}

function checkAndSetupLongPosts() {
    // Run after posts are loaded
    setTimeout(() => {
        document.querySelectorAll('.post-text-container').forEach(container => {
            const postText = container.querySelector('.post-text');
            const readMoreBtn = container.parentElement.querySelector('.read-more-btn');
            
            if (postText && readMoreBtn) {
                // Check if text is taller than container
                if (postText.scrollHeight > 120) {
                    readMoreBtn.style.display = 'inline-flex';
                    
                    // Check localStorage for saved state
                    try {
                        const postId = readMoreBtn.dataset.postId;
                        const postStates = JSON.parse(localStorage.getItem('nexusmind_post_states') || '{}');
                        
                        if (postStates[postId]) {
                            container.classList.add('expanded');
                            readMoreBtn.innerHTML = '<span>Show less</span><i class="fas fa-chevron-up"></i>';
                            readMoreBtn.classList.add('expanded');
                        }
                    } catch (error) {
                        // Ignore localStorage errors
                    }
                }
            }
        });
    }, 100);
}

// ==================== TOOLTIPS FUNCTIONALITY ====================

function setupTooltips() {
    const style = document.createElement('style');
    style.textContent = `
        .tooltip {
            position: fixed;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            white-space: nowrap;
            pointer-events: none;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            transform: translateX(-50%);
            opacity: 0;
            animation: fadeIn 0.2s ease forwards;
        }
        
        .tooltip::after {
            content: '';
            position: absolute;
            bottom: -5px;
            left: 50%;
            transform: translateX(-50%);
            border-left: 5px solid transparent;
            border-right: 5px solid transparent;
            border-top: 5px solid rgba(0, 0, 0, 0.9);
        }
        
        @keyframes fadeIn {
            to { opacity: 1; }
        }
    `;
    document.head.appendChild(style);
    
    document.querySelectorAll('[data-tooltip]').forEach(element => {
        element.addEventListener('mouseenter', function(e) {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('data-tooltip');
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = (rect.left + rect.width / 2) + 'px';
            tooltip.style.top = (rect.top - 10) + 'px';
            
            document.body.appendChild(tooltip);
            this._tooltip = tooltip;
        });
        
        element.addEventListener('mouseleave', function() {
            if (this._tooltip) {
                this._tooltip.remove();
                delete this._tooltip;
            }
        });
    });
}

// ==================== LIVE UPDATES ====================

function setupLiveUpdates() {
    setInterval(updateLiveStats, 8000);
    setInterval(simulateActivity, 12000);
}

function updateLiveStats() {
    const statItems = document.querySelectorAll('.stat-info h4');
    if (statItems.length >= 1) {
        const totalProblems = appData.posts.length + 846;
        statItems[0].textContent = totalProblems.toLocaleString();
        appData.stats.totalProblems = totalProblems;
    }
}

function simulateActivity() {
    appData.posts.forEach(post => {
        const currentUserName = authSystem.currentUser ? authSystem.currentUser.name : appData.currentUser.name;
        if (post.author.name !== currentUserName && Math.random() > 0.7) {
            post.likes += Math.floor(Math.random() * 2);
            
            const postElement = document.querySelector(`[data-post-id="${post.id}"]`);
            if (postElement) {
                const statsText = postElement.querySelector('.stats-text');
                if (statsText) {
                    statsText.textContent = `${post.solutions} solutions • ${post.likes} likes • ${post.comments} comments`;
                }
            }
        }
    });
    
    const notificationBadge = document.querySelector('.nav-link:nth-child(5) .nav-badge');
    if (notificationBadge && Math.random() > 0.8 && notificationBadge.textContent === '0') {
        appData.stats.notificationsBadge = 1;
        notificationBadge.textContent = '1';
        notificationBadge.style.display = 'flex';
        
        notificationBadge.style.animation = 'none';
        setTimeout(() => {
            notificationBadge.style.animation = 'pulse 0.5s ease';
        }, 10);
        
        showToast('New notification! Someone liked your post.', 'info');
    }
}

// ==================== TOAST FUNCTIONALITY ====================

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = 'toast ' + type;
    
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    else if (type === 'error') icon = 'exclamation-circle';
    else if (type === 'warning') icon = 'exclamation-triangle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease forwards';
        setTimeout(() => {
            if (toast.parentNode === container) {
                container.removeChild(toast);
            }
        }, 300);
    }, 4000);
}

// ==================== UTILITY FUNCTIONS ====================

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Helper function to get all tags from container
function getAllTags() {
    const tagsContainer = document.getElementById('tagsContainer');
    if (!tagsContainer) return [];
    
    return Array.from(tagsContainer.querySelectorAll('.profile-tag')).map(tag => 
        tag.textContent.replace('×', '').trim()
    );
}

// ==================== PROBLEMS HIGHLIGHTS FUNCTIONALITY ====================

const problemsHighlights = {
    STORAGE_KEY: 'nexusmind_problems_highlights',
    MAX_HIGHLIGHTS: 8,
    
    init() {
        this.loadHighlights();
        this.setupEventListeners();
        this.updateHighlightsFromPosts();
    },
    
    setupEventListeners() {
        const createBtn = document.getElementById('createProblemHighlight');
        if (createBtn) {
            createBtn.addEventListener('click', () => {
                this.openProblemComposer();
            });
        }
    },
    
    loadHighlights() {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            const highlights = saved ? JSON.parse(saved) : [];
            this.renderHighlights(highlights);
        } catch (error) {
            console.error('Error loading highlights:', error);
            this.renderHighlights([]);
        }
    },
    
    saveHighlights(highlights) {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(highlights));
        } catch (error) {
            console.error('Error saving highlights:', error);
        }
    },
    
    addHighlight(problemData) {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            let highlights = saved ? JSON.parse(saved) : [];
            
            const highlight = {
                id: Date.now(),
                title: problemData.title || this.extractTitle(problemData.content),
                content: problemData.content,
                author: problemData.author,
                timestamp: problemData.timestamp,
                media: problemData.media,
                postId: problemData.id
            };
            
            highlights.unshift(highlight);
            
            if (highlights.length > this.MAX_HIGHLIGHTS) {
                highlights = highlights.slice(0, this.MAX_HIGHLIGHTS);
            }
            
            this.saveHighlights(highlights);
            this.renderHighlights(highlights);
            
            showToast('Problem added to highlights!', 'success');
        } catch (error) {
            console.error('Error adding highlight:', error);
        }
    },
    
    extractTitle(content) {
        const words = content.split(' ').slice(0, 5).join(' ');
        return words.length > 30 ? words.substring(0, 30) + '...' : words;
    },
    
    renderHighlights(highlights) {
        const container = document.getElementById('highlightedProblemsContainer');
        if (!container) return;
        
        container.innerHTML = '';
        
        highlights.forEach(highlight => {
            const card = this.createHighlightCard(highlight);
            container.appendChild(card);
        });
    },
    
    createHighlightCard(highlight) {
        const card = document.createElement('div');
        card.className = 'problem-highlight-card';
        card.dataset.highlightId = highlight.id;
        
        if (highlight.media && highlight.media.length > 0 && highlight.media[0].type === 'image') {
            card.classList.add('has-image');
            card.style.backgroundImage = `url(${highlight.media[0].url})`;
        }
        
        const timeAgo = this.getTimeAgo(new Date(highlight.timestamp));
        
        card.innerHTML = `
            <div class="problem-highlight-inner">
                <div class="card-label">${this.escapeHtml(highlight.title)}</div>
                <div class="problem-preview">${this.escapeHtml(highlight.content)}</div>
                <div class="problem-meta">${timeAgo}</div>
            </div>
        `;
        
        card.addEventListener('click', () => {
            this.openHighlight(highlight);
        });
        
        return card;
    },
    
    openHighlight(highlight) {
        showToast(`Opening: ${highlight.title}`, 'info');
        
        // Find and scroll to the original post if it exists
        if (highlight.postId) {
            const postElement = document.querySelector(`[data-post-id="${highlight.postId}"]`);
            if (postElement) {
                postElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                postElement.classList.add('animate__animated', 'animate__pulse');
                setTimeout(() => {
                    postElement.classList.remove('animate__animated', 'animate__pulse');
                }, 1000);
                return;
            }
        }
        
        // If post not found, show a modal with the highlight details
        this.showHighlightModal(highlight);
    },
    
    showHighlightModal(highlight) {
        // Create a simple modal to display the highlight
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>${this.escapeHtml(highlight.title)}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="highlight-author">
                        <img src="${highlight.author.avatar}" alt="${highlight.author.name}" style="width: 32px; height: 32px; border-radius: 50%; margin-right: 8px;">
                        <strong>${this.escapeHtml(highlight.author.name)}</strong> • ${this.getTimeAgo(new Date(highlight.timestamp))}
                    </div>
                    <div style="margin-top: 16px;">
                        ${highlight.media && highlight.media.length > 0 && highlight.media[0].type === 'image' ? 
                            `<img src="${highlight.media[0].url}" style="width: 100%; border-radius: 8px; margin-bottom: 16px;">` : ''}
                        <p>${this.escapeHtml(highlight.content)}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" onclick="this.closest('.modal').remove()">Close</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Remove backdrop click auto-close to prevent automatic closing
        // Users must now use the X button to close modal
        // modal.addEventListener('click', (e) => {
        //     if (e.target === modal) {
        //         modal.remove();
        //     }
        // });
    },
    
    openProblemComposer() {
        const postInput = document.getElementById('postInput');
        if (postInput) {
            postInput.focus();
            postInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            showToast('Click here to post your problem!', 'info');
        }
    },
    
    updateHighlightsFromPosts() {
        // Auto-add recent posts to highlights if they have media
        if (appData.posts && appData.posts.length > 0) {
            const recentPostsWithMedia = appData.posts
                .filter(post => post.media && post.media.length > 0)
                .slice(0, 3);
            
            recentPostsWithMedia.forEach(post => {
                const saved = localStorage.getItem(this.STORAGE_KEY);
                let highlights = saved ? JSON.parse(saved) : [];
                
                const exists = highlights.some(h => h.postId === post.id);
                if (!exists && highlights.length < this.MAX_HIGHLIGHTS) {
                    this.addHighlight(post);
                }
            });
        }
    },
    
    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago';
        if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago';
        if (seconds < 604800) return Math.floor(seconds / 86400) + 'd ago';
        
        return Math.floor(seconds / 604800) + 'w ago';
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// ==================== ENHANCED FLOATING POST COMPOSER ====================

// Enhanced Post Composer System
const enhancedComposer = {
    modal: null,
    textarea: null,
    emojiPicker: null,
    cameraModal: null,
    selectedTags: new Set(),
    selectedMedia: [],
    isAnonymous: false,
    isUrgent: false,
    
    init() {
        this.modal = document.getElementById('postComposerModal');
        this.textarea = document.getElementById('composerTextarea');
        this.emojiPicker = document.getElementById('emojiPicker');
        this.cameraModal = document.getElementById('cameraModal');
        
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        // Floating post button
        const floatingBtn = document.getElementById('floatingPostBtn');
        if (floatingBtn) {
            floatingBtn.addEventListener('click', () => this.openComposer());
        }
        
        // Close buttons
        const closeBtn = document.getElementById('closeComposer');
        const cancelBtn = document.getElementById('cancelBtn');
        const overlay = this.modal?.querySelector('.composer-overlay');
        
        [closeBtn, cancelBtn, overlay].forEach(btn => {
            if (btn) btn.addEventListener('click', () => this.closeComposer());
        });
        
        // Camera modal buttons
        const cameraCloseBtn = document.getElementById('closeCameraModal');
        const cameraOverlay = this.cameraModal?.querySelector('.camera-overlay');
        
        [cameraCloseBtn, cameraOverlay].forEach(btn => {
            if (btn) btn.addEventListener('click', () => this.closeCameraModal());
        });
        
        // Media upload button - now opens camera modal
        const mediaUploadBtn = document.getElementById('capturePhotoBtn');
        if (mediaUploadBtn) {
            mediaUploadBtn.addEventListener('click', () => this.openCameraModal('photo'));
        }
        
        // Video capture button
        const recordVideoBtn = document.getElementById('recordVideoBtn');
        if (recordVideoBtn) {
            recordVideoBtn.addEventListener('click', () => this.openCameraModal('video'));
        }
        
        // File upload button
        const uploadMediaBtn = document.getElementById('uploadMediaBtn');
        if (uploadMediaBtn) {
            uploadMediaBtn.addEventListener('click', () => this.handleMediaUpload());
        }
        
        // Camera option buttons (these are in the modal, not the media section)
        const takePhotoBtn = document.getElementById('takePhotoBtn');
        const chooseFromGalleryBtn = document.getElementById('chooseFromGalleryBtn');
        
        if (takePhotoBtn) {
            takePhotoBtn.addEventListener('click', () => this.capturePhoto());
        }
        
        // File inputs
        const mediaInput = document.getElementById('mediaInput');
        const photoInput = document.getElementById('photoInput');
        const videoInput = document.getElementById('videoInput');
        
        if (mediaInput) {
            mediaInput.addEventListener('change', (e) => this.handleMediaUpload(e));
        }
        
        if (photoInput) {
            photoInput.addEventListener('change', (e) => this.handleMediaUpload(e));
        }
        
        if (videoInput) {
            videoInput.addEventListener('change', (e) => this.handleMediaUpload(e));
        }
        
        // Camera control buttons
        const closeCameraBtn = document.querySelector('.close-camera');
        const switchCameraBtn = document.getElementById('switchCameraBtn');
        const startCameraBtn = document.getElementById('startCameraBtn');
        const captureBtn = document.getElementById('captureBtn');
        const recordBtn = document.getElementById('recordBtn');
        const stopRecordBtn = document.getElementById('stopRecordBtn');
        const retakeBtn = document.getElementById('retakeBtn');
        const usePhotoBtn = document.getElementById('usePhotoBtn');
        const useVideoBtn = document.getElementById('useVideoBtn');
        
        if (closeCameraBtn) {
            closeCameraBtn.addEventListener('click', () => {
                this.closeCameraModal();
                this.stopCamera();
            });
        }
        
        if (switchCameraBtn) {
            switchCameraBtn.addEventListener('click', () => this.switchCamera());
        }
        
        if (startCameraBtn) {
            startCameraBtn.addEventListener('click', () => this.startCamera());
        }
        
        if (captureBtn) {
            captureBtn.addEventListener('click', () => this.capturePhotoFromStream());
        }
        
        if (recordBtn) {
            recordBtn.addEventListener('click', () => this.startVideoRecording());
        }
        
        if (stopRecordBtn) {
            stopRecordBtn.addEventListener('click', () => this.stopVideoRecording());
        }
        
        if (retakeBtn) {
            retakeBtn.addEventListener('click', () => this.retakePhotoOrVideo());
        }
        
        if (usePhotoBtn) {
            usePhotoBtn.addEventListener('click', () => this.useCapturedPhoto());
        }
        
        if (useVideoBtn) {
            useVideoBtn.addEventListener('click', () => this.useRecordedVideo());
        }
        
        // Emoji picker
        const emojiBtn = document.getElementById('emojiBtn');
        if (emojiBtn) {
            emojiBtn.addEventListener('click', () => this.toggleEmojiPicker());
        }
        
        // Emoji items
        const emojiItems = this.emojiPicker?.querySelectorAll('.emoji-item');
        emojiItems?.forEach(item => {
            item.addEventListener('click', () => this.insertEmoji(item.textContent));
        });
        
        // Tags
        const tagItems = document.querySelectorAll('.tag-item');
        tagItems.forEach(item => {
            item.addEventListener('click', () => this.toggleTag(item));
        });
        
        // Options
        const anonymousBtn = document.getElementById('anonymousBtn');
        const priorityBtn = document.getElementById('priorityBtn');
        
        if (anonymousBtn) {
            anonymousBtn.addEventListener('click', () => this.toggleOption(anonymousBtn, 'anonymous'));
        }
        
        if (priorityBtn) {
            priorityBtn.addEventListener('click', () => this.toggleOption(priorityBtn, 'urgent'));
        }
        
        // Post button
        const postBtn = document.getElementById('postBtn');
        if (postBtn) {
            postBtn.addEventListener('click', () => this.submitPost());
        }
        
        // Remove emoji picker auto-close when clicking outside to prevent automatic closing
        // Users must now use the X button or close it manually
        // document.addEventListener('click', (e) => {
        //     if (!e.target.closest('.emoji-picker-container')) {
        //         this.closeEmojiPicker();
        //     }
        // });
        
        // Remove Escape key auto-close to prevent automatic closing
        // Users must now use the X button to close modals
        // document.addEventListener('keydown', (e) => {
        //     if (e.key === 'Escape') {
        //         if (this.cameraModal?.classList.contains('active')) {
        //             this.closeCameraModal();
        //         } else if (this.modal?.classList.contains('active')) {
        //             this.closeComposer();
        //         }
        //     }
        // });
    },
    
    openComposer() {
        if (this.modal) {
            this.modal.classList.add('active');
            this.textarea?.focus();
            this.resetComposer();
        }
    },
    
    closeComposer() {
        if (this.modal) {
            this.modal.classList.remove('active');
            this.resetComposer();
        }
    },
    
    openCameraModal() {
        if (this.cameraModal) {
            this.cameraModal.classList.add('active');
        }
    },
    
    closeCameraModal() {
        if (this.cameraModal) {
            this.cameraModal.classList.remove('active');
        }
    },
    
    capturePhoto() {
        this.openCameraModal('photo');
    },
    
    captureVideo() {
        this.openCameraModal('video');
    },
    
    openCameraModal(mode = 'photo') {
        if (this.cameraModal) {
            this.cameraMode = mode;
            this.cameraModal.classList.add('active');
            
            // Update title
            const cameraTitle = document.getElementById('cameraTitle');
            if (cameraTitle) {
                cameraTitle.textContent = mode === 'photo' ? 'Capture Photo' : 'Record Video';
            }
            
            // Reset UI
            this.resetCameraUI();
            
            // Start camera automatically
            this.startCamera();
        }
    },
    
    // Camera state
    cameraStream: null,
    mediaRecorder: null,
    recordedChunks: [],
    cameraMode: 'photo',
    isRecording: false,
    currentFacingMode: 'user', // Start with front camera for selfie experience
    
    resetCameraUI() {
        // Hide all control buttons initially
        const buttons = {
            startCameraBtn: document.getElementById('startCameraBtn'),
            captureBtn: document.getElementById('captureBtn'),
            recordBtn: document.getElementById('recordBtn'),
            stopRecordBtn: document.getElementById('stopRecordBtn'),
            retakeBtn: document.getElementById('retakeBtn'),
            usePhotoBtn: document.getElementById('usePhotoBtn'),
            useVideoBtn: document.getElementById('useVideoBtn')
        };
        
        Object.values(buttons).forEach(btn => {
            if (btn) btn.style.display = 'none';
        });
        
        // Reset video and captured image
        const video = document.getElementById('cameraVideo');
        const capturedImage = document.getElementById('capturedImage');
        
        if (video) {
            video.style.display = 'block';
            video.srcObject = null;
        }
        
        if (capturedImage) {
            capturedImage.style.display = 'none';
            capturedImage.src = '';
        }
        
        // Reset recording state
        this.isRecording = false;
        this.recordedChunks = [];
    },
    
    async startCamera() {
        try {
            console.log('🎥 Starting camera...');
            
            // Stop any existing stream
            if (this.cameraStream) {
                this.cameraStream.getTracks().forEach(track => track.stop());
            }
            
            // Request camera access
            const constraints = {
                video: {
                    facingMode: this.currentFacingMode, // Use current facing mode
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: this.cameraMode === 'video'
            };
            
            console.log('📸 Requesting camera with constraints:', constraints);
            this.cameraStream = await navigator.mediaDevices.getUserMedia(constraints);
            console.log('✅ Camera stream obtained');
            
            const video = document.getElementById('cameraVideo');
            if (video) {
                // Ensure video is visible and properly configured
                video.style.display = 'block';
                video.style.visibility = 'visible';
                video.style.opacity = '1';
                video.srcObject = this.cameraStream;
                
                console.log('🎬 Setting video stream...');
                
                // Wait for video to be loaded before playing
                video.onloadedmetadata = () => {
                    console.log('📹 Video metadata loaded');
                    video.play()
                        .then(() => {
                            console.log('🎥 Camera preview started successfully!');
                            showToast('Camera ready! You can see yourself now.', 'success');
                            
                            // Show appropriate controls
                            const startBtn = document.getElementById('startCameraBtn');
                            const captureBtn = document.getElementById('captureBtn');
                            const recordBtn = document.getElementById('recordBtn');
                            
                            if (startBtn) startBtn.style.display = 'none';
                            if (captureBtn && this.cameraMode === 'photo') captureBtn.style.display = 'block';
                            if (recordBtn && this.cameraMode === 'video') recordBtn.style.display = 'block';
                        })
                        .catch(error => {
                            console.error('❌ Error playing video:', error);
                            showToast('Failed to start camera preview', 'error');
                        });
                };
                
                // Handle video load errors
                video.onerror = (error) => {
                    console.error('❌ Video error:', error);
                    showToast('Camera error - please check permissions', 'error');
                };
                
                // Add timeout to detect if video doesn't load
                setTimeout(() => {
                    if (video.readyState < 2) { // HAVE_CURRENT_DATA
                        console.warn('⚠️ Video taking too long to load...');
                        showToast('Camera loading... please wait', 'info');
                    }
                }, 3000);
            } else {
                console.error('❌ Video element not found!');
                showToast('Camera element not found', 'error');
            }
            
        } catch (error) {
            console.error('❌ Error accessing camera:', error);
            let errorMessage = 'Failed to access camera';
            if (error.name === 'NotAllowedError') {
                errorMessage = 'Camera permission denied. Please allow camera access.';
            } else if (error.name === 'NotFoundError') {
                errorMessage = 'No camera found on this device.';
            }
            showToast(errorMessage, 'error');
        }
    },
    
    stopCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
        
        const video = document.getElementById('cameraVideo');
        if (video) {
            video.srcObject = null;
        }
    },
    
    async switchCamera() {
        // Toggle between front and back camera
        this.currentFacingMode = this.currentFacingMode === 'user' ? 'environment' : 'user';
        
        // Show loading state
        const switchBtn = document.getElementById('switchCameraBtn');
        if (switchBtn) {
            switchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Switching...';
            switchBtn.disabled = true;
        }
        
        // Restart camera with new facing mode
        try {
            await this.startCamera();
            
            // Reset button state
            if (switchBtn) {
                switchBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Switch Camera';
                switchBtn.disabled = false;
            }
            
            showToast(`Switched to ${this.currentFacingMode === 'user' ? 'front' : 'back'} camera`, 'success');
        } catch (error) {
            console.error('Error switching camera:', error);
            
            // Reset button state on error
            if (switchBtn) {
                switchBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Switch Camera';
                switchBtn.disabled = false;
            }
            
            showToast('Failed to switch camera', 'error');
        }
    },
    
    capturePhotoFromStream() {
        const video = document.getElementById('cameraVideo');
        const canvas = document.getElementById('cameraCanvas');
        const capturedImage = document.getElementById('capturedImage');
        
        if (!video || !canvas || !capturedImage) return;
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Draw current video frame to canvas
        const context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Convert canvas to image
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            capturedImage.src = url;
            
            // Show captured image and hide video
            video.style.display = 'none';
            capturedImage.style.display = 'block';
            
            // Show appropriate buttons
            const captureBtn = document.getElementById('captureBtn');
            const retakeBtn = document.getElementById('retakeBtn');
            const usePhotoBtn = document.getElementById('usePhotoBtn');
            
            if (captureBtn) captureBtn.style.display = 'none';
            if (retakeBtn) retakeBtn.style.display = 'block';
            if (usePhotoBtn) usePhotoBtn.style.display = 'block';
            
            // Store the captured data
            this.capturedPhotoBlob = blob;
        }, 'image/jpeg', 0.9);
    },
    
    startVideoRecording() {
        if (!this.cameraStream) return;
        
        try {
            this.recordedChunks = [];
            
            const options = {
                mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') ? 'video/webm;codecs=vp9' : 'video/webm'
            };
            
            this.mediaRecorder = new MediaRecorder(this.cameraStream, options);
            
            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };
            
            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                
                // Show recorded video
                const video = document.getElementById('cameraVideo');
                if (video) {
                    video.srcObject = null;
                    video.src = url;
                    video.play();
                }
                
                // Show appropriate buttons
                const recordBtn = document.getElementById('recordBtn');
                const stopRecordBtn = document.getElementById('stopRecordBtn');
                const useVideoBtn = document.getElementById('useVideoBtn');
                const retakeBtn = document.getElementById('retakeBtn');
                
                if (recordBtn) recordBtn.style.display = 'none';
                if (stopRecordBtn) stopRecordBtn.style.display = 'none';
                if (useVideoBtn) useVideoBtn.style.display = 'block';
                if (retakeBtn) retakeBtn.style.display = 'block';
                
                // Store the recorded video
                this.recordedVideoBlob = blob;
                this.isRecording = false;
                
                // Hide recording indicator
                const recordingIndicator = document.getElementById('recordingIndicator');
                if (recordingIndicator) {
                    recordingIndicator.classList.remove('active');
                }
                
                // Remove recording animation from button
                const recordButton = document.getElementById('recordBtn');
                if (recordButton) {
                    recordButton.classList.remove('recording');
                }
            };
            
            this.mediaRecorder.start();
            this.isRecording = true;
            
            // Update UI for recording
            const recordBtn = document.getElementById('recordBtn');
            const stopRecordBtn = document.getElementById('stopRecordBtn');
            
            if (recordBtn) recordBtn.style.display = 'none';
            if (stopRecordBtn) stopRecordBtn.style.display = 'block';
            
            // Show recording indicator
            const recordingIndicator = document.getElementById('recordingIndicator');
            if (recordingIndicator) {
                recordingIndicator.classList.add('active');
            }
            
            // Add recording animation to stop button
            if (stopRecordBtn) {
                stopRecordBtn.classList.add('recording');
            }
            
        } catch (error) {
            console.error('Error starting recording:', error);
            showToast('Failed to start recording', 'error');
        }
    },
    
    stopVideoRecording() {
        if (this.mediaRecorder && this.isRecording) {
            this.mediaRecorder.stop();
        }
    },
    
    retakePhotoOrVideo() {
        // Reset UI to show live camera
        const video = document.getElementById('cameraVideo');
        const capturedImage = document.getElementById('capturedImage');
        const captureBtn = document.getElementById('captureBtn');
        const recordBtn = document.getElementById('recordBtn');
        const retakeBtn = document.getElementById('retakeBtn');
        const usePhotoBtn = document.getElementById('usePhotoBtn');
        const useVideoBtn = document.getElementById('useVideoBtn');
        
        if (video && this.cameraStream) {
            video.style.display = 'block';
            video.srcObject = this.cameraStream;
            // Ensure video plays when retaking
            video.play().catch(error => {
                console.error('Error restarting video preview:', error);
            });
        }
        
        if (capturedImage) {
            capturedImage.style.display = 'none';
            capturedImage.src = '';
        }
        
        // Hide action buttons and show capture/record buttons
        if (retakeBtn) retakeBtn.style.display = 'none';
        if (usePhotoBtn) usePhotoBtn.style.display = 'none';
        if (useVideoBtn) useVideoBtn.style.display = 'none';
        
        if (this.cameraMode === 'photo') {
            if (captureBtn) captureBtn.style.display = 'block';
        } else {
            if (recordBtn) recordBtn.style.display = 'block';
        }
        
        // Clear captured data
        this.capturedPhotoBlob = null;
        this.recordedVideoBlob = null;
    },
    
    useCapturedPhoto() {
        if (!this.capturedPhotoBlob) return;
        
        // Convert blob to data URL for main posting system
        const reader = new FileReader();
        reader.onload = (e) => {
            // Add to main posting system's uploadedMedia
            if (typeof uploadedMedia !== 'undefined') {
                uploadedMedia.push({
                    type: 'image',
                    url: e.target.result,
                    name: `photo_${Date.now()}.jpg`
                });
                
                // Update the media upload button indicator
                const mediaUploadBtn = document.querySelector('.action-option');
                if (mediaUploadBtn) {
                    mediaUploadBtn.innerHTML = `<i class="fas fa-check" style="color: #4CAF50;"></i><span>${uploadedMedia.length} Media</span>`;
                }
            }
            
            // Also add to enhanced composer if it's being used
            if (this.selectedMedia) {
                this.selectedMedia.push({
                    type: 'image',
                    url: e.target.result,
                    name: `photo_${Date.now()}.jpg`
                });
                
                const mediaPreview = document.getElementById('mediaPreview');
                if (mediaPreview) {
                    this.renderMediaPreview({
                        type: 'image',
                        url: e.target.result,
                        name: `photo_${Date.now()}.jpg`
                    }, mediaPreview);
                }
            }
        };
        reader.readAsDataURL(this.capturedPhotoBlob);
        
        // Close camera modal
        this.closeCameraModal();
        this.stopCamera();
        
        showToast('Photo added to your problem!', 'success');
    },
    
    useRecordedVideo() {
        if (!this.recordedVideoBlob) return;
        
        // Convert blob to data URL for main posting system
        const reader = new FileReader();
        reader.onload = (e) => {
            // Add to main posting system's uploadedMedia
            if (typeof uploadedMedia !== 'undefined') {
                uploadedMedia.push({
                    type: 'video',
                    url: e.target.result,
                    name: `video_${Date.now()}.webm`
                });
                
                // Update the media upload button indicator
                const mediaUploadBtn = document.querySelector('.action-option');
                if (mediaUploadBtn) {
                    mediaUploadBtn.innerHTML = `<i class="fas fa-check" style="color: #4CAF50;"></i><span>${uploadedMedia.length} Media</span>`;
                }
            }
            
            // Also add to enhanced composer if it's being used
            if (this.selectedMedia) {
                this.selectedMedia.push({
                    type: 'video',
                    url: e.target.result,
                    name: `video_${Date.now()}.webm`
                });
                
                const mediaPreview = document.getElementById('mediaPreview');
                if (mediaPreview) {
                    this.renderMediaPreview({
                        type: 'video',
                        url: e.target.result,
                        name: `video_${Date.now()}.webm`
                    }, mediaPreview);
                }
            }
        };
        reader.readAsDataURL(this.recordedVideoBlob);
        
        // Close camera modal
        this.closeCameraModal();
        this.stopCamera();
        
        showToast('Video added to your problem!', 'success');
    },
    
    addMediaToComposer(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const mediaItem = {
                type: file.type.startsWith('image/') ? 'image' : 'video',
                url: e.target.result,
                name: file.name
            };
            
            this.selectedMedia.push(mediaItem);
            
            const mediaPreview = document.getElementById('mediaPreview');
            if (mediaPreview) {
                this.renderMediaPreview(mediaItem, mediaPreview);
            }
        };
        
        reader.readAsDataURL(file);
    },
    
    chooseFromGallery() {
        this.closeCameraModal();
        const mediaInput = document.getElementById('mediaInput');
        if (mediaInput) {
            mediaInput.click();
        }
    },
    
    checkCameraPermissions(type) {
        return new Promise((resolve, reject) => {
            // Check if device supports camera
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                reject(new Error('Camera not supported on this device'));
                return;
            }
            
            // Check if we're on HTTPS or localhost (required for camera access)
            if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
                reject(new Error('Camera access requires HTTPS connection'));
                return;
            }
            
            // Check if it's a mobile device that supports capture attribute
            const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            
            if (!isMobile) {
                // For desktop, we might need to request permissions differently
                // For now, we'll proceed and let the file input handle it
                resolve();
                return;
            }
            
            // For mobile, check if capture is supported
            const testInput = document.createElement('input');
            testInput.type = type === 'photo' ? 'file' : 'file';
            testInput.accept = type === 'photo' ? 'image/*' : 'video/*';
            testInput.capture = 'environment';
            
            // Check if capture attribute is supported
            if (!testInput.capture) {
                reject(new Error('Camera capture not supported on this device'));
                return;
            }
            
            resolve();
        });
    },
    
    handleCameraError(type, error) {
        console.error(`Camera ${type} error:`, error);
        
        let errorMessage = 'Unable to access camera';
        let suggestion = 'Please try choosing from gallery instead.';
        
        if (error.name === 'NotAllowedError' || error.message.includes('denied')) {
            errorMessage = 'Camera access denied';
            suggestion = 'Please allow camera access in your browser settings and refresh the page.';
        } else if (error.name === 'NotFoundError' || error.message.includes('not found')) {
            errorMessage = 'Camera not found';
            suggestion = 'No camera device detected. Please check if your camera is connected.';
        } else if (error.name === 'NotReadableError' || error.message.includes('in use')) {
            errorMessage = 'Camera already in use';
            suggestion = 'Camera is being used by another application. Please close other apps using the camera.';
        } else if (error.name === 'OverconstrainedError' || error.message.includes('constraints')) {
            errorMessage = 'Camera constraints not satisfied';
            suggestion = 'Your camera may not support the required resolution. Try again.';
        } else if (error.message.includes('HTTPS')) {
            errorMessage = 'Secure connection required';
            suggestion = 'Camera access requires HTTPS connection.';
        } else if (error.message.includes('not supported')) {
            errorMessage = 'Camera not supported';
            suggestion = 'Your device or browser may not support camera capture. Try choosing from gallery.';
        }
        
        // Show user-friendly error message
        showToast(`${errorMessage}. ${suggestion}`, 'warning');
        
        // Close camera modal and fallback to gallery option
        this.closeCameraModal();
        this.stopCamera();
        
        // Fallback to gallery option after a delay
        setTimeout(() => {
            this.chooseFromGallery();
        }, 2000);
    },
    
    resetComposer() {
        if (this.textarea) this.textarea.value = '';
        this.selectedTags.clear();
        this.selectedMedia = [];
        this.isAnonymous = false;
        this.isUrgent = false;
        
        // Reset UI
        document.querySelectorAll('.tag-item.active').forEach(item => {
            item.classList.remove('active');
        });
        
        document.querySelectorAll('.option-btn.active').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const mediaPreview = document.getElementById('mediaPreview');
        if (mediaPreview) mediaPreview.innerHTML = '';
        
        this.closeEmojiPicker();
    },
    
    toggleEmojiPicker() {
        if (this.emojiPicker) {
            this.emojiPicker.classList.toggle('active');
        }
    },
    
    closeEmojiPicker() {
        if (this.emojiPicker) {
            this.emojiPicker.classList.remove('active');
        }
    },
    
    insertEmoji(emoji) {
        if (this.textarea) {
            const start = this.textarea.selectionStart;
            const end = this.textarea.selectionEnd;
            const text = this.textarea.value;
            
            this.textarea.value = text.substring(0, start) + emoji + text.substring(end);
            this.textarea.selectionStart = this.textarea.selectionEnd = start + emoji.length;
            this.textarea.focus();
        }
        this.closeEmojiPicker();
    },
    
    toggleTag(tagElement) {
        const tag = tagElement.dataset.tag;
        if (this.selectedTags.has(tag)) {
            this.selectedTags.delete(tag);
            tagElement.classList.remove('active');
        } else {
            this.selectedTags.add(tag);
            tagElement.classList.add('active');
        }
    },
    
    toggleOption(button, option) {
        button.classList.toggle('active');
        
        if (option === 'anonymous') {
            this.isAnonymous = !this.isAnonymous;
        } else if (option === 'urgent') {
            this.isUrgent = !this.isUrgent;
        }
    },
    
    handleMediaUpload(event) {
        const files = Array.from(event.target.files);
        const mediaPreview = document.getElementById('mediaPreview');
        
        files.forEach(file => {
            if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    const mediaItem = {
                        type: file.type.startsWith('image/') ? 'image' : 'video',
                        url: e.target.result,
                        name: file.name
                    };
                    
                    this.selectedMedia.push(mediaItem);
                    this.renderMediaPreview(mediaItem, mediaPreview);
                };
                
                reader.readAsDataURL(file);
            }
        });
        
        // Clear input
        event.target.value = '';
    },
    
    renderMediaPreview(mediaItem, container) {
        const previewItem = document.createElement('div');
        previewItem.className = 'media-preview-item';
        
        const mediaElement = mediaItem.type === 'image' 
            ? `<img src="${mediaItem.url}" alt="${mediaItem.name}">`
            : `<video src="${mediaItem.url}" muted></video>`;
        
        previewItem.innerHTML = `
            ${mediaElement}
            <button class="remove-media" onclick="enhancedComposer.removeMedia(${this.selectedMedia.length - 1})">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(previewItem);
    },
    
    removeMedia(index) {
        this.selectedMedia.splice(index, 1);
        this.refreshMediaPreview();
    },
    
    refreshMediaPreview() {
        const mediaPreview = document.getElementById('mediaPreview');
        if (mediaPreview) {
            mediaPreview.innerHTML = '';
            this.selectedMedia.forEach((media, index) => {
                this.renderMediaPreview(media, mediaPreview);
            });
        }
    },
    
    submitPost() {
        const content = this.textarea?.value.trim();
        
        if (!content && this.selectedMedia.length === 0) {
            showToast('Please write a problem or add media', 'warning');
            return;
        }
        
        // Create post with enhanced features
        const problemText = this.buildProblemText(content);
        const tags = Array.from(this.selectedTags);
        
        // Add special tags for options
        if (this.isUrgent) tags.push('urgent');
        if (this.isAnonymous) tags.push('anonymous');
        
        // Create the post using existing function
        createNewPostInData(problemText, this.selectedMedia);
        
        // Update the last post with tags and metadata
        if (appData.posts.length > 0) {
            const lastPost = appData.posts[0];
            lastPost.tags = tags.length > 0 ? tags : ['general'];
            lastPost.isAnonymous = this.isAnonymous;
            lastPost.isUrgent = this.isUrgent;
            
            // Update UI for the new post
            setTimeout(() => {
                const newPostElement = document.querySelector('.post-card');
                if (newPostElement) {
                    this.enhancePostWithFeatures(newPostElement, lastPost);
                }
            }, 100);
        }
        
        saveData();
        this.closeComposer();
        showToast('Problem posted successfully!', 'success');
    },
    
    buildProblemText(content) {
        let text = content;
        
        // Add urgency indicator if urgent
        if (this.isUrgent) {
            text = '🚨 URGENT: ' + text;
        }
        
        // Add anonymous indicator
        if (this.isAnonymous) {
            text = text + ' (Posted anonymously)';
        }
        
        return text;
    },
    
    enhancePostWithFeatures(postElement, postData) {
        // Add tags display with beautiful colors
        if (postData.tags && postData.tags.length > 0) {
            const tagsHTML = postData.tags.map(tag => {
                const tagInfo = this.getTagDisplay(tag);
                return `<span class="post-tag" style="background: ${tagInfo.color}; color: white; border: 1px solid ${tagInfo.color};">${tagInfo.text}</span>`;
            }).join('');
            
            const postContent = postElement.querySelector('.post-content');
            if (postContent) {
                const tagsContainer = document.createElement('div');
                tagsContainer.className = 'post-tags-display';
                tagsContainer.innerHTML = tagsHTML;
                postContent.insertBefore(tagsContainer, postContent.querySelector('.post-stats'));
            }
        }
        
        // Add special styling for urgent posts
        if (postData.isUrgent) {
            postElement.classList.add('urgent-post');
        }
        
        // Add special styling for anonymous posts
        if (postData.isAnonymous) {
            const authorName = postElement.querySelector('.author-name');
            if (authorName) {
                authorName.textContent = 'Anonymous User';
            }
        }
    },
    
    getTagDisplay(tag) {
        const tagDisplays = {
            'business': { text: '💼 Business', color: '#2563eb' },
            'creative': { text: '🎨 Creative', color: '#9333ea' },
            'life': { text: '❤️ Life', color: '#ec4899' },
            'tech': { text: '💻 Tech', color: '#06b6d4' },
            'health': { text: '🏥 Health', color: '#10b981' },
            'education': { text: '📚 Education', color: '#f59e0b' },
            'finance': { text: '💰 Finance', color: '#84cc16' },
            'relationship': { text: '👥 Relationship', color: '#f43f5e' },
            'career': { text: '🚀 Career', color: '#6366f1' },
            'other': { text: '📌 Other', color: '#6b7280' },
            'urgent': { text: '🚨 Urgent', color: '#dc2626' },
            'anonymous': { text: '👤 Anonymous', color: '#6b7280' },
            'general': { text: '📝 General', color: '#6b7280' }
        };
        
        return tagDisplays[tag] || { text: tag, color: '#6b7280' };
    }
};

// Initialize problems highlights when the app loads
function initializeProblemsHighlights() {
    problemsHighlights.init();
}

// Initialize enhanced composer when the app loads
function initializeEnhancedComposer() {
    enhancedComposer.init();
    // Make it globally available
    window.enhancedComposer = enhancedComposer;
}

// Add CSS for post tags display with beautiful colors
const postTagsCSS = `
.post-tags-display {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 16px 0;
}

.post-tag {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 6px 12px;
    border-radius: var(--radius-full);
    font-size: 12px;
    font-weight: 500;
    transition: all var(--transition-normal);
    cursor: pointer;
    position: relative;
    overflow: hidden;
}

.post-tag::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 100%);
    opacity: 0;
    transition: opacity var(--transition-normal);
}

.post-tag:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.post-tag:hover::before {
    opacity: 1;
}

.urgent-post {
    border-left: 4px solid var(--danger-red);
}

.urgent-post .post-tag:first-child {
    background: var(--danger-red) !important;
    border-color: var(--danger-red) !important;
    box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
}
`;

// Inject the CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = postTagsCSS;
document.head.appendChild(styleSheet);

// Extend the createNewPostInData function to also add to highlights
const originalCreateNewPostInData = createNewPostInData;
createNewPostInData = function(problemText, media = []) {
    // Call the original function
    const result = originalCreateNewPostInData.call(this, problemText, media);
    
    // Get the newly created post
    if (appData.posts && appData.posts.length > 0) {
        const newPost = appData.posts[0]; // Most recent post
        
        // Auto-add to highlights if it has media
        if (media && media.length > 0) {
            setTimeout(() => {
                problemsHighlights.addHighlight(newPost);
            }, 1000);
        }
    }
    
    return result;
};
