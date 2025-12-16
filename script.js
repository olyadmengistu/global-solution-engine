// ===== NEXUSMIND APP - MAIN JAVASCRIPT =====

// App State
const appState = {
    currentUser: localStorage.getItem('nexusmind_user') || '',
    problems: [
        {
            id: 1,
            text: "How can we reduce plastic waste in cities effectively?",
            user: "Eco Warrior",
            time: "2 hours ago",
            solutions: 12
        },
        {
            id: 2,
            text: "What's the fastest way to learn programming in 2024?",
            user: "Code Learner",
            time: "5 hours ago",
            solutions: 8
        },
        {
            id: 3,
            text: "How can small businesses survive economic challenges?",
            user: "Entrepreneur",
            time: "1 day ago",
            solutions: 15
        }
    ],
    liveStats: {
        problems: 2847,
        solvers: 12459,
        solutions: 45231
    }
};

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 NexusMind loaded!');
    
    // Hide loading screen after 1 second
    setTimeout(() => {
        const loading = document.getElementById('loading');
        if (loading) {
            loading.style.display = 'none';
        }
        
        // Initialize app
        initApp();
        
        // Show welcome message
        showToast('Welcome to NexusMind!', 'info');
        
    }, 1000);
    
    // Setup event listeners
    setupEventListeners();
});

// Initialize app
function initApp() {
    updateUserInfo();
    displayProblems();
    updateStats();
    updateCharCounter();
    
    // Start live updates
    startLiveUpdates();
}

// ===== PROBLEM FUNCTIONS =====
async function submitProblem() {
    const input = document.getElementById('problemInput');
    const text = input.value.trim();
    const userName = appState.currentUser || 'Anonymous';
    
    // Validation
    if (!text) {
        showToast('Please describe your problem', 'error');
        return;
    }
    
    if (text.length > 500) {
        showToast('Problem too long (max 500 characters)', 'error');
        return;
    }
    
    const button = document.getElementById('submitProblem');
    const originalText = button.innerHTML;
    
    // Show loading state
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    button.disabled = true;
    
    try {
        // Simulate API call with timeout
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Create new problem
        const newProblem = {
            id: Date.now(),
            text: text,
            user: userName,
            time: 'Just now',
            solutions: 0
        };
        
        // Add to state
        appState.problems.unshift(newProblem);
        appState.liveStats.problems++;
        
        // Update UI
        displayProblems();
        updateStats();
        
        // Show success
        showToast('Problem submitted successfully!', 'success');
        
        // Clear input
        input.value = '';
        updateCharCounter();
        
        // Add activity
        addActivityItem(userName, 'posted a new problem');
        
        // Simulate other users viewing
        simulateCommunityActivity();
        
    } catch (error) {
        console.error('Error:', error);
        showToast('Error submitting problem. Please try again.', 'error');
        
    } finally {
        // Restore button
        button.innerHTML = originalText;
        button.disabled = false;
    }
}

function displayProblems() {
    const container = document.getElementById('problemsContainer');
    if (!container) return;
    
    // Clear container
    container.innerHTML = '';
    
    // Add each problem
    appState.problems.forEach(problem => {
        const card = document.createElement('div');
        card.className = 'problem-card';
        card.innerHTML = `
            <div class="problem-text">
                "${problem.text}"
            </div>
            <div class="problem-meta">
                <div class="author">
                    <div class="avatar" style="background: ${getColorFromString(problem.user)}">
                        ${problem.user.charAt(0).toUpperCase()}
                    </div>
                    <div class="author-info">
                        <div class="author-name">${problem.user}</div>
                        <div class="time">${problem.time}</div>
                    </div>
                </div>
                <div class="problem-stats">
                    <i class="fas fa-comment"></i>
                    <span>${problem.solutions}</span>
                </div>
            </div>
        `;
        
        // Add click event
        card.addEventListener('click', () => {
            showToast(`Viewing: "${problem.text.substring(0, 50)}..."`, 'info');
        });
        
        container.appendChild(card);
    });
    
    // Add CSS for problem stats if not exists
    if (!document.querySelector('#problem-stats-css')) {
        const style = document.createElement('style');
        style.id = 'problem-stats-css';
        style.textContent = `
            .problem-stats {
                display: flex;
                align-items: center;
                gap: 5px;
                color: var(--stardust);
                font-size: 0.9rem;
            }
            
            .problem-stats i {
                color: var(--neon-cyan);
            }
        `;
        document.head.appendChild(style);
    }
}

