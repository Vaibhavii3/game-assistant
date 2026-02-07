// import React, { useState } from 'react';
// import { Sparkles, User, MessageCircle, Image, Send, Copy, Download, Loader2 } from 'lucide-react';
// // import ReactMarkdown from 'react-markdown';

// const Home = () => {
//   const [activeTab, setActiveTab] = useState('text');
//   const [prompt, setPrompt] = useState('');
//   const [response, setResponse] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [savedId, setSavedId] = useState('');

//   const tabs = [
//     { id: 'text', label: 'Text Generation', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
//     { id: 'character', label: 'Character Creator', icon: User, color: 'from-blue-500 to-cyan-500' },
//     { id: 'dialogue', label: 'Dialogue Generator', icon: MessageCircle, color: 'from-green-500 to-emerald-500' },
//     { id: 'image', label: 'Image Creation', icon: Image, color: 'from-orange-500 to-red-500' }
//   ];

//   const placeholders = {
//     text: "Enter your creative prompt here...",
//     character: "Describe the character you want to create (or leave empty for a random hero)",
//     dialogue: "Describe the dialogue scenario (or leave empty for NPC quest dialogue)",
//     image: "Describe the image you want to generate..."
//   };

//   // Helper function to extract content from various response formats
//   const extractContent = (data) => {
//     // If it's a string, return as is
//     if (typeof data === 'string') {
//       return data;
//     }
    
//     // If it's an object, try to extract content in order of preference
//     if (typeof data === 'object' && data !== null) {
//       // Check for common content properties
//       return data.raw || 
//              data.response || 
//              data.character || 
//              data.dialogue || 
//              data.content || 
//              data.text ||
//              JSON.stringify(data, null, 2);
//     }
    
//     return 'No content available';
//   };

//   const handleSubmit = async () => {
//     if (!prompt.trim() && activeTab === 'image') {
//       setError('Please enter a prompt for image generation');
//       return;
//     }

//     setLoading(true);
//     setError('');
//     setResponse(null);
//     setSavedId('');

//     try {
//       const endpoint = {
//         text: 'http://localhost:5000/api/gemini/generate',
//         character: 'http://localhost:5000/api/gemini/character',
//         dialogue: 'http://localhost:5000/api/gemini/dialogue',
//         image: 'http://localhost:5000/api/gemini/image'
//       }[activeTab];

//       const body = activeTab === 'text' 
//         ? { prompt, type: 'text' }
//         : { prompt: prompt || undefined };

//       const res = await fetch(endpoint, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(body),
//       });

//       const data = await res.json();

//       if (!res.ok) {
//         throw new Error(data.error || 'Request failed');
//       }

//       if (activeTab === 'image') {
//         setResponse({ type: 'image', url: data.imageUrl });
//       } else {
//         // setResponse({
//         //   type: 'text',
//         //   content: data.response || data.character || data.dialogue
//         // });
//         const content = extractContent(data);
//         setResponse({
//           type: 'text',
//           content: content
//         });
//         setSavedId(data.savedId);
//       }
//     } catch (err) {
//       setError(err.message || 'Something went wrong');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const copyToClipboard = (text) => {
//     navigator.clipboard.writeText(text);
//   };

//   const downloadImage = (url) => {
//     const link = document.createElement('a');
//     link.href = url;
//     link.download = 'generated-image.png';
//     link.click();
//   };

//   // Enhanced markdown renderer component
//   const MarkdownRenderer = ({ content }) => {
//     // Simple markdown parsing for better display
//     const parseMarkdown = (text) => {
//       if (!text || typeof text !== 'string') return text;
      
//       return text
//         // Bold text
//         .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
//         // Italic text
//         .replace(/\*(.*?)\*/g, '<em>$1</em>')
//         // Headers
//         .replace(/^### (.*$)/gm, '<h3>$1</h3>')
//         .replace(/^## (.*$)/gm, '<h2>$1</h2>')
//         .replace(/^# (.*$)/gm, '<h1>$1</h1>')
//         // Line breaks
//         .replace(/\n\n/g, '</p><p>')
//         .replace(/\n/g, '<br/>')
//         // Wrap in paragraph tags
//         .replace(/^(.*)$/s, '<p>$1</p>')
//         // Clean up empty paragraphs
//         .replace(/<p><\/p>/g, '');
//     };

