# Design Tokens Architecture

## Token Hierarchy

PRIMITIVE TOKENS
Raw values — never used directly in components

SEMANTIC TOKENS
Meaningful names — used in components

COMPONENT TOKENS
Component-specific overrides

## Primitive Colors

### Neutrals
neutral-0:   #FFFFFF
neutral-50:  #F9F9F7
neutral-100: #F4F4F2
neutral-200: #E8E8E5
neutral-300: #D0D0CC
neutral-400: #A8A8A3
neutral-500: #6B6B66
neutral-600: #4A4A47
neutral-700: #2E2E2C
neutral-800: #1C1C1E
neutral-900: #111111

### Brand Bronze
brand-100: rgba(185,146,76,0.08)
brand-200: rgba(185,146,76,0.16)
brand-300: rgba(185,146,76,0.28)
brand-400: #D4B06A
brand-500: #B9924C
brand-600: #A88446
brand-700: #8A6A36

### Semantic Status
success-50:  #F0FDF4
success-500: #22C55E
success-700: #15803D

warning-50:  #FFFBEB
warning-500: #F59E0B
warning-700: #B45309

error-50:    #FEF2F2
error-500:   #EF4444
error-700:   #B91C1C

info-50:     #EFF6FF
info-500:    #3B82F6
info-700:    #1D4ED8

## Semantic Tokens

### Application Background
--color-bg:           #F4F4F2   (neutral-100)
--color-bg-alt:       #EEEEED   (slightly deeper)

### Surfaces
--color-surface:      #FFFFFF   (neutral-0)
--color-surface-alt:  #F9F9F7   (neutral-50)
--color-surface-raised: #FFFFFF

### Sidebar (Graphite Command)
--color-sidebar:          #1C1C1E   (neutral-800)
--color-sidebar-hover:    rgba(255,255,255,0.06)
--color-sidebar-active:   rgba(185,146,76,0.12)
--color-sidebar-border:   rgba(255,255,255,0.08)
--color-sidebar-text:     #9B9B96
--color-sidebar-text-active: #F9F9F7
--color-sidebar-accent:   #B9924C

### Topbar
--color-topbar:       #FFFFFF
--color-topbar-border: #E8E8E5

### Typography
--color-text-1:       #111111   (deep charcoal)
--color-text-2:       #4A4A47   (medium charcoal)
--color-text-3:       #6B6B66   (tertiary)
--color-text-disabled: #A8A8A3
--color-text-inv:     #F9F9F7
--color-text-brand:   #B9924C

### Borders
--color-border:       #E8E8E5
--color-border-hover: #D0D0CC
--color-border-focus: #B9924C
--color-border-strong: #A8A8A3
--color-divider:      #F4F4F2

### Brand
--color-brand:        #B9924C
--color-brand-hover:  #A88446
--color-brand-light:  rgba(185,146,76,0.08)
--color-brand-mid:    #D4B06A
--color-brand-muted:  rgba(185,146,76,0.04)
--color-brand-border: rgba(185,146,76,0.22)

### Semantic Status
--color-success:      #22C55E
--color-success-bg:   #F0FDF4
--color-success-border: #BBF7D0
--color-success-text: #15803D

--color-warning:      #F59E0B
--color-warning-bg:   #FFFBEB
--color-warning-border: #FDE68A
--color-warning-text: #B45309

--color-danger:       #EF4444
--color-danger-bg:    #FEF2F2
--color-danger-border: #FECACA
--color-danger-text:  #B91C1C

--color-info:         #3B82F6
--color-info-bg:      #EFF6FF
--color-info-border:  #BFDBFE
--color-info-text:    #1D4ED8

## Dark Mode Overrides (.dark class)

--color-bg:           #111111
--color-bg-alt:       #1C1C1E
--color-surface:      #1C1C1E
--color-surface-alt:  #2E2E2C
--color-text-1:       #F9F9F7
--color-text-2:       #9B9B96
--color-text-3:       #6B6B66
--color-border:       #2E2E2C
--color-divider:      #1C1C1E
--color-topbar:       #1C1C1E
--color-topbar-border: #2E2E2C
