
"use client";
import React, { useRef, useState } from "react";
import {
    Image as ImageIcon,
    Crop,
    Expand,
    Image as ImageUpscale, // no lucide-react upscale, using Image icon
    ImageMinus,
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
];

function ImageSettingSection({ selectedElement }: Props) {
    const [altText, setAltText] = useState(selectedElement.alt || "");
    const [width, setWidth] = useState<number>(selectedElement.width || 300);
    const [height, setHeight] = useState<number>(selectedElement.height || 200);
    const [borderRadius, setBorderRadius] = useState(
        selectedElement.style.borderRadius || "0px"
    );
    const [preview, setPreview] = useState(selectedElement.src || "");
    const [activeTransforms, setActiveTransforms] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    // Toggle transform
    const toggleTransform = (value: string) => {
        setActiveTransforms((prev) =>
            prev.includes(value)
                ? prev.filter((t) => t !== value)
                : [...prev, value]
        );
    };



    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
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
                onClick={openFileDialog}
            >
                Upload Image
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

            <Button className="w-full">
                Generate AI Image
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
                                            onClick={() => toggleTransform(opt.value)}
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
                            onChange={(e) => setWidth(Number(e.target.value))}
                            className="mt-1"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="text-sm">Height</label>
                        <Input
                            type="number"
                            value={height}
                            onChange={(e) => setHeight(Number(e.target.value))}
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

