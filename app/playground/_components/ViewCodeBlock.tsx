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
  <DialogTrigger>{children}</DialogTrigger>
  <DialogContent className="min-w-6xl max-h-[500px] overflow-auto">
    <DialogHeader>
      <DialogTitle>
        <div>
        Source Code
        <span className="ml-5"><Button onClick={handleCopy}><Copy/></Button></span>
        </div>
        </DialogTitle>
      <DialogDescription>
        <div>
        <SyntaxHighlighter>
        {code}
        </SyntaxHighlighter>
        </div>
      </DialogDescription>
    </DialogHeader>
  </DialogContent>
</Dialog>
  )
}
