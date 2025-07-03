/**
 * Core Application Logic Module
 * Handles main application flow and coordination
 */

// Application state
const AppState = {
  currentEntry: null,
  entries: [],
  filteredEntries: [],
  selectedMood: null,
  selectedTags: [],
  searchQuery: '',
  viewMode: 'list', // 'list' or 'grid'
  isEditing: false,
  settings: {
      theme: 'light',
      autoSave: true,
      showStats: true
  }
};

// Main application class
class MindfulJournal {
  constructor() {
      this.initializeApp();
  }

  async initializeApp() {
      try {
          // Initialize UI components
          this.initializeUI();
          
          // Load existing entries
          await this.loadEntries();
          
          // Set up event listeners
          this.setupEventListeners();
          
          // Initialize particle system
          ParticleSystem.init();
          
          // Load user settings
          this.loadSettings();
          
          console.log('MindfulJournal initialized successfully');
      } catch (error) {
          console.error('Failed to initialize app:', error);
          UIComponents.showNotification('Failed to initialize application', 'error');
      }
  }

  initializeUI() {
      // Initialize mood selector
      this.initializeMoodSelector();
      
      // Initialize tag input
      this.initializeTagInput();
      
      // Initialize search
      this.initializeSearch();
      
      // Initialize view controls
      this.initializeViewControls();
      
      // Initialize theme toggle
      this.initializeThemeToggle();
  }

  initializeMoodSelector() {
      const moodSelector = document.getElementById('mood-selector');
      if (!moodSelector) return;

      const moods = ['😊', '😐', '😢', '😴', '😤', '🤔', '😍', '😰'];
      
      moods.forEach(mood => {
          const moodButton = document.createElement('button');
          moodButton.className = 'mood-button';
          moodButton.textContent = mood;
          moodButton.dataset.mood = mood;
          
          moodButton.addEventListener('click', () => {
              this.selectMood(mood);
          });
          
          moodSelector.appendChild(moodButton);
      });
  }

  selectMood(mood) {
      // Update UI
      const moodButtons = document.querySelectorAll('.mood-button');
      moodButtons.forEach(btn => btn.classList.remove('selected'));
      
      const selectedButton = document.querySelector(`[data-mood="${mood}"]`);
      if (selectedButton) {
          selectedButton.classList.add('selected');
      }
      
      // Update state
      AppState.selectedMood = mood;
      
      // Update current entry if editing
      if (AppState.isEditing && AppState.currentEntry) {
          AppState.currentEntry.mood = mood;
          this.autoSave();
      }
  }

  initializeTagInput() {
      const tagInput = document.getElementById('tag-input');
      const tagContainer = document.getElementById('tag-container');
      
      if (!tagInput || !tagContainer) return;

      tagInput.addEventListener('keypress', (e) => {
          if (e.key === 'Enter' || e.key === ',') {
              e.preventDefault();
              this.addTag(tagInput.value.trim());
              tagInput.value = '';
          }
      });

      tagInput.addEventListener('blur', () => {
          if (tagInput.value.trim()) {
              this.addTag(tagInput.value.trim());
              tagInput.value = '';
          }
      });
  }

  addTag(tagText) {
      if (!tagText || AppState.selectedTags.includes(tagText)) return;

      AppState.selectedTags.push(tagText);
      this.renderTags();
      
      // Update current entry if editing
      if (AppState.isEditing && AppState.currentEntry) {
          AppState.currentEntry.tags = [...AppState.selectedTags];
          this.autoSave();
      }
  }

  removeTag(tagText) {
      const index = AppState.selectedTags.indexOf(tagText);
      if (index > -1) {
          AppState.selectedTags.splice(index, 1);
          this.renderTags();
          
          // Update current entry if editing
          if (AppState.isEditing && AppState.currentEntry) {
              AppState.currentEntry.tags = [...AppState.selectedTags];
              this.autoSave();
          }
      }
  }

  renderTags() {
      const tagContainer = document.getElementById('tag-container');
      if (!tagContainer) return;

      tagContainer.innerHTML = '';
      
      AppState.selectedTags.forEach(tag => {
          const tagElement = document.createElement('span');
          tagElement.className = 'tag';
          tagElement.innerHTML = `
              ${tag}
              <button type="button" class="tag-remove" onclick="app.removeTag('${tag}')">×</button>
          `;
          tagContainer.appendChild(tagElement);
      });
  }

  initializeSearch() {
      const searchInput = document.getElementById('search-input');
      if (!searchInput) return;

      searchInput.addEventListener('input', (e) => {
          AppState.searchQuery = e.target.value.toLowerCase();
          this.filterEntries();
      });
  }

  initializeViewControls() {
      const viewButtons = document.querySelectorAll('.view-button');
      viewButtons.forEach(button => {
          button.addEventListener('click', () => {
              const viewMode = button.dataset.view;
              this.setViewMode(viewMode);
          });
      });
  }

