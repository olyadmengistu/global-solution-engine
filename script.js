// Global Solution Engine - SIMPLE REAL VERSION
const SUPABASE_URL = 'https://fzvjbmukadxcxdkkaauk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ6dmpibXVrYWR4Y3hka2thYXVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDQ4MTg1OCwiZXhwIjoyMDgwMDU3ODU4fQ.-kGzdsNszwuMi5MrS1MgjInvyswoa40r8MPvbF9ep5Y';

// Initialize Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Load problems when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadProblems();
    setupEventListeners();
    addFloatingParticles();
});

// Load problems from database
async function loadProblems() {
    showLoading();
    
    try {
        const { data: problems, error } = await supabaseClient
            .from('problems')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        displayProblems(problems);
        updateGlobalStats();
        
    } catch (error) {
        console.error('Error:', error);
        // Show sample problems if database fails
        displayProblems([
            {
                id: 1,
                problem_text: "How can I help my elderly grandmother who feels lonely?",
                created_at: new Date().toISOString(),
                user_name: "Community",
                solutions_count: 3
            },
            {
                id: 2,
                problem_text: "Car check engine light - mechanic wants $1200. Cheaper solution?",
                created_at: new Date().toISOString(),
                user_name: "Community", 
                solutions_count: 2
            }
        ]);
    }
    
    hideLoading();
}

// Display problems
function displayProblems(problems) {
    const container = document.getElementById('problemsContainer');
    container.innerHTML = '';

    problems.forEach(problem => {
        const problemCard = document.createElement('div');
        problemCard.className = 'problem-card';
        problemCard.innerHTML = `
            <div class="problem-text">"${problem.problem_text}"</div>
            <div class="problem-meta">
                <span>By: ${problem.user_name || 'Anonymous'}</span>
                <span>${new Date(problem.created_at).toLocaleDateString()}</span>
                <div class="solution-count">${problem.solutions_count || 0} solutions</div>
            </div>
        `;
        
        problemCard.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
                alert('Solution system coming next!');
            }, 150);
        });
        
        container.appendChild(problemCard);
    });
}

// Submit new problem
async function submitProblem() {
    const problemInput = document.getElementById('problemInput');
    const problemText = problemInput.value.trim();
    const userName = document.getElementById('userName').value.trim() || 'Anonymous';
    
    if (!problemText) {
        problemInput.style.animation = 'shake 0.5s';
        setTimeout(() => problemInput.style.animation = '', 500);
        return;
    }
    
    const button = document.getElementById('submitProblem');
    button.textContent = 'Submitting...';
    button.disabled = true;
    
    try {
        const { data, error } = await supabaseClient
            .from('problems')
            .insert([{ 
                problem_text: problemText, 
                user_name: userName 
            }]);
        
        if (error) throw error;
        
        // Success!
        problemInput.value = '';
        button.textContent = '✓ Submitted!';
        button.style.background = 'linear-gradient(45deg, #4ecdc4, #44a08d)';
        
        createConfetti();
        
        // Reload problems
        setTimeout(() => {
            loadProblems();
            button.textContent = 'Submit to World';
            button.style.background = 'linear-gradient(45deg, #ff6b6b, #4ecdc4)';
            button.disabled = false;
        }, 2000);
        
    } catch (error) {
        console.error('Error:', error);
        button.textContent = 'Error - Try Again';
        setTimeout(() => {
            button.textContent = 'Submit to World';
            button.disabled = false;
        }, 2000);
    }
}

// Update stats
async function updateGlobalStats() {
    try {
        const { count, error } = await supabaseClient
            .from('problems')
            .select('*', { count: 'exact', head: true });
        
        if (!error && count > 0) {
            document.getElementById('globalStats').textContent = 
                `${count} problems posted globally!`;
        }
    } catch (error) {
        console.error('Stats error:', error);
    }
}

// Event listeners
function setupEventListeners() {
    document.getElementById('submitProblem').addEventListener('click', submitProblem);
    
    document.getElementById('problemInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && e.ctrlKey) submitProblem();
    });
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// Keep all animation functions from before
function addFloatingParticles() {
    const animatedBg = document.querySelector('.animated-bg');
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute; width: ${Math.random() * 10 + 5}px; height: ${Math.random() * 10 + 5}px;
            background: rgba(255,255,255,0.3); border-radius: 50%; left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%; animation: floatParticle ${Math.random() * 20 + 10}s linear infinite;
            animation-delay: ${Math.random() * 5}s;
        `;
        animatedBg.appendChild(particle);
    }
}

function createConfetti() {
    const confettiContainer = document.createElement('div');
    confettiContainer.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:1000;';
    document.body.appendChild(confettiContainer);
    
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7'];
    for (let i = 0; i < 30; i++) {
        const confetti = document.createElement('div');
        confetti.style.cssText = `
            position:absolute; width:10px; height:10px; background:${colors[Math.floor(Math.random() * colors.length)]};
            border-radius:50%; left:50%; top:50%; opacity:0;
        `;
        confetti.animate([
            { transform: 'translate(0,0) rotate(0deg)', opacity: 1 },
            { transform: `translate(${Math.random() * 400 - 200}px, ${window.innerHeight}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ], { duration: Math.random() * 2000 + 1000, easing: 'cubic-bezier(0.1,0.8,0.2,1)' });
        confettiContainer.appendChild(confetti);
    }
    setTimeout(() => confettiContainer.remove(), 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes floatParticle {
        0% { transform: translateY(0px) translateX(0px) rotate(0deg); opacity: 0; }
        10% { opacity: 1; }
        90% { opacity: 1; }
        100% { transform: translateY(-100vh) translateX(100px) rotate(360deg); opacity: 0; }
    }
    @keyframes shake {
        0%,100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);