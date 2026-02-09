import React, { useState } from 'react';
import { Layers, Loader2, CheckCircle, XCircle, Download, Globe, Copy, Check, Image as ImageIcon } from 'lucide-react';

const BatchGeneration = () => {
  const [batchType, setBatchType] = useState('single'); // single, world, images
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
    { value: '2d', label: '2D Game Art' },
    { value: '3d', label: '3D Rendered' },
    { value: 'anime', label: 'Anime Style' },
    { value: 'pixel', label: 'Pixel Art' },
    { value: 'realistic', label: 'Realistic' }
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
      const response = await fetch('http://localhost:5000/api/gemini/batch/generate', {
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
      const response = await fetch('http://localhost:5000/api/gemini/batch/world', {
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
      const response = await fetch('http://localhost:5000/api/gemini/batch/images', {
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
    <div className="batch-container">
      <style>{`
        .batch-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
        }

        .batch-header {
          margin-bottom: 32px;
        }

        .batch-header h2 {
          font-size: 1.8rem;
          color: #2d3748;
          margin-bottom: 8px;
        }

        .batch-header p {
          color: #718096;
          font-size: 0.95rem;
        }

        .batch-tabs {
          display: flex;
          gap: 12px;
          margin-bottom: 32px;
          border-bottom: 2px solid #e2e8f0;
        }

        .batch-tab {
          padding: 12px 24px;
          border: none;
          background: transparent;
          cursor: pointer;
          font-weight: 500;
          color: #718096;
          border-bottom: 3px solid transparent;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .batch-tab:hover {
          color: #2d3748;
        }

        .batch-tab.active {
          color: #92400e;
          border-bottom-color: #92400e;
        }

        .form-section {
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          margin-bottom: 24px;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          font-weight: 600;
          color: #2d3748;
          margin-bottom: 8px;
          font-size: 0.9rem;
        }

        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 15px;
          transition: border-color 0.2s;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #92400e;
        }

        .form-textarea {
          min-height: 120px;
          resize: vertical;
          font-family: monospace;
        }

        .slider-container {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .slider {
          flex: 1;
          height: 6px;
        }

        .slider-value {
          font-weight: 600;
          color: #92400e;
          min-width: 40px;
          text-align: center;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .checkbox-input {
          width: 20px;
          height: 20px;
          cursor: pointer;
        }

        .world-config-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
        }

        .world-config-item {
          padding: 16px;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
        }

        .world-config-item label {
          display: block;
          font-weight: 500;
          margin-bottom: 8px;
          color: #2d3748;
        }

        .world-config-item input {
          width: 100%;
          padding: 8px;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
        }

        .image-prompt-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .image-prompt-item {
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .image-prompt-item input {
          flex: 1;
        }

        .btn-remove {
          padding: 8px 12px;
          background: #f56565;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.85rem;
        }

        .btn-add {
          padding: 10px 20px;
          background: #48bb78;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.9rem;
          margin-top: 8px;
        }

        .submit-btn {
          background: #92400e;
          color: white;
          border: none;
          padding: 14px 32px;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
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
          border-left: 4px solid #c53030;
          color: #c53030;
          padding: 16px;
          border-radius: 6px;
          margin-bottom: 24px;
        }

        .results-box {
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 2px solid #e2e8f0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          padding: 20px;
          background: #f7fafc;
          border-radius: 8px;
          border-left: 4px solid #92400e;
        }

        .stat-label {
          font-size: 0.85rem;
          color: #718096;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2d3748;
        }

        .results-list {
          max-height: 600px;
          overflow-y: auto;
        }

        .result-item {
          padding: 20px;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          margin-bottom: 16px;
          background: white;
        }

        .result-item.success {
          border-left: 4px solid #48bb78;
        }

        .result-item.error {
          border-left: 4px solid #f56565;
        }

        .result-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .result-index {
          font-weight: 600;
          color: #2d3748;
          font-size: 1.1rem;
        }

        .result-actions {
          display: flex;
          gap: 8px;
        }

        .result-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
        }

        .copy-btn {
          padding: 6px 12px;
          background: #3182ce;
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.85rem;
          transition: all 0.2s;
        }

        .copy-btn:hover {
          background: #2c5282;
        }

        .copy-btn.copied {
          background: #48bb78;
        }

        .result-content {
          background: #f7fafc;
          padding: 16px;
          border-radius: 6px;
          margin-top: 12px;
        }

        .json-display {
          font-family: 'Courier New', monospace;
          font-size: 0.85rem;
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
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 16px;
          background: white;
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
          margin-bottom: 8px;
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
        }

        .download-btn:hover {
          background: #2c5282;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .dimension-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
      `}</style>

      <div className="batch-header">
        <h2>🚀 Batch Generation</h2>
        <p>Generate multiple content pieces at once with JSON output</p>
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
              placeholder="Create a fire-based warrior character..."
            />
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                className="checkbox-input"
                checked={variations}
                onChange={(e) => setVariations(e.target.checked)}
              />
              <label className="form-label" style={{ margin: 0 }}>
                Generate variations (adds unique traits to each)
              </label>
            </div>
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
                <Layers size={18} />
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
              placeholder="Underwater kingdom, cyberpunk city, medieval fantasy..."
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
            <p style={{ marginTop: '12px', fontSize: '0.85rem', color: '#718096' }}>
              Total: {Object.values(worldConfig).reduce((sum, val) => sum + val, 0)} items (max 30)
            </p>
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
                    placeholder={`Image ${index + 1} prompt...`}
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
            <select
              className="form-select"
              value={artStyle}
              onChange={(e) => setArtStyle(e.target.value)}
            >
              {artStyles.map(style => (
                <option key={style.value} value={style.value}>
                  {style.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Dimensions</label>
            <div className="dimension-inputs">
              <div>
                <label style={{ fontSize: '0.85rem', color: '#718096' }}>Width</label>
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
              <div>
                <label style={{ fontSize: '0.85rem', color: '#718096' }}>Height</label>
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
            <h3>✅ Generation Complete!</h3>
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
              <h4 style={{ marginBottom: '16px', color: '#2d3748' }}>Generated Items:</h4>
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
                            <XCircle size={16} color="#f56565" />
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
              <h4 style={{ marginBottom: '16px', color: '#2d3748' }}>
                Generated World: {results.stats?.theme}
              </h4>
              
              {Object.entries(results.results).map(([category, items]) => {
                if (category === 'theme' || !Array.isArray(items) || items.length === 0) return null;
                
                return (
                  <div key={category} style={{ marginBottom: '32px' }}>
                    <h5 style={{ marginBottom: '16px', color: '#2d3748', textTransform: 'capitalize' }}>
                      {category} ({items.length})
                    </h5>
                    <div className="results-list">
                      {items.map((item, idx) => (
                        <div key={idx} className="result-item success">
                          <div className="result-header">
                            <span className="result-index">{category.slice(0, -1)} {idx + 1}</span>
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
  );
};

export default BatchGeneration;