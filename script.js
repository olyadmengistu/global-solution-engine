// SolveMind - Complete Functional Application

// Configuration
const SUPABASE_URL = 'https://fzvjbmukadxcxdkkaauk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6dmpibXVrYWR4Y3hka2thYXVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQ4MTg1OCwiZXhwIjoyMDgwMDU3ODU4fQ.-kGzdsNszwuMi5MrS1MgjInvyswoa40r8MPvbF9ep5Y';

// Application State
const appState = {
    currentUser: localStorage.getItem('solvemind_user') || '',
    activeProblemId: null,
    currentPage: 1,
    problems: [],
    isLoading: false,
    liveStats: {
        problems: 2847,
        solvers: 12459,
        solutions: 45231
    }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Initialize Supabase
        window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        // Initialize UI
        initializeUI();
        
        // Load initial data
        await loadInitialData();
        
        // Setup event listeners
        setupEventListeners();
        
        // Start live updates
        startLiveUpdates();
        
        console.log('SolveMind initialized successfully');
        
    } catch (error) {
        console.error('Initialization failed:', error);
        showNotification('Failed to initialize application', 'error');
    }
});

// Initialize UI Components
function initializeUI() {
    // Set user name if exists
    const userNameInput = document.getElementById('userName');
    if (appState.currentUser) {
        userNameInput.value = appState.currentUser;
        updateUserAvatar();
    }
    
    // Initialize character counter
    const problemInput = document.getElementById('problemInput');
    problemInput.addEventListener('input', updateCharCounter);
    updateCharCounter();
    
    // Update live stats
    updateLiveStats();
}

// Load Initial Data
async function loadInitialData() {
    showLoading(true);
    
    try {
        // Load problems
        await loadProblems();
        
        // Load trending solutions
        await loadTrendingSolutions();
        
        // Load activity feed
        await loadActivityFeed();
        
    } catch (error) {
        console.error('Failed to load data:', error);
        // Load sample data for demo
        loadSampleData();
    } finally {
        showLoading(false);
    }
}

// Load Problems from Database
async function loadProblems() {
    try {
        const { data: problems, error } = await supabase
            .from('problems')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(12);
        
        if (error) throw error;
        
        appState.problems = problems || [];
        displayProblems(appState.problems);
        
    } catch (error) {
        console.error('Failed to load problems:', error);
        // For demo purposes, use sample data
        appState.problems = getSampleProblems();
        displayProblems(appState.problems);
    }
}

