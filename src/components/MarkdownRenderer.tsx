import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer = ({ content }: MarkdownRendererProps) => {
  return (
    <div className="article-content max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
      
      <style>{`
        .article-content {
          font-size: 1.125rem;
          line-height: 1.8;
          color: #e5e7eb;
        }
        
        .article-content p {
          margin-bottom: 1.5rem;
          color: #d1d5db;
        }
        
        .article-content h1 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #ffffff;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        
        .article-content h2 {
          font-size: 2rem;
          font-weight: 700;
          color: #ffffff;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        
        .article-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #ffffff;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
        }
        
        .article-content a {
          color: #f87171;
          text-decoration: none;
        }
        
        .article-content a:hover {
          color: #fca5a5;
          text-decoration: underline;
        }
        
        .article-content strong {
          color: #ffffff;
          font-weight: 600;
        }
        
        .article-content ul, .article-content ol {
          margin-bottom: 1.5rem;
          padding-left: 1.5rem;
        }
        
        .article-content li {
          margin-bottom: 0.5rem;
          color: #d1d5db;
        }
        
        .article-content blockquote {
          border-left: 4px solid #dc2626;
          padding-left: 1rem;
          margin: 1.5rem 0;
          background-color: rgba(255, 255, 255, 0.05);
          padding: 1rem;
          border-radius: 0.5rem;
        }
        
        .article-content blockquote p {
          color: #e5e7eb;
          margin-bottom: 0;
        }
      `}</style>
    </div>
  );
};

export default MarkdownRenderer;
