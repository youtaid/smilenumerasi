
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css'; // Import CSS directly if possible, or rely on CDN

interface Props {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<Props> = ({ content, className = '' }) => {
  // Check if text-white is passed in className to determine "dark mode" styling
  const isDarkMode = className.includes('text-white');
  
  // If not dark mode, default to gray-700 for body text. 
  // If dark mode, let the wrapper's text-white apply.
  const baseTextColor = isDarkMode ? 'text-white' : 'text-gray-700';
  
  // Use prose-invert for better contrast on dark backgrounds if available in tailwind config, 
  // otherwise fallback to manual color handling which we do below anyway.
  const proseClass = isDarkMode ? 'prose-invert' : 'prose-indigo';

  // Header colors: use Indigo in light mode, inherit (white) in dark mode
  const h1Color = isDarkMode ? 'text-white' : 'text-indigo-900';
  const h2Color = isDarkMode ? 'text-white' : 'text-indigo-800';
  const h3Color = isDarkMode ? 'text-white' : 'text-indigo-700';
  
  // Bold color: dark gray in light mode, inherit (or styled by prose-strong) in dark mode
  const boldColor = isDarkMode ? 'text-white' : 'text-gray-900';

  // Pre-process content to normalize LaTeX delimiters
  // LLMs often output \[ \] for block math and \( \) for inline math.
  // remark-math typically expects $$ for block and $ for inline.
  const normalizeMath = (str: string) => {
    if (!str) return '';
    return str
      .replace(/\\\[/g, '$$$')
      .replace(/\\\]/g, '$$$')
      .replace(/\\\(/g, '$')
      .replace(/\\\)/g, '$');
  };

  const processedContent = normalizeMath(content);

  return (
    <div className={`prose ${proseClass} max-w-none ${baseTextColor} ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({node, ...props}) => <h1 className={`text-2xl font-bold mt-6 mb-4 ${h1Color}`} {...props} />,
          h2: ({node, ...props}) => <h2 className={`text-xl font-bold mt-6 mb-3 border-b pb-1 ${h2Color}`} {...props} />,
          h3: ({node, ...props}) => <h3 className={`text-lg font-bold mt-4 mb-2 ${h3Color}`} {...props} />,
          strong: ({node, ...props}) => <strong className={`font-bold ${boldColor}`} {...props} />,
          li: ({node, ...props}) => <li className="ml-4 list-disc leading-relaxed pl-2" {...props} />,
          ul: ({node, ...props}) => <ul className="list-disc ml-4 space-y-1 my-4" {...props} />,
          ol: ({node, ...props}) => <ol className="list-decimal ml-4 space-y-1 my-4" {...props} />,
          p: ({node, ...props}) => <p className="leading-relaxed mb-4" {...props} />,
          table: ({node, ...props}) => (
            <div className="overflow-x-auto my-6 print:my-4">
              <table className="min-w-full border-collapse border border-slate-800 text-sm font-sans" {...props} />
            </div>
          ),
          th: ({node, ...props}) => <th className="border border-slate-600 p-2.5 bg-slate-100 font-bold" {...props} />,
          td: ({node, ...props}) => <td className="border border-slate-600 p-2.5" {...props} />
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
