import React, { useState } from 'react';
import { 
  User, MessageCircle, Sword, Shield, MapPin, Scroll, BookOpen, Image,
  Copy, Download, Loader2, ChevronRight, Upload, RefreshCw, Palette,
  Sparkles
} from 'lucide-react';

const Home = () => {
  const [activeTab, setActiveTab] = useState('character');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedId, setSavedId] = useState('');

  // Image-to-Image specific state
  const [sourceImage, setSourceImage] = useState(null);
  const [sourceImagePreview, setSourceImagePreview] = useState(null);
  const [artStyle, setArtStyle] = useState('2d');
  const [assetType, setAssetType] = useState('character');
  const [strength, setStrength] = useState(0.75);

  const API_BASE_URL = process.env.REACT_APP_API_URL;
  
  const tabs = [
    { id: 'character', label: 'Character', icon: User },
    { id: 'quest', label: 'Quest', icon: Scroll },
    { id: 'dialogue', label: 'Dialogue', icon: MessageCircle },
    { id: 'world', label: 'World', icon: MapPin },
    { id: 'enemy', label: 'Enemy', icon: Sword },
    { id: 'item', label: 'Item', icon: Shield },
    { id: 'story', label: 'Story', icon: BookOpen },
    { id: 'image', label: 'Image Gen', icon: Image },
    { id: 'img2img', label: 'Sketch→Art', icon: RefreshCw }
  ];

  const placeholders = {
    character: "Create a water elemental mage...",
    quest: "Design a quest in ancient ruins...",
    dialogue: "Merchant in coastal village...",
    world: "Build an underwater kingdom...",
    enemy: "Design a sea serpent boss...",
    item: "Create a trident of the depths...",
    story: "Write a dramatic ocean voyage...",
    image: "A mystical character portrait, digital art style...",
    img2img: "Optional: Add custom transformation instructions (or leave empty to auto-generate based on your selections)"
  };

  const apiEndpoints = {
  character: `${API_BASE_URL}/api/gemini/character`,
  quest: `${API_BASE_URL}/api/gemini/quest`,
  dialogue: `${API_BASE_URL}/api/gemini/dialogue`,
  world: `${API_BASE_URL}/api/gemini/world`,
  enemy: `${API_BASE_URL}/api/gemini/enemy`,
  item: `${API_BASE_URL}/api/gemini/item`,
  story: `${API_BASE_URL}/api/gemini/story`,
  image: `${API_BASE_URL}/api/gemini/image`,
  img2img: `${API_BASE_URL}/api/gemini/image-to-image`
};

  const artStyles = [
    { value: '2d', label: '2D Game Art', desc: 'Hand-painted style' },
    { value: '3d', label: '3D Rendered', desc: 'Realistic 3D model' },
    { value: 'anime', label: 'Anime Style', desc: 'Cel-shaded art' },
    { value: 'pixel', label: 'Pixel Art', desc: 'Retro gaming' },
    { value: 'realistic', label: 'Realistic', desc: 'Photorealistic' }
  ];

  const assetTypes = [
    { value: 'character', label: 'Character', icon: User },
    { value: 'scene', label: 'Scene/BG', icon: MapPin },
    { value: 'item', label: 'Item/Weapon', icon: Shield },
    { value: 'enemy', label: 'Enemy/Monster', icon: Sword },
    { value: 'ui', label: 'UI Element', icon: Image }
  ];

  // Handle image file upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setSourceImagePreview(event.target.result);
      setSourceImage(event.target.result);
    };
    reader.readAsDataURL(file);
    setError('');
  };

  // Format content (existing function)
  const formatContent = (data, type) => {
    if (typeof data === 'string') return data;
    
    const content = data[type] || data.response || data;
    
    if (typeof content === 'string') return content;
    if (!content || typeof content !== 'object') return JSON.stringify(data, null, 2);

    let formatted = '';

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
    } else if (type === 'quest' && content.title) {
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
      }
    } else {
      formatted = JSON.stringify(content, null, 2);
    }

    return formatted || 'Content generated successfully!';
  };

  const handleSubmit = async () => {
    // ✅ Image-to-Image: Only sourceImage is required, prompt is optional
    if (activeTab === 'img2img') {
      if (!sourceImage) {
        setError('Please upload a source image');
        return;
      }
      // Prompt is optional for img2img - clear error if only prompt is missing
      setError('');
    } else if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);
    setSavedId('');

    try {
      const endpoint = apiEndpoints[activeTab];

      let requestBody;

      if (activeTab === 'img2img') {
        requestBody = {
          sourceImage,
          prompt: prompt.trim() || undefined, // ✅ Send undefined if empty
          artStyle,
          assetType,
          strength,
          width: 1024,
          height: 1024
        };
      } else if (activeTab === 'image') {
        requestBody = {
          prompt,
          artStyle,
          assetType,
          width: 1024,
          height: 1024,
          model: 'flux'
        };
      } else {
        requestBody = { prompt };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Request failed');
      }

      console.log('API Response:', data);

      // Handle image responses
      if (activeTab === 'image' || activeTab === 'img2img') {
        setResponse({
          type: 'image',
          url: data.imageUrl || data.url,
          raw: data,
          metadata: data.imageData,
          usedAutoPrompt: data.imageData?.usedAutoPrompt,
          enhancedPrompt: data.imageData?.enhancedPrompt
        });
      } else {
        const formattedContent = formatContent(data, activeTab);
        setResponse({
          type: 'text',
          content: formattedContent,
          raw: data
        });
      }
      
      if (data.savedId || data.imageData?.savedId) {
        setSavedId(data.savedId || data.imageData.savedId);
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
    link.download = `game-asset-${Date.now()}.png`;
    link.click();
  };

  const renderImageToImageUI = () => (
    <div className="img2img-container">
      <div className="upload-section">
        <div className="upload-box">
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: 'none' }}
          />
          <label htmlFor="imageUpload" className="upload-label">
            {sourceImagePreview ? (
              <div className="preview-container">
                <img src={sourceImagePreview} alt="Source" className="source-preview" />
                <div className="upload-overlay">
                  <Upload size={24} />
                  <span>Change Image</span>
                </div>
              </div>
            ) : (
              <div className="upload-placeholder">
                <Upload size={48} />
                <h3>Upload Your Sketch or Image</h3>
                <p>Click to upload an image (PNG, JPG)</p>
                <p className="hint">✨ We'll transform it based on your selections below</p>
              </div>
            )}
          </label>
        </div>
      </div>

      <div className="settings-grid">
        <div className="setting-group">
          <label className="setting-label">
            <Sparkles size={16} /> Asset Type
          </label>
          <div className="asset-type-grid">
            {assetTypes.map((type) => (
              <button
                key={type.value}
                className={`asset-type-btn ${assetType === type.value ? 'active' : ''}`}
                onClick={() => setAssetType(type.value)}
              >
                <type.icon size={20} />
                <span>{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="setting-group">
          <label className="setting-label">
            <Palette size={16} /> Art Style
          </label>
          <div className="style-select-grid">
            {artStyles.map((style) => (
              <button
                key={style.value}
                className={`style-btn ${artStyle === style.value ? 'active' : ''}`}
                onClick={() => setArtStyle(style.value)}
              >
                <strong>{style.label}</strong>
                <span>{style.desc}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="setting-group">
          <label className="setting-label">
            Transformation Strength: {(strength * 100).toFixed(0)}%
          </label>
          <input
            type="range"
            min="0.5"
            max="0.95"
            step="0.05"
            value={strength}
            onChange={(e) => setStrength(parseFloat(e.target.value))}
            className="strength-slider"
          />
          <div className="slider-labels">
            <span>Keep original (50%)</span>
            <span>Full transform (95%)</span>
          </div>
        </div>
      </div>

      {sourceImage && (
        <div className="auto-prompt-info">
          <p>💡 <strong>Tip:</strong> Leave prompt empty to auto-generate based on your Asset Type and Art Style selections!</p>
        </div>
      )}
    </div>
  );

  const renderResponse = () => {
    if (!response) return null;

    if (response.type === 'image') {
      return (
        <div className="response-box">
          <div className="response-header">
            <h3>{activeTab === 'img2img' ? 'Transformed Image' : 'Generated Image'}</h3>
            <div className="header-actions">
              {savedId && <span className="id-badge">{savedId.substring(0, 8)}</span>}
              <button 
                onClick={() => downloadImage(response.url)}
                className="icon-btn"
                title="Download"
              >
                <Download size={18} />
              </button>
            </div>
          </div>

          {response.usedAutoPrompt && (
            <div className="auto-prompt-badge">
              <Sparkles size={14} />
              <span>Auto-generated prompt: {response.enhancedPrompt}</span>
            </div>
          )}

          {activeTab === 'img2img' && sourceImagePreview && (
            <div className="comparison-grid">
              <div className="comparison-item">
                <h4>Original Image</h4>
                <img src={sourceImagePreview} alt="Original" className="comparison-img" />
              </div>
              <div className="comparison-arrow">→</div>
              <div className="comparison-item">
                <h4>Professional Art</h4>
                <img src={response.url} alt="Generated" className="comparison-img" />
              </div>
            </div>
          )}

          {activeTab === 'image' && (
            <div className="image-wrapper">
              <img src={response.url} alt="Generated" className="generated-image" />
            </div>
          )}

          {response.metadata && (
            <div className="metadata">
              <p><strong>Style:</strong> {response.metadata.artStyle || 'Default'}</p>
              <p><strong>Model:</strong> {response.metadata.model}</p>
              <p><strong>Dimensions:</strong> {response.metadata.width}x{response.metadata.height}</p>
              {response.metadata.strength && (
                <p><strong>Strength:</strong> {(response.metadata.strength * 100).toFixed(0)}%</p>
              )}
            </div>
          )}
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
        }

        .header p {
          font-size: 0.95rem;
          color: rgba(253, 252, 250, 0.8);
        }

        .tabs {
          display: flex;
          background: #f5ede0;
          border-bottom: 1px solid #d6ba90;
          overflow-x: auto;
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

        .content {
          padding: 32px;
        }

        .form {
          margin-bottom: 28px;
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
          margin-bottom: 20px;
        }

        .textarea:focus {
          outline: none;
          border-color: #92400e;
          background: #fff;
        }

        /* Image-to-Image Styles */
        .img2img-container {
          margin-bottom: 24px;
        }

        .upload-section {
          margin-bottom: 24px;
        }

        .upload-box {
          border: 2px dashed #d6ba90;
          border-radius: 12px;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        .upload-box:hover {
          border-color: #92400e;
          background: #faf9f7;
        }

        .upload-label {
          display: block;
          cursor: pointer;
        }

        .preview-container {
          position: relative;
          width: 100%;
          height: 300px;
        }

        .source-preview {
          width: 100%;
          height: 100%;
          object-fit: contain;
        }

        .upload-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(146, 64, 14, 0.9);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.3s ease;
          color: #fdfcfa;
        }

        .preview-container:hover .upload-overlay {
          opacity: 1;
        }

        .upload-placeholder {
          padding: 60px 20px;
          text-align: center;
          color: #92400e;
        }

        .upload-placeholder h3 {
          margin: 16px 0 8px;
          font-size: 1.1rem;
        }

        .upload-placeholder p {
          color: #a89880;
          font-size: 0.9rem;
        }

        .upload-placeholder .hint {
          margin-top: 12px;
          font-size: 0.85rem;
          color: #92400e;
          font-weight: 500;
        }

        .settings-grid {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .setting-group {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .setting-label {
          font-weight: 600;
          color: #2d3748;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .asset-type-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 10px;
        }

        .asset-type-btn {
          padding: 14px;
          border: 2px solid #d6ba90;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
          color: #625448;
        }

        .asset-type-btn:hover {
          border-color: #92400e;
          background: #faf9f7;
        }

        .asset-type-btn.active {
          border-color: #92400e;
          background: #f5ede0;
          color: #92400e;
        }

        .style-select-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 10px;
        }

        .style-btn {
          padding: 12px;
          border: 2px solid #d6ba90;
          background: white;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          flex-direction: column;
          gap: 4px;
          text-align: left;
        }

        .style-btn strong {
          color: #2d3748;
          font-size: 0.9rem;
        }

        .style-btn span {
          color: #a89880;
          font-size: 0.75rem;
        }

        .style-btn:hover {
          border-color: #92400e;
          background: #faf9f7;
        }

        .style-btn.active {
          border-color: #92400e;
          background: #f5ede0;
        }

        .strength-slider {
          width: 100%;
          height: 6px;
          border-radius: 3px;
          background: #e6e1d6;
          outline: none;
          -webkit-appearance: none;
        }

        .strength-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #92400e;
          cursor: pointer;
        }

        .slider-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: #a89880;
        }

        .auto-prompt-info {
          background: #fff8e1;
          border-left: 3px solid #ffa000;
          padding: 14px 18px;
          border-radius: 6px;
          margin-top: 16px;
        }

        .auto-prompt-info p {
          font-size: 0.9rem;
          color: #b35900;
          margin: 0;
        }

        .auto-prompt-badge {
          background: #e3f2fd;
          border-left: 3px solid #2196f3;
          padding: 12px 16px;
          border-radius: 6px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.85rem;
          color: #1565c0;
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

        .comparison-grid {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 20px;
          align-items: center;
          margin-bottom: 20px;
        }

        .comparison-item h4 {
          font-size: 0.9rem;
          margin-bottom: 12px;
          color: #625448;
          text-align: center;
        }

        .comparison-img {
          width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .comparison-arrow {
          font-size: 2rem;
          color: #92400e;
          font-weight: bold;
        }

        .image-wrapper {
          text-align: center;
          margin-bottom: 16px;
        }

        .generated-image {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .metadata {
          padding: 16px;
          background: #faf9f7;
          border-radius: 6px;
          font-size: 0.85rem;
        }

        .metadata p {
          margin: 4px 0;
          color: #625448;
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
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .comparison-grid {
            grid-template-columns: 1fr;
          }

          .comparison-arrow {
            transform: rotate(90deg);
            margin: 12px 0;
          }

          .asset-type-grid,
          .style-select-grid {
            grid-template-columns: 1fr 1fr;
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
                setSourceImage(null);
                setSourceImagePreview(null);
              }}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="content">
          {error && <div className="error">{error}</div>}

          <div className="form">
            {activeTab === 'img2img' && renderImageToImageUI()}

            <textarea
              className="textarea"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={placeholders[activeTab]}
              disabled={loading}
            />

            <button
              onClick={handleSubmit}
              className="submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  {activeTab === 'img2img' ? 'Transforming...' : 'Generating...'}
                </>
              ) : (
                <>
                  {activeTab === 'img2img' ? <Palette size={18} /> : <ChevronRight size={18} />}
                  {activeTab === 'img2img' ? 'Transform to Art' : `Generate ${tabs.find(t => t.id === activeTab)?.label}`}
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