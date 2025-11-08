# NSL App Branding Guidance

## Introduction

This document provides comprehensive branding and design system guidance for all applications within the NSL (Narrative Spittoon inversion) ecosystem. Following these guidelines ensures visual consistency, professional appearance, and a cohesive user experience across all NSL-standard applications.

### Purpose
- Maintain consistent visual identity across the NSL ecosystem
- Provide ready-to-use CSS values and configuration
- Enable rapid development with established design patterns
- Ensure accessibility and usability standards

### When to Use This Guide
- Creating new NSL ecosystem applications
- Updating existing NSL applications for consistency
- Designing components or features for NSL tools
- Integrating third-party tools with NSL branding

---

## Color System

The NSL design system uses a sophisticated dark theme with purple/violet primary colors and golden/amber accents. All colors are defined in HSL format for maximum flexibility and consistency.

### Background Colors

**Primary Background** - Deep blue-purple dark theme
```css
--background: 250 24% 10%;
/* Usage: hsl(250 24% 10%) */
```

**Card Background** - Slightly lighter for elevation
```css
--card: 250 20% 14%;
--card-foreground: 250 10% 98%;
/* Usage: hsl(250 20% 14%) */
```

**Popover Background** - Medium tone for overlays
```css
--popover: 250 24% 12%;
--popover-foreground: 250 10% 98%;
/* Usage: hsl(250 24% 12%) */
```

### Primary Colors - Purple/Violet Accent

**Primary** - Main brand color
```css
--primary: 263 70% 60%;
--primary-foreground: 250 10% 98%;
/* Usage: hsl(263 70% 60%) */
/* Hex approximate: #9F7AEA */
```

**Primary Glow** - Lighter variant for effects
```css
--primary-glow: 263 80% 70%;
/* Usage: hsl(263 80% 70%) */
/* Hex approximate: #B794F6 */
```

### Accent Colors - Golden/Amber Highlights

**Accent** - Golden highlights and CTAs
```css
--accent: 38 92% 50%;
--accent-foreground: 250 24% 10%;
/* Usage: hsl(38 92% 50%) */
/* Hex approximate: #F59E0B */
```

**Accent Glow** - Brighter variant for effects
```css
--accent-glow: 38 100% 60%;
/* Usage: hsl(38 100% 60%) */
/* Hex approximate: #FBBF24 */
```

### Secondary Colors

**Secondary** - Subtle backgrounds
```css
--secondary: 250 15% 20%;
--secondary-foreground: 250 10% 98%;
/* Usage: hsl(250 15% 20%) */
```

**Muted** - Disabled states and subtle elements
```css
--muted: 250 15% 18%;
--muted-foreground: 250 10% 65%;
/* Usage: hsl(250 15% 18%) */
```

### Semantic Colors

**Success** - Green for positive actions
```css
--success: 142 71% 45%;
--success-foreground: 250 10% 98%;
/* Usage: hsl(142 71% 45%) */
/* Hex approximate: #10B981 */
```

**Destructive** - Red for dangerous actions
```css
--destructive: 0 72% 51%;
--destructive-foreground: 250 10% 98%;
/* Usage: hsl(0 72% 51%) */
/* Hex approximate: #DC2626 */
```

### Text Colors

**Foreground** - Primary text color
```css
--foreground: 250 10% 98%;
/* Usage: hsl(250 10% 98%) */
/* Near white with slight purple tint */
```

**Muted Foreground** - Secondary text
```css
--muted-foreground: 250 10% 65%;
/* Usage: hsl(250 10% 65%) */
/* Muted gray-purple for less important text */
```

### Border & Input Colors

**Border** - Default border color
```css
--border: 250 15% 22%;
/* Usage: hsl(250 15% 22%) */
```

**Input** - Form input borders
```css
--input: 250 15% 22%;
/* Usage: hsl(250 15% 22%) */
```

**Ring** - Focus ring color
```css
--ring: 263 70% 60%;
/* Usage: hsl(263 70% 60%) - matches primary */
```

### Sidebar Colors

For applications with sidebar navigation:
```css
--sidebar-background: 250 24% 10%;
--sidebar-foreground: 250 10% 98%;
--sidebar-primary: 263 70% 60%;
--sidebar-primary-foreground: 250 10% 98%;
--sidebar-accent: 250 20% 14%;
--sidebar-accent-foreground: 250 10% 98%;
--sidebar-border: 250 15% 22%;
--sidebar-ring: 263 70% 60%;
```

