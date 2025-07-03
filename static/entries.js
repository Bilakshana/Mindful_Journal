// Journal data storage
let journalEntries = [];
let entryCounter = 0;

// Initialize floating particles
function createParticles() {
    const particlesContainer = document.getElementById('particles');
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.width = Math.random() * 20 + 10 + 'px';
        particle.style.height = particle.style.width;
        particle.style.animationDelay = Math.random() * 20 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 15) + 's';
        particlesContainer.appendChild(particle);
    }
}

// Format timestamp
function formatTimestamp() {
    const now = new Date();
    return now.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Update statistics
function updateStats() {
    const totalEntries = journalEntries.length;
    const today = new Date().toDateString();
    const todayEntries = journalEntries.filter(entry => 
        new Date(entry.timestamp).toDateString() === today
    ).length;

    document.getElementById('totalEntries').textContent = totalEntries;
    document.getElementById('todayEntries').textContent = todayEntries;
    document.getElementById('streakDays').textContent = Math.min(totalEntries, 7);
}

// Render entries
function renderEntries() {
    const container = document.getElementById('entriesContainer');
    
    if (journalEntries.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-seedling"></i>
                <p>Start your journey by creating your first motivational entry!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = journalEntries.map(entry => `
        <div class="entry-card">
            <div class="entry-author">
                <i class="fas fa-user-circle"></i>
                ${entry.name}
            </div>
            <div class="entry-message">"${entry.message}"</div>
            <div class="entry-timestamp">
                <i class="far fa-clock"></i>
                ${entry.timestamp}
            </div>
        </div>
    `).join('');

    updateStats();
}

// Handle form submission
document.getElementById('journalForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('authorName').value.trim();
    const message = document.getElementById('motivationMessage').value.trim();
    
    if (!name || !message) return;

    // Create new entry
    const newEntry = {
        id: ++entryCounter,
        name: name,
        message: message,
        timestamp: formatTimestamp(),
        date: new Date()
    };

    // Add to entries array (newest first)
    journalEntries.unshift(newEntry);
    
    // Show success message
    const successMessage = document.getElementById('successMessage');
    successMessage.style.display = 'flex';
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
    
    // Clear form
    this.reset();
    
    // Re-render entries
    renderEntries();
});

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    createParticles();
    renderEntries();
    
    // Add some sample entries for demonstration
    setTimeout(() => {
        journalEntries.push(
            {
                id: 1,
                name: "Alex Johnson",
                message: "Today I choose to focus on progress, not perfection. Every small step forward is a victory worth celebrating.",
                timestamp: new Date(Date.now() - 86400000).toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                date: new Date(Date.now() - 86400000)
            },
            {
                id: 2,
                name: "Sarah Chen",
                message: "Gratitude transforms what we have into enough. Today I'm grateful for the opportunity to grow and learn.",
                timestamp: new Date(Date.now() - 172800000).toLocaleString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                date: new Date(Date.now() - 172800000)
            }
        );
        entryCounter = 2;
        renderEntries();
    }, 1000);
});