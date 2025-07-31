'use client';

import '@assistant-ui/react-markdown/styles/dot.css';
import { FC, memo, useState } from 'react';
import { CheckIcon, CopyIcon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '@/lib/utils';
import { TooltipIconButton } from '@/components/ui/tooltip/';

interface MarkdownRendererProps {
  content: string;
}

const useCopyToClipboard = ({
  copiedDuration = 3000,
}: {
  copiedDuration?: number;
} = {}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const copyToClipboard = (value: string) => {
    if (!value) return;

    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), copiedDuration);
    });
  };

  return { isCopied, copyToClipboard };
};

const CodeHeader: FC<{ language: string; code: string }> = ({ language, code }) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard();
  const onCopy = () => {
    if (!code || isCopied) return;
    copyToClipboard(code);
  };

  return (
    <div className="flex items-center justify-between gap-4 rounded-t-lg bg-black/80 backdrop-blur-sm border-b border-white/10 px-4 py-2 text-sm font-semibold text-white">
      <span className="lowercase [&>span]:text-xs text-white/80">{language}</span>
      <TooltipIconButton tooltip="Copy" onClick={onCopy}>
        {!isCopied && <CopyIcon />}
        {isCopied && <CheckIcon />}
      </TooltipIconButton>
    </div>
  );
};

const MarkdownRendererImpl: FC<MarkdownRendererProps> = ({ content }) => {
  return (
    <div className="aui-md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
        h1: ({ className, ...props }) => (
          <h1
            className={cn(
              'mb-8 scroll-m-20 text-4xl font-extrabold tracking-tight last:mb-0 text-white',
              className
            )}
            {...props}
          />
        ),
        h2: ({ className, ...props }) => (
          <h2
            className={cn(
              'mb-4 mt-8 scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0 last:mb-0 text-white',
              className
            )}
            {...props}
          />
        ),
        h3: ({ className, ...props }) => (
          <h3
            className={cn(
              'mb-4 mt-6 scroll-m-20 text-2xl font-semibold tracking-tight first:mt-0 last:mb-0 text-white',
              className
            )}
            {...props}
          />
        ),
        h4: ({ className, ...props }) => (
          <h4
            className={cn(
              'mb-4 mt-6 scroll-m-20 text-xl font-semibold tracking-tight first:mt-0 last:mb-0 text-white',
              className
            )}
            {...props}
          />
        ),
        h5: ({ className, ...props }) => (
          <h5
            className={cn(
              'my-4 text-lg font-semibold first:mt-0 last:mb-0 text-white',
              className
            )}
            {...props}
          />
        ),
        h6: ({ className, ...props }) => (
          <h6
            className={cn('my-4 font-semibold first:mt-0 last:mb-0 text-white', className)}
            {...props}
          />
        ),
        p: ({ className, ...props }) => (
          <p
            className={cn('mb-5 mt-5 leading-7 first:mt-0 last:mb-0 text-white/90', className)}
            {...props}
          />
        ),
        a: ({ className, ...props }) => (
          <a
            className={cn(
              'text-blue-300 font-medium underline underline-offset-4 hover:text-blue-200 transition-colors',
              className
            )}
            {...props}
          />
        ),
        blockquote: ({ className, ...props }) => (
          <blockquote
            className={cn('border-l-2 border-white/30 pl-6 italic bg-white/5 backdrop-blur-sm rounded-r-lg py-2 my-4 text-white/90', className)}
            {...props}
          />
        ),
        ul: ({ className, ...props }) => (
          <ul
            className={cn('my-5 ml-6 list-disc [&>li]:mt-2 text-white/90 [&>li]:text-white/90', className)}
            {...props}
          />
        ),
        ol: ({ className, ...props }) => (
          <ol
            className={cn('my-5 ml-6 list-decimal [&>li]:mt-2 text-white/90 [&>li]:text-white/90', className)}
            {...props}
          />
        ),
        hr: ({ className, ...props }) => (
          <hr className={cn('my-5 border-b border-white/20', className)} {...props} />
        ),
        table: ({ className, ...props }) => (
          <table
            className={cn(
              'my-5 w-full border-separate border-spacing-0 overflow-y-auto bg-white/5 backdrop-blur-sm rounded-lg border border-white/10',
              className
            )}
            {...props}
          />
        ),
        th: ({ className, ...props }) => (
          <th
            className={cn(
              'bg-white/10 backdrop-blur-sm border-b border-white/10 px-4 py-2 text-left font-bold text-white first:rounded-tl-lg last:rounded-tr-lg [&[align=center]]:text-center [&[align=right]]:text-right',
              className
            )}
            {...props}
          />
        ),
        td: ({ className, ...props }) => (
          <td
            className={cn(
              'border-b border-white/10 px-4 py-2 text-left text-white/90 [&[align=center]]:text-center [&[align=right]]:text-right',
              className
            )}
            {...props}
          />
        ),
        tr: ({ className, ...props }) => (
          <tr
            className={cn(
              'm-0 border-b p-0 first:border-t [&:last-child>td:first-child]:rounded-bl-lg [&:last-child>td:last-child]:rounded-br-lg',
              className
            )}
            {...props}
          />
        ),
        sup: ({ className, ...props }) => (
          <sup
            className={cn('[&>a]:text-xs [&>a]:no-underline', className)}
            {...props}
          />
        ),
        pre: ({ className, children, ...props }) => {
          const codeElement = children as any;
          const code = codeElement?.props?.children || '';
          const language = codeElement?.props?.className?.replace('language-', '') || 'text';
          
          return (
            <div className="my-5 bg-black/40 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg">
              <CodeHeader language={language} code={code} />
              <pre
                className={cn(
                  'overflow-x-auto rounded-b-lg bg-transparent p-4 text-white m-0',
                  className
                )}
                {...props}
              >
                {children}
              </pre>
            </div>
          );
        },
        code: ({ className, ...props }) => {
          // Detect if it's inline code (no parent pre element)
          const isInline = !props.children?.toString().includes('\n');
          return (
            <code
              className={cn(
                !isInline && 'bg-transparent text-white',
                isInline && 'bg-white/20 backdrop-blur-sm rounded border border-white/30 font-semibold px-1 text-white',
                className
              )}
              {...props}
            />
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
};

export const MarkdownRenderer = memo(MarkdownRendererImpl); 