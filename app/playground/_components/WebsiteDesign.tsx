'use client'
import { useEffect, useRef, useState } from 'react'
import WebpageTool from './WebpageTool';

type Props = {
    generatedCode: string
}

const HTML_CODE = `
<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <meta name="description" content="AI Website Builder - Modern TailwindCSS + Flowbite Template">
          <title>AI Website Builder</title>

          <!-- Tailwind CSS -->
          <script src="https://cdn.tailwindcss.com"></script>

          <!-- Flowbite CSS & JS -->
          <link href="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.css" rel="stylesheet">
          <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/2.3.0/flowbite.min.js"></script>

          <!-- Font Awesome / Lucide -->
          <script src="https://unpkg.com/lucide@latest/dist/umd/lucide.js"></script>

          <!-- Chart.js -->
          <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>


         
      </head>
      <body id="root"></body>
      </html>
    `

function WebsiteDesign({ generatedCode }: Props) {

    const [screenSize, setScreenSize] = useState('desktop')
    const [selectedElementLabel, setSelectedElementLabel] = useState<string>("No component selected")

    const iframeRef = useRef<HTMLIFrameElement>(null);


    // Initialize iframe shell once

    useEffect(() => {
        if (!iframeRef.current) return;
        const doc = iframeRef.current.contentDocument;
        if (!doc) return;

        doc.open();
        doc.write(HTML_CODE);
        doc.close();

        let hoverEl: HTMLElement | null = null;
        let selectedEl: HTMLElement | null = null;



        const resolveSelectableTarget = (target: EventTarget | null): HTMLElement | null => {
            if (!target) return null;
            let element: HTMLElement | null = null;
            const nodeTarget = target as Node;

            // Use nodeType checks instead of instanceof (iframe-safe across realms)
            if (nodeTarget.nodeType === 1) {
                element = nodeTarget as HTMLElement;
            } else if (nodeTarget.nodeType === 3) {
                element = nodeTarget.parentElement;
            }

            if (!element) return null;

            const root = doc.getElementById("root");
            if (!root || !root.contains(element)) return null;

            const semanticParent = element.closest(
                "section, article, nav, header, footer, aside, main, form, button, a, li, card, [data-component]"
            );

            const candidate = (semanticParent as HTMLElement | null) ?? element;
            if (candidate === doc.body || candidate === doc.documentElement || candidate.id === "root") {
                const firstChild = doc.getElementById("root")?.firstElementChild;
                return firstChild && firstChild.nodeType === 1 ? (firstChild as HTMLElement) : null;
            }

            return candidate;
        };

        const handleMouseOver = (e: MouseEvent) => {
            if (selectedEl) return;
            const target = resolveSelectableTarget(e.target);
            if (!target) return;
            if (hoverEl && hoverEl !== target) {
                hoverEl.style.outline = "";
            }
            hoverEl = target;
            hoverEl.style.outline = "2px dotted blue";
        };

        const handleMouseOut = () => {
            if (selectedEl) return;
            if (hoverEl) {
                hoverEl.style.outline = "";
                hoverEl = null;
            }
        };

        const getElementLabel = (element: HTMLElement) => {
            const tag = element.tagName.toLowerCase();
            const id = element.id ? `#${element.id}` : "";
            const className =
                typeof element.className === "string" && element.className.trim().length > 0
                    ? `.${element.className.trim().split(/\s+/).join(".")}`
                    : "";
            return `<${tag}${id}${className}>`;
        };

        const clearSelection = () => {
            if (!selectedEl) return;
            selectedEl.style.outline = "";
            selectedEl.removeAttribute("contenteditable");
            selectedEl.removeEventListener("blur", handleBlur);
            selectedEl = null;
            setSelectedElementLabel("No component selected");
        };

        const handleClick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const target = resolveSelectableTarget(e.target);
            if (!target) return;

            if (selectedEl && selectedEl !== target) {
                selectedEl.style.outline = "";
                selectedEl.removeAttribute("contenteditable");
                selectedEl.removeEventListener("blur", handleBlur);
            }

            selectedEl = target;
            selectedEl.style.outline = "2px solid red";
            selectedEl.setAttribute("contenteditable", "true");
            selectedEl.addEventListener("blur", handleBlur);
            selectedEl.focus();
            setSelectedElementLabel(getElementLabel(selectedEl));
            console.log("Selected element:", selectedEl);

        };

        const handleBlur = () => {
            if (selectedEl) {
                console.log("Final edited element:", selectedEl.outerHTML);
            }
        };


        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape" && selectedEl) {
                clearSelection();
            }
        };

        doc.addEventListener("mouseover", handleMouseOver, true);
        doc.addEventListener("mouseout", handleMouseOut, true);
        doc.addEventListener("click", handleClick, true);
        doc?.addEventListener("keydown", handleKeyDown);

        // Cleanup on unmount
        return () => {
            clearSelection();
            doc.removeEventListener("mouseover", handleMouseOver, true);
            doc.removeEventListener("mouseout", handleMouseOut, true);
            doc.removeEventListener("click", handleClick, true);
            doc?.removeEventListener("keydown", handleKeyDown);
        };
    }, []);



    // Update body only when code changes
    useEffect(() => {
        if (!iframeRef.current) return;
        const doc = iframeRef.current.contentDocument;
        if (!doc) return;

        const root = doc.getElementById("root");
        if (root) {
            root.innerHTML =
                generatedCode
                    ?.replaceAll("```html", "")
                    .replaceAll("```", "")
                    .replace("html", "") ?? "";
        }
    }, [generatedCode]);

    return (
        <div className='p-5 w-full flex justify-center items-center flex-col'>

            <iframe
                ref={iframeRef}
                className={`${screenSize == 'desktop' ? "w-full" : "w-110"} h-[600px] border-2 rounded-xl`}
                sandbox="allow-scripts allow-same-origin"
            />
            <div className='w-full mt-2 text-sm text-muted-foreground'>
                Selected: {selectedElementLabel}
            </div>
            <WebpageTool screenSize={screenSize} setScreenSize={(v: string) => setScreenSize(v)} code={generatedCode} />
        </div>
    );
}


export default WebsiteDesign