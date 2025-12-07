// Continue from loadActivityFeed function...

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

// Add New Activity
function addActivity(activity) {
    const container = document.getElementById('activityFeed');
    
    const element = document.createElement('div');
    element.className = 'activity-item';
    element.style.animation = 'slideIn 0.3s ease';
    element.innerHTML = `
        <div class="activity-icon">
            <i class="fas fa-bolt"></i>
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

// Update Live Stats
function updateLiveStats() {
    // Update counts
    const totalProblems = appState.problems.length;
    const totalMinds = 12459 + Math.floor(Math.random() * 10); // Random increase
    const totalSolutions = appState.problems.reduce((sum, problem) => sum + (problem.solutions_count || 0), 0);
    
    document.getElementById('totalProblems').textContent = totalProblems.toLocaleString();
    document.getElementById('totalMinds').textContent = totalMinds.toLocaleString();
    document.getElementById('totalSolutions').textContent = totalSolutions.toLocaleString();
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

// Update Character Counter
function updateCharCounter() {
    const input = document.getElementById('problemInput');
    const counter = document.getElementById('charCount');
    const length = input.value.length;
    
    counter.textContent = `${length}/500`;
    
    if (length > 480) {
        counter.style.color = 'var(--danger)';
    } else if (length > 450) {
        counter.style.color = 'var(--warning)';
    } else {
        counter.style.color = 'var(--text-muted)';
    }
}

// Update User Avatar
function updateUserAvatar() {
    const avatar = document.querySelector('.avatar-initial');
    const name = appState.currentUser;
    const initial = name.charAt(0).toUpperCase();
    avatar.textContent = initial;
}

// Close Modal
function closeModal() {
    const modal = document.getElementById('solutionModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    appState.activeProblemId = null;
}

// Vote Solution
async function voteSolution(solutionId, type) {
    try {
        const supabase = window.supabase || supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        if (type === 'up') {
            await supabase.rpc('increment_upvotes', { solution_id: solutionId });
        } else {
            await supabase.rpc('increment_downvotes', { solution_id: solutionId });
        }
        
        showToast(`Vote recorded!`, 'success');
        
        // Reload solutions if modal is open
        if (appState.activeProblemId) {
            await loadProblemSolutions(appState.activeProblemId);
        }
        
    } catch (error) {
        console.error('Error voting:', error);
        showToast('Vote failed. Please try again.', 'error');
    }
}

// Filter Problems by Category
function filterProblems(category) {
    if (category === 'all') {
        displayProblems(appState.problems);
        return;
    }
    
    const filtered = appState.problems.filter(problem => 
        problem.category === category || 
        (problem.problem_text && problem.problem_text.toLowerCase().includes(category))
    );
    
    displayProblems(filtered);
    
    if (filtered.length === 0) {
        showToast(`No ${category} challenges found`, 'info');
    }
}

// Sort Problems
function sortProblems(sortBy) {
    let sorted = [...appState.problems];
    
    switch(sortBy) {
        case 'newest':
            sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'popular':
            sorted.sort((a, b) => (b.solutions_count || 0) - (a.solutions_count || 0));
            break;
        case 'solved':
            // In a real app, this would check which problems have accepted solutions
            sorted.sort((a, b) => (b.solutions_count || 0) - (a.solutions_count || 0));
            break;
    }
    
    displayProblems(sorted);
}

// Load More Problems
async function loadMoreProblems() {
    const button = document.getElementById('loadMoreBtn');
    const originalHTML = button.innerHTML;
    
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    button.disabled = true;
    
    try {
        const supabase = window.supabase || supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        
        const { data: moreProblems, error } = await supabase
            .from('problems')
            .select('*')
            .order('created_at', { ascending: false })
            .range(appState.problems.length, appState.problems.length + 5);
        
        if (error) throw error;
        
        if (moreProblems && moreProblems.length > 0) {
            appState.problems.push(...moreProblems);
            displayProblems(appState.problems);
            showToast(`Loaded ${moreProblems.length} more challenges`, 'success');
        } else {
            showToast('No more challenges to load', 'info');
            button.style.display = 'none';
        }
        
    } catch (error) {
        console.error('Error loading more:', error);
        showToast('Failed to load more challenges', 'error');
    } finally {
        button.innerHTML = originalHTML;
        button.disabled = false;
    }
}

// Show Loading State
function showLoading(isLoading) {
    appState.isLoading = isLoading;
    
    if (isLoading) {
        document.body.style.cursor = 'wait';
        document.getElementById('problemsContainer').innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 4rem;">
                <div class="loading-spinner" style="width: 50px; height: 50px; border: 3px solid #f1f5f9; border-top: 3px solid #6366f1; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1.5rem;"></div>
                <p style="color: #64748b;">Loading challenges from the hive mind...</p>
            </div>
        `;
    } else {
        document.body.style.cursor = 'default';
    }
}

