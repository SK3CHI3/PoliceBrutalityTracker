interface ArticleRendererProps {
  content: string;
}

const ArticleRenderer = ({ content }: ArticleRendererProps) => {
  // Split content into paragraphs by double newlines
  const paragraphs = (content || '').split('\n\n').filter(p => p.trim());

  return (
    <div className="article-body">
      {paragraphs.map((paragraph, index) => {
        const trimmed = paragraph.trim();
        
        // Skip empty paragraphs
        if (!trimmed) return null;

        // Check if it's a heading (starts with #)
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={index} className="text-3xl font-bold text-white mt-8 mb-4">
              {trimmed.replace('# ', '')}
            </h1>
          );
        }
        
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={index} className="text-2xl font-bold text-white mt-6 mb-3">
              {trimmed.replace('## ', '')}
            </h2>
          );
        }
        
        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={index} className="text-xl font-semibold text-white mt-5 mb-2">
              {trimmed.replace('### ', '')}
            </h3>
          );
        }

        // Check if it's a list
        const lines = trimmed.split('\n');
        const isUnorderedList = lines.every(line => line.trim().startsWith('- ') || line.trim() === '');
        const isOrderedList = lines.every((line, i) => 
          line.trim().match(/^\d+\.\s/) || line.trim() === ''
        );

        if (isUnorderedList) {
          return (
            <ul key={index} className="list-disc list-inside space-y-2 mb-6 text-gray-300">
              {lines
                .filter(line => line.trim().startsWith('- '))
                .map((line, i) => (
                  <li key={i} className="leading-relaxed">
                    {line.trim().replace('- ', '')}
                  </li>
                ))}
            </ul>
          );
        }

        if (isOrderedList) {
          return (
            <ol key={index} className="list-decimal list-inside space-y-2 mb-6 text-gray-300">
              {lines
                .filter(line => line.trim().match(/^\d+\.\s/))
                .map((line, i) => (
                  <li key={i} className="leading-relaxed">
                    {line.trim().replace(/^\d+\.\s/, '')}
                  </li>
                ))}
            </ol>
          );
        }

        // Check if it's a blockquote (starts with >)
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote 
              key={index} 
              className="border-l-4 border-red-500 pl-6 py-4 my-6 bg-white/5 rounded-r-lg italic text-gray-300"
            >
              {trimmed.replace('> ', '')}
            </blockquote>
          );
        }

        // Regular paragraph - render with proper typography
        return (
          <p 
            key={index} 
            className="text-lg leading-relaxed text-gray-300 mb-6 font-normal"
            style={{ lineHeight: '1.8' }}
          >
            {trimmed}
          </p>
        );
      })}

      <style>{`
        .article-body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        
        .article-body p::first-letter {
          font-size: 1.1em;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
};

export default ArticleRenderer;
