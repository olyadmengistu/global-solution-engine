// ===== MINDSHIVE - Complete Functional Application =====

// Configuration
const SUPABASE_URL = 'https://fzvjbmukadxcxdkkaauk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6dmpibXVrYWR4Y3hka2thYXVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQ4MTg1OCwiZXhwIjoyMDgwMDU3ODU4fQ.-kGzdsNszwuMi5MrS1MgjInvyswoa40r8MPvbF9ep5Y';

// App State
let appState = {
    currentUser: 'MindHiver',
    activeProblemId: null,
    problems: [],
    solutions: [],
    notifications: [],
    isLoading: false,
    currentPage: 0,
    hasMoreProblems: true,
    currentCategory: 'all',
    currentSort: 'newest'
};

// DOM Elements
let elements = {};

// Supabase Client
let supabase;

// Initialize App
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 MindHive Initializing...');
    
    // Cache DOM elements
    cacheElements();
    
    // Show loading screen
    showLoadingScreen();
    
    try {
        // Initialize Supabase
        await initializeSupabase();
        
        // Load user data
        loadUserData();
        
        // Setup event listeners
        setupEventListeners();
        
        // Load initial data
        await loadInitialData();
        
        // Start live updates
        startLiveUpdates();
        
        console.log('✅ MindHive Ready!');
    } catch (error) {
        console.error('❌ Initialization error:', error);
        showToast('Failed to initialize app. Using demo data.', 'error');
        loadDemoData();
    } finally {
        // Hide loading screen after delay
        setTimeout(() => {
            hideLoadingScreen();
        }, 1000);
    }
});

// Cache DOM Elements
function cacheElements() {
    elements = {
        // User elements
        userName: document.getElementById('userName'),
        userAvatar: document.getElementById('userAvatar'),
        avatarInitial: document.querySelector('.avatar-initial'),
        
        // Input elements
        problemInput: document.getElementById('problemInput'),
        solutionInput: document.getElementById('solutionInput'),
        charCount: document.getElementById('charCount'),
        searchInput: document.getElementById('searchInput'),
        
        // Button elements
        submitProblemBtn: document.getElementById('submitProblem'),
        submitSolutionBtn: document.getElementById('submitSolution'),
        startSolvingBtn: document.getElementById('startSolving'),
        watchDemoBtn: document.getElementById('watchDemo'),
        loadMoreBtn: document.getElementById('loadMoreBtn'),
        closeModalBtn: document.getElementById('closeModal'),
        
        // Container elements
        problemsContainer: document.getElementById('problemsContainer'),
        solutionsList: document.getElementById('solutionsList'),
        trendingSolutions: document.getElementById('trendingSolutions'),
        activityFeed: document.getElementById('activityFeed'),
        recentSolvers: document.getElementById('recentSolvers'),
        topContributors: document.getElementById('topContributors'),
        notificationList: document.getElementById('notificationList'),
        
        // Modal elements
        solutionModal: document.getElementById('solutionModal'),
        modalProblemText: document.getElementById('modalProblemText'),
        modalProblemTitle: document.getElementById('modalProblemTitle'),
        problemAuthor: document.getElementById('problemAuthor'),
        problemTime: document.getElementById('problemTime'),
        problemAvatar: document.getElementById('problemAvatar'),
        problemViews: document.getElementById('problemViews'),
        solutionsCount: document.getElementById('solutionsCount'),
        upvotesCount: document.getElementById('upvotesCount'),
        ratingValue: document.getElementById('ratingValue'),
        totalSolutionsBadge: document.getElementById('totalSolutionsBadge'),
        modalCategory: document.getElementById('modalCategory'),
        
        // Stats elements
        totalProblems: document.getElementById('totalProblems'),
        totalMinds: document.getElementById('totalMinds'),
        totalSolutions: document.getElementById('totalSolutions'),
        successRate: document.getElementById('successRate'),
        challengesCount: document.getElementById('challengesCount'),
        problemsBadge: document.getElementById('problemsBadge'),
        
        // Notification elements
        notificationBell: document.getElementById('notificationBell'),
        notificationPanel: document.getElementById('notificationPanel'),
        notificationCount: document.getElementById('notificationCount'),
        notificationEmpty: document.getElementById('notificationEmpty'),
        clearNotifications: document.getElementById('clearNotifications'),
        
        // Loading elements
        loadingScreen: document.getElementById('loadingScreen'),
        loadingSpinner: document.getElementById('loadingSpinner'),
        emptyState: document.getElementById('emptyState'),
        
        // View elements
        viewToggleBtns: document.querySelectorAll('.view-btn'),
        categoryBtns: document.querySelectorAll('.category'),
        sortSelect: document.getElementById('sortSelect'),
        filterSelect: document.getElementById('filterSelect'),
        solutionSortSelect: document.getElementById('solutionSortSelect')
    };
}

// Initialize Supabase
async function initializeSupabase() {
    try {
        if (typeof window.supabase === 'undefined') {
            console.warn('Supabase SDK not loaded. Loading from CDN...');
            await loadSupabaseSDK();
        }
        
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Supabase initialized');
        return true;
    } catch (error) {
        console.error('❌ Failed to initialize Supabase:', error);
        return false;
    }
}

// Load Supabase SDK dynamically
function loadSupabaseSDK() {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load Supabase SDK'));
        document.head.appendChild(script);
    });
}

