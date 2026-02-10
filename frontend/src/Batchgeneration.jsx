import React, { useState } from 'react';
import { Layers, Loader2, CheckCircle, XCircle, Download, Globe, Copy, Check, Image as ImageIcon, Sparkles, ChevronRight } from 'lucide-react';

const BatchGeneration = () => {
  const [batchType, setBatchType] = useState('single'); 
  const [contentType, setContentType] = useState('character');
  const [count, setCount] = useState(5);
  const [basePrompt, setBasePrompt] = useState('');
  const [variations, setVariations] = useState(true);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Image generation state
  const [imagePrompts, setImagePrompts] = useState(['']);
  const [imageWidth, setImageWidth] = useState(1024);
  const [imageHeight, setImageHeight] = useState(1024);
  const [artStyle, setArtStyle] = useState('2d');

  // World generation state
  const [worldTheme, setWorldTheme] = useState('');
  const [worldConfig, setWorldConfig] = useState({
    characters: 3,
    quests: 2,
    enemies: 3,
    items: 4,
    locations: 2
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

  // Navigate back to Home page
  const navigateToHome = () => {
    window.location.href = '/';
    // OR if using React Router:
    // navigate('/');
  };

  const contentTypes = [
    { value: 'character', label: 'Characters' },
    { value: 'quest', label: 'Quests' },
    { value: 'dialogue', label: 'Dialogues' },
    { value: 'enemy', label: 'Enemies' },
    { value: 'item', label: 'Items' },
    { value: 'world', label: 'Locations' },
    { value: 'story', label: 'Story Beats' }
  ];

  const artStyles = [
    { value: '2d', label: '2D Game Art', desc: 'Hand-painted style' },
    { value: '3d', label: '3D Rendered', desc: 'Realistic 3D model' },
    { value: 'anime', label: 'Anime Style', desc: 'Cel-shaded art' },
    { value: 'pixel', label: 'Pixel Art', desc: 'Retro gaming' },
    { value: 'realistic', label: 'Realistic', desc: 'Photorealistic' }
  ];

  const handleBatchGenerate = async () => {
    if (!basePrompt.trim()) {
      setError('Please enter a base prompt');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/gemini/batch/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: contentType,
          count: parseInt(count),
          basePrompt,
          variations,
          saveToDb: true
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Batch generation failed');
      }

      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleWorldGenerate = async () => {
    if (!worldTheme.trim()) {
      setError('Please enter a world theme');
      return;
    }

    const total = Object.values(worldConfig).reduce((sum, val) => sum + val, 0);
    if (total === 0) {
      setError('Please select at least one content type');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/gemini/batch/world`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: worldTheme,
          ...worldConfig
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'World generation failed');
      }

      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageGenerate = async () => {
    const validPrompts = imagePrompts.filter(p => p.trim());
    
    if (validPrompts.length === 0) {
      setError('Please enter at least one image prompt');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/gemini/batch/images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompts: validPrompts,
          artStyle,
          width: imageWidth,
          height: imageHeight
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Image generation failed');
      }

      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addImagePrompt = () => {
    if (imagePrompts.length < 10) {
      setImagePrompts([...imagePrompts, '']);
    }
  };

  const updateImagePrompt = (index, value) => {
    const newPrompts = [...imagePrompts];
    newPrompts[index] = value;
    setImagePrompts(newPrompts);
  };

  const removeImagePrompt = (index) => {
    if (imagePrompts.length > 1) {
      setImagePrompts(imagePrompts.filter((_, i) => i !== index));
    }
  };

  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const downloadResults = () => {
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `batch-results-${Date.now()}.json`;
    link.click();
  };

  return (
    <div className="batch-app">
      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .batch-app {
          min-height: 100vh;
          padding: 24px;
          background: linear-gradient(135deg, #1e3a5f 0%, #2a5470 100%);
        }

        .batch-container {
          max-width: 1400px;
          margin: 0 auto;
          background: #fdfcfa;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        }

        .batch-header {
          background: linear-gradient(135deg, #2c5f7f 0%, #1e3a5f 100%);
          padding: 40px 32px;
          border-bottom: 3px solid #92400e;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 24px;
        }

        .header-text h1 {
          font-size: 2rem;
          font-weight: 300;
          color: #fdfcfa;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .header-text p {
          font-size: 0.95rem;
          color: rgba(253, 252, 250, 0.8);
        }

        .home-nav-btn {
          background: rgba(253, 252, 250, 0.15);
          border: 2px solid rgba(253, 252, 250, 0.3);
          color: #fdfcfa;
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          backdrop-filter: blur(10px);
          white-space: nowrap;
        }

        .home-nav-btn:hover {
          background: rgba(253, 252, 250, 0.25);
          border-color: rgba(253, 252, 250, 0.5);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }

        .home-nav-btn:active {
          transform: translateY(0);
        }

        .batch-tabs {
          display: flex;
          background: #f5ede0;
          border-bottom: 1px solid #d6ba90;
          overflow-x: auto;
        }

        .batch-tab {
          flex: 1;
          min-width: 160px;
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

        .batch-tab:hover:not(.active) {
          background: rgba(146, 64, 14, 0.05);
          color: #92400e;
        }

        .batch-tab.active {
          background: #fdfcfa;
          color: #92400e;
          border-bottom: 2px solid #92400e;
        }

        .batch-content {
          padding: 32px;
        }

        .form-section {
          background: white;
          border-radius: 12px;
          padding: 28px;
          border: 2px solid #e6e1d6;
          margin-bottom: 24px;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-group:last-child {
          margin-bottom: 0;
        }

        .form-label {
          display: block;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 10px;
          font-size: 0.9rem;
        }

        .form-input,
        .form-select {
          width: 100%;
          padding: 14px 16px;
          border: 2px solid #d6ba90;
          border-radius: 8px;
          font-size: 15px;
          font-family: inherit;
          transition: all 0.2s ease;
          background: #fdfcfa;
        }

        .form-input:focus,
        .form-select:focus {
          outline: none;
          border-color: #92400e;
          background: #fff;
        }

        .form-textarea {
          width: 100%;
          min-height: 120px;
          padding: 14px 16px;
          border: 2px solid #d6ba90;
          border-radius: 8px;
          font-size: 15px;
          font-family: inherit;
          resize: vertical;
          transition: all 0.2s ease;
          background: #fdfcfa;
        }

        .form-textarea:focus {
          outline: none;
          border-color: #92400e;
          background: #fff;
        }

        .slider-container {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .slider {
          flex: 1;
          height: 6px;
          border-radius: 3px;
          background: #e6e1d6;
          outline: none;
          -webkit-appearance: none;
        }

        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #92400e;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .slider::-webkit-slider-thumb:hover {
          background: #7a421c;
          transform: scale(1.1);
        }

        .slider-value {
          font-weight: 600;
          color: #92400e;
          min-width: 50px;
          text-align: center;
          font-size: 1.1rem;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px;
          background: #faf9f7;
          border-radius: 8px;
          border: 2px solid #e6e1d6;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .checkbox-group:hover {
          border-color: #d6ba90;
          background: #f5ede0;
        }

        .checkbox-input {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: #92400e;
        }

        .world-config-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .world-config-item {
          padding: 18px;
          border: 2px solid #d6ba90;
          border-radius: 8px;
          background: #fdfcfa;
          transition: all 0.2s ease;
        }

        .world-config-item:hover {
          border-color: #92400e;
          background: #faf9f7;
        }

        .world-config-item label {
          display: block;
          font-weight: 600;
          margin-bottom: 10px;
          color: #2d3748;
          font-size: 0.9rem;
        }

        .world-config-item input {
          width: 100%;
          padding: 10px;
          border: 2px solid #e6e1d6;
          border-radius: 6px;
          font-size: 15px;
          text-align: center;
          font-weight: 600;
          color: #92400e;
        }

        .world-config-item input:focus {
          outline: none;
          border-color: #92400e;
        }

        .image-prompt-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .image-prompt-item {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .image-prompt-item input {
          flex: 1;
        }

        .btn-remove {
          padding: 10px 16px;
          background: #c53030;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
          font-weight: 500;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .btn-remove:hover {
          background: #9b2c2c;
          transform: translateY(-1px);
        }

        .btn-add {
          padding: 12px 24px;
          background: #48bb78;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          margin-top: 8px;
          transition: all 0.2s ease;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .btn-add:hover {
          background: #38a169;
          transform: translateY(-1px);
        }

        .style-select-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 10px;
        }

        .style-btn {
          padding: 14px;
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

        .error-box {
          background: #fee;
          border-left: 3px solid #c53030;
          color: #c53030;
          padding: 14px 18px;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .results-box {
          background: white;
          border-radius: 12px;
          padding: 28px;
          border: 2px solid #e6e1d6;
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

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e6e1d6;
        }

        .results-header h3 {
          font-size: 1.3rem;
          font-weight: 500;
          color: #2d3748;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .download-btn {
          background: #3182ce;
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .download-btn:hover {
          background: #2c5282;
          transform: translateY(-1px);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 28px;
        }

        .stat-card {
          padding: 20px;
          background: #faf9f7;
          border-radius: 8px;
          border-left: 4px solid #92400e;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #718096;
          margin-bottom: 6px;
          font-weight: 500;
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: 700;
          color: #92400e;
        }

        .results-list {
          max-height: 600px;
          overflow-y: auto;
        }

        .result-item {
          padding: 20px;
          border: 2px solid #e6e1d6;
          border-radius: 8px;
          margin-bottom: 16px;
          background: white;
          transition: all 0.2s ease;
        }

        .result-item:hover {
          border-color: #d6ba90;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .result-item.success {
          border-left: 4px solid #48bb78;
        }

        .result-item.error {
          border-left: 4px solid #c53030;
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
        }

        .result-index {
          font-weight: 600;
          color: #2d3748;
          font-size: 1.05rem;
        }

        .result-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .result-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .copy-btn {
          padding: 8px 14px;
          background: #3182ce;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          transition: all 0.2s ease;
          font-weight: 500;
        }

        .copy-btn:hover {
          background: #2c5282;
          transform: translateY(-1px);
        }

        .copy-btn.copied {
          background: #48bb78;
        }

        .result-content {
          background: #faf9f7;
          padding: 18px;
          border-radius: 6px;
          border: 1px solid #e6e1d6;
          margin-top: 12px;
        }

        .json-display {
          font-family: 'SF Mono', 'Monaco', 'Consolas', monospace;
          font-size: 0.85rem;
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-word;
          color: #2d3748;
          max-height: 400px;
          overflow-y: auto;
        }

        .image-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        .image-result {
          border: 2px solid #e6e1d6;
          border-radius: 8px;
          padding: 16px;
          background: white;
          transition: all 0.2s ease;
        }

        .image-result:hover {
          border-color: #92400e;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .image-result img {
          width: 100%;
          height: auto;
          border-radius: 6px;
          margin-bottom: 12px;
        }

        .image-prompt {
          font-size: 0.85rem;
          color: #4a5568;
          margin-bottom: 10px;
          line-height: 1.5;
        }

        .dimension-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .dimension-input-wrapper label {
          display: block;
          font-size: 0.85rem;
          color: #718096;
          margin-bottom: 6px;
          font-weight: 500;
        }

        .category-section {
          margin-bottom: 32px;
        }

        .category-header {
          margin-bottom: 16px;
          padding-bottom: 12px;
          border-bottom: 2px solid #e6e1d6;
        }

        .category-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #2d3748;
          text-transform: capitalize;
        }

        .category-count {
          font-size: 0.9rem;
          color: #718096;
          font-weight: 500;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .world-total-info {
          margin-top: 12px;
          padding: 12px;
          background: #fff8e1;
          border-left: 3px solid #ffa000;
          border-radius: 6px;
        }

        .world-total-info p {
          font-size: 0.85rem;
          color: #b35900;
          margin: 0;
        }

        @media (max-width: 768px) {
          .header-content {
            flex-direction: column;
            gap: 16px;
            align-items: flex-start;
          }

          .home-nav-btn {
            width: 100%;
            justify-content: center;
          }

          .world-config-grid,
          .dimension-inputs,
          .style-select-grid {
            grid-template-columns: 1fr;
          }

          .stats-grid {
            grid-template-columns: 1fr 1fr;
          }

          .image-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="batch-container">
        <div className="batch-header">
          <div className="header-content">
            <div className="header-text">
              <h1>
                <Layers size={28} />
                Batch Generation Engine
              </h1>
              <p>Generate multiple content pieces at once with structured JSON output</p>
            </div>
            <button className="home-nav-btn" onClick={navigateToHome}>
              <ChevronRight size={18} style={{ transform: 'rotate(180deg)' }} />
              Back to Home
            </button>
          </div>
        </div>

        <div className="batch-tabs">
          <button
            className={`batch-tab ${batchType === 'single' ? 'active' : ''}`}
            onClick={() => setBatchType('single')}
          >
            <Layers size={18} /> Single Type
          </button>
          <button
            className={`batch-tab ${batchType === 'world' ? 'active' : ''}`}
            onClick={() => setBatchType('world')}
          >
            <Globe size={18} /> Complete World
          </button>
          <button
            className={`batch-tab ${batchType === 'images' ? 'active' : ''}`}
            onClick={() => setBatchType('images')}
          >
            <ImageIcon size={18} /> Batch Images
          </button>
        </div>

        <div className="batch-content">
          {error && <div className="error-box">{error}</div>}

          {batchType === 'single' && (
            <div className="form-section">
              <div className="form-group">
                <label className="form-label">Content Type</label>
                <select
                  className="form-select"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                >
                  {contentTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">How many to generate? (1-20)</label>
                <div className="slider-container">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={count}
                    onChange={(e) => setCount(e.target.value)}
                    className="slider"
                  />
                  <span className="slider-value">{count}</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Base Prompt</label>
                <textarea
                  className="form-textarea"
                  value={basePrompt}
                  onChange={(e) => setBasePrompt(e.target.value)}
                  placeholder="Create a fire-based warrior character with unique abilities..."
                />
              </div>

              <div className="form-group">
                <label className="checkbox-group">
                  <input
                    type="checkbox"
                    className="checkbox-input"
                    checked={variations}
                    onChange={(e) => setVariations(e.target.checked)}
                  />
                  <span style={{ fontWeight: 600, color: '#2d3748' }}>
                    Generate variations (adds unique traits to each item)
                  </span>
                </label>
              </div>

              <button
                className="submit-btn"
                onClick={handleBatchGenerate}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="spinner" />
                    Generating {count} {contentType}s...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Generate Batch
                  </>
                )}
              </button>
            </div>
          )}

          {batchType === 'world' && (
            <div className="form-section">
              <div className="form-group">
                <label className="form-label">World Theme</label>
                <input
                  type="text"
                  className="form-input"
                  value={worldTheme}
                  onChange={(e) => setWorldTheme(e.target.value)}
                  placeholder="Underwater kingdom, cyberpunk city, medieval fantasy realm..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Content Breakdown</label>
                <div className="world-config-grid">
                  <div className="world-config-item">
                    <label>Characters</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={worldConfig.characters}
                      onChange={(e) => setWorldConfig({...worldConfig, characters: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="world-config-item">
                    <label>Quests</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={worldConfig.quests}
                      onChange={(e) => setWorldConfig({...worldConfig, quests: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="world-config-item">
                    <label>Enemies</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={worldConfig.enemies}
                      onChange={(e) => setWorldConfig({...worldConfig, enemies: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="world-config-item">
                    <label>Items</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={worldConfig.items}
                      onChange={(e) => setWorldConfig({...worldConfig, items: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="world-config-item">
                    <label>Locations</label>
                    <input
                      type="number"
                      min="0"
                      max="10"
                      value={worldConfig.locations}
                      onChange={(e) => setWorldConfig({...worldConfig, locations: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="world-total-info">
                  <p>
                    <strong>Total items:</strong> {Object.values(worldConfig).reduce((sum, val) => sum + val, 0)} (maximum 30)
                  </p>
                </div>
              </div>

              <button
                className="submit-btn"
                onClick={handleWorldGenerate}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="spinner" />
                    Generating World...
                  </>
                ) : (
                  <>
                    <Globe size={18} />
                    Generate Complete World
                  </>
                )}
              </button>
            </div>
          )}

          {batchType === 'images' && (
            <div className="form-section">
              <div className="form-group">
                <label className="form-label">Image Prompts (max 10)</label>
                <div className="image-prompt-list">
                  {imagePrompts.map((prompt, index) => (
                    <div key={index} className="image-prompt-item">
                      <input
                        type="text"
                        className="form-input"
                        value={prompt}
                        onChange={(e) => updateImagePrompt(index, e.target.value)}
                        placeholder={`Image ${index + 1} prompt: A mystical forest guardian...`}
                      />
                      {imagePrompts.length > 1 && (
                        <button
                          className="btn-remove"
                          onClick={() => removeImagePrompt(index)}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {imagePrompts.length < 10 && (
                  <button className="btn-add" onClick={addImagePrompt}>
                    + Add Image Prompt
                  </button>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Art Style</label>
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

              <div className="form-group">
                <label className="form-label">Dimensions</label>
                <div className="dimension-inputs">
                  <div className="dimension-input-wrapper">
                    <label>Width (px)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={imageWidth}
                      onChange={(e) => setImageWidth(parseInt(e.target.value))}
                      min="512"
                      max="2048"
                      step="64"
                    />
                  </div>
                  <div className="dimension-input-wrapper">
                    <label>Height (px)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={imageHeight}
                      onChange={(e) => setImageHeight(parseInt(e.target.value))}
                      min="512"
                      max="2048"
                      step="64"
                    />
                  </div>
                </div>
              </div>

              <button
                className="submit-btn"
                onClick={handleImageGenerate}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="spinner" />
                    Generating Images...
                  </>
                ) : (
                  <>
                    <ImageIcon size={18} />
                    Generate Images
                  </>
                )}
              </button>
            </div>
          )}

          {results && (
            <div className="results-box">
              <div className="results-header">
                <h3>
                  <CheckCircle size={24} color="#48bb78" />
                  Generation Complete!
                </h3>
                <button className="download-btn" onClick={downloadResults}>
                  <Download size={16} />
                  Download JSON
                </button>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-label">Total Generated</div>
                  <div className="stat-value">{results.stats?.successful || results.stats?.totalPieces || 0}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Success Rate</div>
                  <div className="stat-value">
                    {results.stats?.successful ? 
                      `${((results.stats.successful / results.stats.total) * 100).toFixed(0)}%` : 
                      '100%'}
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Duration</div>
                  <div className="stat-value">{results.stats?.duration || 'N/A'}</div>
                </div>
                {results.stats?.averageTime && (
                  <div className="stat-card">
                    <div className="stat-label">Avg Time/Item</div>
                    <div className="stat-value">{results.stats.averageTime}</div>
                  </div>
                )}
              </div>

              {batchType === 'images' && results.results && (
                <div className="image-grid">
                  {results.results.map((result, idx) => (
                    result.success && (
                      <div key={idx} className="image-result">
                        <img src={result.imageUrl} alt={result.prompt} />
                        <div className="image-prompt"><strong>Prompt:</strong> {result.prompt}</div>
                        <button
                          className={`copy-btn ${copiedIndex === `img-${idx}` ? 'copied' : ''}`}
                          onClick={() => copyToClipboard(result.imageUrl, `img-${idx}`)}
                        >
                          {copiedIndex === `img-${idx}` ? (
                            <>
                              <Check size={14} />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              Copy Base64
                            </>
                          )}
                        </button>
                      </div>
                    )
                  ))}
                </div>
              )}

              {batchType === 'single' && results.results && (
                <div className="results-list">
                  <h4 style={{ marginBottom: '16px', color: '#2d3748', fontSize: '1.1rem', fontWeight: 600 }}>
                    Generated Items:
                  </h4>
                  {results.results.map((result, idx) => (
                    <div key={idx} className={`result-item ${result.success ? 'success' : 'error'}`}>
                      <div className="result-header">
                        <span className="result-index">Item {result.index}</span>
                        <div className="result-actions">
                          {result.success && (
                            <button
                              className={`copy-btn ${copiedIndex === idx ? 'copied' : ''}`}
                              onClick={() => copyToClipboard(result.contentJson || JSON.stringify(result.content, null, 2), idx)}
                            >
                              {copiedIndex === idx ? (
                                <>
                                  <Check size={14} />
                                  Copied!
                                </>
                              ) : (
                                <>
                                  <Copy size={14} />
                                  Copy JSON
                                </>
                              )}
                            </button>
                          )}
                          <span className="result-status">
                            {result.success ? (
                              <>
                                <CheckCircle size={16} color="#48bb78" />
                                Success
                              </>
                            ) : (
                              <>
                                <XCircle size={16} color="#c53030" />
                                Failed
                              </>
                            )}
                          </span>
                        </div>
                      </div>
                      {result.success && result.content && (
                        <div className="result-content">
                          <div className="json-display">
                            {result.contentJson || JSON.stringify(result.content, null, 2)}
                          </div>
                        </div>
                      )}
                      {result.error && (
                        <div className="result-content" style={{ color: '#c53030' }}>
                          Error: {result.error}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {batchType === 'world' && results.results && (
                <div>
                  <h4 style={{ marginBottom: '20px', color: '#2d3748', fontSize: '1.2rem', fontWeight: 600 }}>
                    Generated World: {results.stats?.theme}
                  </h4>
                  
                  {Object.entries(results.results).map(([category, items]) => {
                    if (category === 'theme' || !Array.isArray(items) || items.length === 0) return null;
                    
                    return (
                      <div key={category} className="category-section">
                        <div className="category-header">
                          <span className="category-title">
                            {category}
                          </span>
                          <span className="category-count"> ({items.length})</span>
                        </div>
                        <div className="results-list">
                          {items.map((item, idx) => (
                            <div key={idx} className="result-item success">
                              <div className="result-header">
                                <span className="result-index">
                                  {category.slice(0, -1).charAt(0).toUpperCase() + category.slice(1, -1)} {idx + 1}
                                </span>
                                <button
                                  className={`copy-btn ${copiedIndex === `${category}-${idx}` ? 'copied' : ''}`}
                                  onClick={() => copyToClipboard(item.contentJson || JSON.stringify(item.content, null, 2), `${category}-${idx}`)}
                                >
                                  {copiedIndex === `${category}-${idx}` ? (
                                    <>
                                      <Check size={14} />
                                      Copied!
                                    </>
                                  ) : (
                                    <>
                                      <Copy size={14} />
                                      Copy JSON
                                    </>
                                  )}
                                </button>
                              </div>
                              <div className="result-content">
                                <div className="json-display">
                                  {item.contentJson || JSON.stringify(item.content, null, 2)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BatchGeneration;