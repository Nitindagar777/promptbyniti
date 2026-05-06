/* PromptOutput — Displays generated prompt results */
import { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp, Sparkles, Layers, Ban } from 'lucide-react';
import './PromptOutput.css';

export default function PromptOutput({ result }) {
  const [copied, setCopied] = useState(null);
  const [showStructured, setShowStructured] = useState(false);
  const [showVariations, setShowVariations] = useState(false);

  if (!result) return null;

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="prompt-output animate-fade-in-up" id="prompt-output">
      {/* Marketplace Listing Details */}
      <div className="prompt-output__section prompt-output__section--premium">
        <div className="prompt-output__header">
          <div className="prompt-output__label">
            <Sparkles size={16} color="#ff0080" />
            <span style={{ color: '#ff0080', fontWeight: 'bold' }}>Marketplace Listing Metadata</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge badge-primary">{result.priceTokens} Credits</span>
          </div>
        </div>
        <div className="prompt-output__meta-grid">
          <div className="prompt-output__meta-item">
            <label>Suggested Title</label>
            <div className="flex items-center justify-between gap-2 p-2 rounded bg-dark-lighter border border-dark-accent">
              <span className="text-sm">{result.title}</span>
              <button onClick={() => copyToClipboard(result.title, 'title')}><Copy size={14} /></button>
            </div>
          </div>
          <div className="prompt-output__meta-item">
            <label>Product Description</label>
            <div className="flex items-center justify-between gap-2 p-2 rounded bg-dark-lighter border border-dark-accent">
              <span className="text-sm line-clamp-1">{result.description}</span>
              <button onClick={() => copyToClipboard(result.description, 'desc')}><Copy size={14} /></button>
            </div>
          </div>
        </div>
      </div>

      {/* Prompt Template Section */}
      <div className="prompt-output__section prompt-output__section--template">
        <div className="prompt-output__header">
          <div className="prompt-output__label">
            <Layers size={16} />
            <span>Prompt Template (with variables)</span>
          </div>
          <button
            className={`prompt-output__copy ${copied === 'template' ? 'prompt-output__copy--copied' : ''}`}
            onClick={() => copyToClipboard(result.promptTemplate, 'template')}
          >
            {copied === 'template' ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy Template</>}
          </button>
        </div>
        <div className="prompt-output__text prompt-output__text--template">
          {result.promptTemplate}
        </div>
      </div>
      <div className="prompt-output__section">
        <div className="prompt-output__header">
          <div className="prompt-output__label">
            <Sparkles size={16} />
            <span>Sample Example A (Best Result)</span>
          </div>
          <button
            className={`prompt-output__copy ${copied === 'main' ? 'prompt-output__copy--copied' : ''}`}
            onClick={() => copyToClipboard(result.mainPrompt, 'main')}
            id="copy-main-prompt"
          >
            {copied === 'main' ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
          </button>
        </div>
        <div className="prompt-output__text" id="main-prompt-text">
          {result.mainPrompt}
        </div>
      </div>

      {/* Negative Prompt */}
      <div className="prompt-output__section prompt-output__section--negative">
        <div className="prompt-output__header">
          <div className="prompt-output__label">
            <Ban size={16} />
            <span>Negative Prompt</span>
          </div>
          <button
            className={`prompt-output__copy ${copied === 'neg' ? 'prompt-output__copy--copied' : ''}`}
            onClick={() => copyToClipboard(result.negativePrompt, 'neg')}
            id="copy-negative-prompt"
          >
            {copied === 'neg' ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
          </button>
        </div>
        <div className="prompt-output__text prompt-output__text--negative">
          {result.negativePrompt}
        </div>
      </div>

      {/* Variations */}
      <div className="prompt-output__section">
        <button
          className="prompt-output__toggle"
          onClick={() => setShowVariations(!showVariations)}
          id="toggle-variations"
        >
          <div className="prompt-output__label">
            <Layers size={16} />
            <span>Prompt Variations ({result.variations.length})</span>
          </div>
          {showVariations ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showVariations && (
          <div className="prompt-output__variations">
            {result.variations.map((v, i) => (
              <div key={i} className="prompt-output__variation">
                <div className="prompt-output__header">
                  <span className="prompt-output__var-label">{v.label}</span>
                  <button
                    className={`prompt-output__copy ${copied === `var-${i}` ? 'prompt-output__copy--copied' : ''}`}
                    onClick={() => copyToClipboard(v.prompt, `var-${i}`)}
                  >
                    {copied === `var-${i}` ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                  </button>
                </div>
                <div className="prompt-output__text">{v.prompt}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Structured Breakdown */}
      <div className="prompt-output__section">
        <button
          className="prompt-output__toggle"
          onClick={() => setShowStructured(!showStructured)}
          id="toggle-structured"
        >
          <div className="prompt-output__label">
            <Sparkles size={16} />
            <span>Structured Breakdown</span>
          </div>
          {showStructured ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {showStructured && (
          <div className="prompt-output__structured">
            {Object.entries(result.structured).map(([key, value]) => (
              <div key={key} className="prompt-output__field">
                <span className="prompt-output__field-key">
                  {key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                </span>
                <span className="prompt-output__field-val">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