---

## Typography

### Default Font Settings

**Body Text**
```css
body {
  font-feature-settings: "rlig" 1, "calt" 1;
  /* Enables ligatures and contextual alternates */
}
```

### Headings

All headings (h1-h6) use consistent styling:
```css
h1, h2, h3, h4, h5, h6 {
  font-weight: 600; /* font-semibold */
  letter-spacing: -0.025em; /* tracking-tight */
}
```

**Recommended Heading Sizes (Tailwind classes)**
- H1: `text-4xl md:text-5xl lg:text-6xl`
- H2: `text-3xl md:text-4xl lg:text-5xl`
- H3: `text-2xl md:text-3xl lg:text-4xl`
- H4: `text-xl md:text-2xl`
- H5: `text-lg md:text-xl`
- H6: `text-base md:text-lg`

### Body Text
- Regular: `text-base` (16px)
- Small: `text-sm` (14px)
- Extra small: `text-xs` (12px)
- Large: `text-lg` (18px)

---

## Gradients

### Primary Gradient - Purple
Beautiful purple gradient for primary elements, hero sections, and CTAs.

```css
--gradient-primary: linear-gradient(135deg, hsl(263 70% 60%) 0%, hsl(263 80% 70%) 100%);
```

**Usage:**
```jsx
<div className="gradient-primary">Content</div>
```

### Accent Gradient - Golden
Warm golden gradient for highlights and special elements.

```css
--gradient-accent: linear-gradient(135deg, hsl(38 92% 50%) 0%, hsl(38 100% 60%) 100%);
```

**Usage:**
```jsx
<div className="gradient-accent">Content</div>
```

### Subtle Gradient - Background
Soft gradient for card backgrounds and subtle depth.

```css
--gradient-subtle: linear-gradient(180deg, hsl(250 20% 14%) 0%, hsl(250 24% 10%) 100%);
```

**Usage:**
```jsx
<div className="gradient-subtle">Content</div>
```

---

## Shadows & Effects

### Elegant Shadow
Sophisticated shadow for elevated cards and modals.

```css
--shadow-elegant: 0 10px 40px -10px hsl(263 70% 30% / 0.4);
```

**Usage:**
```jsx
<div className="shadow-elegant">Content</div>
```

### Glow Shadow
Glowing effect for primary interactive elements.

```css
--shadow-glow: 0 0 40px hsl(263 80% 70% / 0.3);
```

**Usage:**
```jsx
<div className="shadow-glow">Content</div>
```

### Accent Shadow
Warm shadow for accent-colored elements.

```css
--shadow-accent: 0 4px 20px hsl(38 92% 50% / 0.3);
```

**Usage:**
```jsx
<div className="shadow-accent">Content</div>
```

---

## Border Radius Standards

Consistent border radius for cohesive design:

```css
--radius: 0.75rem; /* 12px */
```

**Variants:**
- Large: `0.75rem` (12px) - `rounded-lg`
- Medium: `calc(0.75rem - 2px)` (10px) - `rounded-md`
- Small: `calc(0.75rem - 4px)` (8px) - `rounded-sm`
- Full: `9999px` - `rounded-full`

---

## Animations

### Smooth Transitions
Default transition for interactive elements:

```css
--transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
```

**Usage:**
```jsx
<button className="transition-smooth hover:scale-105">Button</button>
```

### Glow Animation
Pulsing glow effect for attention-grabbing elements:

```css
.animate-glow {
  animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
  from {
    box-shadow: 0 0 20px hsl(263 70% 60% / 0.3);
  }
  to {
    box-shadow: 0 0 40px hsl(263 80% 70% / 0.5);
  }
}
```

**Usage:**
```jsx
<div className="animate-glow">Glowing content</div>
```

### Slide Up Animation
Entrance animation for content:

```css
.animate-slide-up {
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Usage:**
```jsx
<div className="animate-slide-up">Content</div>
```

### Accordion Animations
Built-in animations for expandable content (via Tailwind config):

```javascript
keyframes: {
  "accordion-down": {
    from: { height: "0" },
    to: { height: "var(--radix-accordion-content-height)" }
  },
  "accordion-up": {
    from: { height: "var(--radix-accordion-content-height)" },
    to: { height: "0" }
  }
}
```

---

## Component Guidelines

### Buttons

**Primary Button** - Main actions
```jsx
<button className="bg-primary text-primary-foreground hover:bg-primary/90 
                   rounded-md px-4 py-2 font-medium transition-smooth">
  Primary Action
