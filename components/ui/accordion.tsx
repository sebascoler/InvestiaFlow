"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface AccordionContextValue {
  value: string | null
  onValueChange: (value: string | null) => void
}

const AccordionContext = React.createContext<AccordionContextValue | undefined>(undefined)

const AccordionItemContext = React.createContext<{ value: string } | undefined>(undefined)

interface AccordionProps {
  children: React.ReactNode
  type?: "single" | "multiple"
  defaultValue?: string
  className?: string
}

export function Accordion({ children, type = "single", defaultValue, className }: AccordionProps) {
  const [value, setValue] = React.useState<string | null>(defaultValue || null)

  const onValueChange = React.useCallback((newValue: string | null) => {
    if (type === "single") {
      setValue(newValue === value ? null : newValue)
    }
  }, [type, value])

  return (
    <AccordionContext.Provider value={{ value, onValueChange }}>
      <div className={cn("space-y-2", className)}>{children}</div>
    </AccordionContext.Provider>
  )
}

interface AccordionItemProps {
  value: string
  children: React.ReactNode
  className?: string
}

export function AccordionItem({ value, children, className }: AccordionItemProps) {
  return (
    <AccordionItemContext.Provider value={{ value }}>
      <div className={cn("border border-gray-200 rounded-lg overflow-hidden", className)}>
        {children}
      </div>
    </AccordionItemContext.Provider>
  )
}

interface AccordionTriggerProps {
  children: React.ReactNode
  className?: string
}

export function AccordionTrigger({ children, className }: AccordionTriggerProps) {
  const context = React.useContext(AccordionContext)
  if (!context) throw new Error("AccordionTrigger must be used within Accordion")

  const itemContext = React.useContext(AccordionItemContext)
  if (!itemContext) throw new Error("AccordionTrigger must be used within AccordionItem")

  const isOpen = context.value === itemContext.value

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center justify-between p-4 text-left font-medium transition-all hover:bg-gray-50",
        isOpen && "[&>svg]:rotate-180",
        className
      )}
      onClick={() => context.onValueChange(itemContext.value)}
      aria-expanded={isOpen}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0 text-gray-text transition-transform duration-200" />
    </button>
  )
}

interface AccordionContentProps {
  children: React.ReactNode
  className?: string
}

export function AccordionContent({ children, className }: AccordionContentProps) {
  const context = React.useContext(AccordionContext)
  const itemContext = React.useContext(AccordionItemContext)
  
  if (!context || !itemContext) return null

  const isOpen = context.value === itemContext.value

  return (
    <div
      className={cn(
        "overflow-hidden text-sm transition-all",
        className
      )}
      style={{
        maxHeight: isOpen ? "1000px" : "0",
        transition: "max-height 0.3s ease-out",
      }}
    >
      <div className={cn("p-4 pt-0 text-gray-text", className)}>{children}</div>
    </div>
  )
}

export function AccordionItemWithContext({ value, children }: { value: string; children: React.ReactNode }) {
  return (
    <AccordionItem value={value}>
      {children}
    </AccordionItem>
  )
}
