import { Light as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dark, docco, paraisoLight } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

const CodeRenderer = ({ node, inline, className, children }) => {
    const match = /language-(\w+)/.exec(className || '');
    const language = match && match[1];
  
    if (!match) {
      return <code className="text-sm font-mono" style={{backgroundColor:"grey", borderRadius: "0.1rem", margin:"0.2rem"}}>{children}</code>;
    } else {
      return (
        <div className="p-4 rounded bg-gray-800" style={{borderRadius: "0.rem"}}>
          <SyntaxHighlighter language={language || 'text'} style={dark} >
            {String(children).replace(/\n$/, '')}
          </SyntaxHighlighter>
        </div>
      );
    }
  };


export default CodeRenderer