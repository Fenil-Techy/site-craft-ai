 'use client'
import { Button } from '@/components/ui/button'
import { SwatchBook } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useMemo, useState } from 'react'

type Props = {
  selectedElement: HTMLElement | null,
  clearSelection: () => void
}

type ElementStyleState = {
  fontSize: string
  fontWeight: string
  textAlign: string
  lineHeight: string
  letterSpacing: string
  color: string
  backgroundColor: string
  padding: string
  margin: string
  borderRadius: string
  borderWidth: string
  borderStyle: string
  borderColor: string
  opacity: string
}

const DEFAULT_STYLE_STATE: ElementStyleState = {
  fontSize: "16px",
  fontWeight: "400",
  textAlign: "left",
  lineHeight: "1.5",
  letterSpacing: "0px",
  color: "#000000",
  backgroundColor: "#ffffff",
  padding: "0px",
  margin: "0px",
  borderRadius: "0px",
  borderWidth: "0px",
  borderStyle: "solid",
  borderColor: "#000000",
  opacity: "1",
}

function normalizeColor(value: string, fallback: string) {
  if (!value) return fallback
  if (value.startsWith("#")) return value
  const rgbMatch = value.match(/\d+/g)
  if (value.startsWith("rgb") && rgbMatch && rgbMatch.length >= 3) {
    const [r, g, b] = rgbMatch.slice(0, 3).map((n) => Number.parseInt(n, 10))
    if (![r, g, b].some(Number.isNaN)) {
      return `#${[r, g, b].map((n) => n.toString(16).padStart(2, "0")).join("")}`
    }
  }
  return fallback
}

