'use client'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'
import WebpageTool from './WebpageTool';
import ElementSettingSection from './ElementSettingSection';
import ImageSettingSection from './ImageSetting';
import { OnSaveContext } from '@/context/OnSaveContext';
import { toast } from 'sonner';
import { useParams, useSearchParams } from 'next/navigation';
import axios from 'axios';

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
    const [selectedElement, setSelectedElement] = useState<HTMLElement | null>(null)
    const{onSave,setOnSave}=useContext(OnSaveContext)
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const selectedElementRef = useRef<HTMLElement | null>(null);
    const clearSelectionRef = useRef<() => void>(() => { });

    const{projectId}=useParams()
    const params=useSearchParams()
    const frameId=params.get('frameId')

    const clearSelectedElement = useCallback(() => {
        clearSelectionRef.current();
    }, []);


    // Initialize iframe shell once

    useEffect(() => {
        if (!iframeRef.current) return;
        const doc = iframeRef.current.contentDocument;
        if (!doc) return;

        doc.open();
        doc.write(HTML_CODE);
        doc.close();

        let hoverEl: HTMLElement | null = null;



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
            if (selectedElementRef.current) return;
            const target = resolveSelectableTarget(e.target);
            if (!target) return;
            if (hoverEl && hoverEl !== target) {
                hoverEl.style.outline = "";
            }
            hoverEl = target;
            hoverEl.style.outline = "2px dotted blue";
        };

        const handleMouseOut = () => {
            if (selectedElementRef.current) return;
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
            const selectedEl = selectedElementRef.current;
            if (!selectedEl) return;
            selectedEl.style.outline = "";
            selectedEl.removeAttribute("contenteditable");
            selectedEl.removeEventListener("blur", handleBlur);
            selectedElementRef.current = null;
            setSelectedElement(null);
            setSelectedElementLabel("No component selected");
        };

        const handleClick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const target = resolveSelectableTarget(e.target);
            if (!target) return;

            const currentSelectedEl = selectedElementRef.current;
            if (currentSelectedEl && currentSelectedEl !== target) {
                currentSelectedEl.style.outline = "";
                currentSelectedEl.removeAttribute("contenteditable");
                currentSelectedEl.removeEventListener("blur", handleBlur);
            }

            selectedElementRef.current = target;
            target.style.outline = "2px solid red";
            target.setAttribute("contenteditable", "true");
            target.addEventListener("blur", handleBlur);
            target.focus();
            setSelectedElementLabel(getElementLabel(target));
            setSelectedElement(target)

        };

        const handleBlur = () => {
            const selectedEl = selectedElementRef.current;
            if (selectedEl) {
                console.log("Final edited element:", selectedEl.outerHTML);
            }
        };


        const handleKeyDown = (e: KeyboardEvent) => {
            const selectedEl = selectedElementRef.current;
            if (e.key === "Escape" && selectedEl) {
                clearSelection();
            }
        };

        clearSelectionRef.current = clearSelection;

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
            clearSelectedElement();
            root.innerHTML =
                generatedCode
                    ?.replaceAll("```html", "")
                    .replaceAll("```", "")
                    .replace("html", "") ?? "";
        }
    }, [generatedCode, clearSelectedElement]);

    useEffect(()=>{
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions, react-hooks/immutability
        onSave && HandleOnSave()
    },[onSave])

    const HandleOnSave=async()=>{
        if(iframeRef.current){
            try {
                const iframeDoc=iframeRef.current.contentDocument
                || iframeRef.current.contentWindow?.document

                if(iframeDoc){
                    const cloneDoc=iframeDoc.documentElement.cloneNode(true) as HTMLElement
                    const allEle=cloneDoc.querySelectorAll<HTMLElement>("*")
                    allEle.forEach(el => {
                        el.style.outline='';
                        el.style.cursor='';
                    });
                    const html=cloneDoc.outerHTML
                    console.log(html)
                    const result = await axios.put("/api/frames",{
                        designCode:html,
                        frameId:frameId,projectId:projectId
                      })
                      console.log(result.data)
                      toast.success("Saved Successfully")
                }

            } catch (error) {
                console.log(error)
            }
        }
    }

    return (
        <div className='flex gap-2 w-full'>

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
        {selectedElement?.tagName === "IMG" ? (
            <ImageSettingSection selectedElement={selectedElement as HTMLImageElement} />
        ) : selectedElement ? (
            <ElementSettingSection selectedElement={selectedElement} clearSelection={clearSelectedElement} />
        ) : null}
        </div>
    );
}


export default WebsiteDesign