</button>
```

**Secondary Button** - Alternative actions
```jsx
<button className="bg-secondary text-secondary-foreground hover:bg-secondary/80 
                   rounded-md px-4 py-2 font-medium transition-smooth">
  Secondary Action
</button>
```

**Accent Button** - Call-to-action
```jsx
<button className="bg-accent text-accent-foreground hover:bg-accent/90 
                   rounded-md px-4 py-2 font-medium transition-smooth shadow-accent">
  Call to Action
</button>
```

**Outline Button** - Subtle actions
```jsx
<button className="border border-input bg-background hover:bg-accent 
                   hover:text-accent-foreground rounded-md px-4 py-2 
                   font-medium transition-smooth">
  Outline Action
</button>
```

**Ghost Button** - Minimal actions
```jsx
<button className="hover:bg-accent hover:text-accent-foreground 
                   rounded-md px-4 py-2 font-medium transition-smooth">
  Ghost Action
</button>
```

### Cards

**Standard Card**
```jsx
<div className="bg-card text-card-foreground rounded-lg p-6 shadow-elegant">
  <h3 className="text-xl font-semibold mb-2">Card Title</h3>
  <p className="text-muted-foreground">Card content goes here.</p>
</div>
```

**Gradient Card**
```jsx
<div className="gradient-subtle rounded-lg p-6 shadow-glow border border-border">
  <h3 className="text-xl font-semibold mb-2">Gradient Card</h3>
  <p className="text-muted-foreground">Special content with gradient background.</p>
</div>
```

### Inputs

**Text Input**
```jsx
<input 
  type="text"
  className="bg-background border border-input text-foreground 
             rounded-md px-3 py-2 w-full focus:outline-none 
             focus:ring-2 focus:ring-ring transition-smooth"
  placeholder="Enter text..."
/>
```

**Textarea**
```jsx
<textarea 
  className="bg-background border border-input text-foreground 
             rounded-md px-3 py-2 w-full focus:outline-none 
             focus:ring-2 focus:ring-ring transition-smooth resize-none"
  rows={4}
  placeholder="Enter longer text..."
/>
```

### Navigation

**Navigation Bar**
```jsx
<nav className="bg-card border-b border-border px-6 py-4">
  <div className="flex items-center justify-between">
    <div className="text-xl font-semibold">NSL App</div>
    <div className="flex gap-4">
      <a href="#" className="text-foreground hover:text-primary transition-smooth">
        Link 1
      </a>
      <a href="#" className="text-foreground hover:text-primary transition-smooth">
        Link 2
      </a>
    </div>
  </div>
</nav>
```

---

## Implementation Examples

### CSS Custom Properties Setup

Add this to your main CSS file (e.g., `index.css` or `globals.css`):

```css
@layer base {
  :root {
    --background: 250 24% 10%;
    --foreground: 250 10% 98%;
    --card: 250 20% 14%;
    --card-foreground: 250 10% 98%;
    --popover: 250 24% 12%;
    --popover-foreground: 250 10% 98%;
    --primary: 263 70% 60%;
    --primary-foreground: 250 10% 98%;
    --primary-glow: 263 80% 70%;
    --secondary: 250 15% 20%;
    --secondary-foreground: 250 10% 98%;
    --muted: 250 15% 18%;
    --muted-foreground: 250 10% 65%;
    --accent: 38 92% 50%;
    --accent-foreground: 250 24% 10%;
    --accent-glow: 38 100% 60%;
    --destructive: 0 72% 51%;
    --destructive-foreground: 250 10% 98%;
    --success: 142 71% 45%;
    --success-foreground: 250 10% 98%;
    --border: 250 15% 22%;
    --input: 250 15% 22%;
    --ring: 263 70% 60%;
    --radius: 0.75rem;
    --gradient-primary: linear-gradient(135deg, hsl(263 70% 60%) 0%, hsl(263 80% 70%) 100%);
    --gradient-accent: linear-gradient(135deg, hsl(38 92% 50%) 0%, hsl(38 100% 60%) 100%);
    --gradient-subtle: linear-gradient(180deg, hsl(250 20% 14%) 0%, hsl(250 24% 10%) 100%);
    --shadow-elegant: 0 10px 40px -10px hsl(263 70% 30% / 0.4);
    --shadow-glow: 0 0 40px hsl(263 80% 70% / 0.3);
    --shadow-accent: 0 4px 20px hsl(38 92% 50% / 0.3);
    --transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }

  h1, h2, h3, h4, h5, h6 {
    @apply font-semibold tracking-tight;
  }
}

