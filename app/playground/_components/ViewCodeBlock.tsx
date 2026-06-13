import { Button } from "@/components/ui/button"
import SyntaxHighlighter from 'react-syntax-highlighter';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Copy } from "lucide-react";
import { toast } from "sonner";


// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ViewCodeBlock({children,code}:any) {

    const handleCopy=async ()=>{
        await navigator.clipboard.writeText(code)
        toast.success("code copied")
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

      <Button size="icon" variant="outline" onClick={handleCopy}>
        <Copy className="h-4 w-4" />
      </Button>
    </DialogHeader>

    {/* Body */}
    <div className="flex-1 overflow-auto p-4">
      <SyntaxHighlighter
        wrapLongLines={false}
        customStyle={{
          margin: 0,
          borderRadius: 8,
          fontSize: 14,
          minWidth: "100%",
          overflowX: "auto",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  </DialogContent>
</Dialog>
    );
}