function loadMoreProblems() {
    showToast('Loading more problems...', 'info');
    
    // Simulate loading
    setTimeout(() => {
        // Add sample problems
        const sampleProblems = [
            {
                id: Date.now() + 1,
                text: "How can we improve renewable energy storage?",
                user: "Energy Expert",
                time: "3 hours ago",
                solutions: 7
            },
            {
                id: Date.now() + 2,
                text: "What are effective remote work strategies?",
                user: "Remote Worker",
                time: "6 hours ago",
                solutions: 11
            },
            {
                id: Date.now() + 3,
                text: "How to build sustainable food systems?",
                user: "Agriculture Expert",
                time: "1 day ago",
                solutions: 9
            }
        ];
        
        appState.problems.push(...sampleProblems);
        displayProblems();
        appState.liveStats.problems += 3;
        updateStats();
        
        showToast('Loaded 3 more problems', 'success');
        
    }, 1000);
}

// ===== USER FUNCTIONS =====
function updateUserInfo() {
    const userNameInput = document.getElementById('userName');
    
    if (!userNameInput) return;
    
    // Set current value
    if (appState.currentUser) {
        userNameInput.value = appState.currentUser;
    }
    
    // Save on change
    userNameInput.addEventListener('change', function() {
        const newName = this.value.trim();
        if (newName) {
            appState.currentUser = newName;
            localStorage.setItem('nexusmind_user', newName);
            showToast(`Welcome, ${newName}!`, 'success');
            
            // Update user stats (simulated)
            document.querySelectorAll('.avatar').forEach(avatar => {
                if (avatar.textContent === 'U' || avatar.textContent === 'A') {
                    avatar.textContent = newName.charAt(0).toUpperCase();
                    avatar.style.background = getColorFromString(newName);
                }
            });
        }
    });
}

// ===== STATS FUNCTIONS =====
function updateStats() {
    // Update problem count
    const problemCount = appState.liveStats.problems;
    document.getElementById('liveProblems').textContent = problemCount.toLocaleString();
    
    // Update other stats with slight randomization
    const solvers = appState.liveStats.solvers + Math.floor(Math.random() * 10);
    const solutions = appState.liveStats.solutions + Math.floor(Math.random() * 50);
    
    document.getElementById('liveSolvers').textContent = solvers.toLocaleString();
    document.getElementById('liveSolutions').textContent = solutions.toLocaleString();
}

function startLiveUpdates() {
    // Update stats every 30 seconds
    setInterval(() => {
        // Randomly update stats
        if (Math.random() > 0.7) {
            appState.liveStats.problems += Math.floor(Math.random() * 3);
            appState.liveStats.solvers += Math.floor(Math.random() * 10);
            appState.liveStats.solutions += Math.floor(Math.random() * 20);
            updateStats();
        }
        
        // Occasionally add random activity
        if (Math.random() > 0.8) {
            const users = ['Quantum Thinker', 'AI Pioneer', 'Tech Visionary', 'Solution Master'];
            const actions = ['joined the network', 'solved a problem', 'reached expert level', 'shared 5 solutions'];
            
            const randomUser = users[Math.floor(Math.random() * users.length)];
            const randomAction = actions[Math.floor(Math.random() * actions.length)];
            
            addActivityItem(randomUser, randomAction);
        }
        
    }, 30000); // 30 seconds
}

function simulateCommunityActivity() {
    // Simulate community engagement
    setTimeout(() => {
        appState.liveStats.solvers += Math.floor(Math.random() * 5) + 1;
        updateStats();
        
        // Occasionally add a solution
        if (Math.random() > 0.5) {
            setTimeout(() => {
                appState.liveStats.solutions += Math.floor(Math.random() * 3) + 1;
                updateStats();
                showToast('Someone just posted a solution!', 'info');
            }, 2000);
        }
    }, 3000);
}

