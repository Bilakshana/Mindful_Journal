from flask import Flask, render_template, request, jsonify, redirect, url_for
from datetime import datetime
import json
import os

app = Flask(__name__)

# Configure static folder
app.static_folder = 'static'
app.template_folder = 'templates'

# Data file for persistent storage
DATA_FILE = 'journal_entries.json'

def load_entries():
    """Load entries from JSON file"""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (json.JSONDecodeError, IOError):
            return []
    return []

def save_entries(entries):
    """Save entries to JSON file"""
    try:
        with open(DATA_FILE, 'w', encoding='utf-8') as f:
            json.dump(entries, f, ensure_ascii=False, indent=2)
        return True
    except IOError:
        return False

def format_timestamp():
    """Format current timestamp"""
    now = datetime.now()
    return now.strftime("%A, %B %d, %Y at %I:%M %p")

@app.route('/')
def index():
    """Main page"""
    return render_template('index.html')

@app.route('/api/entries', methods=['GET'])
def get_entries():
    """Get all journal entries"""
    entries = load_entries()
    return jsonify(entries)

@app.route('/api/entries', methods=['POST'])
def create_entry():
    """Create a new journal entry"""
    data = request.get_json()
    
    if not data or not data.get('name') or not data.get('message'):
        return jsonify({'error': 'Name and message are required'}), 400
    
    # Load existing entries
    entries = load_entries()
    
    # Create new entry
    new_entry = {
        'id': len(entries) + 1,
        'name': data['name'].strip(),
        'message': data['message'].strip(),
        'timestamp': format_timestamp(),
        'date': datetime.now().isoformat()
    }
    
    # Add to beginning of list (newest first)
    entries.insert(0, new_entry)
    
    # Save to file
    if save_entries(entries):
        return jsonify(new_entry), 201
    else:
        return jsonify({'error': 'Failed to save entry'}), 500

@app.route('/api/entries/<int:entry_id>', methods=['DELETE'])
def delete_entry(entry_id):
    """Delete a journal entry"""
    entries = load_entries()
    
    # Find and remove entry
    entries = [entry for entry in entries if entry.get('id') != entry_id]
    
    if save_entries(entries):
        return jsonify({'message': 'Entry deleted successfully'}), 200
    else:
        return jsonify({'error': 'Failed to delete entry'}), 500

@app.route('/api/stats', methods=['GET'])
def get_stats():
    """Get statistics about journal entries"""
    entries = load_entries()
    
    # Calculate statistics
    total_entries = len(entries)
    today = datetime.now().date()
    today_entries = sum(1 for entry in entries 
                       if datetime.fromisoformat(entry['date']).date() == today)
    
    # Calculate streak (simplified - assumes daily entries)
    streak_days = min(total_entries, 7)  # Max 7 days for demo
    
    return jsonify({
        'total_entries': total_entries,
        'today_entries': today_entries,
        'streak_days': streak_days
    })

@app.route('/export')
def export_entries():
    """Export entries as JSON"""
    entries = load_entries()
    
    # Create a formatted export
    export_data = {
        'export_date': datetime.now().isoformat(),
        'total_entries': len(entries),
        'entries': entries
    }
    
    return jsonify(export_data)

@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return render_template('404.html'), 404

@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return render_template('500.html'), 500

if __name__ == '__main__':
    # Create directories if they don't exist
    os.makedirs('templates', exist_ok=True)
    os.makedirs('static/css', exist_ok=True)
    os.makedirs('static/js', exist_ok=True)
    
    # Initialize with sample data if no entries exist
    if not os.path.exists(DATA_FILE):
        sample_entries = [
            {
                'id': 1,
                'name': 'Alex Johnson',
                'message': 'Today I choose to focus on progress, not perfection. Every small step forward is a victory worth celebrating.',
                'timestamp': format_timestamp(),
                'date': datetime.now().isoformat()
            },
            {
                'id': 2,
                'name': 'Sarah Chen',
                'message': 'Gratitude transforms what we have into enough. Today I\'m grateful for the opportunity to grow and learn.',
                'timestamp': format_timestamp(),
                'date': datetime.now().isoformat()
            }
        ]
        save_entries(sample_entries)
    
    app.run(debug=True, host='0.0.0.0', port=5000)