//     return (
//       <div 
//         className="markdown-content"
//         dangerouslySetInnerHTML={{ __html: parseMarkdown(content) }}
//       />
//     );
//   };

//   const renderResponse = () => {
//     if (!response) return null;

//     if (response.type === 'image') {
//       return (
//         <div className="response-container">
//           <div className="response-header">
//             <h3>Generated Image</h3>
//             <button 
//               onClick={() => downloadImage(response.url)}
//               className="action-btn"
//               title="Download Image"
//             >
//               <Download size={16} />
//             </button>
//           </div>
//           <div className="image-container">
//             <img src={response.url} alt="Generated" />
//           </div>
//         </div>
//       );
//     }

//     return (
//       <div className="response-container">
//         <div className="response-header">
//           <h3>Generated Content</h3>
//           <div className="response-actions">
//             {savedId && <span className="saved-id">ID: {savedId}</span>}
//             <button 
//               onClick={() => copyToClipboard(typeof response.content === 'string' ? response.content : JSON.stringify(response.content, null, 2))}
//               className="action-btn"
//               title="Copy to Clipboard"
//             >
//               <Copy size={16} />
//             </button>
//           </div>
//         </div>
//         <div className="response-content">

//             <MarkdownRenderer content={response.content} />
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="app">
//       <style jsx>{`
//         * {
//           margin: 0;
//           padding: 0;
//           box-sizing: border-box;
//         }

//         body {
//           font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
//           background: linear-gradient(135deg,rgb(54, 55, 59) 0%, #764ba2 100%);
//           min-height: 100vh;
//         }

//         .app {
//           min-height: 100vh;
//           padding: 20px;
//           background: linear-gradient(135deg,rgb(9, 9, 9) 0%, #764ba2 100%);
//         }

//         .container {
//           max-width: 1200px;
//           margin: 0 auto;
//           background: rgba(255, 255, 255, 0.95);
//           backdrop-filter: blur(20px);
//           border-radius: 24px;
//           box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
//           overflow: hidden;
//           border: 1px solid rgba(255, 255, 255, 0.2);
//         }

//         .header {
//           background: linear-gradient(135deg,rgb(9, 9, 9) 0%, #764ba2 100%);
//           padding: 40px;
//           text-align: center;
//           color: white;
//         }

//         .header h1 {
//           font-size: 2.5rem;
//           font-weight: 700;
//           margin-bottom: 10px;
//           text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
//         }

//         .header p {
//           font-size: 1.1rem;
//           opacity: 0.9;
//         }

//         .tabs {
//           display: flex;
//           background: rgba(255, 255, 255, 0.9);
//           backdrop-filter: blur(10px);
//           border-bottom: 1px solid rgba(0, 0, 0, 0.1);
//           overflow-x: auto;
//         }

//         .tab {
//           flex: 1;
//           min-width: 200px;
//           padding: 20px;
//           border: none;
//           background: transparent;
//           cursor: pointer;
//           transition: all 0.3s ease;
//           display: flex;
//           align-items: center;
//           justify-content: center;
//           gap: 8px;
//           font-weight: 500;
//           position: relative;
//         }

//         .tab.active {
//           background: white;
//           box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
//         }

//         .tab.active::after {
//           content: '';
//           position: absolute;
//           bottom: 0;
//           left: 0;
//           right: 0;
//           height: 3px;
//           background: linear-gradient(90deg, var(--tab-color-from), var(--tab-color-to));
//         }

//         .tab:hover:not(.active) {
//           background: rgba(255, 255, 255, 0.7);
//         }

//         .tab-icon {
//           padding: 4px;
//           border-radius: 8px;
//           background: linear-gradient(135deg, var(--tab-color-from), var(--tab-color-to));
//           color: white;
//         }

//         .content {
//           padding: 40px;
//         }

