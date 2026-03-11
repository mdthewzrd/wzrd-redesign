---
name: shadcn-generator
description: Generate and customize shadcn/ui components with theme-aware styling for React applications
category: ui-ux
priority: P1
tags: [shadcn, components, react, tailwind, generation, theming, accessibility]
subskills:
  - component-scaffolding
  - variant-customization
  - theme-application
  - accessibility-wrapper
---

# shadcn/ui Generator Skill

## Purpose

**Generate and customize shadcn/ui components** with theme-aware styling for rapid UI development.

## Core Principle

**"Components should be theme-aware, not theme-hacked. Use design tokens everywhere."**

---

## What is shadcn/ui?

- **Copy-paste components** - not npm packages
- **You own the code** - fully customizable
- **Radix UI primitives** - WAI-ARIA compliant
- **Tailwind CSS styling** - utility-first approach
- **Dark mode support** - built-in

---

## Installation

### One-Time Setup

```bash
# Initialize shadcn/ui
npx shadcn@latest init

# Follow prompts:
# - TypeScript: Yes
# - Tailwind CSS: Yes
# - Components directory: src/components/ui
# - Utils directory: src/lib
# - App directory: src/app
# - Import alias: @/*
# - Color: zinc (or slate/gray)
# - CSS variables: Yes
```

### Adding Components

```bash
# Individual components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add input
npx shadcn@latest add dialog
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add tabs
npx shadcn@latest add dropdown-menu
npx shadcn@latest add avatar

# Multiple at once
npx shadcn@latest add button card input dialog
```

---

## Theme-Aware Component Templates

### Button (with WZRD.theme)

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",

        // WZRD Gold variant
        gold: "bg-gold-500 text-gold-foreground shadow hover:bg-gold-600",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### Usage

```tsx
// Default (primary gold)
<Button>Action</Button>

// Gold accent
<Button variant="gold">Primary</Button>

// Secondary
<Button variant="secondary">Cancel</Button>

// Icon button
<Button size="icon">
  <Icon className="h-4 w-4" />
</Button>

// With icon
<Button className="bg-gold-500">
  <Play className="mr-2 h-4 w-4" />
  Run Scan
</Button>

// Disabled
<Button disabled>Disabled</Button>
```

---

### Card (with WZRD.theme)

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "rounded-lg border border-border bg-card text-card-foreground shadow-sm",
      className
    )}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-2xl font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
```

### Usage

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Scanner Name</CardTitle>
  </CardHeader>
  <CardContent>
    <p className="text-muted-foreground">Scanner description</p>
  </CardContent>
  <CardFooter>
    <Button>Run</Button>
  </CardFooter>
</Card>
```

---

### Input (with WZRD.theme)

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
```

### Usage

```tsx
import { Input } from '@/components/ui/input'

<Input placeholder="Search scanners..." />
<Input type="email" placeholder="Enter email" />
<Input disabled value="Disabled" />
```

---

### Badge (Status Indicators)

```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",

        // Status variants
        success: "bg-success text-success-foreground border-success/20",
        warning: "bg-warning text-warning-foreground border-warning/20",
        info: "bg-blue-500 text-white border-blue-500/20",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
```

### Usage

```tsx
<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="success">Completed</Badge>
<Badge variant="warning">Running</Badge>
<Badge variant="destructive">Failed</Badge>
<Badge variant="info">Info</Badge>
```

---

### Dialog (Modal)

```tsx
import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const Dialog = DialogPrimitive.Root
const DialogTrigger = DialogPrimitive.Trigger
const DialogPortal = DialogPrimitive.Portal
const DialogClose = DialogPrimitive.Close
const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closing]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogOverlay>
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closing]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 sm:rounded-lg",
          className
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogOverlay>
  </DialogPrimitive.Portal>
))
DialogContent.displayName = DialogPrimitive.Content.displayName

export {
  Dialog,
  DialogPortal,
  DialogOverlay,
  DialogTrigger,
  DialogClose,
  DialogContent,
}
```

### Usage

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <h2 className="text-lg font-semibold">Dialog Title</h2>
    <p className="text-sm text-muted-foreground">Dialog content</p>
  </DialogContent>
</Dialog>
```

---

### Table

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"

const Table = React.forwardRef<
  HTMLTableElement,
  React.HTMLAttributes<HTMLTableElement>