  setViewMode(mode) {
      AppState.viewMode = mode;
      
      // Update UI
      document.querySelectorAll('.view-button').forEach(btn => {
          btn.classList.remove('active');
      });
      document.querySelector(`[data-view="${mode}"]`).classList.add('active');
      
      // Re-render entries
      this.renderEntries();
  }

  initializeThemeToggle() {
      const themeToggle = document.getElementById('theme-toggle');
      if (!themeToggle) return;

      themeToggle.addEventListener('click', () => {
          this.toggleTheme();
      });
  }

  toggleTheme() {
      const currentTheme = AppState.settings.theme;
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      AppState.settings.theme = newTheme;
      document.body.classList.toggle('dark-theme', newTheme === 'dark');
      
      this.saveSettings();
  }

  setupEventListeners() {
      // Entry form submission
      const entryForm = document.getElementById('entry-form');
      if (entryForm) {
          entryForm.addEventListener('submit', this.handleEntrySubmit.bind(this));
      }

      // Content auto-save
      const contentTextarea = document.getElementById('entry-content');
      if (contentTextarea) {
          contentTextarea.addEventListener('input', () => {
              if (AppState.settings.autoSave) {
                  this.autoSave();
              }
          });
      }

      // New entry button
      const newEntryBtn = document.getElementById('new-entry-btn');
      if (newEntryBtn) {
          newEntryBtn.addEventListener('click', () => {
              this.createNewEntry();
          });
      }

      // Export button
      const exportBtn = document.getElementById('export-btn');
      if (exportBtn) {
          exportBtn.addEventListener('click', () => {
              this.exportEntries();
          });
      }

      // Keyboard shortcuts
      document.addEventListener('keydown', (e) => {
          if (e.ctrlKey || e.metaKey) {
              switch (e.key) {
                  case 'n':
                      e.preventDefault();
                      this.createNewEntry();
                      break;
                  case 's':
                      e.preventDefault();
                      this.saveCurrentEntry();
                      break;
                  case 'f':
                      e.preventDefault();
                      document.getElementById('search-input')?.focus();
                      break;
              }
          }
      });
  }

  async loadEntries() {
      try {
          const response = await APIClient.getEntries();
          AppState.entries = response.entries || [];
          AppState.filteredEntries = [...AppState.entries];
          this.renderEntries();
      } catch (error) {
          console.error('Failed to load entries:', error);
          UIComponents.showNotification('Failed to load entries', 'error');
      }
  }

  async handleEntrySubmit(e) {
      e.preventDefault();
      await this.saveCurrentEntry();
  }

  async saveCurrentEntry() {
      const content = document.getElementById('entry-content')?.value;
      const title = document.getElementById('entry-title')?.value;
      
      if (!content?.trim()) {
          UIComponents.showNotification('Please enter some content', 'warning');
          return;
      }

      try {
          const entryData = {
              title: title || this.generateTitle(content),
              content: content,
              mood: AppState.selectedMood,
              tags: AppState.selectedTags,
              timestamp: new Date().toISOString()
          };

          let response;
          if (AppState.isEditing && AppState.currentEntry) {
              // Update existing entry
              response = await APIClient.updateEntry(AppState.currentEntry.id, entryData);
          } else {
              // Create new entry
              response = await APIClient.createEntry(entryData);
          }

          if (response.success) {
              UIComponents.showNotification('Entry saved successfully', 'success');
              await this.loadEntries();
              this.resetForm();
          } else {
              throw new Error(response.message || 'Failed to save entry');
          }
      } catch (error) {
          console.error('Failed to save entry:', error);
          UIComponents.showNotification('Failed to save entry', 'error');
      }
  }

  async autoSave() {
      if (!AppState.settings.autoSave || !AppState.isEditing) return;

      const content = document.getElementById('entry-content')?.value;
      if (!content?.trim()) return;

      try {
          const entryData = {
              title: document.getElementById('entry-title')?.value || this.generateTitle(content),
              content: content,
              mood: AppState.selectedMood,
              tags: AppState.selectedTags,
              timestamp: new Date().toISOString()
          };

          if (AppState.currentEntry) {
              await APIClient.updateEntry(AppState.currentEntry.id, entryData);
          }
      } catch (error) {
          console.error('Auto-save failed:', error);
      }
  }

  generateTitle(content) {
      const words = content.trim().split(/\s+/);
      const title = words.slice(0, 5).join(' ');
      return title.length > 30 ? title.substring(0, 30) + '...' : title;
  }

  createNewEntry() {
      this.resetForm();
      AppState.isEditing = false;
      AppState.currentEntry = null;
      
      // Focus on content textarea
      document.getElementById('entry-content')?.focus();
  }

  editEntry(entryId) {
      const entry = AppState.entries.find(e => e.id === entryId);
      if (!entry) return;

      AppState.isEditing = true;
      AppState.currentEntry = entry;
      
      // Populate form
      document.getElementById('entry-title').value = entry.title || '';
      document.getElementById('entry-content').value = entry.content || '';
      
      // Set mood
      if (entry.mood) {
          this.selectMood(entry.mood);
      }
      
      // Set tags
      AppState.selectedTags = [...(entry.tags || [])];
      this.renderTags();
      
      // Scroll to form
      document.getElementById('entry-form')?.scrollIntoView({ behavior: 'smooth' });
  }