// Load User Data
function loadUserData() {
    // Load from localStorage
    const savedUser = localStorage.getItem('mindhive_user');
    if (savedUser) {
        appState.currentUser = savedUser;
        elements.userName.value = savedUser;
    }
    
    // Update avatar
    updateUserAvatar();
    
    // Load notifications
    loadNotifications();
}

// Setup Event Listeners
function setupEventListeners() {
    // User name input
    elements.userName.addEventListener('input', function() {
        appState.currentUser = this.value.trim() || 'Anonymous';
        updateUserAvatar();
        localStorage.setItem('mindhive_user', appState.currentUser);
    });
    
    // Problem input character counter
    elements.problemInput.addEventListener('input', updateCharCounter);
    
    // Search input
    elements.searchInput.addEventListener('input', debounce(searchProblems, 300));
    
    // Submit problem
    elements.submitProblemBtn.addEventListener('click', submitProblem);
    elements.problemInput.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            submitProblem();
        }
    });
    
    // Submit solution
    elements.submitSolutionBtn.addEventListener('click', submitSolution);
    elements.solutionInput.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            submitSolution();
        }
    });
    
    // Start solving button
    elements.startSolvingBtn.addEventListener('click', function() {
        elements.problemInput.focus();
        showToast('Start presenting your challenge!', 'success');
    });
    
    // Watch demo button
    elements.watchDemoBtn.addEventListener('click', function() {
        showToast('Demo feature coming soon!', 'info');
    });
    
    // Modal close
    elements.closeModalBtn.addEventListener('click', closeModal);
    elements.solutionModal.addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
    
    // Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeModal();
    });
    
    // View toggle
    elements.viewToggleBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            elements.viewToggleBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const view = this.dataset.view;
            toggleView(view);
        });
    });
    
    // Category selection
    elements.categoryBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            elements.categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            appState.currentCategory = this.dataset.category;
            filterProblems();
        });
    });
    
    // Sort selection
    elements.sortSelect.addEventListener('change', function() {
        appState.currentSort = this.value;
        sortProblems();
    });
    
    // Filter selection
    elements.filterSelect.addEventListener('change', filterProblems);
    
    // Solution sort selection
    elements.solutionSortSelect.addEventListener('change', sortSolutions);
    
    // Notification bell
    elements.notificationBell.addEventListener('click', toggleNotificationPanel);
    
    // Clear notifications
    elements.clearNotifications.addEventListener('click', clearNotifications);
    
    // Load more (infinite scroll)
    window.addEventListener('scroll', handleScroll);
    
    // Prevent form submission on Enter
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
        }
    });
    
    // Newsletter subscription
    document.getElementById('subscribeBtn')?.addEventListener('click', subscribeNewsletter);
    document.getElementById('footerSubscribeBtn')?.addEventListener('click', subscribeNewsletter);
    
    // Modal action buttons
    document.getElementById('bookmarkModalBtn')?.addEventListener('click', bookmarkProblem);
    document.getElementById('shareModalBtn')?.addEventListener('click', shareProblem);
    document.getElementById('upvoteProblemBtn')?.addEventListener('click', upvoteProblem);
    document.getElementById('followProblemBtn')?.addEventListener('click', followProblem);
    document.getElementById('reportProblemBtn')?.addEventListener('click', reportProblem);
    document.getElementById('cancelSolutionBtn')?.addEventListener('click', cancelSolution);
}

// Load Initial Data
async function loadInitialData() {
    showLoading(true);
    
    try {
        // Load problems
        await loadProblems();
        
        // Load trending solutions
        loadTrendingSolutions();
        
        // Load activity feed
        loadActivityFeed();
        
        // Load recent solvers
        loadRecentSolvers();
        
        // Load top contributors
        loadTopContributors();
        
        // Update stats
        updateStats();
        
    } catch (error) {
        console.error('Error loading initial data:', error);
        throw error;
    } finally {
        showLoading(false);
    }
}

// Load Problems
async function loadProblems() {
    try {
        if (!supabase) {
            throw new Error('Supabase not initialized');
        }
        
        const { data: problems, error } = await supabase
            .from('problems')
            .select('*')
            .order('created_at', { ascending: false })
            .range(appState.currentPage * 9, (appState.currentPage * 9) + 8);
        
        if (error) throw error;
        
        if (problems) {
            appState.problems = appState.currentPage === 0 ? problems : [...appState.problems, ...problems];
            appState.hasMoreProblems = problems.length === 9;
            
            if (appState.problems.length === 0) {
                elements.emptyState.classList.add('active');
                elements.problemsContainer.innerHTML = '';
            } else {
                elements.emptyState.classList.remove('active');
                displayProblems();
            }
            
            // Update counts
            elements.challengesCount.textContent = appState.problems.length;
            elements.problemsBadge.textContent = appState.problems.length;
            
            console.log(`✅ Loaded ${problems.length} problems`);
        }
        
    } catch (error) {
        console.error('Error loading problems:', error);
        // For demo purposes, use mock data
        if (appState.currentPage === 0) {
            appState.problems = getMockProblems();
            displayProblems();
            elements.emptyState.classList.remove('active');
        }
    }
}

