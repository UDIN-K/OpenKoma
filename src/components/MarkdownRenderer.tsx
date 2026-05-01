import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Copy, Check } from 'lucide-react';
import 'katex/dist/katex.min.css';

interface MarkdownRendererProps {
  content: string;
  searchQuery?: string;
}

// Highlight helper
export const highlightText = (text: string, query?: string) => {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() 
          ? <span key={i} className="bg-amber-500/30 text-white rounded-[2px] px-[2px]">{part}</span> 
          : part
      )}
    </>
  );
};

const CustomText = ({ children, searchQuery }: any) => {
  if (typeof children === 'string') {
    return highlightText(children, searchQuery);
  }
  return children;
};

const CodeBlock = ({ inline, className, children, searchQuery, ...props }: any) => {
  const [copied, setCopied] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const codeString = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className="relative my-4 rounded-xl overflow-hidden border border-white/10 bg-[#1E293B]">
        <div className="flex items-center justify-between px-4 py-2 bg-[#0B101A]/50 border-b border-white/5">
          <span className="text-xs font-mono text-gray-400">{language}</span>
          <button 
            onClick={handleCopy}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors p-1"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
        <SyntaxHighlighter
          style={vscDarkPlus as any}
          language={language}
          PreTag="div"
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            fontSize: '13px',
          }}
          {...props}
        >
          {codeString}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <code className="bg-black/40 px-1.5 py-0.5 rounded-md text-[13px] font-mono text-[#00D4FF] border border-white/10 break-words" {...props}>
      {children}
    </code>
  );
};

const renderWithHighlight = (children: React.ReactNode, searchQuery?: string): React.ReactNode => {
  if (typeof children === 'string') {
    return highlightText(children, searchQuery);
  }
  if (Array.isArray(children)) {
    return React.Children.map(children, child => renderWithHighlight(child, searchQuery));
  }
  return children;
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, searchQuery }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code: (props) => <CodeBlock {...props} searchQuery={searchQuery} />,
        p: ({ node, children, ...props }) => <p {...props}>{renderWithHighlight(children, searchQuery)}</p>,
        li: ({ node, children, ...props }) => <li {...props}>{renderWithHighlight(children, searchQuery)}</li>,
        strong: ({ node, children, ...props }) => <strong {...props}>{renderWithHighlight(children, searchQuery)}</strong>,
        em: ({ node, children, ...props }) => <em {...props}>{renderWithHighlight(children, searchQuery)}</em>,
        h1: ({ node, children, ...props }) => <h1 {...props}>{renderWithHighlight(children, searchQuery)}</h1>,
        h2: ({ node, children, ...props }) => <h2 {...props}>{renderWithHighlight(children, searchQuery)}</h2>,
        h3: ({ node, children, ...props }) => <h3 {...props}>{renderWithHighlight(children, searchQuery)}</h3>,
        h4: ({ node, children, ...props }) => <h4 {...props}>{renderWithHighlight(children, searchQuery)}</h4>,
        h5: ({ node, children, ...props }) => <h5 {...props}>{renderWithHighlight(children, searchQuery)}</h5>,
        h6: ({ node, children, ...props }) => <h6 {...props}>{renderWithHighlight(children, searchQuery)}</h6>,
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