function ElementSettingSection({ selectedElement, clearSelection }: Props) {
  const [, setRerender] = useState(0)
  const [draftStyles, setDraftStyles] = useState<Partial<Record<"lineHeight" | "letterSpacing" | "padding" | "margin" | "borderRadius" | "borderWidth", string>>>({})

  const fontSizes = useMemo(() => [...Array(53)].map((_, index) => `${index + 12}px`), [])

  const getStyleValue = (key: keyof ElementStyleState) => {
    if (!selectedElement) return DEFAULT_STYLE_STATE[key]
    const inlineStyles = selectedElement.style
    const computedStyles = window.getComputedStyle(selectedElement)
    const inlineValue = inlineStyles[key as keyof CSSStyleDeclaration] as string | undefined
    const computedValue = computedStyles[key as keyof CSSStyleDeclaration] as string | undefined
    const value = (inlineValue && inlineValue.trim()) || (computedValue && computedValue.trim()) || ""
    if (key === "color") return normalizeColor(value || "", "#000000")
    if (key === "backgroundColor") return normalizeColor(value || "", "#ffffff")
    if (key === "borderColor") return normalizeColor(value || "", "#000000")
    return value || DEFAULT_STYLE_STATE[key]
  }

  const applyStyle = (cssKey: string, value: string) => {
    if (!selectedElement) return
    selectedElement.style.setProperty(cssKey, value, "important")
    setRerender((v) => v + 1)
  }

  const getDraftOrStyle = (key: "lineHeight" | "letterSpacing" | "padding" | "margin" | "borderRadius" | "borderWidth") => {
    return draftStyles[key] ?? getStyleValue(key)
  }

  const commitDraft = (key: "lineHeight" | "letterSpacing" | "padding" | "margin" | "borderRadius" | "borderWidth", cssKey: string) => {
    const nextValue = draftStyles[key]
    if (nextValue === undefined) return
    applyStyle(cssKey, nextValue)
    setDraftStyles((prev) => {
      const next = { ...prev }
      delete next[key]
      return next
    })
  }

  const resetSelectedElementStyles = () => {
    if (!selectedElement) return
    const editableKeys = [
      "font-size",
      "font-weight",
      "text-align",
      "color",
      "background-color",
      "line-height",
      "letter-spacing",
      "padding",
      "margin",
      "border-radius",
      "border-width",
      "border-style",
      "border-color",
      "opacity",
    ]
    editableKeys.forEach((key) => {
      selectedElement.style.removeProperty(key)
    })
    setDraftStyles({})
    setRerender((v) => v + 1)
  }

  return (
    <div className='w-96 shadow p-4'>
      <h2 className='flex gap-2 font-bold items-center'><SwatchBook /> Settings</h2>

      <div className='grid grid-cols-2 gap-3 mt-4'>
        <div className='col-span-2'>
          <label className='text-sm'>Font Size</label>
          <Select value={getStyleValue("fontSize")} onValueChange={(value) => applyStyle("font-size", value)}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="select size" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {fontSizes.map((size) => (
                  <SelectItem value={size} key={size}>{size}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className='text-sm'>Font Weight</label>
          <Select value={getStyleValue("fontWeight")} onValueChange={(value) => applyStyle("font-weight", value)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["300", "400", "500", "600", "700", "800"].map((w) => <SelectItem key={w} value={w}>{w}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className='text-sm'>Text Align</label>
          <Select value={getStyleValue("textAlign")} onValueChange={(value) => applyStyle("text-align", value)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["left", "center", "right", "justify"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className='text-sm'>Text Color</label>
          <input className='w-full border rounded px-2 py-1' type="color" value={getStyleValue("color")} onChange={(e) => applyStyle("color", e.target.value)} />
        </div>

        <div>
          <label className='text-sm'>Background</label>
          <input className='w-full border rounded px-2 py-1' type="color" value={getStyleValue("backgroundColor")} onChange={(e) => applyStyle("background-color", e.target.value)} />
        </div>

        <div>
          <label className='text-sm'>Line Height</label>
          <input
            className='w-full border rounded px-2 py-1'
            value={getDraftOrStyle("lineHeight")}
            onChange={(e) => setDraftStyles((prev) => ({ ...prev, lineHeight: e.target.value }))}
            onBlur={() => commitDraft("lineHeight", "line-height")}
            onKeyDown={(e) => e.key === "Enter" && commitDraft("lineHeight", "line-height")}
            placeholder='e.g. 1.5 or 24px'
          />
        </div>

        <div>
          <label className='text-sm'>Letter Spacing</label>
          <input
            className='w-full border rounded px-2 py-1'
            value={getDraftOrStyle("letterSpacing")}
            onChange={(e) => setDraftStyles((prev) => ({ ...prev, letterSpacing: e.target.value }))}
            onBlur={() => commitDraft("letterSpacing", "letter-spacing")}
            onKeyDown={(e) => e.key === "Enter" && commitDraft("letterSpacing", "letter-spacing")}
            placeholder='e.g. 1px'
          />
        </div>

        <div>
          <label className='text-sm'>Padding</label>
          <input
            className='w-full border rounded px-2 py-1'
            value={getDraftOrStyle("padding")}
            onChange={(e) => setDraftStyles((prev) => ({ ...prev, padding: e.target.value }))}
            onBlur={() => commitDraft("padding", "padding")}
            onKeyDown={(e) => e.key === "Enter" && commitDraft("padding", "padding")}
            placeholder='e.g. 12px'
          />
        </div>

        <div>
          <label className='text-sm'>Margin</label>
          <input
            className='w-full border rounded px-2 py-1'
            value={getDraftOrStyle("margin")}
            onChange={(e) => setDraftStyles((prev) => ({ ...prev, margin: e.target.value }))}
            onBlur={() => commitDraft("margin", "margin")}
            onKeyDown={(e) => e.key === "Enter" && commitDraft("margin", "margin")}
            placeholder='e.g. 8px'
          />
        </div>

        <div>
          <label className='text-sm'>Border Radius</label>
          <input
            className='w-full border rounded px-2 py-1'
            value={getDraftOrStyle("borderRadius")}
            onChange={(e) => setDraftStyles((prev) => ({ ...prev, borderRadius: e.target.value }))}
            onBlur={() => commitDraft("borderRadius", "border-radius")}
            onKeyDown={(e) => e.key === "Enter" && commitDraft("borderRadius", "border-radius")}
            placeholder='e.g. 8px'
          />
        </div>

        <div>
          <label className='text-sm'>Border Width</label>
          <input
            className='w-full border rounded px-2 py-1'
            value={getDraftOrStyle("borderWidth")}
            onChange={(e) => setDraftStyles((prev) => ({ ...prev, borderWidth: e.target.value }))}
            onBlur={() => commitDraft("borderWidth", "border-width")}
            onKeyDown={(e) => e.key === "Enter" && commitDraft("borderWidth", "border-width")}
            placeholder='e.g. 1px'
          />
        </div>

        <div>
          <label className='text-sm'>Border Style</label>
          <Select value={getStyleValue("borderStyle")} onValueChange={(value) => applyStyle("border-style", value)}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["solid", "dashed", "dotted", "double", "none"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className='text-sm'>Border Color</label>
          <input className='w-full border rounded px-2 py-1' type="color" value={getStyleValue("borderColor")} onChange={(e) => applyStyle("border-color", e.target.value)} />
        </div>

        <div className='col-span-2'>
          <label className='text-sm'>Opacity ({getStyleValue("opacity")})</label>
          <input className='w-full' type="range" min="0" max="1" step="0.05" value={getStyleValue("opacity")} onChange={(e) => applyStyle("opacity", e.target.value)} />
        </div>
      </div>

      <div className='grid grid-cols-2 gap-2 mt-4'>
        <Button variant="outline" onClick={resetSelectedElementStyles} disabled={!selectedElement}>
          Reset Styles
        </Button>
        <Button variant="secondary" onClick={clearSelection}>
          Clear Selection
        </Button>
      </div>
    </div>
  )
}

export default ElementSettingSection