//         .form {
//           margin-bottom: 30px;
//         }

//         .input-group {
//           position: relative;
//           margin-bottom: 20px;
//         }

//         .textarea {
//           width: 100%;
//           min-height: 120px;
//           padding: 20px;
//           border: 2px solid rgba(0, 0, 0, 0.1);
//           border-radius: 16px;
//           font-size: 16px;
//           font-family: inherit;
//           resize: vertical;
//           transition: all 0.3s ease;
//           background: rgba(255, 255, 255, 0.9);
//           backdrop-filter: blur(10px);
//         }

//         .textarea:focus {
//           outline: none;
//           border-color: #667eea;
//           box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
//           background: white;
//         }

//         .submit-btn {
//           background: linear-gradient(135deg,rgb(9, 9, 9) 0%, #764ba2 100%);
//           color: white;
//           border: none;
//           padding: 16px 32px;
//           border-radius: 12px;
//           font-size: 16px;
//           font-weight: 600;
//           cursor: pointer;
//           transition: all 0.3s ease;
//           display: flex;
//           align-items: center;
//           gap: 8px;
//           box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
//         }

//         .submit-btn:hover:not(:disabled) {
//           transform: translateY(-2px);
//           box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
//         }

//         .submit-btn:disabled {
//           opacity: 0.7;
//           cursor: not-allowed;
//           transform: none;
//         }

//         .error {
//           background: linear-gradient(135deg, #ff6b6b, #ee5a52);
//           color: white;
//           padding: 16px 20px;
//           border-radius: 12px;
//           margin-bottom: 20px;
//           font-weight: 500;
//           box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
//         }

//         .response-container {
//           background: rgba(255, 255, 255, 0.9);
//           backdrop-filter: blur(10px);
//           border-radius: 16px;
//           padding: 24px;
//           box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
//           border: 1px solid rgba(255, 255, 255, 0.2);
//         }

//         .response-header {
//           display: flex;
//           justify-content: space-between;
//           align-items: center;
//           margin-bottom: 20px;
//           padding-bottom: 16px;
//           border-bottom: 1px solid rgba(0, 0, 0, 0.1);
//         }

//         .response-header h3 {
//           font-size: 1.25rem;
//           font-weight: 600;
//           color: #333;
//         }

//         .response-actions {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//         }

//         .saved-id {
//           background: linear-gradient(135deg, #667eea, #764ba2);
//           color: white;
//           padding: 6px 12px;
//           border-radius: 8px;
//           font-size: 12px;
//           font-weight: 500;
//         }

//         .action-btn {
//           background: rgba(102, 126, 234, 0.1);
//           border: 1px solid rgba(102, 126, 234, 0.2);
//           color: #667eea;
//           padding: 8px;
//           border-radius: 8px;
//           cursor: pointer;
//           transition: all 0.3s ease;
//         }

//         .action-btn:hover {
//           background: rgba(102, 126, 234, 0.2);
//           transform: translateY(-1px);
//         }

//         .response-content {
//           line-height: 1.6;
//           color: #555;
//         }

//         .response-content p {
//           margin-bottom: 12px;
//         }

//         .response-content pre {
//           background: rgba(0, 0, 0, 0.05);
//           padding: 16px;
//           border-radius: 8px;
//           overflow-x: auto;
//           font-size: 14px;
//           border: 1px solid rgba(0, 0, 0, 0.1);
//         }

//         .image-container {
//           text-align: center;
//         }

//         .image-container img {
//           max-width: 100%;
//           height: auto;
//           border-radius: 12px;
//           box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
//         }

//         .spinner {
//           animation: spin 1s linear infinite;
//         }

//         @keyframes spin {
//           from { transform: rotate(0deg); }
//           to { transform: rotate(360deg); }
//         }

//         @media (max-width: 768px) {
//           .app {
//             padding: 10px;
//           }

//           .header {
//             padding: 30px 20px;
//           }

//           .header h1 {
//             font-size: 2rem;
//           }

//           .content {
//             padding: 20px;
//           }

//           .tabs {
//             flex-wrap: wrap;
//           }

