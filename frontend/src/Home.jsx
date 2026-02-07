import React, { useState } from 'react';
import { 
  User, MessageCircle, Sword, Shield, MapPin, Scroll, BookOpen, Image,
  Send, Copy, Download, Loader2, ChevronRight
} from 'lucide-react';

const Home = () => {
  const [activeTab, setActiveTab] = useState('character');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedId, setSavedId] = useState('');

  // Updated tabs with image generation
  const tabs = [
    { id: 'character', label: 'Character', icon: User },
    { id: 'quest', label: 'Quest', icon: Scroll },
    { id: 'dialogue', label: 'Dialogue', icon: MessageCircle },
    { id: 'world', label: 'World', icon: MapPin },
    { id: 'enemy', label: 'Enemy', icon: Sword },
    { id: 'item', label: 'Item', icon: Shield },
    { id: 'story', label: 'Story', icon: BookOpen },
    { id: 'image', label: 'Image', icon: Image }
  ];

  const placeholders = {
    character: "Create a water elemental mage...",
    quest: "Design a quest in ancient ruins...",
    dialogue: "Merchant in coastal village...",
    world: "Build an underwater kingdom...",
    enemy: "Design a sea serpent boss...",
    item: "Create a trident of the depths...",
    story: "Write a dramatic ocean voyage...",
    image: "A mystical character portrait, digital art style..."
  };

  const apiEndpoints = {
    character: 'http://localhost:5000/api/gemini/character',
    quest: 'http://localhost:5000/api/gemini/quest',
    dialogue: 'http://localhost:5000/api/gemini/dialogue',
    world: 'http://localhost:5000/api/gemini/world',
    enemy: 'http://localhost:5000/api/gemini/enemy',
    item: 'http://localhost:5000/api/gemini/item',
    story: 'http://localhost:5000/api/gemini/story',
    image: 'http://localhost:5000/api/gemini/image'
  };

  // Format JSON data into clean text
  const formatContent = (data, type) => {
    if (typeof data === 'string') return data;
    
    const content = data[type] || data.response || data;
    
    if (typeof content === 'string') return content;
    if (!content || typeof content !== 'object') return JSON.stringify(data, null, 2);

    let formatted = '';

    // Character
    if (type === 'character' && content.name) {
      formatted += `${content.name}\n${'─'.repeat(40)}\n\n`;
      if (content.class) formatted += `Class: ${content.class}\n\n`;
      if (content.backstory) formatted += `${content.backstory}\n\n`;
      if (content.personality) formatted += `Personality: ${content.personality}\n\n`;
      
      if (content.abilities && Array.isArray(content.abilities)) {
        formatted += `Abilities:\n`;
        content.abilities.forEach(ability => formatted += `• ${ability}\n`);
        formatted += '\n';
      }
      
      if (content.stats) {
        formatted += `Stats:\n`;
        Object.entries(content.stats).forEach(([key, value]) => {
          formatted += `${key}: ${value}\n`;
        });
      }
    }
    
    // Quest
    else if (type === 'quest' && content.title) {
      formatted += `${content.title}\n${'─'.repeat(40)}\n\n`;
      if (content.type && content.difficulty) {
        formatted += `Type: ${content.type} | Difficulty: ${content.difficulty}\n\n`;
      }
      if (content.description) formatted += `${content.description}\n\n`;
      
      if (content.objectives && Array.isArray(content.objectives)) {
        formatted += `Objectives:\n`;
        content.objectives.forEach((obj, i) => {
          const task = typeof obj === 'string' ? obj : obj.task;
          formatted += `${i + 1}. ${task}\n`;
        });
        formatted += '\n';
      }
      
      if (content.rewards) {
        formatted += `Rewards:\n`;
        if (content.rewards.experience) formatted += `XP: ${content.rewards.experience}\n`;
        if (content.rewards.gold) formatted += `Gold: ${content.rewards.gold}\n`;
        if (content.rewards.items) {
          content.rewards.items.forEach(item => formatted += `• ${item}\n`);
        }
      }
    }
    
    // Dialogue
    else if (type === 'dialogue' && content.npcName) {
      formatted += `${content.npcName}\n${'─'.repeat(40)}\n\n`;
      if (content.npcRole) formatted += `Role: ${content.npcRole}\n`;
      if (content.location) formatted += `Location: ${content.location}\n\n`;
      
      if (content.dialogueOptions && Array.isArray(content.dialogueOptions)) {
        content.dialogueOptions.forEach((option) => {
          if (option.npcLine) formatted += `NPC: "${option.npcLine}"\n\n`;
          
          if (option.playerChoices && Array.isArray(option.playerChoices)) {
            formatted += `Player Choices:\n`;
            option.playerChoices.forEach((choice, i) => {
              formatted += `${i + 1}. "${choice.text}"\n`;
              if (choice.response) formatted += `   → "${choice.response}"\n\n`;
            });
          }
        });
      }
    }
    
    // World
    else if (type === 'world' && content.name) {
      formatted += `${content.name}\n${'─'.repeat(40)}\n\n`;
      if (content.type) formatted += `Type: ${content.type}\n\n`;
      if (content.description) formatted += `${content.description}\n\n`;
      
      if (content.pointsOfInterest && Array.isArray(content.pointsOfInterest)) {
        formatted += `Points of Interest:\n`;
        content.pointsOfInterest.forEach(poi => {
          formatted += `• ${poi.name || poi}\n`;
          if (poi.description) formatted += `  ${poi.description}\n`;
        });
      }
    }
    
    // Enemy
    else if (type === 'enemy' && content.name) {
      formatted += `${content.name}\n${'─'.repeat(40)}\n\n`;
      if (content.type) formatted += `Type: ${content.type}\n`;
      if (content.level) formatted += `Level: ${content.level}\n\n`;
      if (content.description) formatted += `${content.description}\n\n`;
      
      if (content.stats) {
        formatted += `Stats:\n`;
        Object.entries(content.stats).forEach(([key, value]) => {
          formatted += `${key}: ${value}\n`;
        });
        formatted += '\n';
      }
      
      if (content.abilities && Array.isArray(content.abilities)) {
        formatted += `Abilities:\n`;
        content.abilities.forEach(ability => {
          if (typeof ability === 'object') {
            formatted += `• ${ability.name}`;
            if (ability.damage) formatted += ` (${ability.damage} damage)`;
            formatted += '\n';
          } else {
            formatted += `• ${ability}\n`;
          }
        });
      }
    }
    
    // Item
    else if (type === 'item' && content.name) {
      formatted += `${content.name}\n${'─'.repeat(40)}\n\n`;
      if (content.type && content.rarity) {
        formatted += `Type: ${content.type} | Rarity: ${content.rarity}\n\n`;
      }
      if (content.description) formatted += `${content.description}\n\n`;
      
      if (content.effects && Array.isArray(content.effects)) {
        formatted += `Effects:\n`;
        content.effects.forEach(effect => formatted += `• ${effect}\n`);
        formatted += '\n';
      }
      
      if (content.lore) formatted += `Lore:\n${content.lore}\n`;
    }
    
    // Story
    else if (type === 'story' && content.title) {
      formatted += `${content.title}\n${'─'.repeat(40)}\n\n`;
      if (content.scene) formatted += `${content.scene}\n\n`;
      
      if (content.choices && Array.isArray(content.choices)) {
        formatted += `Player Choices:\n\n`;
        content.choices.forEach((choice, i) => {
          formatted += `${i + 1}. ${choice.option}\n`;
          if (choice.consequence) formatted += `   → ${choice.consequence}\n\n`;
        });
      }
    }
    
    else {
      formatted = JSON.stringify(content, null, 2);
    }

    return formatted || 'Content generated successfully!';
  };

  const handleSubmit = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);
    setSavedId('');

    try {
      const endpoint = apiEndpoints[activeTab];

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Request failed');
      }

      console.log('API Response:', data);

      // Handle image response
      if (activeTab === 'image') {
        setResponse({
          type: 'image',
          url: data.imageUrl || data.url,
          raw: data
        });
      } else {
        const formattedContent = formatContent(data, activeTab);
        setResponse({
          type: 'text',
          content: formattedContent,
          raw: data
        });
      }
      
      if (data.savedId) {
        setSavedId(data.savedId);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const downloadImage = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = 'generated-image.png';
    link.click();
  };

  const renderResponse = () => {
    if (!response) return null;

    if (response.type === 'image') {
      return (
        <div className="response-box">
          <div className="response-header">
            <h3>Generated Image</h3>
            <button 
              onClick={() => downloadImage(response.url)}
              className="icon-btn"
              title="Download"
            >
              <Download size={18} />
            </button>
          </div>
          <div className="image-wrapper">
            <img src={response.url} alt="Generated" className="generated-image" />
          </div>
        </div>
      );
    }

    return (
      <div className="response-box">
        <div className="response-header">
          <h3>Generated Content</h3>
          <div className="header-actions">
            {savedId && <span className="id-badge">{savedId.substring(0, 8)}</span>}
            <button 
              onClick={() => copyToClipboard(response.content)}
              className="icon-btn"
              title="Copy"
            >
              <Copy size={18} />
            </button>
          </div>
        </div>
        <pre className="content-display">{response.content}</pre>
      </div>
    );
  };

  return (
    <div className="app">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background: linear-gradient(135deg, #1e3a5f 0%, #2a5470 100%);
          color: #2d3748;
        }

        .app {
          min-height: 100vh;
          padding: 24px;
          background: linear-gradient(135deg, #1e3a5f 0%, #2a5470 100%);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          background: #fdfcfa;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        }

        .header {
          background: linear-gradient(135deg, #2c5f7f 0%, #1e3a5f 100%);
          padding: 40px 32px;
          border-bottom: 3px solid #92400e;
        }

        .header h1 {
          font-size: 2rem;
          font-weight: 300;
          color: #fdfcfa;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }

        .header p {
          font-size: 0.95rem;
          color: rgba(253, 252, 250, 0.8);
          font-weight: 400;
        }

        .tabs {
          display: flex;
          background: #f5ede0;
          border-bottom: 1px solid #d6ba90;
          overflow-x: auto;
          padding: 0;
        }

        .tabs::-webkit-scrollbar {
          height: 4px;
        }

        .tabs::-webkit-scrollbar-thumb {
          background: #92400e;
          border-radius: 2px;
        }

        .tab {
          flex: 1;
          min-width: 120px;
          padding: 16px 20px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 500;
          font-size: 0.9rem;
          color: #625448;
          border-bottom: 2px solid transparent;
        }

        .tab:hover:not(.active) {
          background: rgba(146, 64, 14, 0.05);
          color: #92400e;
        }

        .tab.active {
          background: #fdfcfa;
          color: #92400e;
          border-bottom: 2px solid #92400e;
        }

        .tab-icon {
          color: inherit;
        }

        .content {
          padding: 32px;
        }

        .form {
          margin-bottom: 28px;
        }

        .input-wrapper {
          margin-bottom: 20px;
        }

        .textarea {
          width: 100%;
          min-height: 140px;
          padding: 18px;
          border: 2px solid #d6ba90;
          border-radius: 8px;
          font-size: 15px;
          font-family: inherit;
          resize: vertical;
          transition: all 0.2s ease;
          background: #fdfcfa;
          color: #2d3748;
        }

        .textarea::placeholder {
          color: #a89880;
        }

        .textarea:focus {
          outline: none;
          border-color: #92400e;
          background: #fff;
        }

        .submit-btn {
          background: #92400e;
          color: #fdfcfa;
          border: none;
          padding: 14px 28px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .submit-btn:hover:not(:disabled) {
          background: #7a421c;
          transform: translateY(-1px);
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error {
          background: #fee;
          border-left: 3px solid #c53030;
          color: #c53030;
          padding: 14px 18px;
          border-radius: 6px;
          margin-bottom: 20px;
          font-size: 0.9rem;
        }

        .response-box {
          background: #fff;
          border: 1px solid #e6e1d6;
          border-radius: 8px;
          padding: 24px;
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .response-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e6e1d6;
        }

        .response-header h3 {
          font-size: 1.1rem;
          font-weight: 500;
          color: #2d3748;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .id-badge {
          background: #f5ede0;
          color: #92400e;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          font-family: 'Courier New', monospace;
        }

        .icon-btn {
          background: #f5ede0;
          border: 1px solid #d6ba90;
          color: #92400e;
          padding: 8px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .icon-btn:hover {
          background: #e8dcc8;
        }

        .content-display {
          font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
          font-size: 14px;
          line-height: 1.7;
          color: #2d3748;
          white-space: pre-wrap;
          word-wrap: break-word;
          background: #faf9f7;
          padding: 18px;
          border-radius: 6px;
          border: 1px solid #e6e1d6;
          overflow-x: auto;
        }

        .image-wrapper {
          text-align: center;
        }

        .generated-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .app {
            padding: 12px;
          }

          .header {
            padding: 28px 20px;
          }

          .header h1 {
            font-size: 1.5rem;
          }

          .content {
            padding: 20px;
          }

          .tabs {
            gap: 0;
          }

          .tab {
            min-width: 100px;
            padding: 12px 16px;
            font-size: 0.85rem;
          }

          .response-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }

          .content-display {
            font-size: 13px;
          }
        }
      `}</style>

      <div className="container">
        <div className="header">
          <h1>MythiCraft Engine</h1>
          <p>AI-Powered Game Development Assistant</p>
        </div>

        <div className="tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => {
                setActiveTab(tab.id);
                setPrompt('');
                setResponse(null);
                setError('');
              }}
            >
              <tab.icon size={18} className="tab-icon" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="content">
          {error && <div className="error">{error}</div>}

          <div className="form">
            <div className="input-wrapper">
              <textarea
                className="textarea"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={placeholders[activeTab]}
                disabled={loading}
              />
            </div>

            <button
              onClick={handleSubmit}
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  Generating...
                </>
              ) : (
                <>
                  <ChevronRight size={18} />
                  Generate {tabs.find(t => t.id === activeTab)?.label}
                </>
              )}
            </button>
          </div>

          {renderResponse()}
        </div>
      </div>
    </div>
  );
};

export default Home;