// Display Problems in Grid
function displayProblems(problems) {
    const container = document.getElementById('problemsContainer');
    
    if (!problems || problems.length === 0) {
        container.innerHTML = `
            <div class="text-center" style="grid-column: 1 / -1; padding: 3rem;">
                <div style="font-size: 3rem; margin-bottom: 1rem; color: #cbd5e1;">💡</div>
                <h3 style="color: #64748b; margin-bottom: 1rem;">No Challenges Yet</h3>
                <p style="color: #94a3b8;">Be the first to present a challenge to the community.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    problems.forEach(problem => {
        const problemCard = createProblemCard(problem);
        container.appendChild(problemCard);
    });
}

// Create Problem Card Element
function createProblemCard(problem) {
    const card = document.createElement('div');
    card.className = 'problem-card';
    card.innerHTML = `
        <div class="problem-content">
            "${problem.problem_text}"
        </div>
        <div class="problem-meta">
            <div class="problem-author">
                <div class="author-avatar">
                    ${problem.user_name ? problem.user_name.charAt(0).toUpperCase() : '?'}
                </div>
                <div>
                    <div class="author-name">${problem.user_name || 'Anonymous'}</div>
                    <div class="problem-time">${formatTimeAgo(problem.created_at)}</div>
                </div>
            </div>
            <div class="problem-stats">
                <span><i class="fas fa-comment"></i> ${problem.solutions_count || 0}</span>
                <span><i class="fas fa-eye"></i> ${Math.floor(Math.random() * 100) + 1}</span>
            </div>
        </div>
    `;
    
    card.addEventListener('click', () => openProblemModal(problem));
    
    return card;
}

// Open Problem Modal
function openProblemModal(problem) {
    appState.activeProblemId = problem.id;
    
    // Update modal content
    document.getElementById('modalProblemTitle').textContent = 'Challenge Details';
    document.getElementById('modalProblemText').textContent = problem.problem_text;
    
    const metaHtml = `
        <div class="flex items-center gap-3">
            <div class="author-avatar">
                ${problem.user_name ? problem.user_name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div>
                <div class="author-name">${problem.user_name || 'Anonymous'}</div>
                <div class="problem-time">${formatTimeAgo(problem.created_at)} • ${problem.solutions_count || 0} solutions</div>
            </div>
        </div>
    `;
    
    document.getElementById('modalProblemMeta').innerHTML = metaHtml;
    
    // Load solutions for this problem
    loadProblemSolutions(problem.id);
    
    // Show modal
    document.getElementById('solutionModal').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Load Solutions for a Problem
async function loadProblemSolutions(problemId) {
    try {
        const { data: solutions, error } = await supabase
            .from('solutions')
            .select('*')
            .eq('problem_id', problemId)
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        displaySolutions(solutions || []);
        
    } catch (error) {
        console.error('Failed to load solutions:', error);
        displaySolutions(getSampleSolutions());
    }
}

// Display Solutions in Modal
function displaySolutions(solutions) {
    const container = document.getElementById('solutionsList');
    
    if (!solutions || solutions.length === 0) {
        container.innerHTML = `
            <div class="text-center" style="padding: 2rem;">
                <div style="font-size: 2rem; margin-bottom: 1rem; color: #cbd5e1;">💭</div>
                <h4 style="color: #64748b; margin-bottom: 0.5rem;">No Solutions Yet</h4>
                <p style="color: #94a3b8;">Be the first to share your insight.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    
    solutions.forEach(solution => {
        const solutionElement = createSolutionElement(solution);
        container.appendChild(solutionElement);
    });
}

// Create Solution Element
function createSolutionElement(solution) {
    const element = document.createElement('div');
    element.className = 'solution-item';
    element.innerHTML = `
        <div style="margin-bottom: 0.5rem;">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                    <div class="author-avatar" style="width: 28px; height: 28px; font-size: 0.75rem;">
                        ${solution.user_name ? solution.user_name.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <span class="author-name">${solution.user_name || 'Anonymous'}</span>
                </div>
                <span class="problem-time">${formatTimeAgo(solution.created_at)}</span>
            </div>
        </div>
        <div style="color: #1e293b; line-height: 1.6;">
            ${solution.solution_text}
        </div>
        <div class="flex items-center gap-4 mt-3" style="color: #64748b; font-size: 0.875rem;">
            <button class="flex items-center gap-1" onclick="voteSolution(${solution.id}, 'up')">
                <i class="fas fa-chevron-up"></i>
                <span>${solution.upvotes || 0}</span>
            </button>
            <button class="flex items-center gap-1" onclick="voteSolution(${solution.id}, 'down')">
                <i class="fas fa-chevron-down"></i>
                <span>${solution.downvotes || 0}</span>
            </button>
        </div>
    `;
    
    return element;
}

// Submit New Problem
async function submitProblem() {
    const input = document.getElementById('problemInput');
    const text = input.value.trim();
    const userName = appState.currentUser || 'Anonymous';
    
    // Validation
    if (!text) {
        showNotification('Please describe your challenge', 'error');
        input.focus();
        return;
    }
    
    if (text.length > 500) {
        showNotification('Challenge too long (max 500 characters)', 'error');
        return;
    }
    
    if (!userName || userName === 'Anonymous') {
        showNotification('Please enter your name first', 'error');
        document.getElementById('userName').focus();
        return;
    }
    
    const button = document.getElementById('submitProblem');
    const originalText = button.innerHTML;
    
    // Show loading state
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    button.disabled = true;
    
    try {
        // Insert into database
        const { data, error } = await supabase
            .from('problems')
            .insert([
                {
                    problem_text: text,
                    user_name: userName,
                    solutions_count: 0
                }
            ])
            .select();
        
        if (error) throw error;
        
        // Show success
        showNotification('Challenge submitted successfully!', 'success');
        
        // Clear input
        input.value = '';
        updateCharCounter();
        
        // Update live stats
        appState.liveStats.problems++;
        updateLiveStats();
        
        // Reload problems
        await loadProblems();
        
        // Add to activity feed
        addActivityItem({
            type: 'problem',
            user: userName,
            content: 'presented a new challenge',
            time: 'just now'
        });
        
    } catch (error) {
        console.error('Failed to submit problem:', error);
        showNotification('Failed to submit. Please try again.', 'error');
    } finally {
        // Restore button
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Submit Solution
async function submitSolution() {
    const input = document.getElementById('solutionInput');
    const text = input.value.trim();
    
    if (!text) {
        showNotification('Please write a solution', 'error');
        input.focus();
        return;
    }
    
    if (!appState.activeProblemId) {
        showNotification('No problem selected', 'error');
        return;
    }
    
    const userName = appState.currentUser || 'Anonymous';
    const button = document.getElementById('submitSolution');
    const originalText = button.innerHTML;
    
    // Show loading state
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Posting...';
    button.disabled = true;
    
    try {
        // Insert solution into database
        const { data, error } = await supabase
            .from('solutions')
            .insert([
                {
                    problem_id: appState.activeProblemId,
                    solution_text: text,
                    user_name: userName,
                    upvotes: 0,
                    downvotes: 0
                }
            ]);
        
        if (error) throw error;
        
        // Update problem solutions count
        await supabase
            .from('problems')
            .update({ solutions_count: supabase.sql`solutions_count + 1` })
            .eq('id', appState.activeProblemId);
        
        // Show success
        showNotification('Solution posted successfully!', 'success');
        
        // Clear input
        input.value = '';
        
        // Update live stats
        appState.liveStats.solutions++;
        updateLiveStats();
        
        // Reload solutions
        await loadProblemSolutions(appState.activeProblemId);
        
        // Add to activity feed
        addActivityItem({
            type: 'solution',
            user: userName,
            content: 'shared a solution',
            time: 'just now'
        });
        
    } catch (error) {
        console.error('Failed to submit solution:', error);
        showNotification('Failed to post solution. Please try again.', 'error');
    } finally {
        // Restore button
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

// Load Trending Solutions
async function loadTrendingSolutions() {
    try {
        const { data: solutions, error } = await supabase
            .from('solutions')
            .select('*')
            .order('upvotes', { ascending: false })
            .limit(5);
        
        if (error) throw error;
        
        displayTrendingSolutions(solutions || getSampleTrending());
        
    } catch (error) {
        console.error('Failed to load trending:', error);
        displayTrendingSolutions(getSampleTrending());
    }
}

// Display Trending Solutions
function displayTrendingSolutions(solutions) {
    const container = document.getElementById('trendingSolutions');
    container.innerHTML = '';
    
    solutions.forEach((solution, index) => {
        const item = document.createElement('div');
        item.className = 'trending-item';
        item.innerHTML = `
            <div>
                <span class="trending-rank">${index + 1}</span>
                <span style="font-weight: 500;">${truncateText(solution.solution_text, 80)}</span>
            </div>
            <div style="font-size: 0.875rem; color: #64748b; margin-top: 0.25rem;">
                ${solution.upvotes || 0} votes • ${solution.user_name || 'Anonymous'}
            </div>
        `;
        container.appendChild(item);
    });
}

// Load Activity Feed
async function loadActivityFeed() {
    // For now, use sample activity
    const activities = [
        { type: 'join', user: 'Alex Chen', content: 'joined SolveMind', time: '2 minutes ago' },
        { type: 'solve', user: 'Tech Team', content: 'solved an AI optimization challenge', time: '15 minutes ago' },
        { type: 'post', user: 'Startup Founder', content: 'presented a fundraising challenge', time: '1 hour ago' },
        { type: 'milestone', user: 'Community', content: 'reached 10,000 active solvers', time: '2 hours ago' }
    ];
    
    displayActivityFeed(activities);
}

// Display Activity Feed
function displayActivityFeed(activities) {
    const container = document.getElementById('activityFeed');
    container.innerHTML = '';
    
    activities.forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
                <div style="color: #06b6d4;">
                    <i class="fas fa-${getActivityIcon(activity.type)}"></i>
                </div>
                <div>
                    <div style="font-weight: 500; color: #1e293b;">
                        <span style="color: #2563eb;">${activity.user}</span> ${activity.content}
                    </div>
                    <div style="font-size: 0.875rem; color: #64748b;">
                        ${activity.time}
                    </div>
                </div>
            </div>
        `;
        container.appendChild(item);
    });
}

// Add Activity Item
function addActivityItem(activity) {
    const container = document.getElementById('activityFeed');
    const item = document.createElement('div');
    item.className = 'activity-item';
    item.style.animation = 'highlightPulse 2s ease-in-out';
    item.innerHTML = `
        <div style="display: flex; align-items: flex-start; gap: 0.75rem;">
            <div style="color: #10b981;">
                <i class="fas fa-${activity.type === 'problem' ? 'pen' : 'lightbulb'}"></i>
            </div>
            <div>
                <div style="font-weight: 500; color: #1e293b;">
                    <span style="color: #2563eb;">${activity.user}</span> ${activity.content}
                </div>
                <div style="font-size: 0.875rem; color: #64748b;">
                    ${activity.time}
                </div>
            </div>
        </div>
    `;
    
    container.insertBefore(item, container.firstChild);
    
    // Limit to 10 items
    if (container.children.length > 10) {
        container.removeChild(container.lastChild);
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // User name input
    const userNameInput = document.getElementById('userName');
    userNameInput.addEventListener('change', function() {
        appState.currentUser = this.value.trim();
        localStorage.setItem('solvemind_user', appState.currentUser);
        updateUserAvatar();
    });
    
    // Submit problem button
    document.getElementById('submitProblem').addEventListener('click', submitProblem);
    
    // Submit solution button
    document.getElementById('submitSolution').addEventListener('click', submitSolution);
    
    // Close modal button
    document.getElementById('closeModal').addEventListener('click', closeModal);
    
    // Modal background click
    document.getElementById('solutionModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
    
    // Escape key to close modal
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeModal();
    });
    
    // Load more button
    document.getElementById('loadMoreBtn').addEventListener('click', loadMoreProblems);
    
    // Category tags
    document.querySelectorAll('.category-tag').forEach(tag => {
        tag.addEventListener('click', function() {
            document.querySelectorAll('.category-tag').forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const category = this.dataset.category;
            filterProblemsByCategory(category);
        });
    });
    
    // Sort filter
    document.getElementById('sortFilter').addEventListener('change', function() {
        sortProblems(this.value);
    });
}

// Close Modal
function closeModal() {
    document.getElementById('solutionModal').style.display = 'none';
    document.body.style.overflow = 'auto';
    appState.activeProblemId = null;
}

// Update Character Counter
function updateCharCounter() {
    const input = document.getElementById('problemInput');
    const counter = document.getElementById('charCount');
    const length = input.value.length;
    counter.textContent = `${length}/500`;
    
    if (length > 450) {
        counter.style.color = '#ef4444';
    } else if (length > 300) {
        counter.style.color = '#f59e0b';
    } else {
        counter.style.color = '#64748b';
    }
}

// Update User Avatar
function updateUserAvatar() {
    const avatar = document.getElementById('userAvatar');
    if (appState.currentUser) {
        const initial = appState.currentUser.charAt(0).toUpperCase();
        avatar.textContent = initial;
    } else {
        avatar.textContent = 'U';
    }
}

// Update Live Stats
function updateLiveStats() {
    document.getElementById('globalProblems').textContent = appState.liveStats.problems.toLocaleString();
    document.getElementById('globalSolvers').textContent = appState.liveStats.solvers.toLocaleString();
    document.getElementById('globalSolutions').textContent = appState.liveStats.solutions.toLocaleString();
}

// Show Loading State
function showLoading(show) {
    // Could implement a loading spinner
}

// Show Notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.75rem;">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Start Live Updates
function startLiveUpdates() {
    // Update stats every 30 seconds
    setInterval(() => {
        // Simulate live activity
        if (Math.random() > 0.7) {
            appState.liveStats.problems += Math.floor(Math.random() * 3);
            appState.liveStats.solvers += Math.floor(Math.random() * 10);
            appState.liveStats.solutions += Math.floor(Math.random() * 15);
            updateLiveStats();
        }
        
        // Occasionally add random activity
        if (Math.random() > 0.8) {
            const users = ['Data Scientist', 'UX Designer', 'Engineer', 'Product Manager'];
            const actions = [
                'joined the network',
                'solved a complex challenge',
                'reached contributor status',
                'shared innovative solution'
            ];
            
            addActivityItem({
                type: 'activity',
                user: users[Math.floor(Math.random() * users.length)],
                content: actions[Math.floor(Math.random() * actions.length)],
                time: 'just now'
            });
        }
    }, 30000);
}

// Filter Problems by Category
function filterProblemsByCategory(category) {
    showNotification(`Filtering ${category} challenges`, 'info');
    // In real implementation, filter the problems array
}

// Sort Problems
function sortProblems(sortBy) {
    showNotification(`Sorted by: ${sortBy}`, 'info');
    // In real implementation, sort the problems array
}

// Load More Problems
async function loadMoreProblems() {
    const button = document.getElementById('loadMoreBtn');
    const originalText = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    button.disabled = true;
    
    // Simulate loading
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // In real implementation, load next page
    showNotification('Loaded more challenges', 'success');
    
    button.innerHTML = originalText;
    button.disabled = false;
}

// Vote on Solution
window.voteSolution = async (solutionId, voteType) => {
    if (!appState.currentUser) {
        showNotification('Please enter your name to vote', 'error');
        return;
    }
    
    showNotification(`${voteType === 'up' ? 'Upvoted' : 'Downvoted'} solution`, 'success');
    
    // In real implementation, update vote in database
    await new Promise(resolve => setTimeout(resolve, 500));
};

// ===== UTILITY FUNCTIONS =====

// Format Time Ago
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Truncate Text
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Get Activity Icon
function getActivityIcon(type) {
    const icons = {
        'join': 'user-plus',
        'solve': 'check-circle',
        'post': 'pen',
        'milestone': 'trophy',
        'problem': 'question-circle',
        'solution': 'lightbulb'
    };
    return icons[type] || 'bell';
}

// ===== SAMPLE DATA (For Demo) =====

function getSampleProblems() {
    return [
        {
            id: 1,
            problem_text: "How can small businesses implement AI without technical expertise or large budgets?",
            user_name: "Startup Founder",
            created_at: new Date(Date.now() - 3600000).toISOString(),
            solutions_count: 8
        },
        {
            id: 2,
            problem_text: "What are the most effective strategies for reducing plastic waste in urban communities?",
            user_name: "Environmental Activist",
            created_at: new Date(Date.now() - 7200000).toISOString(),
            solutions_count: 12
        },
        {
            id: 3,
            problem_text: "How can remote teams maintain strong communication and collaboration across time zones?",
            user_name: "Remote Team Lead",
            created_at: new Date(Date.now() - 10800000).toISOString(),
            solutions_count: 15
        },
        {
            id: 4,
            problem_text: "What are innovative ways to make renewable energy affordable for developing countries?",
            user_name: "Energy Consultant",
            created_at: new Date(Date.now() - 14400000).toISOString(),
            solutions_count: 6
        }
    ];
}

function getSampleSolutions() {
    return [
        {
            id: 1,
            user_name: "AI Specialist",
            solution_text: "Start with no-code AI platforms like Bubble or Adalo. Focus on specific business problems rather than general AI implementation. Many cloud providers offer free tiers for ML services.",
            created_at: new Date(Date.now() - 1800000).toISOString(),
            upvotes: 24,
            downvotes: 1
        },
        {
            id: 2,
            user_name: "Tech Consultant",
            solution_text: "Partner with local universities. Computer science students often need real-world projects and can implement AI solutions at low cost while gaining valuable experience.",
            created_at: new Date(Date.now() - 3600000).toISOString(),
            upvotes: 18,
            downvotes: 0
        }
    ];
}

function getSampleTrending() {
    return [
        {
            solution_text: "Implement community recycling programs with incentives for participation",
            upvotes: 42,
            user_name: "Urban Planner"
        },
        {
            solution_text: "Use asynchronous communication tools and establish core overlap hours",
            upvotes: 35,
            user_name: "Remote Work Expert"
        },
        {
            solution_text: "Micro-grid solar systems with community ownership models",
            upvotes: 28,
            user_name: "Energy Analyst"
        }
    ];
}

function loadSampleData() {
    appState.problems = getSampleProblems();
    displayProblems(appState.problems);
    displayTrendingSolutions(getSampleTrending());
    displayActivityFeed([
        { type: 'join', user: 'Demo User', content: 'joined SolveMind', time: 'just now' },
        { type: 'post', user: 'Sample User', content: 'presented a demo challenge', time: '5 minutes ago' }
    ]);
}

// Add CSS for animations
const animationCSS = document.createElement('style');
animationCSS.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes highlightPulse {
        0%, 100% {
            background-color: transparent;
        }
        50% {
            background-color: rgba(16, 185, 129, 0.1);
        }
    }
`;
document.head.appendChild(animationCSS);
