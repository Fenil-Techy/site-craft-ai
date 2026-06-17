/* eslint-disable @next/next/no-img-element */

"use client";
import React, { useRef, useState } from "react";
import {
    Image as ImageIcon,
    Crop,
    Expand,
    Image as ImageUpscale, // no lucide-react upscale, using Image icon
    ImageMinus,
    Loader2Icon,
    Sparkles,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";


type Props = {
    selectedElement: HTMLImageElement;
};

const transformOptions = [
    { label: "Smart Crop", value: "smartcrop", icon: <Crop /> },
    { label: "Resize", value: "resize", icon: <Expand /> },
    { label: "Upscale", value: "upscale", icon: <ImageUpscale /> },
    { label: "BG Remove", value: "bgremove", icon: <ImageMinus /> },
] as const;
function ImageSettingSection({ selectedElement }: Props) {
    const [altText, setAltText] = useState(selectedElement.alt || "");
    const[selectedImage,setSelectedImage]=useState<File>();
    const[loading,setLoading]=useState(false)
    const [width, setWidth] = useState<number>(selectedElement.width || 300);
    const [height, setHeight] = useState<number>(selectedElement.height || 200);
    const [borderRadius, setBorderRadius] = useState(
        selectedElement.style.borderRadius || "0px"
    );
    const [preview, setPreview] = useState(selectedElement.src || "");
    const [activeTransforms, setActiveTransforms] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const buildTransformListFrom = React.useCallback((list: string[], w: number, h: number): string[] => {
        const parts: string[] = [];
        for (const t of list) {
            // Smart crop needs an actual crop/resize to be visible.
            // If enabled, we build a single crop transform using current width/height.
            if (t === "smartcrop") parts.push(`c-at_max,w-${w},h-${h},fo-auto`);
            if (t === "resize" && !list.includes("smartcrop")) parts.push(`w-${w},h-${h}`);
            if (t === "upscale") parts.push("e-upscale");
            if (t === "bgremove") parts.push("e-bgremove");
        }
        return parts;
    }, []);

    const applyTransformsToUrl = React.useCallback(
        (
            inputUrl: string,
            overrides?: { transforms?: string[]; width?: number; height?: number }
        ) => {
            if (!inputUrl) return inputUrl;
            // Transformations only apply to ImageKit-hosted URLs.
            if (inputUrl.startsWith("data:")) return inputUrl;

            const tr = buildTransformListFrom(
                overrides?.transforms ?? activeTransforms,
                overrides?.width ?? width,
                overrides?.height ?? height
            ).join(":");

            try {
                const u = new URL(inputUrl);
                // IMPORTANT: ImageKit expects `tr` in a non-URL-encoded form
                // (commas/colons are part of the transformation syntax).
                // `URLSearchParams` will encode them (`,` -> %2C, `:` -> %3A),
                // which can prevent ImageKit from applying transformations.
                u.searchParams.delete("tr");

                const base = `${u.origin}${u.pathname}`;
                const otherParams = u.searchParams.toString(); // safe to encode non-tr params

                if (!tr) return otherParams ? `${base}?${otherParams}` : base;
                return otherParams ? `${base}?${otherParams}&tr=${tr}` : `${base}?tr=${tr}`;
            } catch {
                // Fallback for relative/invalid URLs in preview.
                const [base] = inputUrl.split("?");
                return tr ? `${base}?tr=${tr}` : base;
            }
        },
        [activeTransforms, buildTransformListFrom, height, width]
    );

    const syncPreviewToSelectedElement = React.useCallback(
        (nextUrl: string) => {
            setPreview(nextUrl);
            selectedElement.setAttribute("src", nextUrl);
        },
        [selectedElement]
    );

    // Toggle transform and immediately update URL
    const toggleTransform = (value: string) => {
        setActiveTransforms((prev) => {
            const next = prev.includes(value)
                ? prev.filter((t) => t !== value)
                : [...prev, value];

            const nextUrl = applyTransformsToUrl(preview, { transforms: next });
            syncPreviewToSelectedElement(nextUrl);
            return next;
        });
    };

    const GenerateAiImage=()=>{
        setLoading(true)

        const url=`https://ik.imagekit.io/uyzs9rkmd/ik-genimg-prompt-${altText}/${Date.now()}.png`
        const nextUrl = applyTransformsToUrl(url);
        syncPreviewToSelectedElement(nextUrl);
    }


    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file)
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const openFileDialog = () => {
        fileInputRef.current?.click();
    };

    const saveUploadedImage = async () => {
        if (!selectedImage) {
            return;
        }

        setLoading(true);
        try {
            const fileAsDataUrl = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result as string);
                reader.onerror = () => reject(new Error("Failed to read selected image."));
                reader.readAsDataURL(selectedImage);
            });

            const response = await fetch("/api/imagekit-upload", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    file: fileAsDataUrl,
                    fileName: `${Date.now()}-${selectedImage.name}`,
                }),
            });

            if (!response.ok) {
                throw new Error("Image upload failed.");
            }

            const data = await response.json();
            if (data?.url) {
                const nextUrl = applyTransformsToUrl(data.url);
                syncPreviewToSelectedElement(nextUrl);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full space-y-5 p-3 sm:p-4 text-slate-200">
            <h2 className="hidden items-center gap-2 font-bold text-slate-100 lg:flex text-base">
                <ImageIcon className="h-4 w-4 text-purple-400" /> Image Settings
            </h2> 
    
            {/* Responsive Grid for Preview & Upload Box */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center border border-slate-800/60 bg-slate-900/20 p-3 rounded-xl">
                {/* Left Column: Image Preview Target */}
                <div className="flex flex-col items-center justify-center">
                    <div 
                        className="relative group w-full h-32 max-w-[180px] bg-slate-950/60 rounded-lg border border-slate-800 border-dashed overflow-hidden flex items-center justify-center cursor-pointer hover:border-purple-500/50 transition-all duration-200"
                        onClick={openFileDialog}
                    >
                        {preview ? (
                            <img
                                src={preview}
                                alt={altText}
                                className="w-full h-full object-contain p-1 transition-transform duration-200 group-hover:scale-102"
                                style={{ borderRadius }}
                                onLoad={() => setLoading(false)}
                            />
                        ) : (
                            <div className="text-center p-2 text-slate-500">
                                <ImageIcon className="h-6 w-6 mx-auto mb-1 text-slate-600" />
                                <span className="text-xs">No image src</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-150">
                            <span className="text-[11px] font-medium bg-slate-900/90 text-white px-2 py-1 rounded-md border border-slate-700 shadow-sm">Change File</span>
                        </div>
                    </div>
                </div>
    
                {/* Right Column: Upload Actions */}
                <div className="space-y-2 w-full">
                    <label className="text-xs font-medium text-slate-400 block sm:text-left text-center">Local Upload Source</label>
                    <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        className="w-full border-slate-800 bg-slate-950/40 hover:bg-slate-900 text-slate-300 h-9 text-xs gap-2"
                        onClick={openFileDialog}
                        disabled={loading}
                    >
                        Browse System
                    </Button>
                    <Button
                        type="button"
                        className="w-full bg-slate-100 hover:bg-white text-slate-950 font-medium h-9 text-xs gap-1.5 shadow-sm"
                        onClick={saveUploadedImage}
                        disabled={loading || !selectedImage}
                    >
                        {loading ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : null}
                        Commit Upload
                    </Button>
                </div>
            </div>
    
            {/* AI Prompt Input Row */}
            <div className="space-y-1.5 border-t border-slate-900 pt-4">
                <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold tracking-wide text-slate-400 uppercase">AI Tooling Prompt</label>
                    <span className="text-[10px] text-slate-500 font-mono">Alt Attribute</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                    <Input
                        type="text"
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                        placeholder="Describe your desired image..."
                        className="flex-1 bg-slate-950/50 border-slate-800 text-sm h-9 placeholder:text-slate-600 focus-visible:ring-purple-500/30"
                    />
                    <Button 
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium h-9 text-xs px-4 gap-1.5 shrink-0" 
                        onClick={GenerateAiImage} 
                        disabled={loading || !altText.trim()}
                    >
                        {loading ? <Loader2Icon className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                        Generate
                    </Button>
                </div>
            </div>
    
            {/* Optimizations & Sizing Parameters Grid */}
            <div className="grid grid-cols-2 gap-3 border-t border-slate-900 pt-4">
                {/* Row-Spanned Transform Options */}
                <div className="col-span-2">
                    <label className="text-xs font-semibold tracking-wide text-slate-400 uppercase mb-2 block">Image Optimization (ImageKit)</label>
                    <div className="grid grid-cols-4 gap-1.5">
                        <TooltipProvider>
                            {transformOptions.map((opt) => {
                                const applied = activeTransforms.includes(opt.value);
                                return (
                                    <Tooltip key={opt.value}>
                                        <TooltipTrigger asChild>
                                            <Button
                                                type="button"
                                                variant={applied ? "default" : "outline"}
                                                className={`flex items-center justify-center h-9 p-0 rounded-lg border transition-all ${
                                                    applied 
                                                    ? "bg-purple-600 border-purple-500 text-white shadow-sm shadow-purple-500/10" 
                                                    : "border-slate-800 bg-slate-950/30 text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                                                }`}
                                                onClick={() => {
                                                    setLoading(true);
                                                    toggleTransform(opt.value);
                                                }}
                                            >
                                                {opt.icon}
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom" className="bg-slate-900 text-slate-200 border-slate-800 text-xs">
                                            {opt.label} {applied && "(Applied)"}
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            })}
                        </TooltipProvider>
                    </div>
                </div>
    
                {/* Inlined Sizing Fields */}
                {activeTransforms.includes("resize") && (
                    <>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-400">Width (px)</label>
                            <Input
                                type="number"
                                value={width}
                                onChange={(e) => {
                                    const nextW = Number(e.target.value);
                                    setWidth(nextW);
                                    if (activeTransforms.includes("resize")) {
                                        const nextUrl = applyTransformsToUrl(preview, { width: nextW });
                                        syncPreviewToSelectedElement(nextUrl);
                                    }
                                }}
                                className="bg-slate-950/40 border-slate-800 h-9 text-sm"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-400">Height (px)</label>
                            <Input
                                type="number"
                                value={height}
                                onChange={(e) => {
                                    const nextH = Number(e.target.value);
                                    setHeight(nextH);
                                    if (activeTransforms.includes("resize")) {
                                        const nextUrl = applyTransformsToUrl(preview, { height: nextH });
                                        syncPreviewToSelectedElement(nextUrl);
                                    }
                                }}
                                className="bg-slate-950/40 border-slate-800 h-9 text-sm"
                            />
                        </div>
                    </>
                )}
    
                {/* Corner Radius Field */}
            <div>
                <label className="text-sm">Border Radius</label>
                <Input
                    type="text"
                    value={borderRadius}
                    onChange={(e) => setBorderRadius(e.target.value)}
                    placeholder="e.g. 8px or 50%"
                    className="mt-1"
                />
            </div>
                
            </div>
        </div>
    );

}

export default ImageSettingSection;

