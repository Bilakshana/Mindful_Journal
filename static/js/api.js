/**
 * API Communication Module
 * Handles all communication with the Flask backend
 */

// API configuration
const API_CONFIG = {
  baseUrl: '',
  endpoints: {
      entries: '/api/entries',
      stats: '/api/stats',
      export: '/export'
  },
  timeout: 10000 // 10 seconds
};

/**
* Generic API request handler
* @param {string} url - API endpoint URL
* @param {Object} options - Fetch options
* @returns {Promise} - API response
*/
async function apiRequest(url, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
  
  try {
      const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
              'Content-Type': 'application/json',
              ...options.headers
          }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
          throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
  } catch (error) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
          throw new Error('Request timeout');
      }
      
      throw error;
  }
}

/**
* API methods for journal entries
*/
const JournalAPI = {
  /**
   * Load all journal entries
   * @returns {Promise<Array>} - Array of journal entries
   */
  async loadEntries() {
      try {
          return await apiRequest(API_CONFIG.endpoints.entries);
      } catch (error) {
          console.error('Failed to load entries:', error);
          throw new Error('Failed to load journal entries');
      }
  },

  /**
   * Create a new journal entry
   * @param {string} name - Author name
   * @param {string} message - Journal message
   * @returns {Promise<Object>} - Created entry object
   */
  async createEntry(name, message) {
      try {
          return await apiRequest(API_CONFIG.endpoints.entries, {
              method: 'POST',
              body: JSON.stringify({ name, message })
          });
      } catch (error) {
          console.error('Failed to create entry:', error);
          throw new Error('Failed to save journal entry');
      }
  },

  /**
   * Delete a journal entry
   * @param {number} entryId - Entry ID to delete
   * @returns {Promise<Object>} - Deletion response
   */
  async deleteEntry(entryId) {
      try {
          return await apiRequest(`${API_CONFIG.endpoints.entries}/${entryId}`, {
              method: 'DELETE'
          });
      } catch (error) {
          console.error('Failed to delete entry:', error);
          throw new Error('Failed to delete journal entry');
      }
  },

  /**
   * Load journal statistics
   * @returns {Promise<Object>} - Statistics object
   */
  async loadStats() {
      try {
          return await apiRequest(API_CONFIG.endpoints.stats);
      } catch (error) {
          console.error('Failed to load stats:', error);
          throw new Error('Failed to load statistics');
      }
  },

  /**
   * Export journal entries
   * @returns {Promise<Object>} - Export data
   */
  async exportEntries() {
      try {
          return await apiRequest(API_CONFIG.endpoints.export);
      } catch (error) {
          console.error('Failed to export entries:', error);
          throw new Error('Failed to export entries');
      }
  }
};

/**
* Connection status checker
*/
const ConnectionChecker = {
  isOnline: true,
  
  /**
   * Check if API is reachable
   * @returns {Promise<boolean>} - Connection status
   */
  async checkConnection() {
      try {
          await apiRequest(API_CONFIG.endpoints.stats);
          this.isOnline = true;
          return true;
      } catch (error) {
          this.isOnline = false;
          return false;
      }
  },

  /**
   * Start monitoring connection
   */
  startMonitoring() {
      // Check connection every 30 seconds
      setInterval(async () => {
          const wasOnline = this.isOnline;
          await this.checkConnection();
          
          if (wasOnline !== this.isOnline) {
              // Connection status changed
              const event = new CustomEvent('connectionStatusChanged', {
                  detail: { isOnline: this.isOnline }
              });
              document.dispatchEvent(event);
          }
      }, 30000);
  }
};

// Export for use in other modules
window.JournalAPI = JournalAPI;
window.ConnectionChecker = ConnectionChecker;