// ===== ACTIVITY FUNCTIONS =====
function addActivityItem(user, action) {
    const activityList = document.querySelector('.activity-list');
    if (!activityList) return;
    
    const activityItem = document.createElement('div');
    activityItem.className = 'activity-item';
    activityItem.innerHTML = `
        <div class="activity-icon">
            <i class="fas fa-${action.includes('joined') ? 'user-plus' : action.includes('solved') ? 'check-circle' : 'bullhorn'}"></i>
        </div>
        <div class="activity-content">
            <div class="activity-text">
                <strong>${user}</strong> ${action}
            </div>
            <div class="activity-time">Just now</div>
        </div>
    `;
    
    // Add at the beginning
    activityList.insertBefore(activityItem, activityList.firstChild);
    
    // Limit to 5 items
    if (activityList.children.length > 5) {
        activityList.removeChild(activityList.lastChild);
    }
    
    // Add highlight animation
    activityItem.classList.add('new');
    setTimeout(() => {
        activityItem.classList.remove('new');
    }, 2000);
}

// ===== UI HELPER FUNCTIONS =====
function updateCharCounter() {
    const input = document.getElementById('problemInput');
    const counter = document.getElementById('charCount');
    const fill = document.getElementById('charFill');
    
    if (!input || !counter || !fill) return;
    
    const length = input.value.length;
    const max = 500;
    const percentage = (length / max) * 100;
    
    counter.textContent = `${length}/${max}`;
    fill.style.width = `${percentage}%`;
    
    // Update color based on length
    if (length > max * 0.9) {
        fill.style.background = 'linear-gradient(90deg, var(--neon-pink), var(--cyber-yellow))';
        counter.style.color = 'var(--neon-pink)';
    } else if (length > max * 0.7) {
        fill.style.background = 'linear-gradient(90deg, var(--cyber-yellow), var(--neon-cyan))';
        counter.style.color = 'var(--cyber-yellow)';
    } else {
        fill.style.background = 'linear-gradient(90deg, var(--neon-cyan), var(--electric-blue))';
        counter.style.color = 'var(--neon-cyan)';
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' ? 'check-circle' : 
                 type === 'error' ? 'exclamation-circle' : 'info-circle';
    
    toast.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease-out forwards';
        setTimeout(() => {
            if (toast.parentNode === container) {
                container.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

function getColorFromString(str) {
    if (!str) return 'linear-gradient(45deg, var(--neon-cyan), var(--electric-blue))';
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = hash % 360;
    return `hsl(${hue}, 80%, 60%)`;
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
    // Problem input character counter
    const problemInput = document.getElementById('problemInput');
    if (problemInput) {
        problemInput.addEventListener('input', updateCharCounter);
    }
    
    // Category selection (if added later)
    document.querySelectorAll('.category-pill').forEach(pill => {
        pill.addEventListener('click', function() {
            document.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Add enter key support for problem submission
    if (problemInput) {
        problemInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && e.ctrlKey) {
                submitProblem();
            }
        });
    }
}

// ===== NAVIGATION FUNCTIONS =====
window.showSection = function(section) {
    // Update active nav link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Show appropriate content (simplified for now)
    showToast(`Showing: ${section.charAt(0).toUpperCase() + section.slice(1)}`, 'info');
    
    if (section === 'problems') {
        displayProblems();
    } else if (section === 'solutions') {
        showToast('Solutions feature coming soon!', 'info');
    } else if (section === 'leaderboard') {
        showToast('Leaderboard feature coming soon!', 'info');
    }
};

// ===== PUBLIC FUNCTIONS =====
window.submitProblem = submitProblem;
window.loadMoreProblems = loadMoreProblems;
window.showToast = showToast;

// Add animation CSS
document.addEventListener('DOMContentLoaded', function() {
    if (!document.querySelector('#animations-css')) {
        const style = document.createElement('style');
        style.id = 'animations-css';
        style.textContent = `
            @keyframes highlightPulse {
                0%, 100% { background: transparent; }
                50% { background: rgba(0, 212, 170, 0.1); }
            }
            
            .activity-item.new {
                animation: highlightPulse 1s ease-in-out;
            }
            
            .category-pill {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 20px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 25px;
                cursor: pointer;
                transition: all 0.3s;
                margin: 5px;
                border: 1px solid transparent;
            }
            
            .category-pill:hover {
                background: rgba(0, 212, 170, 0.1);
                transform: translateY(-2px);
            }
            
            .category-pill.active {
                background: rgba(0, 212, 170, 0.2);
                border-color: var(--neon-cyan);
                box-shadow: var(--glow-cyan);
            }
        `;
        document.head.appendChild(style);
    }
});

console.log('✅ NexusMind app.js loaded successfully!');
