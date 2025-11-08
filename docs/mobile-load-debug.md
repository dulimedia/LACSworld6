# Mobile Load Debugging Guide

## Problem

The mobile UI loads correctly, but the 3D Canvas never appears. This guide helps diagnose why.

## Quick Diagnosis

### Step 1: Test Safe Mode

Open the app on your mobile device with:

```
https://your-app-url.vercel.app/?safe=1&debug
```

**What this does:**
- `?safe=1` - Enables ultra-safe WebGL mode (DPR=1, no post-processing, demand frameloop)
- `?debug` - Enables console logging visible in remote Safari devtools

### Step 2: Check Console Logs

Connect your iPhone to your Mac and open Safari devtools. Look for these logs:

✅ **Success indicators:**
```
[info] Device report { ua:..., mem:..., SAFE: true, DEBUG: true }
[info] App mounted { SAFE: true, isMobile: true, tier: 'mobileLow' }
[info] Canvas element ready, creating renderer...
[info] Renderer created { type: 'webgl2', tier: 'mobile-low', isWebGL2: true }
[info] Watchdog: canvas detected successfully
```

❌ **Failure indicators:**
```
[err] Watchdog: canvas never mounted in 12s
[err] CanvasErrorBoundary caught error ...
[err] Renderer creation failed ...
[warn] webglcontextlost event
```

## Common Failure Modes

### 1. Canvas Never Mounts (12s Watchdog)

**Symptoms:** 
- UI loads but canvas area is blank
- After 12 seconds, shows fallback message

**Causes:**
- Suspense boundary never resolves
- Model loader hangs on DRACO/KTX2 decode
- Worker script 404

**Fix:**
- Check Network tab for 404s on `/draco/` or `/ktx2/` files
- Ensure `PerfFlags.isMobile` correctly disables model loading
- Try `?safe=1` to see if it bypasses the issue

### 2. WebGL Context Lost

**Symptoms:**
```
[warn] webglcontextlost event
```

**Causes:**
- GPU memory exhaustion
- Too many textures loaded at once
- iOS killed the context due to OOM

**Fix:**
- Enable SAFE mode which reduces DPR and disables effects
- Check if Environment HDRI is loading (large file)
- Ensure models are not loading on mobile (check `SingleEnvironmentMesh.tsx`)

### 3. Renderer Creation Fails

**Symptoms:**
```
[err] Renderer creation failed ...
```

**Causes:**
- WebGL not supported
- Canvas element not ready
- makeRenderer threw an error

**Fix:**
- Check if WebGL is enabled in Safari settings
- Ensure canvas element exists before renderer creation
- Review `makeRenderer.ts` for iOS-specific issues

### 4. Post-Processing Crash

**Symptoms:**
- Works in safe mode
- Fails in normal mode
- No specific error

**Causes:**
- EffectComposer not compatible with device
- AO/SSR/Bloom shaders too heavy

**Fix:**
- Already guarded with `!SAFE` check
- Verify `PerfFlags.isMobile` is true
- Check if effects are being rendered despite guards

## Debug Flags

### ?safe=1

Ultra-safe mode for maximum compatibility:
- DPR: [1, 1] (no scaling)
- Frameloop: 'demand' (not continuous)
- Shadows: disabled
- Post-processing: disabled

### ?debug

Enables verbose console logging:
- Device capabilities
- App lifecycle events
- Renderer creation
- Canvas mount status

## Testing Workflow

1. **Start with safe mode:**
   ```
   ?safe=1&debug
   ```
   If this works → issue is performance/effects-related

2. **Remove safe mode:**
   ```
   ?debug
   ```
   If this fails → check last log before failure

3. **Check without debug:**
   ```
   (normal URL)
   ```
   Verify user experience

## Files to Check

### Core Debug Files
- `src/lib/debug.ts` - Debug logger and query param handling
- `src/ui/RootCanvas.tsx` - Error boundary, watchdog, safe mode

### Potential Failure Points
- `src/components/SingleEnvironmentMesh.tsx` - Model loading (should skip on mobile)
- `src/graphics/makeRenderer.ts` - Renderer creation
- `src/App.tsx` - Effects and scene setup
- `src/perf/PerfFlags.ts` - Device detection

## Error Boundary Fallback

If the canvas fails to load, users see:

```
Interactive 3D view unavailable.
[error reason]
[Retry button]
```

This prevents a broken white screen and gives users a way to retry.

## Watchdog Timer

The watchdog checks if a `<canvas>` element appears within 12 seconds:
- ✅ If found: continues normally
- ❌ If not found: shows fallback with timeout message

## Production Recommendations

1. **Always test with real device** - BrowserStack has interaction issues
2. **Monitor error rates** - Track how often fallback is shown
3. **A/B test safe mode** - Some users may need permanent safe mode
4. **Add analytics** - Log which step fails most often

## Advanced Debugging

### iOS Safari Remote Debugging

1. Connect iPhone to Mac via USB
2. Enable "Web Inspector" in iPhone Settings > Safari > Advanced
3. Open Safari on Mac > Develop > [Your iPhone] > [Your Site]
4. Console tab shows all logs from `?debug`

### Network Tab

Check for:
- 404s on DRACO decoder files
- 404s on KTX2 transcoder files
- Large HDRI files (>5MB)
- CORS errors

### Memory Profiling

Use Xcode Instruments:
1. Xcode > Open Developer Tool > Instruments
2. Choose "Allocations" template
3. Select your iOS device
4. Start recording while opening app
5. Look for memory spikes >200MB

## Support

If issues persist:
1. Share console output from `?debug` mode
2. Include device model and iOS version
3. Note if `?safe=1` works or fails
4. Check Network tab for 404s or CORS errors