  async deleteEntry(entryId) {
      if (!confirm('Are you sure you want to delete this entry?')) return;

      try {
          const response = await APIClient.deleteEntry(entryId);
          if (response.success) {
              UIComponents.showNotification('Entry deleted successfully', 'success');
              await this.loadEntries();
              
              // Clear form if editing deleted entry
              if (AppState.currentEntry?.id === entryId) {
                  this.resetForm();
              }
          } else {
              throw new Error(response.message || 'Failed to delete entry');
          }
      } catch (error) {
          console.error('Failed to delete entry:', error);
          UIComponents.showNotification('Failed to delete entry', 'error');
      }
  }

  resetForm() {
      document.getElementById('entry-title').value = '';
      document.getElementById('entry-content').value = '';
      
      // Clear mood selection
      document.querySelectorAll('.mood-button').forEach(btn => {
          btn.classList.remove('selected');
      });
      AppState.selectedMood = null;
      
      // Clear tags
      AppState.selectedTags = [];
      this.renderTags();
      
      // Reset state
      AppState.isEditing = false;
      AppState.currentEntry = null;
  }

  filterEntries() {
      let filtered = [...AppState.entries];

      // Filter by search query
      if (AppState.searchQuery) {
          filtered = filtered.filter(entry => 
              entry.title?.toLowerCase().includes(AppState.searchQuery) ||
              entry.content?.toLowerCase().includes(AppState.searchQuery) ||
              entry.tags?.some(tag => tag.toLowerCase().includes(AppState.searchQuery))
          );
      }

      AppState.filteredEntries = filtered;
      this.renderEntries();
  }

  renderEntries() {
      const entriesContainer = document.getElementById('entries-container');
      if (!entriesContainer) return;

      if (AppState.filteredEntries.length === 0) {
          entriesContainer.innerHTML = `
              <div class="no-entries">
                  <p>No entries found. Start writing your first journal entry!</p>
              </div>
          `;
          return;
      }

      entriesContainer.innerHTML = '';
      
      AppState.filteredEntries.forEach(entry => {
          const entryElement = this.createEntryElement(entry);
          entriesContainer.appendChild(entryElement);
      });
  }

  createEntryElement(entry) {
      const entryDiv = document.createElement('div');
      entryDiv.className = `entry-card ${AppState.viewMode}`;
      entryDiv.dataset.entryId = entry.id;

      const date = new Date(entry.timestamp).toLocaleDateString();
      const time = new Date(entry.timestamp).toLocaleTimeString();
      
      const tagsHTML = entry.tags?.map(tag => 
          `<span class="tag">${tag}</span>`
      ).join('') || '';

      entryDiv.innerHTML = `
          <div class="entry-header">
              <h3 class="entry-title">${entry.title || 'Untitled'}</h3>
              <div class="entry-meta">
                  <span class="entry-date">${date}</span>
                  <span class="entry-time">${time}</span>
                  ${entry.mood ? `<span class="entry-mood">${entry.mood}</span>` : ''}
              </div>
          </div>
          <div class="entry-content">
              <p>${this.truncateText(entry.content, 200)}</p>
          </div>
          ${tagsHTML ? `<div class="entry-tags">${tagsHTML}</div>` : ''}
          <div class="entry-actions">
              <button class="btn btn-sm btn-primary" onclick="app.editEntry('${entry.id}')">
                  Edit
              </button>
              <button class="btn btn-sm btn-danger" onclick="app.deleteEntry('${entry.id}')">
                  Delete
              </button>
          </div>
      `;

      return entryDiv;
  }

  truncateText(text, maxLength) {
      if (!text || text.length <= maxLength) return text;
      return text.substring(0, maxLength) + '...';
  }

  async exportEntries() {
      try {
          const response = await APIClient.exportEntries();
          
          // Create download link
          const blob = new Blob([JSON.stringify(response.entries, null, 2)], {
              type: 'application/json'
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `journal_entries_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          UIComponents.showNotification('Entries exported successfully', 'success');
      } catch (error) {
          console.error('Failed to export entries:', error);
          UIComponents.showNotification('Failed to export entries', 'error');
      }
  }

  loadSettings() {
      const savedSettings = localStorage.getItem('mindful-journal-settings');
      if (savedSettings) {
          try {
              AppState.settings = { ...AppState.settings, ...JSON.parse(savedSettings) };
          } catch (error) {
              console.error('Failed to load settings:', error);
          }
      }
      
      // Apply theme
      document.body.classList.toggle('dark-theme', AppState.settings.theme === 'dark');
  }

  saveSettings() {
      localStorage.setItem('mindful-journal-settings', JSON.stringify(AppState.settings));
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new MindfulJournal();
});

// Global error handler
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  if (window.UIComponents) {
      UIComponents.showNotification('An unexpected error occurred', 'error');
  }
});

// Export for other modules
window.AppState = AppState;
window.MindfulJournal = MindfulJournal;