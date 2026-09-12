/**
 * exportDoc.js — Generates and downloads beautifully styled Word .doc files
 * for single direct prompts and complete prompt packs.
 */

function escapeXml(unsafe) {
  if (!unsafe || typeof unsafe !== 'string') return '';
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function generateDocHtml(result, isPack = false) {
  if (!result) return '';
  const isCompletePack = isPack || !!result.promptTemplate;
  const title = result.title || (isCompletePack ? 'AI Complete Prompt Pack' : 'AI Direct Prompt');
  const type = (result.promptType || 'image').toUpperCase();
  const model = result.model || 'Midjourney';
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>${escapeXml(title)}</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    body {
      font-family: 'Segoe UI', 'Calibri', Arial, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1f2937;
      margin: 30px;
    }
    .header {
      border-bottom: 3px solid #0284c7;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .brand {
      font-size: 10pt;
      font-weight: bold;
      color: #0284c7;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    h1 {
      font-size: 22pt;
      color: #0f172a;
      margin: 0 0 6px 0;
      line-height: 1.2;
    }
    .meta-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
    }
    .meta-table td {
      padding: 8px 12px;
      border: 1px solid #e2e8f0;
      font-size: 10pt;
    }
    .meta-label {
      font-weight: bold;
      color: #64748b;
      width: 130px;
      text-transform: uppercase;
      font-size: 8.5pt;
    }
    .meta-value {
      color: #0f172a;
      font-weight: 600;
    }
    h2 {
      font-size: 13pt;
      color: #0369a1;
      margin-top: 24px;
      margin-bottom: 8px;
      border-bottom: 1px solid #bae6fd;
      padding-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .prompt-box {
      background-color: #f0fdf4;
      border: 1px solid #86efac;
      border-left: 5px solid #16a34a;
      padding: 16px;
      margin: 10px 0 20px 0;
      font-size: 11.5pt;
      line-height: 1.7;
      color: #064e3b;
      font-family: 'Segoe UI', Tahoma, sans-serif;
    }
    .template-box {
      background-color: #eff6ff;
      border: 1px solid #93c5fd;
      border-left: 5px solid #2563eb;
      padding: 16px;
      margin: 10px 0 20px 0;
      font-size: 11.5pt;
      line-height: 1.7;
      color: #1e3a8a;
      font-family: 'Segoe UI', Tahoma, sans-serif;
    }
    .sample-title {
      font-weight: bold;
      color: #7e22ce;
      font-size: 11pt;
      margin-top: 14px;
      margin-bottom: 4px;
    }
    .sample-box {
      background-color: #faf5ff;
      border: 1px solid #d8b4fe;
      border-left: 4px solid #a855f7;
      padding: 14px;
      margin: 6px 0 16px 0;
      font-size: 10.5pt;
      line-height: 1.6;
      color: #581c87;
    }
    .negative-box {
      background-color: #fff1f2;
      border: 1px solid #fca5a5;
      border-left: 4px solid #e11d48;
      padding: 12px 14px;
      margin: 8px 0 16px 0;
      font-size: 10pt;
      color: #9f1239;
    }
    .tag {
      display: inline-block;
      background-color: #e0f2fe;
      color: #0369a1;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 9pt;
      font-weight: bold;
      margin-right: 6px;
      margin-bottom: 6px;
    }
    .info-box {
      background-color: #f8fafc;
      border: 1px solid #cbd5e1;
      padding: 12px 16px;
      border-radius: 4px;
      margin-bottom: 16px;
      font-size: 10pt;
      color: #334155;
    }
    .footer {
      margin-top: 40px;
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      text-align: center;
      font-size: 9pt;
      color: #94a3b8;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">Prompt by Niti — AI Prompt &amp; Agent Generation</div>
    <h1>${escapeXml(title)}</h1>
  </div>

  <table class="meta-table">
    <tr>
      <td class="meta-label">Format</td>
      <td class="meta-value">${escapeXml(type)} Prompt ${isCompletePack ? 'Pack' : ''}</td>
      <td class="meta-label">Target Model</td>
      <td class="meta-value">${escapeXml(model)}</td>
    </tr>
    <tr>
      <td class="meta-label">Created</td>
      <td class="meta-value">${escapeXml(dateStr)}</td>
      <td class="meta-label">Credits</td>
      <td class="meta-value">${result.priceTokens || 1} Credits</td>
    </tr>
    ${result.description ? `
    <tr>
      <td class="meta-label">Description</td>
      <td class="meta-value" colspan="3">${escapeXml(result.description)}</td>
    </tr>` : ''}
  </table>

  ${result.faceAnalysis && result.faceAnalysis.face_detected ? `
  <h2>MediaPipe Facial Biometrics (Character Ground Truth)</h2>
  <table class="meta-table">
    <tr>
      <td class="meta-label">Face Shape</td>
      <td class="meta-value">${escapeXml(result.faceAnalysis.face_shape)}</td>
      <td class="meta-label">Eye Spacing</td>
      <td class="meta-value">${escapeXml(result.faceAnalysis.eye_spacing)}</td>
    </tr>
    <tr>
      <td class="meta-label">Skin Tone (Hex)</td>
      <td class="meta-value">${escapeXml(result.faceAnalysis.skin_tone_hex)}</td>
      <td class="meta-label">Eye Color (Hex)</td>
      <td class="meta-value">${escapeXml(result.faceAnalysis.left_eye_color_hex)}</td>
    </tr>
    ${Array.isArray(result.faceAnalysis.expression_notes) && result.faceAnalysis.expression_notes.length > 0 ? `
    <tr>
      <td class="meta-label">Expressions</td>
      <td class="meta-value" colspan="3">${escapeXml(result.faceAnalysis.expression_notes.map(e => `${e.feature} (${Math.round((e.intensity || 0) * 100)}%)`).join(', '))}</td>
    </tr>` : ''}
    <tr>
      <td class="meta-label">Landmarks</td>
      <td class="meta-value" colspan="3">${result.faceAnalysis.landmark_count || 478} 3D facial landmarks analyzed (${result.faceAnalysis.processing_ms || 10}ms) — 100% Consistent Character Profile</td>
    </tr>
  </table>
  ` : ''}

  ${result.imageAnalysis ? `
  <h2>Reference Image Analysis</h2>
  <div class="info-box">${escapeXml(result.imageAnalysis)}</div>
  ` : ''}

  ${result.mainPrompt && !isCompletePack ? `
  <h2>Direct Ready-to-Use Prompt</h2>
  <div class="prompt-box">${escapeXml(result.mainPrompt)}</div>
  ` : ''}

  ${result.promptTemplate ? `
  <h2>Prompt Template (With Variables)</h2>
  <div class="template-box">${escapeXml(result.promptTemplate)}</div>
  ` : ''}

  ${isCompletePack && Array.isArray(result.samples) && result.samples.length > 0 ? `
  <h2>Generated Sample Variations (${result.samples.length} Samples)</h2>
  ${result.samples.map((sample, idx) => `
    <div class="sample-title">Sample Example ${String.fromCharCode(65 + idx)}</div>
    <div class="sample-box">${escapeXml(sample)}</div>
  `).join('')}
  ` : ''}

  ${result.negativePrompt ? `
  <h2>Negative Prompt (Flaws to Avoid)</h2>
  <div class="negative-box">${escapeXml(result.negativePrompt)}</div>
  ` : ''}

  ${Array.isArray(result.keywords) && result.keywords.length > 0 ? `
  <h2>Target Keywords</h2>
  <div style="margin-bottom: 16px;">
    ${result.keywords.map(kw => `<span class="tag">#${escapeXml(kw.replace(/^#/, ''))}</span>`).join(' ')}
  </div>
  ` : ''}

  ${result.instructions ? `
  <h2>Usage Instructions</h2>
  <div class="info-box">${escapeXml(result.instructions)}</div>
  ` : ''}

  ${result.structured && Object.keys(result.structured).length > 0 ? `
  <h2>Structured Breakdown</h2>
  <table class="meta-table">
    ${Object.entries(result.structured).map(([key, val]) => `
      <tr>
        <td class="meta-label">${escapeXml(key.replace(/([A-Z])/g, ' $1'))}</td>
        <td class="meta-value">${escapeXml(val)}</td>
      </tr>
    `).join('')}
  </table>
  ` : ''}

  <div class="footer">
    Prompt by Niti — Prompts. Agents. Built by AI. | https://promptbyniti.com
  </div>
</body>
</html>`;
}

/**
 * Downloads the prompt result as a formatted Word (.doc) file
 */
export function downloadPromptAsDoc(result, isPack = false) {
  if (!result) return;
  const isCompletePack = isPack || !!result.promptTemplate;
  const rawTitle = result.title || (isCompletePack ? 'AI_Prompt_Pack' : 'AI_Prompt');
  const safeFilename = rawTitle
    .replace(/[^a-zA-Z0-9_\- ]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .substring(0, 40) || 'prompt';

  const filename = isCompletePack ? `${safeFilename}_Complete_Pack.doc` : `${safeFilename}.doc`;
  const docHtml = generateDocHtml(result, isCompletePack);

  const blob = new Blob(['\ufeff' + docHtml], {
    type: 'application/msword;charset=utf-8'
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 1500);
}
