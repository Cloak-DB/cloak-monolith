import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeSlug from 'rehype-slug';

type DocsContentProps = {
  content: string;
};

export function DocsContent({ content }: DocsContentProps) {
  return (
    <article
      className="
        prose dark:prose-invert max-w-none
        prose-headings:font-semibold
        prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-4
        prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
        prose-p:text-gray-600 dark:prose-p:text-gray-400 prose-p:leading-relaxed
        prose-a:text-yellow-600 dark:prose-a:text-yellow-500 prose-a:no-underline hover:prose-a:underline
        prose-code:text-sm prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-gray-800 prose-pre:text-gray-100 prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-gray-700 prose-pre:rounded-lg
        [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_pre_code]:text-gray-100
        prose-table:text-sm
        prose-th:bg-gray-50 dark:prose-th:bg-gray-800 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold
        prose-td:px-4 prose-td:py-2 prose-td:border-t prose-td:border-gray-200 dark:prose-td:border-gray-700
        prose-li:text-gray-600 dark:prose-li:text-gray-400
        prose-strong:text-gray-900 dark:prose-strong:text-white
      "
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeSlug]}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}