//           .tab {
//             min-width: auto;
//             flex: 1 1 50%;
//           }

//           .response-header {
//             flex-direction: column;
//             gap: 12px;
//             align-items: flex-start;
//           }

//           .markdown {
//   font-family: 'Segoe UI', sans-serif;
//   line-height: 1.6;
//   color: #333;
// }

// .markdown h1, .markdown h2, .markdown h3 {
//   margin-top: 1rem;
//   margin-bottom: 0.5rem;
// }

// .markdown ul {
//   list-style: disc;
//   margin-left: 1.5rem;
//   margin-bottom: 1rem;
// }

// .markdown pre {
//   background: #f4f4f4;
//   padding: 12px;
//   border-radius: 8px;
//   overflow-x: auto;
// }

//         }
//       `}</style>

//       <div className="container">
//         <div className="header">
//           <h1>The MythiCraft Engine</h1>
//           <p>Generate text, create characters, craft dialogue, and create images with AI</p>
//         </div>

//         <div className="tabs">
//           {tabs.map((tab) => {
//             const colorParts = tab.color.split(' ');
//             const colorFrom = colorParts[0]?.replace('from-', '') || 'purple-500';
//             const colorTo = colorParts[2]?.replace('to-', '') || 'pink-500';
            
//             return (
//               <button
//                 key={tab.id}
//                 className={`tab ${activeTab === tab.id ? 'active' : ''}`}
//                 onClick={() => setActiveTab(tab.id)}
//                 style={{
//                   '--tab-color-from': colorFrom,
//                   '--tab-color-to': colorTo
//                 }}
//               >
//                 <div className="tab-icon">
//                   <tab.icon size={16} />
//                 </div>
//                 {tab.label}
//               </button>
//             );
//           })}
//         </div>

//         <div className="content">
//           {error && <div className="error">{error}</div>}

//           <div className="form">
//             <div className="input-group">
//               <textarea
//                 className="textarea"
//                 value={prompt}
//                 onChange={(e) => setPrompt(e.target.value)}
//                 placeholder={placeholders[activeTab]}
//                 disabled={loading}
//               />
//             </div>

//             <button
//               onClick={handleSubmit}
//               className="submit-btn"
//               disabled={loading}
//             >
//               {loading ? (
//                 <>
//                   <Loader2 size={16} className="spinner" />
//                   Generating...
//                 </>
//               ) : (
//                 <>
//                   <Send size={16} />
//                   Generate {tabs.find(t => t.id === activeTab)?.label.split(' ')[0]}
//                 </>
//               )}
//             </button>
//           </div>

//           {renderResponse()}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Home;

import React, { useState } from 'react';
import { Sparkles, User, MessageCircle, Image, Send, Copy, Download, Loader2 } from 'lucide-react';

