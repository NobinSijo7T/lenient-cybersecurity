# Video Optimization Guide for Smooth Scroll Scrubbing

## 🎯 Goal
Achieve Apple-style smooth scroll scrubbing with zero lag and consistent frame rendering.

## 🎬 Critical: Video Encoding Settings

The **most important factor** for smooth scrubbing is proper video encoding. Use these exact settings:

### FFmpeg Encoding Command

```bash
# Desktop version (1080p)
ffmpeg -i input.mp4 \
  -c:v libx264 \
  -profile:v high \
  -level 4.2 \
  -pix_fmt yuv420p \
  -r 30 \
  -g 1 \
  -keyint_min 1 \
  -sc_threshold 0 \
  -b:v 6M \
  -maxrate 8M \
  -bufsize 12M \
  -movflags +faststart \
  -an \
  output-1080p.mp4

# Mobile version (720p)
ffmpeg -i input.mp4 \
  -vf scale=1280:720 \
  -c:v libx264 \
  -profile:v high \
  -level 4.1 \
  -pix_fmt yuv420p \
  -r 30 \
  -g 1 \
  -keyint_min 1 \
  -sc_threshold 0 \
  -b:v 3M \
  -maxrate 4M \
  -bufsize 6M \
  -movflags +faststart \
  -an \
  output-720p.mp4
```

### Key Parameters Explained

- **`-r 30`**: 30 FPS (DO NOT use 60 FPS - causes seek lag)
- **`-g 1`**: Keyframe every 1 frame (CRITICAL for smooth scrubbing)
- **`-keyint_min 1`**: Minimum keyframe interval
- **`-sc_threshold 0`**: Disable scene change detection
- **`-movflags +faststart`**: Move metadata to beginning (fast loading)
- **`-an`**: Remove audio (not needed for background video)
- **`-pix_fmt yuv420p`**: Maximum compatibility

## 📊 Recommended Video Specs

| Property | Desktop | Mobile |
|----------|---------|--------|
| Resolution | 1920x1080 | 1280x720 |
| Frame Rate | 30 FPS | 30 FPS |
| Bitrate | 5-8 Mbps | 2-4 Mbps |
| Keyframes | Every frame | Every frame |
| Codec | H.264 High | H.264 High |

## ⚠️ Common Mistakes to Avoid

1. ❌ **Using 60 FPS** - Causes seek lag, use 30 FPS
2. ❌ **Sparse keyframes** - Default is every 2 seconds, must be every frame
3. ❌ **High bitrate** - Over 8 Mbps causes buffering issues
4. ❌ **4K resolution** - Too heavy for scrubbing, use 1080p max
5. ❌ **Including audio** - Wastes bandwidth, remove it
6. ❌ **No faststart** - Video won't start playing until fully downloaded

## 🔧 Component Implementation

The component now implements these Apple-style optimizations:

- ✅ Linear interpolation with `lerpFactor: 0.08`
- ✅ Throttled updates: 30 FPS desktop, 24 FPS mobile
- ✅ Single `requestAnimationFrame` loop
- ✅ No video updates inside scroll events
- ✅ Seek threshold: ignore updates < 10ms
- ✅ GPU acceleration with `will-change: transform`
- ✅ Layout containment with `contain: paint layout`
- ✅ Reduced CSS filters for better performance

## 📱 Mobile Optimizations

- Serve 720p video instead of 1080p
- Limit to 24 FPS updates
- Reduced scroll distance (250vh vs 400vh)
- Lighter CSS filters
- Consider fallback to poster image on slow devices

## 🎨 Alternative: Image Sequence (Apple Product Pages)

For **absolute smoothest** scrubbing (like Apple product pages), consider:

1. Export video as image sequence (WebP or AVIF format)
2. Load images into array
3. Display on canvas based on scroll position
4. Zero seek lag, instant frame rendering

## 🧪 Testing Checklist

- [ ] Video encoded with keyframe every frame
- [ ] Video is 30 FPS, not 60 FPS
- [ ] Video has `faststart` flag enabled
- [ ] Only one RAF loop exists
- [ ] No video updates inside scroll event
- [ ] CSS filters are minimal
- [ ] GPU acceleration enabled
- [ ] Test on both desktop and mobile

## 📚 Resources

- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [GSAP ScrollTrigger](https://greensock.com/docs/v3/Plugins/ScrollTrigger)
- [Apple Product Page Examples](https://www.apple.com/airpods-pro/)