@layer utilities {
  .gradient-primary {
    background: var(--gradient-primary);
  }
  
  .gradient-accent {
    background: var(--gradient-accent);
  }
  
  .gradient-subtle {
    background: var(--gradient-subtle);
  }
  
  .shadow-elegant {
    box-shadow: var(--shadow-elegant);
  }
  
  .shadow-glow {
    box-shadow: var(--shadow-glow);
  }

  .shadow-accent {
    box-shadow: var(--shadow-accent);
  }
  
  .transition-smooth {
    transition: var(--transition-smooth);
  }

  .animate-glow {
    animation: glow 2s ease-in-out infinite alternate;
  }

  @keyframes glow {
    from {
      box-shadow: 0 0 20px hsl(263 70% 60% / 0.3);
    }
    to {
      box-shadow: 0 0 40px hsl(263 80% 70% / 0.5);
    }
  }

  .animate-slide-up {
    animation: slideUp 0.5s ease-out;
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}
```

### Tailwind CSS Configuration

Add this to your `tailwind.config.ts` or `tailwind.config.js`:

```typescript
import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          glow: "hsl(var(--primary-glow))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          glow: "hsl(var(--accent-glow))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
```

### React/JSX Usage Examples

**Hero Section with Gradient**
```jsx
export function Hero() {
  return (
    <section className="gradient-primary py-20 px-6">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-slide-up">
          Welcome to NSL
        </h1>
        <p className="text-xl text-primary-foreground/90 mb-8">
          Create compelling stories with AI-powered tools
        </p>
        <button className="bg-accent text-accent-foreground hover:bg-accent/90 
                         px-8 py-3 rounded-md font-medium transition-smooth 
                         shadow-accent hover:scale-105">
          Get Started
        </button>
      </div>
    </section>
  );
}
```

**Feature Card Grid**
```jsx
export function Features() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
      <div className="bg-card rounded-lg p-6 shadow-elegant hover:shadow-glow 
                      transition-smooth hover:-translate-y-1">
        <h3 className="text-xl font-semibold mb-3">Feature 1</h3>
        <p className="text-muted-foreground">Description of feature...</p>
      </div>
      <div className="bg-card rounded-lg p-6 shadow-elegant hover:shadow-glow 
                      transition-smooth hover:-translate-y-1">
        <h3 className="text-xl font-semibold mb-3">Feature 2</h3>
        <p className="text-muted-foreground">Description of feature...</p>
      </div>
      <div className="bg-card rounded-lg p-6 shadow-elegant hover:shadow-glow 
                      transition-smooth hover:-translate-y-1">
        <h3 className="text-xl font-semibold mb-3">Feature 3</h3>
        <p className="text-muted-foreground">Description of feature...</p>
      </div>
    </div>
  );
}
```

**Form with Validation States**
```jsx
export function ContactForm() {
  return (
    <form className="bg-card rounded-lg p-6 shadow-elegant max-w-md">
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Email</label>
        <input
          type="email"
          className="w-full bg-background border border-input rounded-md px-3 py-2
                     focus:outline-none focus:ring-2 focus:ring-ring transition-smooth"
          placeholder="you@example.com"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Message</label>
        <textarea
          className="w-full bg-background border border-input rounded-md px-3 py-2
                     focus:outline-none focus:ring-2 focus:ring-ring transition-smooth 
                     resize-none"
          rows={4}
          placeholder="Your message..."
        />
      </div>
      <button
        type="submit"
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90
                   rounded-md py-2 font-medium transition-smooth"
      >
        Send Message
      </button>
    </form>
  );
}
```

---

## Best Practices

### Dark Theme Considerations

1. **Contrast Ratios**: Ensure text meets WCAG AA standards (4.5:1 for normal text)
   - Primary text on background: ✓ Passes
   - Muted text on background: ✓ Passes
   - Accent text on dark: ✓ Passes

2. **Avoid Pure Black/White**: Use the defined color palette instead
   - ✗ `#000000` or `#FFFFFF`
   - ✓ `hsl(250 24% 10%)` for dark, `hsl(250 10% 98%)` for light

3. **Layer Elevation**: Use subtle background variations
   - Base: `bg-background`
   - Elevated: `bg-card`
   - Highest: `bg-popover`