const Home = () => {
  const [activeTab, setActiveTab] = useState('text');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [savedId, setSavedId] = useState('');

  const tabs = [
    { id: 'text', label: 'Text Generation', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
    { id: 'character', label: 'Character Creator', icon: User, color: 'from-blue-500 to-cyan-500' },
    { id: 'dialogue', label: 'Dialogue Generator', icon: MessageCircle, color: 'from-green-500 to-emerald-500' },
    { id: 'image', label: 'Image Creation', icon: Image, color: 'from-orange-500 to-red-500' }
  ];

  const placeholders = {
    text: "Enter your creative prompt here...",
    character: "Describe the character you want to create (or leave empty for a random hero)",
    dialogue: "Describe the dialogue scenario (or leave empty for NPC quest dialogue)",
    image: "Describe the image you want to generate..."
  };

  // Updated function to handle structured responses
  const extractContent = (data, type) => {
    console.log('Raw API response:', data);
    
    // Handle text generation (simple string response)
    if (type === 'text') {
      if (typeof data === 'string') {
        return data;
      }
      
      if (typeof data === 'object' && data !== null) {
        const content = data.raw || 
                       data.response || 
                       data.content || 
                       data.text ||
                       data.message ||
                       data.result;
        
        if (typeof content === 'string') {
          return content;
        }
        
        if (typeof content === 'object' && content !== null) {
          const nestedContent = content.raw || content.response || content.text || content.content;
          if (typeof nestedContent === 'string') {
            return nestedContent;
          }
        }
      }
      
      return 'Content received but in unexpected format. Please check console for details.';
    }

    // Handle character generation
    if (type === 'character') {
      if (data.character) {
        const char = data.character;
        return formatCharacterData(char);
      }
      return 'Character data not found in response.';
    }

    // Handle dialogue generation
    if (type === 'dialogue') {
      if (data.dialogue) {
        const dialogue = data.dialogue;
        return formatDialogueData(dialogue);
      }
      return 'Dialogue data not found in response.';
    }

    return 'No content available';
  };

  // Format character data into readable text
  const formatCharacterData = (character) => {
    let formatted = '';
    
    if (character.name) {
      formatted += `# ${character.name}\n\n`;
    }
    
    if (character.race || character.class) {
      formatted += `**Race:** ${character.race || 'Unknown'}\n`;
      formatted += `**Class:** ${character.class || 'Unknown'}\n\n`;
    }
    
    if (character.background) {
      formatted += `## Background\n${character.background}\n\n`;
    }
    
    if (character.personality) {
      formatted += `## Personality\n${character.personality}\n\n`;
    }
    
    if (character.appearance) {
      formatted += `## Appearance\n${character.appearance}\n\n`;
    }
    
    if (character.backstory) {
      formatted += `## Backstory\n${character.backstory}\n\n`;
    }
    
    if (character.abilities && character.abilities.length > 0) {
      formatted += `## Abilities\n`;
      character.abilities.forEach(ability => {
        formatted += `- **${ability.name}:** ${ability.description}\n`;
      });
      formatted += '\n';
    }
    
    if (character.equipment && character.equipment.length > 0) {
      formatted += `## Equipment\n`;
      character.equipment.forEach(item => {
        formatted += `- ${item}\n`;
      });
      formatted += '\n';
    }
    
    if (character.stats) {
      formatted += `## Stats\n`;
      Object.entries(character.stats).forEach(([stat, value]) => {
        formatted += `- **${stat}:** ${value}\n`;
      });
    }
    
    return formatted || 'Character created but formatting failed.';
  };

  // Format dialogue data into readable text
  const formatDialogueData = (dialogue) => {
    let formatted = '';
    
    if (dialogue.npcName) {
      formatted += `# ${dialogue.npcName}\n\n`;
    }
    
    if (dialogue.questTitle) {
      formatted += `**Quest:** ${dialogue.questTitle}\n`;
    }
    
    if (dialogue.location) {
      formatted += `**Location:** ${dialogue.location}\n`;
    }
    
    if (dialogue.reward) {
      formatted += `**Reward:** ${dialogue.reward}\n\n`;
    }
    
    if (dialogue.dialogue && Array.isArray(dialogue.dialogue)) {
      formatted += `## Dialogue\n\n`;
      dialogue.dialogue.forEach((line, index) => {
        if (typeof line === 'string') {
          formatted += `${index + 1}. ${line}\n\n`;
        } else if (typeof line === 'object') {
          if (line.speaker && line.text) {
            formatted += `**${line.speaker}:** ${line.text}\n\n`;
          } else if (line.text) {
            formatted += `${index + 1}. ${line.text}\n\n`;
          }
        }
      });
    }
    
    return formatted || 'Dialogue created but formatting failed.';
  };

  const handleSubmit = async () => {
    if (!prompt.trim() && activeTab === 'image') {
      setError('Please enter a prompt for image generation');
      return;
    }

    setLoading(true);
    setError('');
    setResponse(null);
    setSavedId('');

    try {
      const endpoint = {
        text: 'http://localhost:5000/api/gemini/generate',
        character: 'http://localhost:5000/api/gemini/character',
        dialogue: 'http://localhost:5000/api/gemini/dialogue',
        image: 'http://localhost:5000/api/gemini/image'
      }[activeTab];

      const body = activeTab === 'text' 
        ? { prompt, type: 'text' }
        : { prompt: prompt || undefined };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Request failed');
      }

      if (activeTab === 'image') {
        setResponse({ type: 'image', url: data.imageUrl });
      } else {
        console.log('Full API response:', data);
        
        // Extract the clean content with type awareness
        const content = extractContent(data, activeTab);
        console.log('Extracted clean content:', content);
        
        setResponse({
          type: 'text',
          content: content
        });
        
        // Set saved ID if available
        if (data.savedId) {
          setSavedId(data.savedId);
        }
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

  // Clean markdown renderer component
  const MarkdownRenderer = ({ content }) => {
    console.log('MarkdownRenderer received:', content, typeof content);
    
    // Handle non-string content
    if (typeof content !== 'string') {
      if (content === null || content === undefined) {
        return <div className="markdown-content"><p>No content available</p></div>;
      }
      return (
        <div className="markdown-content">
          <p>Unable to display content in expected format.</p>
        </div>
      );
    }

    // Clean the content - remove any JSON-like structures that might have leaked through
    let cleanContent = content;
    
    // If the content looks like it contains JSON remnants, try to clean it
    if (content.includes('"raw":') || content.includes('"response":')) {
      // Try to extract just the text content after the raw field
      const rawMatch = content.match(/"raw":\s*"([^"]+)"/);
      if (rawMatch && rawMatch[1]) {
        cleanContent = rawMatch[1];
      }
    }

    // Simple markdown parsing for better display
    const parseMarkdown = (text) => {
      if (!text) return '';
      
      return text
        // Escape any remaining quotes and backslashes
        .replace(/\\n/g, '\n')
        .replace(/\\"/g, '"')
        .replace(/\\\\/g, '\\')
        // Bold text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic text
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Headers
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        // Line breaks - handle both \n\n and \n
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br/>')
        // Wrap in paragraph tags
        .replace(/^(.*)$/s, '<p>$1</p>')
        // Clean up empty paragraphs
        .replace(/<p><\/p>/g, '')
        // Clean up paragraphs that only contain breaks
        .replace(/<p><br\/><\/p>/g, '');
    };

    return (
      <div 
        className="markdown-content"
        dangerouslySetInnerHTML={{ __html: parseMarkdown(cleanContent) }}
      />
    );
  };

  const renderResponse = () => {
    if (!response) return null;

    if (response.type === 'image') {
      return (
        <div className="response-container">
          <div className="response-header">
            <h3>Generated Image</h3>
            <button 
              onClick={() => downloadImage(response.url)}
              className="action-btn"
              title="Download Image"
            >
              <Download size={16} />
            </button>
          </div>
          <div className="image-container">
            <img src={response.url} alt="Generated" />
          </div>
        </div>
      );
    }

    return (
      <div className="response-container">
        <div className="response-header">
          <h3>Generated Content</h3>
          <div className="response-actions">
            {savedId && <span className="saved-id">ID: {savedId}</span>}
            <button 
              onClick={() => copyToClipboard(response.content)}
              className="action-btn"
              title="Copy to Clipboard"
            >
              <Copy size={16} />
            </button>
          </div>
        </div>
        <div className="response-content">
          <MarkdownRenderer content={response.content} />
        </div>
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
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
          background: linear-gradient(135deg,rgb(54, 55, 59) 0%, #764ba2 100%);
          min-height: 100vh;
        }

        .app {
          min-height: 100vh;
          padding: 20px;
          background: linear-gradient(135deg,rgb(9, 9, 9) 0%, #764ba2 100%);
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .header {
          background: linear-gradient(135deg,rgb(9, 9, 9) 0%, #764ba2 100%);
          padding: 40px;
          text-align: center;
          color: white;
        }

        .header h1 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 10px;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .header p {
          font-size: 1.1rem;
          opacity: 0.9;
        }

        .tabs {
          display: flex;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
          overflow-x: auto;
        }

        .tab {
          flex: 1;
          min-width: 200px;
          padding: 20px;
          border: none;
          background: transparent;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-weight: 500;
          position: relative;
        }

        .tab.active {
          background: white;
          box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        }

        .tab.active::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--tab-color-from), var(--tab-color-to));
        }

        .tab:hover:not(.active) {
          background: rgba(255, 255, 255, 0.7);
        }

        .tab-icon {
          padding: 4px;
          border-radius: 8px;
          background: linear-gradient(135deg, var(--tab-color-from), var(--tab-color-to));
          color: white;
        }

        .content {
          padding: 40px;
        }

        .form {
          margin-bottom: 30px;
        }

        .input-group {
          position: relative;
          margin-bottom: 20px;
        }

        .textarea {
          width: 100%;
          min-height: 120px;
          padding: 20px;
          border: 2px solid rgba(0, 0, 0, 0.1);
          border-radius: 16px;
          font-size: 16px;
          font-family: inherit;
          resize: vertical;
          transition: all 0.3s ease;
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
        }

        .textarea:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
          background: white;
        }

        .submit-btn {
          background: linear-gradient(135deg,rgb(9, 9, 9) 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
        }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .error {
          background: linear-gradient(135deg, #ff6b6b, #ee5a52);
          color: white;
          padding: 16px 20px;
          border-radius: 12px;
          margin-bottom: 20px;
          font-weight: 500;
          box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
        }

        .response-container {
          background: rgba(255, 255, 255, 0.9);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .response-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.1);
        }

        .response-header h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #333;
        }

        .response-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .saved-id {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 500;
        }

        .action-btn {
          background: rgba(102, 126, 234, 0.1);
          border: 1px solid rgba(102, 126, 234, 0.2);
          color: #667eea;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          background: rgba(102, 126, 234, 0.2);
          transform: translateY(-1px);
        }

        .response-content {
          line-height: 1.7;
          color: #444;
        }

        .markdown-content {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.7;
        }

        .markdown-content h1 {
          font-size: 1.8rem;
          font-weight: 700;
          color: #2d3748;
          margin: 1.5rem 0 1rem 0;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 0.5rem;
        }

        .markdown-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #2d3748;
          margin: 1.3rem 0 0.8rem 0;
        }

        .markdown-content h3 {
          font-size: 1.2rem;
          font-weight: 600;
          color: #4a5568;
          margin: 1.1rem 0 0.6rem 0;
        }

        .markdown-content p {
          margin-bottom: 1rem;
          color: #4a5568;
          text-align: justify;
        }

        .markdown-content strong {
          font-weight: 600;
          color: #2d3748;
        }

        .markdown-content em {
          font-style: italic;
          color: #5a6572;
        }

        .image-container {
          text-align: center;
        }

        .image-container img {
          max-width: 100%;
          height: auto;
          border-radius: 12px;
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
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
            padding: 10px;
          }

          .header {
            padding: 30px 20px;
          }

          .header h1 {
            font-size: 2rem;
          }

          .content {
            padding: 20px;
          }

          .tabs {
            flex-wrap: wrap;
          }

          .tab {
            min-width: auto;
            flex: 1 1 50%;
          }

          .response-header {
            flex-direction: column;
            gap: 12px;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="container">
        <div className="header">
          <h1>The MythiCraft Engine</h1>
          <p>Generate text, create characters, craft dialogue, and create images with AI</p>
        </div>

        <div className="tabs">
          {tabs.map((tab) => {
            const colorParts = tab.color.split(' ');
            const colorFrom = colorParts[0]?.replace('from-', '') || 'purple-500';
            const colorTo = colorParts[2]?.replace('to-', '') || 'pink-500';
            
            return (
              <button
                key={tab.id}
                className={`tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  '--tab-color-from': colorFrom,
                  '--tab-color-to': colorTo
                }}
              >
                <div className="tab-icon">
                  <tab.icon size={16} />
                </div>
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="content">
          {error && <div className="error">{error}</div>}

          <div className="form">
            <div className="input-group">
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
                  <Loader2 size={16} className="spinner" />
                  Generating...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Generate {tabs.find(t => t.id === activeTab)?.label.split(' ')[0]}
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