>(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
))
Table.displayName = "Table"

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
))
TableHeader.displayName = "TableHeader"

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
))
TableBody.displayName = "TableBody"

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)} {...props} />
))
TableFooter.displayName = "TableFooter"

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      className
    )}
    {...props}
  />
))
TableRow.displayName = "TableRow"

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.HTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:[role=checkbox]]:pr-0 [&:[role=radio]]:pr-0",
      className
    )}
    {...props}
  />
))
TableHead.displayName = "TableHead"

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.HTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-2 align-middle [&:[role=checkbox]]:pr-0 [&:[role=radio]]:pr-0", className)}
    {...props}
  />
))
TableCell.displayName = "TableCell"
```

### Usage

```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Ticker</TableHead>
      <TableHead>Date</TableHead>
      <TableHead>Signal</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {results.map((row) => (
      <TableRow key={row.id}>
        <TableCell>{row.ticker}</TableCell>
        <TableCell>{row.date}</TableCell>
        <TableCell className="text-primary">{row.signal}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## Component Customization

### Adding Custom Variants

```tsx
// 1. Add variant to cva config
const componentVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "default-classes",
        custom: "custom-classes",
      },
    },
  }
)

// 2. Extend props interface
interface MyComponentProps extends VariantProps<typeof componentVariants> {
  variant?: "default" | "custom"
}

// 3. Use in component
<MyComponent variant="custom" />
```

### Theme Integration

```tsx
// Use theme tokens instead of hardcoded values
<Button className="bg-primary text-primary-foreground">
  ✅ Uses CSS variables
</Button>

<Button className="bg-[#fbbf24] text-white">
  ❌ Hardcoded colors
</Button>
```

---

## Component Patterns

### Empty State

```tsx
import { FileText } from 'lucide-react'
import { Card } from '@/components/ui/card'

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <FileText className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">
          No items found
        </h3>
        <p className="text-sm text-muted-foreground text-center max-w-md">
          Create your first item to get started.
        </p>
        <Button className="mt-4">
          Create Item
        </Button>
      </CardContent>
    </Card>
  )
}
```

### Loading State

```tsx
import { Loader2 } from 'lucide-react'

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      <p className="text-sm text-muted-foreground mt-2">Loading...</p>
    </div>
  )
}
```

### Error State

```tsx
import { AlertCircle } from 'lucide-react'

function ErrorState({ message }: { message: string }) {
  return (
    <Card className="border-destructive">
      <CardContent className="flex items-center gap-4 py-12">
        <AlertCircle className="h-12 w-12 text-destructive flex-shrink-0" />
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1">
            Something went wrong
          </h3>
          <p className="text-sm text-muted-foreground">
            {message}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## Accessibility Wrapper

### Adding ARIA Labels

```tsx
// ❌ WRONG: Icon button has no label
<button onClick={handleAction}>
  <Icon className="h-4 w-4" />
</button>

// ✅ CORRECT: Add aria-label
<button onClick={handleAction} aria-label="Delete item">
  <Icon className="h-4 w-4" aria-hidden="true" />
</button>

// ✅ CORRECT: Or use visually hidden text
<button onClick={handleAction}>
  <Icon className="h-4 w-4" aria-hidden="true" />
  <span className="sr-only">Delete item</span>
</button>
```

### Focus Management

```tsx
import { useFocus } from '@radix-ui/react-use-focus-size'

function FocusExample() {
  return (
    <div className="rounded-md ring-2 ring-offset-2 focus-visible:ring-offset-2 focus-visible:ring-ring">
      <input className="border-0 outline-none" />
    </div>
  )
}
```

---

## Integration with Design Mode

### Workflow

```
1. Extract design tokens (dembrandt)
2. Generate theme (theme-generator)
3. Update tailwind.config.js
4. Add components (npx shadcn add ...)
5. Customize components with theme
6. Validate with agent-browser
```

### Example: Full Page Build

```bash
# 1. Generate theme
npx theme-generator --input tokens.json

# 2. Add components
npx shadcn add button card input badge dialog table

# 3. Create page
# components automatically use theme colors

# 4. Validate
agent-browser open http://localhost:5174/new-page
agent-browser screenshot /tmp/page-screenshot.png
```

---

## Quick Reference

### Commands

```bash
# Initialize shadcn/ui
npx shadcn@latest init

# Add component
npx shadcn@latest add <component-name>

# Add multiple
npx shadcn@latest add button card input dialog

# Available components
npx shadcn@latest add button card input label select textarea
npx shadcn@latest add checkbox radio switch
npx shadcn@latest add accordion collapsible tabs
npx shadcn@latest add dialog dropdown-menu popover tooltip
npx shadcn@latest add table avatar badge skeleton
```

### Component Locations

```
src/components/ui/
├── button.tsx
├── card.tsx
├── input.tsx
├── badge.tsx
├── dialog.tsx
├── table.tsx
├── tabs.tsx
└── ...

src/lib/utils.ts
└── cn() helper function
```

---

## Sources

- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Radix UI Primitives](https://www.radix-ui.com/primitives)
- [Radix UI Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)
- [Tailwind CSS](https://tailwindcss.com/)
- [WAI-ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)

---

**"Components should be theme-aware, not theme-hacked. Use design tokens everywhere."**