### Accessibility Guidelines

1. **Focus States**: Always include visible focus indicators
   ```jsx
   <button className="focus-visible:outline-none focus-visible:ring-2 
                      focus-visible:ring-ring">
     Button
   </button>
   ```

2. **Color Independence**: Don't rely solely on color for information
   - Use icons alongside colors
   - Provide text labels
   - Include patterns or shapes

3. **Interactive Element Size**: Minimum 44x44px touch targets
   ```jsx
   <button className="h-11 px-8"> {/* 44px height */}
     Large Enough
   </button>
   ```

4. **ARIA Labels**: Provide context for screen readers
   ```jsx
   <button aria-label="Close dialog">
     <X className="h-4 w-4" />
   </button>
   ```

### Responsive Design

1. **Mobile-First Approach**: Start with mobile, enhance for desktop
   ```jsx
   <div className="text-base md:text-lg lg:text-xl">
     Responsive text
   </div>
   ```

2. **Breakpoints**: Use Tailwind's standard breakpoints
   - `sm`: 640px
   - `md`: 768px
   - `lg`: 1024px
   - `xl`: 1280px
   - `2xl`: 1536px

3. **Touch Targets**: Ensure adequate spacing on mobile
   ```jsx
   <button className="h-11 px-6 sm:h-10 sm:px-4">
     {/* Larger on mobile */}
     Button
   </button>
   ```

### Performance Optimization

1. **Reduce Motion**: Respect user preferences
   ```css
   @media (prefers-reduced-motion: reduce) {
     .transition-smooth {
       transition: none;
     }
     .animate-glow {
       animation: none;
     }
   }
   ```

2. **CSS Variables**: Use for dynamic theming without JS overhead

3. **Lazy Loading**: Load animations only when visible
   ```jsx
   <div className="opacity-0 [&.visible]:animate-slide-up">
     Content
   </div>
   ```

### Color Contrast Requirements

**Text on Background**
- Primary text (`--foreground` on `--background`): 18.7:1 ✓ Excellent
- Muted text (`--muted-foreground` on `--background`): 6.8:1 ✓ Good
- Primary on card (`--foreground` on `--card`): 15.4:1 ✓ Excellent

**Interactive Elements**
- Primary button text: High contrast ✓
- Accent button text: High contrast ✓
- Link colors: Distinguishable from body text ✓

### Component Composition

1. **Reusable Components**: Build small, focused components
2. **Semantic HTML**: Use appropriate HTML elements
3. **Consistent Spacing**: Use Tailwind's spacing scale (4, 8, 12, 16, 24, 32, etc.)
4. **Prop-Based Variants**: Allow customization through props

---

## Quick Reference

### Color Palette Cheat Sheet

| Color | HSL Value | Usage |
|-------|-----------|-------|
| Primary | `263 70% 60%` | Main brand, CTAs, links |
| Primary Glow | `263 80% 70%` | Hover states, glows |
| Accent | `38 92% 50%` | Highlights, important CTAs |
| Accent Glow | `38 100% 60%` | Hover states, effects |
| Background | `250 24% 10%` | Page background |
| Card | `250 20% 14%` | Elevated surfaces |
| Foreground | `250 10% 98%` | Primary text |
| Muted Foreground | `250 10% 65%` | Secondary text |
| Border | `250 15% 22%` | Borders, dividers |
| Success | `142 71% 45%` | Success states |
| Destructive | `0 72% 51%` | Error states, dangerous actions |

### Common Class Combinations

**Primary Button**
```
bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2 font-medium transition-smooth
```

**Card**
```
bg-card text-card-foreground rounded-lg p-6 shadow-elegant
```

**Input**
```
bg-background border border-input rounded-md px-3 py-2 focus:ring-2 focus:ring-ring
```

**Hero Section**
```
gradient-primary py-20 px-6 text-center
```

---

## Support & Contributions

For questions, suggestions, or contributions to NSL ecosystem branding:

1. **Documentation**: Refer to the NSL specification for technical standards
2. **Consistency**: When in doubt, follow existing NSL application patterns
3. **Updates**: This guide evolves with the NSL ecosystem - check for updates regularly

---

## Version History

- **v1.0.0** (2025-10-23) - Initial branding guidance document
  - Complete color system definition
  - Typography guidelines
  - Component examples
  - Accessibility standards

---

*This document is maintained as part of the NSL (Narrative Spittoon Inversion) ecosystem standards.*
