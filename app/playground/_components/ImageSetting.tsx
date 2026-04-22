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
        <div className="w-96 shadow p-4 space-y-4">
            <h2 className="flex gap-2 items-center font-bold">
                <ImageIcon /> Image Settings
            </h2>

            {/* Preview (clickable) */}
            <div className="flex justify-center">
                <img
                    src={preview}
                    alt={altText}
                    
                    className="max-h-40 object-contain border rounded cursor-pointer hover:opacity-80"
                    onClick={openFileDialog}
                    onLoad={()=>setLoading(false)}
                />
            </div>

            {/* Hidden file input */}
            <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
            />

            {/* Upload Button */}
            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={saveUploadedImage}
                disabled={loading}
            >
                {loading && <Loader2Icon className="animate-spin" />}Upload Image
            </Button>

            {/* Alt text */}
            <div>
                <label className="text-sm">Prompt</label>
                <Input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    placeholder="Enter alt text"
                    className="mt-1"
                />
            </div>

            <Button className="w-full" onClick={GenerateAiImage} disabled={loading}
            >
                {loading && <Loader2Icon className="animate-spin" />}Generate AI Image
            </Button>

            {/* Transform Buttons */}
            <div>
                <label className="text-sm mb-1 block">AI Transform</label>
                <div className="flex gap-2 flex-wrap">
                    <TooltipProvider>
                        {transformOptions.map((opt) => {
                            const applied = activeTransforms.includes(opt.value);
                            return (
                                <Tooltip key={opt.value}>
                                    <TooltipTrigger asChild>
                                        <Button
                                            type="button"
                                            variant={applied ? "default" : "outline"}
                                            className="flex items-center justify-center p-2"
                                            onClick={() => {
                                                setLoading(true);
                                                toggleTransform(opt.value);
                                            }}
                                        >
                                            {opt.icon}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {opt.label} {applied && "(Applied)"}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </TooltipProvider>
                </div>
            </div>

            {/* Conditional Resize Inputs */}
            {activeTransforms.includes("resize") && (
                <div className="flex gap-2">
                    <div className="flex-1">
                        <label className="text-sm">Width</label>
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
                            className="mt-1"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-sm">Height</label>
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
                            className="mt-1"
                        />
                    </div>
                </div>
            )}

            {/* Border Radius */}
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
    );
}

export default ImageSettingSection;