// Display Problems
function displayProblems() {
    if (!appState.problems || appState.problems.length === 0) {
        elements.problemsContainer.innerHTML = '';
        elements.emptyState.classList.add('active');
        return;
    }
    
    let problemsToShow = appState.problems;
    
    // Apply filters
    if (appState.currentCategory !== 'all') {
        problemsToShow = problemsToShow.filter(problem => 
            problem.category === appState.currentCategory
        );
    }
    
    // Apply search
    const searchTerm = elements.searchInput.value.trim().toLowerCase();
    if (searchTerm) {
        problemsToShow = problemsToShow.filter(problem =>
            problem.problem_text.toLowerCase().includes(searchTerm) ||
            problem.user_name.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply sort
    sortProblemsArray(problemsToShow);
    
    // Clear container
    elements.problemsContainer.innerHTML = '';
    
    // Add problems
    problemsToShow.forEach(problem => {
        const problemCard = createProblemCard(problem);
        elements.problemsContainer.appendChild(problemCard);
    });
    
    // Update empty state
    if (problemsToShow.length === 0) {
        elements.emptyState.classList.add('active');
    } else {
        elements.emptyState.classList.remove('active');
    }
}

// Create Problem Card
function createProblemCard(problem) {
    const card = document.createElement('div');
    card.className = 'problem-card';
    card.dataset.id = problem.id;
    
    const formattedTime = formatTimeAgo(problem.created_at);
    const solutionsCount = problem.solutions_count || 0;
    const views = Math.floor(Math.random() * 100) + 50;
    const upvotes = Math.floor(Math.random() * 50) + 10;
    
    card.innerHTML = `
        <div class="problem-content">
            "${problem.problem_text}"
        </div>
        <div class="problem-meta">
            <div class="problem-author">
                <div class="author-avatar-small">
                    ${problem.user_name ? problem.user_name.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                    <div class="author-name">${problem.user_name || 'Anonymous'}</div>
                    <div class="problem-time">${formattedTime}</div>
                </div>
            </div>
            <div class="problem-stats">
                <span><i class="fas fa-comment"></i> ${solutionsCount}</span>
                <span><i class="fas fa-eye"></i> ${views}</span>
                <span><i class="fas fa-heart"></i> ${upvotes}</span>
            </div>
        </div>
    `;
    
    // Click to open modal
    card.addEventListener('click', () => openProblemModal(problem));
    
    return card;
}

// Open Problem Modal
async function openProblemModal(problem) {
    console.log('Opening problem modal:', problem.id);
    
    appState.activeProblemId = problem.id;
    
    // Update modal content
    elements.modalProblemTitle.textContent = 'Challenge Details';
    elements.modalProblemText.textContent = problem.problem_text;
    elements.problemAuthor.textContent = problem.user_name || 'Anonymous';
    elements.problemTime.textContent = formatTimeAgo(problem.created_at);
    elements.modalCategory.textContent = problem.category || 'General';
    elements.solutionsCount.textContent = problem.solutions_count || 0;
    elements.totalSolutionsBadge.textContent = problem.solutions_count || 0;
    elements.problemViews.textContent = Math.floor(Math.random() * 100) + 142;
    elements.upvotesCount.textContent = Math.floor(Math.random() * 50) + 20;
    elements.ratingValue.textContent = (Math.random() * 1 + 4).toFixed(1);
    
    // Update avatar
    const initial = problem.user_name ? problem.user_name.charAt(0).toUpperCase() : 'A';
    elements.problemAvatar.textContent = initial;
    
    // Update solved badge
    const solvedBadge = document.getElementById('modalSolvedBadge');
    if (problem.solutions_count > 0) {
        solvedBadge.style.display = 'inline-flex';
    } else {
        solvedBadge.style.display = 'none';
    }
    
    // Load solutions
    await loadProblemSolutions(problem.id);
    
    // Show modal
    elements.solutionModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Add animation
    document.querySelector('.modal-container').style.animation = 'slideIn 0.3s ease';
    
    // Track view (in a real app, this would be an API call)
    incrementProblemViews(problem.id);
}

// Load Problem Solutions
async function loadProblemSolutions(problemId) {
    try {
        if (!supabase) {
            throw new Error('Supabase not initialized');
        }
        
        const { data: solutions, error } = await supabase
            .from('solutions')
            .select('*')
            .eq('problem_id', problemId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        appState.solutions = solutions || [];
        displaySolutions();
        
    } catch (error) {
        console.error('Error loading solutions:', error);
        // Use mock solutions for demo
        appState.solutions = getMockSolutions(problemId);
        displaySolutions();
    }
}

// Display Solutions
function displaySolutions() {
    const container = elements.solutionsList;
    
    if (!appState.solutions || appState.solutions.length === 0) {
        container.innerHTML = `
            <div class="solution-item" style="text-align: center; padding: 3rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem; color: #cbd5e1;">💭</div>
                <h4 style="color: #64748b; margin-bottom: 0.5rem;">No Solutions Yet</h4>
                <p style="color: #94a3b8;">Be the first to share your wisdom with the community.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    appState.solutions.forEach((solution, index) => {
        const solutionElement = createSolutionElement(solution, index);
        container.appendChild(solutionElement);
    });
}

// Create Solution Element
function createSolutionElement(solution, index) {
    const element = document.createElement('div');
    element.className = 'solution-item';
    
    const formattedTime = formatTimeAgo(solution.created_at);
    const upvotes = solution.upvotes || 0;
    const downvotes = solution.downvotes || 0;
    
    element.innerHTML = `
        <div class="solution-header">
            <div class="solution-author">
                <div class="author-avatar-small">
                    ${solution.user_name ? solution.user_name.charAt(0).toUpperCase() : 'A'}
                </div>
                <div>
                    <div class="author-name">${solution.user_name || 'Anonymous'}</div>
                    <div class="problem-time">${formattedTime}</div>
                </div>
            </div>
            <div class="solution-actions">
                <button class="action-btn" onclick="voteSolution(${solution.id}, 'up', this)">
                    <i class="fas fa-chevron-up"></i>
                    <span>${upvotes}</span>
                </button>
                <button class="action-btn" onclick="voteSolution(${solution.id}, 'down', this)">
                    <i class="fas fa-chevron-down"></i>
                    <span>${downvotes}</span>
                </button>
            </div>
        </div>
        <div class="solution-content">
            ${solution.solution_text}
        </div>
    `;
    
    return element;
}

// Submit Problem
async function submitProblem() {
    const input = elements.problemInput;
    const text = input.value.trim();
    const userName = appState.currentUser;
    
    // Validation
    if (!text) {
        showToast('Please describe your challenge', 'error');
        input.focus();
        return;
    }
    
    if (text.length < 20) {
        showToast('Please provide more details (minimum 20 characters)', 'error');
        return;
    }
    
    if (text.length > 500) {
        showToast('Challenge too long (max 500 characters)', 'error');
        return;
    }
    
    const button = elements.submitProblemBtn;
    const originalHTML = button.innerHTML;
    
    // Show loading
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    button.disabled = true;
    
    try {
        if (!supabase) {
            throw new Error('Supabase not initialized');
        }
        
        const category = document.querySelector('.category.active')?.dataset.category || 'all';
        
        // Insert into database
        const { data, error } = await supabase
            .from('problems')
            .insert([
                {
                    problem_text: text,
                    user_name: userName,
                    category: category,
                    solutions_count: 0,
                    created_at: new Date().toISOString()
                }
            ])
            .select();
        
        if (error) throw error;
        
        // Success
        showToast('Challenge submitted to the hive!', 'success');
        
        // Clear input
        input.value = '';
        updateCharCounter();
        
        // Add to problems list
        if (data && data[0]) {
            appState.problems.unshift(data[0]);
            displayProblems();
            
            // Update stats
            updateStats();
            
            // Add activity
            addActivity({
                user: userName,
                action: 'presented a new challenge',
                time: 'just now',
                icon: 'bullhorn'
            });
            
            // Add notification
            addNotification({
                type: 'success',
                message: 'Your challenge has been published!',
                time: 'just now'
            });
            
            // Show confetti
            showConfetti();
        }
        
    } catch (error) {
        console.error('Error submitting problem:', error);
        showToast('Failed to submit. Please try again.', 'error');
        
        // For demo, add locally
        const newProblem = {
            id: Date.now(),
            problem_text: text,
            user_name: userName,
            category: document.querySelector('.category.active')?.dataset.category || 'all',
            solutions_count: 0,
            created_at: new Date().toISOString()
        };
        
        appState.problems.unshift(newProblem);
        displayProblems();
        showToast('Challenge added locally!', 'success');
        
    } finally {
        // Reset button
        button.innerHTML = originalHTML;
        button.disabled = false;
    }
}

// Submit Solution
async function submitSolution() {
    const input = elements.solutionInput;
    const text = input.value.trim();
    
    if (!text) {
        showToast('Please write a solution', 'error');
        input.focus();
        return;
    }
    
    if (!appState.activeProblemId) {
        showToast('No problem selected', 'error');
        return;
    }
    
    const userName = appState.currentUser;
    const isAnonymous = document.getElementById('anonymousCheckbox').checked;
    const displayName = isAnonymous ? 'Anonymous' : userName;
    
    const button = elements.submitSolutionBtn;
    const originalHTML = button.innerHTML;
    
    // Show loading
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';
    button.disabled = true;
    
    try {
        if (!supabase) {
            throw new Error('Supabase not initialized');
        }
        
        // Insert solution
        const { data, error } = await supabase
            .from('solutions')
            .insert([
                {
                    problem_id: appState.activeProblemId,
                    solution_text: text,
                    user_name: displayName,
                    upvotes: 0,
                    downvotes: 0,
                    created_at: new Date().toISOString()
                }
            ])
            .select();
        
        if (error) throw error;
        
        // Update problem solutions count
        await supabase.rpc('increment_solutions', { problem_id: appState.activeProblemId });
        
        // Success
        showToast('Solution shared with the community!', 'success');
        
        // Clear input
        input.value = '';
        document.getElementById('anonymousCheckbox').checked = false;
        
        // Add to solutions list
        if (data && data[0]) {
            appState.solutions.unshift(data[0]);
            displaySolutions();
            
            // Update modal counts
            const currentCount = parseInt(elements.solutionsCount.textContent);
            elements.solutionsCount.textContent = currentCount + 1;
            elements.totalSolutionsBadge.textContent = currentCount + 1;
            
            // Add activity
            addActivity({
                user: displayName,
                action: 'shared a solution',
                time: 'just now',
                icon: 'lightbulb'
            });
            
            // Add notification
            addNotification({
                type: 'info',
                message: 'Someone replied to your challenge!',
                time: 'just now'
            });
        }
        
    } catch (error) {
        console.error('Error submitting solution:', error);
        showToast('Failed to post solution. Please try again.', 'error');
        
        // For demo, add locally
        const newSolution = {
            id: Date.now(),
            problem_id: appState.activeProblemId,
            solution_text: text,
            user_name: displayName,
            upvotes: 0,
            downvotes: 0,
            created_at: new Date().toISOString()
        };
        
        appState.solutions.unshift(newSolution);
        displaySolutions();
        showToast('Solution added locally!', 'success');
        
    } finally {
        // Reset button
        button.innerHTML = originalHTML;
        button.disabled = false;
    }
}

// Vote Solution (global function for onclick)
window.voteSolution = async function(solutionId, type, buttonElement) {
    try {
        // Update UI immediately for better UX
        const span = buttonElement.querySelector('span');
        const currentVotes = parseInt(span.textContent);
        span.textContent = currentVotes + 1;
        
        // Disable button temporarily
        buttonElement.disabled = true;
        
        if (!supabase) {
            throw new Error('Supabase not initialized');
        }
        
        // In a real app, this would be an API call
        // For demo, just update locally
        const solution = appState.solutions.find(s => s.id === solutionId);
        if (solution) {
            if (type === 'up') {
                solution.upvotes = (solution.upvotes || 0) + 1;
            } else {
                solution.downvotes = (solution.downvotes || 0) + 1;
            }
        }
        
        showToast('Vote recorded!', 'success');
        
    } catch (error) {
        console.error('Error voting:', error);
        showToast('Vote failed. Please try again.', 'error');
    }
};

// Load Trending Solutions
function loadTrendingSolutions() {
    const trending = [
        {
            text: "Implement AI-powered recycling sorting systems in urban centers",
            votes: 142,
            author: "Tech Innovator"
        },
        {
            text: "Create community-based renewable energy cooperatives",
            votes: 98,
            author: "Energy Expert"
        },
        {
            text: "Develop blockchain-based transparent supply chains",
            votes: 76,
            author: "Blockchain Specialist"
        },
        {
            text: "Use gamification to encourage sustainable habits",
            votes: 65,
            author: "UX Designer"
        }
    ];
    
    const container = elements.trendingSolutions;
    if (!container) return;
    
    container.innerHTML = '';
    
    trending.forEach((item, index) => {
        const element = document.createElement('div');
        element.className = 'trending-item';
        element.innerHTML = `
            <div class="trending-rank">${index + 1}</div>
            <div class="trending-content">
                <div class="trending-text">${item.text}</div>
                <div class="trending-meta">
                    <span>${item.votes} votes</span>
                    <span>• ${item.author}</span>
                </div>
            </div>
        `;
        container.appendChild(element);
    });
}

// Load Activity Feed
function loadActivityFeed() {
    const activities = [
        {
            user: 'Alex Chen',
            action: 'solved the AI ethics challenge',
            time: '2 minutes ago',
            icon: 'check-circle'
        },
        {
            user: 'Startup Team',
            action: 'presented a funding challenge',
            time: '15 minutes ago',
            icon: 'bullhorn'
        },
        {
            user: 'Research Group',
            action: 'joined MindHive',
            time: '1 hour ago',
            icon: 'user-plus'
        },
        {
            user: 'Community',
            action: 'reached 10,000 active solvers',
            time: '2 hours ago',
            icon: 'trophy'
        }
    ];
    
    const container = elements.activityFeed;
    if (!container) return;
    
    container.innerHTML = '';
    
    activities.forEach((activity) => {
        const element = document.createElement('div');
        element.className = 'activity-item';
        element.innerHTML = `
            <div class="activity-icon">
                <i class="fas fa-${activity.icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-text"><strong>${activity.user}</strong> ${activity.action}</div>
                <div class="activity-time">${activity.time}</div>
            </div>
        `;
        container.appendChild(element);
    });
}

// Load Recent Solvers
function loadRecentSolvers() {
    const solvers = [
        { name: 'Sarah M.', score: '42 solutions', rank: 1 },
        { name: 'David K.', score: '38 solutions', rank: 2 },
        { name: 'Emma L.', score: '35 solutions', rank: 3 },
        { name: 'James P.', score: '31 solutions', rank: 4 }
    ];
    
    const container = elements.recentSolvers;
    if (!container) return;
    
    container.innerHTML = '';
    
    solvers.forEach(solver => {
        const element = document.createElement('div');
        element.className = 'solver-item';
        element.innerHTML = `
            <div class="solver-rank">${solver.rank}</div>
            <div class="solver-avatar">${solver.name.charAt(0)}</div>
            <div class="solver-info">
                <div class="solver-name">${solver.name}</div>
                <div class="solver-score">${solver.score}</div>
            </div>
        `;
        container.appendChild(element);
    });
}

// Load Top Contributors
function loadTopContributors() {
    const contributors = [
        { name: 'Alex Chen', score: '1,245 points', rank: 1 },
        { name: 'Maria G.', score: '987 points', rank: 2 },
        { name: 'Tom B.', score: '842 points', rank: 3 },
        { name: 'Lisa W.', score: '798 points', rank: 4 }
    ];
    
    const container = elements.topContributors;
    if (!container) return;
    
    container.innerHTML = '';
    
    contributors.forEach(contributor => {
        const element = document.createElement('div');
        element.className = 'contributor-item';
        element.innerHTML = `
            <div class="contributor-rank">${contributor.rank}</div>
            <div class="contributor-avatar">${contributor.name.charAt(0)}</div>
            <div class="contributor-info">
                <div class="contributor-name">${contributor.name}</div>
                <div class="contributor-score">${contributor.score}</div>
            </div>
        `;
        container.appendChild(element);
    });
}

// Update Stats
function updateStats() {
    // Update counts
    const totalProblems = appState.problems.length;
    const totalMinds = 12459 + Math.floor(Math.random() * 10);
    const totalSolutions = appState.problems.reduce((sum, problem) => 
        sum + (problem.solutions_count || 0), 0
    );
    
    elements.totalProblems.textContent = totalProblems.toLocaleString();
    elements.totalMinds.textContent = totalMinds.toLocaleString();
    elements.totalSolutions.textContent = totalSolutions.toLocaleString();
    
    // Update challenges count
    elements.challengesCount.textContent = totalProblems;
    elements.problemsBadge.textContent = totalProblems;
}

// Update Character Counter
function updateCharCounter() {
    const length = elements.problemInput.value.length;
    elements.charCount.textContent = `${length}/500`;
    
    if (length > 480) {
        elements.charCount.className = 'char-count error';
    } else if (length > 450) {
        elements.charCount.className = 'char-count warning';
    } else {
        elements.charCount.className = 'char-count';
    }
}

// Update User Avatar
function updateUserAvatar() {
    const initial = appState.currentUser.charAt(0).toUpperCase();
    elements.avatarInitial.textContent = initial;
}

// Close Modal
function closeModal() {
    elements.solutionModal.style.display = 'none';
    document.body.style.overflow = 'auto';
    elements.solutionInput.value = '';
    document.getElementById('anonymousCheckbox').checked = false;
    appState.activeProblemId = null;
}

// Filter Problems
function filterProblems() {
    displayProblems();
}

// Sort Problems
function sortProblems() {
    displayProblems();
}

// Sort Problems Array
function sortProblemsArray(problems) {
    switch(appState.currentSort) {
        case 'newest':
            problems.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'popular':
            problems.sort((a, b) => (b.solutions_count || 0) - (a.solutions_count || 0));
            break;
        case 'solved':
            problems.sort((a, b) => (b.solutions_count || 0) - (a.solutions_count || 0));
            break;
        case 'trending':
            problems.sort((a, b) => {
                const aScore = (a.solutions_count || 0) * 2 + (Math.random() * 10);
                const bScore = (b.solutions_count || 0) * 2 + (Math.random() * 10);
                return bScore - aScore;
            });
            break;
    }
}

// Sort Solutions
function sortSolutions() {
    if (!appState.solutions) return;
    
    const sortBy = elements.solutionSortSelect.value;
    
    switch(sortBy) {
        case 'newest':
            appState.solutions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'top':
            appState.solutions.sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0));
            break;
        case 'helpful':
            appState.solutions.sort((a, b) => {
                const aScore = (b.upvotes || 0) - (b.downvotes || 0);
                const bScore = (a.upvotes || 0) - (a.downvotes || 0);
                return aScore - bScore;
            });
            break;
    }
    
    displaySolutions();
}

// Toggle View
function toggleView(view) {
    if (view === 'grid') {
        elements.problemsContainer.classList.remove('list-view');
    } else {
        elements.problemsContainer.classList.add('list-view');
    }
}

// Search Problems
function searchProblems() {
    displayProblems();
}

// Handle Scroll (Infinite Scroll)
function handleScroll() {
    if (appState.isLoading || !appState.hasMoreProblems) return;
    
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (scrollTop + windowHeight >= documentHeight - 100) {
        loadMoreProblems();
    }
}

// Load More Problems
async function loadMoreProblems() {
    if (appState.isLoading || !appState.hasMoreProblems) return;
    
    appState.isLoading = true;
    appState.currentPage++;
    
    elements.loadingSpinner.classList.add('active');
    
    try {
        await loadProblems();
    } catch (error) {
        console.error('Error loading more problems:', error);
        appState.hasMoreProblems = false;
    } finally {
        appState.isLoading = false;
        elements.loadingSpinner.classList.remove('active');
    }
}

// Add Activity
function addActivity(activity) {
    const container = elements.activityFeed;
    if (!container) return;
    
    const element = document.createElement('div');
    element.className = 'activity-item';
    element.style.animation = 'slideIn 0.3s ease';
    element.innerHTML = `
        <div class="activity-icon">
            <i class="fas fa-${activity.icon}"></i>
        </div>
        <div class="activity-content">
            <div class="activity-text"><strong>${activity.user}</strong> ${activity.action}</div>
            <div class="activity-time">${activity.time}</div>
        </div>
    `;
    
    container.insertBefore(element, container.firstChild);
    
    // Remove oldest activity if more than 5
    if (container.children.length > 5) {
        container.removeChild(container.lastChild);
    }
}

// Load Notifications
function loadNotifications() {
    const notifications = JSON.parse(localStorage.getItem('mindhive_notifications') || '[]');
    appState.notifications = notifications;
    updateNotificationUI();
}

// Update Notification UI
function updateNotificationUI() {
    const unreadCount = appState.notifications.filter(n => !n.read).length;
    
    elements.notificationCount.textContent = unreadCount;
    elements.notificationCount.style.display = unreadCount > 0 ? 'flex' : 'none';
    
    // Update notification list
    const container = elements.notificationList;
    container.innerHTML = '';
    
    if (appState.notifications.length === 0) {
        elements.notificationEmpty.style.display = 'block';
        return;
    }
    
    elements.notificationEmpty.style.display = 'none';
    
    appState.notifications.forEach((notification, index) => {
        const element = document.createElement('div');
        element.className = `notification-item ${notification.read ? '' : 'unread'}`;
        element.dataset.index = index;
        element.innerHTML = `
            <div class="notification-content">
                <div class="notification-icon">
                    <i class="fas fa-${getNotificationIcon(notification.type)}"></i>
                </div>
                <div>
                    <div class="notification-text">${notification.message}</div>
                    <div class="notification-time">${notification.time}</div>
                </div>
            </div>
        `;
        
        element.addEventListener('click', () => markNotificationAsRead(index));
        container.appendChild(element);
    });
}

// Add Notification
function addNotification(notification) {
    notification.read = false;
    appState.notifications.unshift(notification);
    
    // Keep only last 20 notifications
    if (appState.notifications.length > 20) {
        appState.notifications.pop();
    }
    
    // Save to localStorage
    localStorage.setItem('mindhive_notifications', JSON.stringify(appState.notifications));
    
    // Update UI
    updateNotificationUI();
    
    // Show notification badge animation
    elements.notificationCount.classList.add('pulse');
    setTimeout(() => {
        elements.notificationCount.classList.remove('pulse');
    }, 1000);
}

// Get Notification Icon
function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

// Mark Notification as Read
function markNotificationAsRead(index) {
    if (appState.notifications[index]) {
        appState.notifications[index].read = true;
        localStorage.setItem('mindhive_notifications', JSON.stringify(appState.notifications));
        updateNotificationUI();
    }
}

// Clear Notifications
function clearNotifications() {
    appState.notifications = [];
    localStorage.setItem('mindhive_notifications', '[]');
    updateNotificationUI();
    showToast('Notifications cleared', 'success');
}

// Toggle Notification Panel
function toggleNotificationPanel() {
    elements.notificationPanel.classList.toggle('active');
}

// Subscribe Newsletter
function subscribeNewsletter() {
    const emailInput = document.getElementById('newsletterEmail') || document.getElementById('footerEmail');
    const email = emailInput.value.trim();
    
    if (!email || !validateEmail(email)) {
        showToast('Please enter a valid email address', 'error');
        return;
    }
    
    // In a real app, this would be an API call
    showToast('Subscribed to newsletter!', 'success');
    emailInput.value = '';
    
    // Add notification
    addNotification({
        type: 'success',
        message: 'You\'re subscribed to our newsletter',
        time: 'just now'
    });
}

// Bookmark Problem
function bookmarkProblem() {
    const btn = document.getElementById('bookmarkModalBtn');
    const icon = btn.querySelector('i');
    
    if (icon.classList.contains('far')) {
        icon.className = 'fas fa-bookmark';
        showToast('Challenge bookmarked', 'success');
    } else {
        icon.className = 'far fa-bookmark';
        showToast('Bookmark removed', 'info');
    }
}

// Share Problem
function shareProblem() {
    if (navigator.share) {
        navigator.share({
            title: 'MindHive Challenge',
            text: 'Check out this challenge on MindHive!',
            url: window.location.href
        });
    } else {
        navigator.clipboard.writeText(window.location.href);
        showToast('Link copied to clipboard!', 'success');
    }
}

// Upvote Problem
function upvoteProblem() {
    const btn = document.getElementById('upvoteProblemBtn');
    const span = btn.querySelector('span');
    const currentVotes = parseInt(elements.upvotesCount.textContent);
    
    elements.upvotesCount.textContent = currentVotes + 1;
    span.textContent = 'Upvoted';
    btn.disabled = true;
    
    showToast('Upvote recorded!', 'success');
}

// Follow Problem
function followProblem() {
    const btn = document.getElementById('followProblemBtn');
    const icon = btn.querySelector('i');
    const text = btn.querySelector('span');
    
    if (icon.classList.contains('far')) {
        icon.className = 'fas fa-bell';
        text.textContent = 'Following';
        showToast('You will receive updates about this challenge', 'success');
    } else {
        icon.className = 'far fa-bell';
        text.textContent = 'Follow';
        showToast('You will no longer receive updates', 'info');
    }
}

// Report Problem
function reportProblem() {
    showToast('Report submitted. Thank you!', 'success');
}

// Cancel Solution
function cancelSolution() {
    elements.solutionInput.value = '';
    document.getElementById('anonymousCheckbox').checked = false;
    showToast('Solution cancelled', 'info');
}

// Show Loading
function showLoading(loading) {
    appState.isLoading = loading;
    if (loading) {
        document.body.style.cursor = 'wait';
    } else {
        document.body.style.cursor = 'default';
    }
}

// Show Loading Screen
function showLoadingScreen() {
    elements.loadingScreen.classList.remove('hidden');
}

// Hide Loading Screen
function hideLoadingScreen() {
    elements.loadingScreen.classList.add('hidden');
}

// Show Toast
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${getToastIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Remove toast after 5 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 5000);
}

// Get Toast Icon
function getToastIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        case 'info': return 'info-circle';
        default: return 'check-circle';
    }
}

// Show Confetti
function showConfetti() {
    const container = document.getElementById('confettiContainer');
    if (!container) return;
    
    const colors = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ec4899'];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.borderRadius = '50%';
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-20px';
        confetti.style.zIndex = '9999';
        confetti.style.opacity = '0.8';
        
        container.appendChild(confetti);
        
        const animation = confetti.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
            { transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ], {
            duration: 3000 + Math.random() * 2000,
            easing: 'cubic-bezier(0.215, 0.61, 0.355, 1)'
        });
        
        animation.onfinish = () => confetti.remove();
    }
}

// Format Time Ago
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    if (seconds < 2592000) return Math.floor(seconds / 86400) + ' days ago';
    if (seconds < 31536000) return Math.floor(seconds / 2592000) + ' months ago';
    return Math.floor(seconds / 31536000) + ' years ago';
}

// Validate Email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Debounce function
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

// Increment Problem Views (mock)
function incrementProblemViews(problemId) {
    // In a real app, this would be an API call
    console.log(`Incrementing views for problem ${problemId}`);
}

// Start Live Updates
function startLiveUpdates() {
    // Update stats every 30 seconds
    setInterval(() => {
        updateStats();
        
        // Occasionally add random activity
        if (Math.random() > 0.7) {
            const users = ['AI Assistant', 'Research Team', 'Global Mind', 'Community'];
            const actions = [
                'is analyzing solutions',
                'just joined the discussion',
                'validated a solution',
                'added new insights'
            ];
            
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomAction = actions[Math.floor(Math.random() * actions.length)];
            
            addActivity({
                user: randomUser,
                action: randomAction,
                time: 'just now',
                icon: 'bolt'
            });
        }
        
        // Randomly update trending
        if (Math.random() > 0.9) {
            loadTrendingSolutions();
        }
        
        // Random notification
        if (Math.random() > 0.95 && appState.problems.length > 0) {
            const randomProblem = appState.problems[Math.floor(Math.random() * appState.problems.length)];
            addNotification({
                type: 'info',
                message: `New solution added to "${randomProblem.problem_text.substring(0, 50)}..."`,
                time: '1 min ago'
            });
        }
        
    }, 30000);
}

// Load Demo Data (fallback)
function loadDemoData() {
    appState.problems = getMockProblems();
    displayProblems();
    loadTrendingSolutions();
    loadActivityFeed();
    loadRecentSolvers();
    loadTopContributors();
    updateStats();
}

// Get Mock Problems
function getMockProblems() {
    return [
        {
            id: 1,
            problem_text: "How can we reduce plastic waste in urban areas without increasing costs for consumers?",
            user_name: "Eco Warrior",
            category: "environment",
            solutions_count: 8,
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 2,
            problem_text: "What's the most efficient way to teach programming to complete beginners in 2024?",
            user_name: "Code Mentor",
            category: "technology",
            solutions_count: 12,
            created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 3,
            problem_text: "How can small businesses compete with Amazon's delivery speeds without huge infrastructure?",
            user_name: "Shop Local",
            category: "business",
            solutions_count: 15,
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 4,
            problem_text: "What are creative ways to make public transportation more appealing to car owners?",
            user_name: "Urban Planner",
            category: "social",
            solutions_count: 11,
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 5,
            problem_text: "How can we detect deepfake videos with 99%+ accuracy using open source tools?",
            user_name: "AI Ethicist",
            category: "technology",
            solutions_count: 23,
            created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 6,
            problem_text: "What's the best remote team-building activity you've experienced that actually works?",
            user_name: "Remote Lead",
            category: "business",
            solutions_count: 7,
            created_at: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString()
        }
    ];
}

// Get Mock Solutions
function getMockSolutions(problemId) {
    const solutions = [
        {
            id: 1,
            problem_id: 1,
            solution_text: "Implement a deposit-return system for all plastic containers. Consumers pay a small deposit when buying products, refunded when returning containers to recycling centers. This creates economic incentive for proper disposal.",
            user_name: "Green Innovator",
            upvotes: 28,
            downvotes: 2,
            created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
        },
        {
            id: 2,
            problem_id: 1,
            solution_text: "Partner with local businesses to create 'plastic-free' shopping zones where only biodegradable packaging is allowed. Offer tax incentives for participating businesses and educate consumers about alternatives.",
            user_name: "Zero Waste Advocate",
            upvotes: 19,
            downvotes: 1,
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 3,
            problem_id: 2,
            solution_text: "Start with visual programming languages like Scratch or Blockly, then transition to Python using project-based learning. Platforms like Code.org and freeCodeCamp provide excellent structured pathways for beginners.",
            user_name: "EdTech Expert",
            upvotes: 42,
            downvotes: 3,
            created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
        }
    ];
    
    return solutions.filter(s => s.problem_id === problemId);
}

// Export for debugging
window.mindhive = {
    state: appState,
    supabase: supabase,
    refresh: () => {
        appState.currentPage = 0;
        appState.hasMoreProblems = true;
        loadProblems();
    },
    reset: () => {
        localStorage.clear();
        location.reload();
    }
};

console.log('🎉 MindHive initialized successfully!');