// Show Toast Notification
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Remove after 4 seconds
    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

// Start Live Updates
function startLiveUpdates() {
    // Update stats every 30 seconds
    setInterval(() => {
        updateLiveStats();
        
        // Occasionally add random activity
        if (Math.random() > 0.7) {
            const activities = [
                { user: 'Global Mind', action: 'is working on climate solutions', time: 'just now' },
                { user: 'AI Assistant', action: 'generated 5 solution ideas', time: '1 min ago' },
                { user: 'Research Team', action: 'validated 3 solutions', time: '2 mins ago' }
            ];
            
            const randomActivity = activities[Math.floor(Math.random() * activities.length)];
            addActivity(randomActivity);
        }
        
        // Occasionally update trending
        if (Math.random() > 0.9) {
            loadTrendingSolutions();
        }
    }, 30000);
    
    // Update problem views randomly
    setInterval(() => {
        const cards = document.querySelectorAll('.problem-card');
        if (cards.length > 0) {
            const randomCard = cards[Math.floor(Math.random() * cards.length)];
            const viewsSpan = randomCard.querySelector('.problem-stats span:nth-child(2)');
            if (viewsSpan) {
                const currentViews = parseInt(viewsSpan.textContent.match(/\d+/)[0]) || 0;
                viewsSpan.innerHTML = `<i class="fas fa-eye"></i> ${currentViews + 1}`;
            }
        }
    }, 15000);
}

// Sample Data for Demo
function getSampleProblems() {
    return [
        {
            id: 1,
            problem_text: "How can we reduce plastic waste in urban areas without increasing costs for consumers?",
            user_name: "Eco Warrior",
            solutions_count: 8,
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 2,
            problem_text: "What's the most efficient way to teach programming to complete beginners in 2024?",
            user_name: "Code Mentor",
            solutions_count: 12,
            created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 3,
            problem_text: "How can small businesses compete with Amazon's delivery speeds without huge infrastructure?",
            user_name: "Shop Local",
            solutions_count: 15,
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 4,
            problem_text: "What are creative ways to make public transportation more appealing to car owners?",
            user_name: "Urban Planner",
            solutions_count: 11,
            created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 5,
            problem_text: "How can we detect deepfake videos with 99%+ accuracy using open source tools?",
            user_name: "AI Ethicist",
            solutions_count: 23,
            created_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
        }
    ];
}

function getSampleSolutions() {
    return [
        {
            id: 1,
            solution_text: "Implement a deposit-return system for all plastic containers. Consumers pay a small deposit when buying products, refunded when returning containers to recycling centers.",
            user_name: "Green Innovator",
            upvotes: 28,
            downvotes: 2,
            created_at: new Date(Date.now() - 60 * 60 * 1000).toISOString()
        },
        {
            id: 2,
            solution_text: "Partner with local businesses to create 'plastic-free' shopping zones where only biodegradable packaging is allowed. Offer tax incentives for participating businesses.",
            user_name: "Zero Waste Advocate",
            upvotes: 19,
            downvotes: 1,
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
        }
    ];
}

function loadSampleData() {
    console.log('📝 Loading sample data for demo...');
    
    appState.problems = getSampleProblems();
    displayProblems(appState.problems);
    
    loadTrendingSolutions();
    loadActivityFeed();
    updateLiveStats();
    
    showToast('Loaded sample data. Connect to Supabase for full functionality.', 'info');
}

// Add CSS for animations if not present
if (!document.querySelector('#mindhive-animations')) {
    const style = document.createElement('style');
    style.id = 'mindhive-animations';
    style.textContent = `
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// Export for debugging
window.mindhive = {
    state: appState,
    functions: {
        loadProblems,
        submitProblem,
        submitSolution,
        openProblemModal,
        closeModal,
        showToast
    }
};
