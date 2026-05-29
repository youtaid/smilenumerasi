
import React, { useState } from 'react';
import { Copy, Check, RefreshCw, FileDown, Loader2 } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

interface ResultDisplayProps {
  content: string;
  onReset: () => void;
}

const KokurikulerResult: React.FC<ResultDisplayProps> = ({ content, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleDownloadDoc = () => {
    setIsDownloading(true);
    try {
      const element = document.getElementById('kokurikuler-content-area');
      if (!element) return;

      const clone = element.cloneNode(true) as HTMLElement;

      // Fix KaTeX for Word Export: Convert to image using CodeCogs
      const katexElements = clone.querySelectorAll('.katex');
      katexElements.forEach(katexEl => {
          const annotationEl = katexEl.querySelector('annotation[encoding="application/x-tex"]');
          if (annotationEl && annotationEl.textContent) {
              const tex = annotationEl.textContent;
              const img = document.createElement('img');
              img.src = `https://latex.codecogs.com/png.image?\\dpi{300}\\bg{white}${encodeURIComponent(tex)}`;
              img.alt = tex;
              img.style.verticalAlign = 'middle';
              
              const isBlock = katexEl.classList.contains('katex-display');
              if (isBlock) {
                  const div = document.createElement('div');
                  div.style.textAlign = 'center';
                  div.style.margin = '1em 0';
                  div.appendChild(img);
                  katexEl.parentNode?.replaceChild(div, katexEl);
              } else {
                  katexEl.parentNode?.replaceChild(img, katexEl);
              }
          } else {
              // Fallback to MathML if annotation is missing
              const mathmlEl = katexEl.querySelector('.katex-mathml math');
              if (mathmlEl) {
                  katexEl.parentNode?.replaceChild(mathmlEl.cloneNode(true), katexEl);
              }
          }
      });

      const contentHtml = clone.innerHTML;

      const preHtml = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset='utf-8'>
          <title>Dokumen Kokurikuler</title>
          <style>
            @page {
              size: A4;
              margin: 2.54cm;
            }
            body {
              font-family: 'Arial', sans-serif;
              font-size: 11pt;
              line-height: 1.5;
              color: #000000;
            }
            h1, h2, h3, h4 {
              color: #000000;
              margin-top: 15pt;
              margin-bottom: 5pt;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 12pt;
            }
            td, th {
              border: 1px solid #000000;
              padding: 5pt;
              vertical-align: top;
              font-size: 10pt;
            }
            th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .page-break {
              page-break-before: always;
            }
            /* Remove tailwind-specific styling artifacts */
            * { box-sizing: border-box; }
          </style>
        </head>
        <body>
      `;
      const postHtml = "</body></html>";
      const fullHtml = preHtml + contentHtml + postHtml;

      const blob = new Blob(['\ufeff', fullHtml], {
        type: 'application/msword'
      });
      
      const filename = `Dokumen_Kokurikuler_${new Date().toISOString().slice(0,10)}.doc`;

      const url = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(fullHtml);
      
      const downloadLink = document.createElement("a");
      document.body.appendChild(downloadLink);
      
      if ((navigator as any).msSaveOrOpenBlob) {
        (navigator as any).msSaveOrOpenBlob(blob, filename);
      } else {
        downloadLink.href = url;
        downloadLink.download = filename;
        downloadLink.click();
      }
      
      document.body.removeChild(downloadLink);
    } catch (e) {
      console.error("Download failed", e);
      alert("Gagal mengunduh dokumen. Silakan coba lagi.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full animate-fade-in">
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center sticky top-0 z-10 gap-3">
        <h2 className="font-bold text-[#112967] flex items-center gap-2">
          <span className="w-2 h-6 bg-[#F34B1E] rounded-full"></span>
          Dokumen Siap Pakai
        </h2>
        <div className="flex flex-wrap items-center gap-2">
           <button
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-[#112967] hover:bg-white rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
            <span className="hidden sm:inline">Buat Baru</span>
          </button>
          
          <div className="h-6 w-px bg-slate-300 mx-1 hidden sm:block"></div>

          <button
            onClick={handleCopy}
            className={`flex items-center gap-2 px-4 py-1.5 text-sm font-medium rounded-lg transition-all shadow-sm border ${
              copied
                ? "bg-green-100 text-green-700 border-green-200"
                : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 hover:text-[#112967]"
            }`}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Tersalin!" : "Salin Teks"}
          </button>

          <button
            onClick={handleDownloadDoc}
            disabled={isDownloading}
            className="flex items-center gap-2 px-4 py-1.5 text-sm font-bold rounded-lg transition-all shadow-sm bg-[#112967] text-white border border-[#112967] hover:bg-blue-900 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <FileDown size={16} />}
            Download Word
          </button>
        </div>
      </div>
      
      <div id="kokurikuler-content-area" className="flex-1 p-8 overflow-y-auto bg-white">
        <div className="max-w-4xl mx-auto font-sans text-[15px] leading-relaxed">
          <MarkdownRenderer content={content} />
        </div>
      </div>
      
      <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-xs text-slate-400 text-center font-medium">
        Dokumen ini dibuat otomatis oleh AI Kokurikuler. Silakan periksa kembali sebelum dicetak.
      </div>
    </div>
  );
};

export default KokurikulerResult;
