import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

type DocsContentProps = {
  content: string;
};

export function DocsContent({ content }: DocsContentProps) {
  return (
    <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-code:font-mono prose-pre:border-2 prose-pre:border-black dark:prose-pre:border-white">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
