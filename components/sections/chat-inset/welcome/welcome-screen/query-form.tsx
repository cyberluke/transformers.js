'use client';

import { useRef } from 'react';
import { ArrowRightIcon } from 'lucide-react';
import { AttachmentButton, AttachmentList } from '@/components/ui/attachment';
import { useKeyBindings } from '@/hooks/useKeyBindings';
import { SpeedToggle } from './speed-toggle';

interface QueryFormProps {
  input: string;
  status: string;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  handleFormSubmit: (e: React.FormEvent) => void;
  isDetailed: boolean;
  setIsDetailed: (value: boolean) => void;
}

export function QueryForm({
  input,
  status,
  handleInputChange,
  handleFormSubmit,
  isDetailed,
  setIsDetailed,
}: QueryFormProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleSubmit() {
    if (status === 'ready' && input.trim()) {
      const event = new Event('submit', { bubbles: true, cancelable: true });
      handleFormSubmit(event as unknown as React.FormEvent);
    }
  }

  useKeyBindings({
    bindings: [
      {
        key: 'Enter',
        action: handleSubmit,
        disabled: status !== 'ready' || !input.trim(),
        preventDefault: true,
        ctrlKey: false,
        shiftKey: false,
        altKey: false,
        metaKey: false,
      },
    ],
    target: textareaRef.current,
    deps: [status, input],
  });

  return (
    <form
      onSubmit={handleFormSubmit}
      className="w-full flex flex-col rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg transition-all duration-300 px-2.5 ease-in min-h-[64px] max-w-full overflow-hidden"
    >
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleInputChange}
        rows={1}
        autoFocus
        placeholder="Ask anything..."
        disabled={status !== 'ready'}
        className="placeholder:text-white/60 text-white max-h-40 w-full flex-grow resize-none border-none bg-transparent px-2 py-4 text-lg outline-none focus:ring-0 disabled:cursor-not-allowed min-w-0 cursor-pointer"
        style={{ wordBreak: 'break-word', overflowWrap: 'break-word' }}
      />
      <div className="flex w-full items-center justify-between pt-1 pb-0">
        <SpeedToggle
          isDetailed={isDetailed}
          onToggle={() => setIsDetailed(!isDetailed)}
          disabled={status !== 'ready'}
        />
        <div className="mx-1.5 flex gap-4 items-center">
          <AttachmentButton disabled={status !== 'ready'} />
          <button
            type="submit"
            disabled={status !== 'ready' || !input.trim()}
            className="my-2.5 size-8 rounded-full p-1.5 transition-opacity duration-300 cursor-pointer bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 disabled:opacity-50 border border-white/30"
          >
            <ArrowRightIcon className="w-full h-full" />
          </button>
        </div>
      </div>

      <AttachmentList />
    </form>
  );
}



