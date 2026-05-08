/* PromptOutput — Displays generated prompt results */
import { useState } from 'react';
import { Copy, Check, ChevronDown, ChevronUp, Sparkles, Layers, Ban } from 'lucide-react';
import './PromptOutput.css';

export default function PromptOutput({ result }) {
  const [copied, setCopied] = useState(null);
  const [showStructured, setShowStructured] = useState(false);

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
            <span className="badge badge-primary">{result.priceTokens || 5} Credits</span>
          </div>
        </div>
        <div className="prompt-output__meta-grid">
          <div className="prompt-output__meta-item">
            <label>Suggested Title</label>
            <div className="prompt-output__meta-box">
              <span className="text-sm">{result.title || 'Untitled Prompt'}</span>
              <button 
                className={`prompt-output__copy-mini ${copied === 'title' ? 'copied' : ''}`}
                onClick={() => copyToClipboard(result.title, 'title')}
              >
                {copied === 'title' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          <div className="prompt-output__meta-item">
            <label>Product Description</label>
            <div className="prompt-output__meta-box">
              <span className="text-sm line-clamp-1">{result.description || 'No description available'}</span>
              <button 
                className={`prompt-output__copy-mini ${copied === 'desc' ? 'copied' : ''}`}
                onClick={() => copyToClipboard(result.description, 'desc')}
              >
                {copied === 'desc' ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
          <div className="prompt-output__meta-item">
            <label className="uppercase tracking-widest text-[10px] opacity-60">PROMPT TYPE</label>
            <div className="prompt-output__meta-badge">
              <Sparkles size={12} />
              <span className="capitalize">{result.promptType || 'Image'} Prompt</span>
            </div>
          </div>
          <div className="prompt-output__meta-item">
            <label className="uppercase tracking-widest text-[10px] opacity-60">TARGET MODEL</label>
            <div className="prompt-output__meta-badge prompt-output__meta-badge--model">
              <Layers size={12} />
              <span className="uppercase">{result.model || 'Midjourney'}</span>
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

      {/* 3 Sample Examples (Replaced Variables) */}
      {(result.samples || []).map((sample, idx) => (
        <div className="prompt-output__section" key={idx}>
          <div className="prompt-output__header">
            <div className="prompt-output__label">
              <Sparkles size={16} />
              <span>Sample Example {String.fromCharCode(65 + idx)} (Best Result)</span>
            </div>
            <button
              className={`prompt-output__copy ${copied === `sample-${idx}` ? 'prompt-output__copy--copied' : ''}`}
              onClick={() => copyToClipboard(sample, `sample-${idx}`)}
            >
              {copied === `sample-${idx}` ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
            </button>
          </div>
          <div className="prompt-output__text">
            {sample}
          </div>
        </div>
      ))}

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
          >
            {copied === 'neg' ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
          </button>
        </div>
        <div className="prompt-output__text prompt-output__text--negative">
          {result.negativePrompt}
        </div>
      </div>

      {/* Keywords & Instructions */}
      <div className="prompt-output__section" style={{ padding: '24px' }}>
        <div className="mb-6">
          <label className="text-xs uppercase text-muted block mb-3 font-bold tracking-widest">Target Keywords</label>
          <div className="flex flex-wrap gap-2">
            {(result.keywords || []).map((kw, i) => (
              <span key={i} className="px-3 py-1.5 rounded-full bg-dark-lighter border border-dark-accent text-[11px] text-cyan font-medium">
                #{kw.replace(/^#/, '')}
              </span>
            ))}
            {(!result.keywords || result.keywords.length === 0) && <span className="text-muted text-xs italic">No keywords generated.</span>}
          </div>
        </div>
        
        <div>
          <label className="text-xs uppercase text-muted block mb-3 font-bold tracking-widest">Usage Instructions</label>
          <div className="text-sm text-secondary leading-relaxed bg-dark-lighter p-4 rounded border border-dark-accent">
            {result.instructions || "Use this prompt in your favorite AI generator."}
          </div>
        </div>
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
            {result.structured && Object.entries(result.structured).map(([key, value]) => (
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
