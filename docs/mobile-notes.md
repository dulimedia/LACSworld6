# Mobile Optimizations

## Overview

This document describes the mobile-specific optimizations implemented in the LACSWORLD2 warehouse visualization.

## Mobile Tier Strategy

The application uses a **mobile-lite WebGL** approach to prevent performance issues and crashes on mobile devices:

### WebGL Settings (Mobile)
- **DPR**: Clamped to [1, 1.25] (max 1.25x device pixel ratio)
- **Frameloop**: `demand` (renders only when needed, not continuously)
- **Antialiasing**: Disabled
- **Power Preference**: `low-power`
- **Alpha**: Enabled for transparency support

### WebGL Settings (Desktop)
- **DPR**: [1, 2] (up to 2x device pixel ratio)
- **Frameloop**: `always` (continuous rendering)
- **Antialiasing**: Disabled for performance
- **Power Preference**: `high-performance`

## UI Layout

### Mobile Bottom Sheet

On mobile devices (viewport ≤768px), the sidebar converts to a **bottom sheet**:

- **Collapsed State**: Only shows a 14px grab handle at the bottom
- **Expanded State**: Takes up min(78vh, 720px) of viewport height
- **Touch-Optimized**: Includes safe-area padding for iOS notches
- **Blur Overlay**: Prevents accidental canvas interaction when open

### Z-Index Policy

The application uses a strict z-index hierarchy to prevent overlap issues:

```css
Canvas:         z-index: 10
Notice Banner:  z-index: 20
Bottom Sheet:   z-index: 30
Toggle Button:  z-index: 35
Modals:         z-index: 40
```

## Camera Controls

### Mobile Camera
- **Position**: (9, 7, 9) - Closer and more centered
- **Target**: (0, 0, 0) - Scene origin
- **Pan**: Disabled (touch conflicts with rotation)
- **Aspect Ratio**: Auto-updates on resize

### Desktop Camera
- **Position**: (-10, 10, -14) - Default distant view
- **Target**: (0, 0, 0) - Scene origin
- **Pan**: Enabled
- **Aspect Ratio**: Auto-updates on resize

## Post-Processing

Post-processing effects (AO, SSR, Bloom) are **completely disabled** on mobile to:
- Reduce GPU load
- Prevent memory spikes
- Improve frame rates
- Avoid crashes on low-end devices

## Floorplan Viewer

On mobile, floorplan images open in a **lightweight full-screen viewer** instead of expanding the sidebar:

- **Overlay**: Semi-transparent black background (80% opacity)
- **Image**: Max 96vw × 90vh, object-contain scaling
- **Close Button**: Fixed top-right, fully tappable
- **No Sidebar Expansion**: Prevents layout jank

## Memory Management

### iOS-Specific Optimizations
- Skip CSV data processing (PerfFlags.isIOS check)
- Fast-track loading (500ms vs normal 3s delay)
- Skip HDRI environment (uses simple gradient instead)
- Disable shadows completely
- Simple lighting (ambient + directional, no shadows)

### Mobile-Specific Optimizations
- No 3D model loading (WebGL disabled entirely on detected mobile)
- No environment meshes
- UI-only experience with message: "Desktop Experience Recommended"

## Testing Notes

### Manual QA Checklist (iPhone Safari)
- ✅ Viewport meta includes `viewport-fit=cover`
- ✅ No overlapping between banner, sheet, FABs
- ✅ Z-index order maintained
- ✅ Collapsed state shows only 14px handle
- ✅ Tapping/dragging opens sheet smoothly
- ✅ Floorplan opens full-screen viewer
- ✅ Collapse/expand button fully visible and tappable
- ✅ Camera starts centered on scene
- ✅ Pinch-zoom & rotate feel natural
- ✅ No lateral camera offset
- ✅ Idle CPU stays low
- ✅ No stutters during sheet open/close

### Known Limitations
- **BrowserStack**: Remote device testing has interaction issues (touch events don't work properly)
- **Real Device Required**: Test on actual iPhone/Android for accurate results
- **WebGL Disabled**: Mobile users see UI-only experience, desktop required for 3D visualization

## Implementation Files

### New Files
- `src/hooks/useBottomSheet.ts` - Body scroll lock hook
- `src/components/FloorplanLightbox.tsx` - Mobile floorplan viewer
- `src/lib/utils.ts` - Tailwind class merge utility
- `docs/mobile-notes.md` - This file

### Modified Files
- `src/index.css` - Mobile bottom sheet styles
- `src/ui/Sidebar/Sidebar.tsx` - Bottom sheet implementation
- `src/ui/RootCanvas.tsx` - Mobile-lite WebGL settings
- `src/App.tsx` - Camera controls, post-processing guards
- `package.json` - Added clsx, tailwind-merge dependencies

## Future Improvements

1. **Progressive Enhancement**: Load minimal 3D scene on high-end mobile devices
2. **Adaptive Loading**: Detect device capabilities and load appropriate tier
3. **Touch Gestures**: Implement swipe-to-dismiss for bottom sheet
4. **Offline Support**: Cache unit data for offline browsing

## References

- [PerfFlags.ts](../src/perf/PerfFlags.ts) - Device detection and tier selection
- [RootCanvas.tsx](../src/ui/RootCanvas.tsx) - WebGL configuration
- [makeRenderer.ts](../src/graphics/makeRenderer.ts) - Renderer creation
