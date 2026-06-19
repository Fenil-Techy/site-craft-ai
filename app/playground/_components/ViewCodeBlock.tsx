'use client'

import dynamic from 'next/dynamic';
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Copy } from "lucide-react";
import { toast } from "sonner";

// 3.3 — Lazy-load the ~70KB syntax highlighter only when the dialog opens.
// ssr: false because it uses browser-only APIs.
const SyntaxHighlighter = dynamic(
  () => import('react-syntax-highlighter').then((mod) => mod.default),
  {
    ssr: false,
    loading: ({ error }) =>
      error
        ? <pre className="p-4 text-red-400 text-sm">Failed to load highlighter.</pre>
        : <pre className="p-4 text-sm text-muted-foreground animate-pulse">Loading…</pre>,
  }
);

// 4.11 — Import a dark theme for HTML syntax highlighting
import { atomOneDark } from 'react-syntax-highlighter/dist/esm/styles/hljs';

type Props = {
  children: React.ReactNode;
  code: string;
};

export function ViewCodeBlock({ children, code }: Props) {

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    toast.success("Code copied to clipboard")
  }

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        className="
          w-[95vw]
          max-w-[95vw]
          sm:max-w-[90vw]
          md:max-w-4xl
          lg:max-w-5xl
          xl:max-w-6xl
          h-[90vh]
          p-0
          gap-0
          overflow-hidden
          rounded-lg
          backdrop-blur-sm
        "
      >
        {/* Header */}
        <DialogHeader className="flex flex-row items-center justify-between border-b px-4 py-3 shrink-0">
          <DialogTitle>Source Code</DialogTitle>

          <Button size="icon" variant="outline" onClick={handleCopy} aria-label="Copy code to clipboard">
            <Copy className="h-4 w-4" />
          </Button>
        </DialogHeader>

        {/* Body */}
        <div className="flex-1 overflow-auto p-4">
          <SyntaxHighlighter
            language="html"
            style={atomOneDark}
            wrapLongLines={false}
            customStyle={{
              margin: 0,
              borderRadius: 8,
              fontSize: 14,
              minWidth: "100%",
              overflowX: "auto",
              background: "transparent",
            }}
          >
            {code}
          </SyntaxHighlighter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
