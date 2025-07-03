/**
 * UI Components and Animations Module
 * Handles all visual elements and interactions
 */

/**
 * Particle animation system
 */
const ParticleSystem = {
  /**
   * Create floating particles background
   */
  init() {
      const particlesContainer = document.getElementById('particles');
      if (!particlesContainer) return;

      // Clear existing particles
      particlesContainer.innerHTML = '';

      // Create new particles
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
  },

  /**
   * Add burst effect at coordinates
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  addBurstEffect(x, y) {
      const burst = document.createElement('div');
      burst.className = 'particle-burst';
      burst.style.left = x + 'px';
      burst.style.top = y + 'px';
      burst.style.cssText += `
          position: fixed;
          width: 4px;
          height: 4px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          pointer-events: none;
          animation: burst 1s ease-out forwards;
          z-index: 1000;
      `;
      
      document.body.appendChild(burst);
      
      // Remove after animation
      setTimeout(() => {
          document.body.removeChild(burst);
      }, 1000);
  }
};

/**
* Message system for user feedback
*/
const MessageSystem = {
  /**
   * Show success message
   * @param {string} message - Success message text
   */
  showSuccess(message = 'Your motivational entry has been saved successfully!') {
      const successElement = document.getElementById('successMessage');
      if (successElement) {
          successElement.querySelector('span') && (successElement.querySelector('span').textContent = message);
          successElement.style.display = 'flex';
          
          // Auto-hide after 3 seconds
          setTimeout(() => {
              successElement.style.display = 'none';
          }, 3000);
      }
  },

  /**
   * Show error message
   * @param {string} message - Error message text
   */
  showError(message = 'An error occurred. Please try again.') {
      let errorElement = document.getElementById('errorMessage');
      
      // Create error element if it doesn't exist
      if (!errorElement) {
          errorElement = document.createElement('div');
          errorElement.id = 'errorMessage';
          errorElement.className = 'error-message';
          errorElement.style.cssText = `
              background: rgba(239, 68, 68, 0.1);
              border: 1px solid #ef4444;
              color: #ef4444;
              padding: 1rem;
              border-radius: 12px;
              margin-bottom: 1.5rem;
              display: flex;
              align-items: center;
              gap: 0.5rem;
              animation: slideIn 0.3s ease-out;
          `;
          errorElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i><span></span>`;
          
          // Insert after success message
          const successElement = document.getElementById('successMessage');
          if (successElement) {
              successElement.parentNode.insertBefore(errorElement, successElement.nextSibling);
          }
      }
      
      errorElement.querySelector('span').textContent = message;
      errorElement.style.display = 'flex';
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
          errorElement.style.display = 'none';
      }, 5000);
  },

  /**
   * Show loading state
   * @param {HTMLElement} button - Button element to show loading on
   * @param {string} loadingText - Loading text to display
   */
  showLoading(button, loadingText = 'Loading...') {
      if (!button) return;
      
      button.dataset.originalText = button.innerHTML;
      button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadingText}`;
      button.disabled = true;
      button.classList.add('loading');
  },

  /**
   * Hide loading state
   * @param {HTMLElement} button - Button element to restore
   */
  hideLoading(button) {
      if (!button) return;
      
      button.innerHTML = button.dataset.originalText || button.innerHTML;
      button.disabled = false;
      button.classList.remove('loading');
      delete button.dataset.originalText;
  },

  /**
   * Show connection status
   * @param {boolean} isOnline - Connection status
   */
  showConnectionStatus(isOnline) {
      let statusElement = document.getElementById('connectionStatus');
      
      if (!statusElement) {
          statusElement = document.createElement('div');
          statusElement.id = 'connectionStatus';
          statusElement.style.cssText = `
              position: fixed;
              top: 20px;
              right: 20px;
              padding: 0.5rem 1rem;
              border-radius: 8px;
              font-size: 0.9rem;
              font-weight: 600;
              z-index: 1000;
              transition: all 0.3s ease;
          `;
          document.body.appendChild(statusElement);
      }
      
      if (isOnline) {
          statusElement.style.cssText += `
              background: rgba(72, 187, 120, 0.9);
              color: white;
              transform: translateY(-100px);
              opacity: 0;
          `;
          statusElement.innerHTML = '<i class="fas fa-wifi"></i> Connected';
          
          // Hide after 2 seconds
          setTimeout(() => {
              statusElement.style.transform = 'translateY(-100px)';
              statusElement.style.opacity = '0';
          }, 2000);
      } else {
          statusElement.style.cssText += `
              background: rgba(239, 68, 68, 0.9);
              color: white;
              transform: translateY(0);
              opacity: 1;
          `;
          statusElement.innerHTML = '<i class="fas fa-wifi-slash"></i> Disconnected';
      }
  }
};

/**
* Entry rendering system
*/
const EntryRenderer = {
  /**
   * Render all entries
   * @param {Array} entries - Array of journal entries
   */
  renderEntries(entries) {
      const container = document.getElementById('entriesContainer');
      if (!container) return;

      if (entries.length === 0) {
          container.innerHTML = `
              <div class="empty-state">
                  <i class="fas fa-seedling"></i>
                  <p>Start your journey by creating your first motivational entry!</p>
              </div>
          `;
          return;
      }

      container.innerHTML = entries.map(entry => this.renderEntry(entry)).join('');
      
      // Add animation to new entries
      this.animateEntries();
  },

  /**
   * Render a single entry
   * @param {Object} entry - Journal entry object
   * @returns {string} - HTML string for the entry
   */
  renderEntry(entry) {
      return `
          <div class="entry-card" data-entry-id="${entry.id}">
              <div class="entry-author">
                  <i class="fas fa-user-circle"></i>
                  ${this.escapeHtml(entry.name)}
              </div>
              <div class="entry-message">"${this.escapeHtml(entry.message)}"</div>
              <div class="entry-timestamp">
                  <i class="far fa-clock"></i>
                  ${entry.timestamp}
              </div>
          </div>
      `;
  },

  /**
   * Animate entry cards
   */
  animateEntries() {
      const entries = document.querySelectorAll('.entry-card');
      entries.forEach((entry, index) => {
          entry.style.opacity = '0';
          entry.style.transform = 'translateY(20px)';
          
          setTimeout(() => {
              entry.style.transition = 'all 0.5s ease';
              entry.style.opacity = '1';
              entry.style.transform = 'translateY(0)';
          }, index * 100);
      });
  },

  /**
   * Escape HTML to prevent XSS
   * @param {string} text - Text to escape
   * @returns {string} - Escaped HTML string
   */
  escapeHtml(text) {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
  }
};

/**
* Statistics display system
*/
const StatsDisplay = {
  /**
   * Update statistics display
   * @param {Object} stats - Statistics object
   */
  updateStats(stats) {
      const elements = {
          totalEntries: document.getElementById('totalEntries'),
          todayEntries: document.getElementById('todayEntries'),
          streakDays: document.getElementById('streakDays')
      };

      // Animate number changes
      Object.entries(stats).forEach(([key, value]) => {
          const element = elements[key];
          if (element) {
              this.animateNumber(element, value);
          }
      });
  },

  /**
   * Animate number changes
   * @param {HTMLElement} element - Element to animate
   * @param {number} targetValue - Target number value
   */
  animateNumber(element, targetValue) {
      const currentValue = parseInt(element.textContent) || 0;
      const difference = targetValue - currentValue;
      const duration = 1000;
      const steps = 60;
      const stepValue = difference / steps;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const timer = setInterval(() => {
          currentStep++;
          const newValue = Math.round(currentValue + (stepValue * currentStep));
          element.textContent = newValue;

          if (currentStep >= steps) {
              clearInterval(timer);
              element.textContent = targetValue;
          }
      }, stepDuration);
  }
};

/**
* Form handling system
*/
const FormHandler = {
  /**
   * Initialize form validation and handling
   */
  init() {
      const form = document.getElementById('journalForm');
      if (!form) return;

      // Add real-time validation
      const nameInput = document.getElementById('authorName');
      const messageInput = document.getElementById('motivationMessage');

      if (nameInput) {
          nameInput.addEventListener('input', () => this.validateField(nameInput));
      }

      if (messageInput) {
          messageInput.addEventListener('input', () => this.validateField(messageInput));
      }

      // Add character counter for message
      if (messageInput) {
          this.addCharacterCounter(messageInput);
      }
  },

  /**
   * Validate form field
   * @param {HTMLElement} field - Form field to validate
   */
  validateField(field) {
      const value = field.value.trim();
      const isValid = value.length > 0;

      if (isValid) {
          field.classList.remove('invalid');
          field.classList.add('valid');
      } else {
          field.classList.remove('valid');
          field.classList.add('invalid');
      }

      return isValid;
  },

  /**
   * Add character counter to textarea
   * @param {HTMLElement} textarea - Textarea element
   */
  addCharacterCounter(textarea) {
      const counter = document.createElement('div');
      counter.className = 'character-counter';
      counter.style.cssText = `
          text-align: right;
          font-size: 0.8rem;
          color: #718096;
          margin-top: 0.25rem;
      `;

      textarea.parentNode.appendChild(counter);

      const updateCounter = () => {
          const length = textarea.value.length;
          const maxLength = 500; // Suggested maximum
          counter.textContent = `${length}${maxLength ? `/${maxLength}` : ''} characters`;
          
          if (length > maxLength * 0.9) {
              counter.style.color = '#ed8936';
          } else {
              counter.style.color = '#718096';
          }
      };

      textarea.addEventListener('input', updateCounter);
      updateCounter();
  },

  /**
   * Reset form with animation
   * @param {HTMLElement} form - Form element to reset
   */
  resetForm(form) {
      if (!form) return;

      // Add reset animation
      form.style.opacity = '0.5';
      form.style.transform = 'scale(0.98)';

      setTimeout(() => {
          form.reset();
          form.style.transition = 'all 0.3s ease';
          form.style.opacity = '1';
          form.style.transform = 'scale(1)';
          
          // Remove validation classes
          const fields = form.querySelectorAll('.valid, .invalid');
          fields.forEach(field => {
              field.classList.remove('valid', 'invalid');
          });
      }, 150);
  }
};

// Add CSS for new animations
const additionalCSS = `
  @keyframes slideIn {
      from { transform: translateX(-100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
  }

  @keyframes burst {
      0% { transform: scale(1); opacity: 1; }
      100% { transform: scale(3); opacity: 0; }
  }

  .form-input.valid {
      border-color: #48bb78;
      box-shadow: 0 0 0 3px rgba(72, 187, 120, 0.1);
  }

  .form-input.invalid {
      border-color: #ef4444;
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
  }

  .btn.loading {
      cursor: not-allowed;
      opacity: 0.7;
  }

  .character-counter {
      transition: color 0.3s ease;
  }
`;

// Inject additional CSS
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalCSS;
document.head.appendChild(styleSheet);

// Export for use in other modules
window.ParticleSystem = ParticleSystem;
window.MessageSystem = MessageSystem;
window.EntryRenderer = EntryRenderer;
window.StatsDisplay = StatsDisplay;
window.FormHandler = FormHandler;