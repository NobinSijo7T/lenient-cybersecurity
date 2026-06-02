# Liquid Chrome Loader

A stunning WebGL-based loader component with an interactive liquid chrome effect and centered logo.

## Components

### LiquidChrome.vue
The core WebGL component that renders the liquid chrome effect.

**Props:**
- `baseColor` - RGB color array, default: `[0.1, 0.1, 0.1]`
- `speed` - Animation speed, default: `0.2`
- `amplitude` - Wave amplitude, default: `0.3`
- `frequencyX` - Horizontal wave frequency, default: `3`
- `frequencyY` - Vertical wave frequency, default: `3`
- `interactive` - Enable mouse/touch interaction, default: `true`

### Loader.vue
Full-screen loader component using LiquidChrome with the white.png logo overlay.

## Usage

### Basic Usage (Full-Screen Loader)

```vue
<template>
  <div>
    <Loader v-if="isLoading" />
    <div v-else>
      <!-- Your content here -->
    </div>
  </div>
</template>

<script setup>
const isLoading = ref(true)

onMounted(() => {
  // Hide loader after 2 seconds
  setTimeout(() => {
    isLoading.value = false
  }, 2000)
})
</script>
```

### Using the Composable

```vue
<template>
  <div>
    <Loader v-if="isLoading" />
    <YourContent v-else />
  </div>
</template>

<script setup>
const { isLoading, hideLoader } = useLoader()

onMounted(async () => {
  // Load your data
  await fetchData()
  // Hide loader when done
  hideLoader()
})
</script>
```

### Custom LiquidChrome Usage

```vue
<template>
  <div style="width: 100%; height: 600px; position: relative;">
    <LiquidChrome
      :base-color="[0.2, 0.0, 0.1]"
      :speed="0.5"
      :amplitude="0.4"
      :interactive="true"
    />
  </div>
</template>
```

### Integration with App Layout

Add to your `app.vue`:

```vue
<template>
  <div>
    <Loader v-if="isLoading" />
    <div v-else>
      <NuxtPage />
    </div>
  </div>
</template>

<script setup>
const { isLoading, hideLoader } = useLoader()

onMounted(() => {
  // Minimum display time for branding
  setTimeout(() => {
    hideLoader()
  }, 2000)
})
</script>
```

## Demo

Visit `/loader-demo` to see the loader in action.

## Dependencies

- `ogl` - Lightweight WebGL library for rendering

## Browser Support

Works in all modern browsers that support WebGL.

## Customization

The logo image (`/white.png`) is displayed centered over the liquid chrome background. You can:

1. Change the logo by replacing `/public/white.png`
2. Adjust logo size in `LiquidChrome.vue` (`.logo` class)
3. Modify colors by changing the `baseColor` prop
4. Adjust animation by changing `speed` and `amplitude` props
