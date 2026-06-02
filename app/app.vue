<template>
  <div class="site-shell">
    <NuxtRouteAnnouncer />
    <header ref="navBar" class="nav-wrap" aria-label="Primary navigation">
      <div class="nav-brand" aria-label="Lenient Cyber">
        <img class="nav-brand__logo" src="/white.png" alt="Lenient Cyber" />
      </div>

      <nav class="menu-bar" aria-label="Course navigation">
        <Transition name="tooltip-fade">
          <div
            v-if="activeIndex !== null"
            ref="tooltipRef"
            class="menu-tooltip"
            :style="{ transform: `translate3d(${tooltipPosition.left}px, 0, 0)` }"
            aria-hidden="true"
          >
            {{ navItems[activeIndex].label }}
          </div>
        </Transition>

        <div ref="menuRef" class="menu-bar__items" @mouseleave="clearActiveItem">
          <span
            ref="menuGlow"
            class="menu-bar__glow"
            :class="{ 'is-visible': activeIndex !== null }"
            aria-hidden="true"
          ></span>

          <button
            v-for="(item, index) in navItems"
            :key="item.label"
            :ref="(el) => setMenuItemRef(el, index)"
            class="menu-bar__button"
            type="button"
            :aria-label="item.label"
            @mouseenter="setActiveItem(index)"
            @focus="setActiveItem(index)"
            @blur="clearActiveItem"
          >
            <Icon :name="item.icon" class="menu-bar__icon" aria-hidden="true" />
          </button>
        </div>
      </nav>
    </header>

    <main class="hero" aria-labelledby="hero-title">
      <div class="hero__backdrop" aria-hidden="true"></div>
      <div class="hero__grid" aria-hidden="true"></div>
      <div class="hero__scan" aria-hidden="true"></div>
      <div class="hero__sweep" aria-hidden="true"></div>
      <section ref="heroContent" class="hero__content">
        <p ref="heroKicker" class="hero__kicker">Hands-on cyber training</p>
        <h1 id="hero-title" ref="heroTitle" class="hero__title">
          <span>Learn</span>
          <span>Cybersecurity</span>
          <span class="hero__title-accent">the Practical Way</span>
        </h1>
        <div ref="heroCopy" class="hero__copy-card">
          <p class="hero__copy">
            Master ethical hacking, network security, and Python scripting
            through real-world training and projects.
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { gsap } from 'gsap'

const navItems = [
  { icon: 'lucide:home', label: 'Home' },
  { icon: 'lucide:shield-check', label: 'Ethical Hacking' },
  { icon: 'lucide:network', label: 'Network Security' },
  { icon: 'lucide:square-terminal', label: 'Python Scripting' },
  { icon: 'lucide:folder-code', label: 'Projects' }
]

const activeIndex = ref<number | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const tooltipRef = ref<HTMLElement | null>(null)
const menuGlow = ref<HTMLElement | null>(null)
const navBar = ref<HTMLElement | null>(null)
const tooltipPosition = reactive({ left: 0 })
const menuItemRefs = ref<HTMLElement[]>([])
const heroContent = ref<HTMLElement | null>(null)
const heroKicker = ref<HTMLElement | null>(null)
const heroTitle = ref<HTMLElement | null>(null)
const heroCopy = ref<HTMLElement | null>(null)

const setMenuItemRef = (element: Element | null, index: number) => {
  if (element instanceof HTMLElement) {
    menuItemRefs.value[index] = element
  }
}

const updateActivePosition = async () => {
  await nextTick()

  if (activeIndex.value === null || !menuRef.value) {
    return
  }

  const menuItem = menuItemRefs.value[activeIndex.value]

  if (!menuItem) {
    return
  }

  const menuRect = menuRef.value.getBoundingClientRect()
  const itemRect = menuItem.getBoundingClientRect()

  if (tooltipRef.value) {
    const tooltipRect = tooltipRef.value.getBoundingClientRect()
    const centeredLeft =
      itemRect.left - menuRect.left + (itemRect.width - tooltipRect.width) / 2
    tooltipPosition.left = Math.max(
      0,
      Math.min(centeredLeft, menuRect.width - tooltipRect.width)
    )
  }

  if (menuGlow.value) {
    gsap.to(menuGlow.value, {
      x: itemRect.left - menuRect.left,
      width: itemRect.width,
      opacity: 1,
      duration: 0.34,
      ease: 'power3.out'
    })
  }
}

const setActiveItem = (index: number) => {
  activeIndex.value = index
  updateActivePosition()
}

const clearActiveItem = () => {
  activeIndex.value = null

  if (menuGlow.value) {
    gsap.to(menuGlow.value, {
      opacity: 0,
      duration: 0.22,
      ease: 'power2.out'
    })
  }
}

onMounted(() => {
  const timeline = gsap.timeline({ defaults: { ease: 'power3.out' } })

  timeline
    .from('.hero__backdrop', {
      scale: 1.08,
      opacity: 0,
      duration: 1.4,
      ease: 'power2.out'
    })
    .from(
      heroContent.value,
      {
        opacity: 0,
        y: 26,
        duration: 0.9
      },
      '-=0.85'
    )
    .from(
      [heroKicker.value, heroTitle.value, heroCopy.value],
      {
        opacity: 0,
        y: 34,
        duration: 0.8,
        stagger: 0.14
      },
      '-=0.55'
    )

  gsap.from(navBar.value, {
    opacity: 0,
    y: -22,
    filter: 'blur(12px)',
    duration: 0.9,
    ease: 'power3.out',
    delay: 0.2
  })

  gsap.to('.hero__backdrop', {
    scale: 1.045,
    xPercent: -1.15,
    yPercent: 0.65,
    duration: 16,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  })
})
</script>

<style>
@font-face {
  font-family: 'Audiowide';
  src: url('/fonts/Audiowide-Regular.ttf') format('truetype');
  font-display: swap;
}

@font-face {
  font-family: 'Proxima Nova';
  src: url('/fonts/ProximaNova-Regular.ttf') format('truetype');
  font-display: swap;
}

:root {
  color: #f7f2ee;
  background: #070101;
  font-family: 'Proxima Nova', Arial, sans-serif;
}

* {
  box-sizing: border-box;
}

html,
body,
#__nuxt {
  min-height: 100%;
  margin: 0;
}

body {
  overflow-x: hidden;
}

.site-shell {
  min-height: 100svh;
  background: #070101;
}

.nav-wrap {
  position: fixed;
  top: clamp(1rem, 2.6vw, 1.75rem);
  left: 50%;
  z-index: 20;
  display: flex;
  width: min(calc(100% - 2rem), 780px);
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  transform: translateX(-50%);
  pointer-events: none;
}

.nav-brand,
.menu-bar__items {
  position: relative;
  border: 1px solid rgb(255 255 255 / 0.18);
  background:
    linear-gradient(135deg, rgb(255 255 255 / 0.22), rgb(255 255 255 / 0.06)),
    linear-gradient(180deg, rgb(120 16 16 / 0.38), rgb(8 2 2 / 0.2));
  box-shadow:
    inset 0 1px 1px rgb(255 255 255 / 0.32),
    inset 0 -1px 1px rgb(255 255 255 / 0.08),
    0 18px 42px rgb(0 0 0 / 0.35),
    0 0 38px rgb(255 42 42 / 0.12);
  backdrop-filter: blur(22px) saturate(170%);
}

.nav-brand::before,
.menu-bar__items::before {
  position: absolute;
  inset: 1px;
  border-radius: inherit;
  background:
    linear-gradient(120deg, rgb(255 255 255 / 0.35), transparent 34%),
    radial-gradient(circle at 22% 0%, rgb(255 255 255 / 0.25), transparent 32%);
  content: '';
  opacity: 0.9;
  pointer-events: none;
}

.nav-brand {
  display: inline-flex;
  align-items: center;
  min-height: 2.8rem;
  padding: 0.5rem 0.95rem;
  border-radius: 999px;
  color: #fff8f5;
  font-family: 'Proxima Nova', Arial, sans-serif;
  pointer-events: auto;
}

.nav-brand__logo {
  position: relative;
  display: block;
  width: auto;
  height: 1.7rem;
  max-width: 8.5rem;
  object-fit: contain;
  filter: drop-shadow(0 4px 14px rgb(0 0 0 / 0.54));
}

.menu-bar {
  position: relative;
  display: flex;
  justify-content: flex-end;
  pointer-events: auto;
}

.menu-tooltip {
  position: absolute;
  bottom: calc(100% + 0.65rem);
  left: 0;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 1.85rem;
  padding: 0.3rem 0.72rem;
  border: 1px solid rgb(255 255 255 / 0.22);
  border-radius: 999px;
  background:
    linear-gradient(135deg, rgb(255 255 255 / 0.24), rgb(255 255 255 / 0.08)),
    rgb(15 3 3 / 0.58);
  color: #fff7f3;
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1;
  white-space: nowrap;
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.24),
    0 12px 30px rgb(0 0 0 / 0.32);
  backdrop-filter: blur(18px) saturate(165%);
  pointer-events: none;
}

.tooltip-fade-enter-active,
.tooltip-fade-leave-active {
  transition:
    opacity 0.22s ease,
    translate 0.22s ease,
    scale 0.22s ease;
}

.tooltip-fade-enter-from,
.tooltip-fade-leave-to {
  opacity: 0;
  scale: 0.96;
  translate: 0 0.35rem;
}

.menu-bar__items {
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  height: 3rem;
  padding: 0.28rem;
  overflow: hidden;
  border-radius: 999px;
}

.menu-bar__glow {
  position: absolute;
  top: 0.28rem;
  left: 0;
  z-index: 0;
  width: 2.45rem;
  height: calc(100% - 0.56rem);
  border-radius: 999px;
  background:
    radial-gradient(circle at 32% 20%, rgb(255 255 255 / 0.48), transparent 34%),
    linear-gradient(135deg, rgb(255 83 83 / 0.5), rgb(255 255 255 / 0.13));
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.42),
    0 0 24px rgb(255 45 45 / 0.38);
  opacity: 0;
}

.menu-bar__button {
  position: relative;
  z-index: 1;
  display: grid;
  width: 2.45rem;
  height: 2.45rem;
  place-items: center;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: #fff4ef;
  cursor: pointer;
  transition:
    color 0.2s ease,
    transform 0.2s ease;
}

.menu-bar__button:hover,
.menu-bar__button:focus-visible {
  color: #fff;
  transform: translateY(-1px);
  outline: none;
}

.menu-bar__button:focus-visible {
  box-shadow: 0 0 0 2px rgb(255 255 255 / 0.7);
}

.menu-bar__icon {
  width: 1.08rem;
  height: 1.08rem;
  filter: drop-shadow(0 4px 12px rgb(0 0 0 / 0.52));
}

.hero {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 100svh;
  overflow: hidden;
  isolation: isolate;
  padding: clamp(7rem, 10vw, 9rem) clamp(1.25rem, 5vw, 5rem) clamp(2rem, 5vw, 4rem);
}

.hero::before,
.hero::after {
  position: absolute;
  inset: 0;
  z-index: -1;
  content: '';
  pointer-events: none;
}

.hero::before {
  background:
    radial-gradient(circle at 72% 20%, rgb(255 31 31 / 0.1), transparent 30rem),
    linear-gradient(90deg, rgb(3 0 0 / 0.62), rgb(4 0 0 / 0.38) 30%, rgb(4 0 0 / 0.08) 66%, rgb(4 0 0 / 0.32));
}

.hero::after {
  background:
    linear-gradient(180deg, rgb(0 0 0 / 0.24), transparent 44%, rgb(0 0 0 / 0.38)),
    linear-gradient(0deg, rgb(7 1 1 / 0.06), rgb(7 1 1 / 0.06));
}

.hero__backdrop {
  position: absolute;
  inset: 0;
  z-index: -4;
  background-image: url('/hero.png');
  background-position: center;
  background-size: cover;
  transform-origin: center;
  filter: saturate(1.2) contrast(1.08) brightness(1.12);
}

.hero__grid,
.hero__scan,
.hero__sweep {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.hero__grid {
  z-index: -3;
  background-image:
    linear-gradient(rgb(255 255 255 / 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgb(255 255 255 / 0.045) 1px, transparent 1px);
  background-position: center;
  background-size: 7rem 7rem;
  mask-image: linear-gradient(90deg, rgb(0 0 0 / 0.95), rgb(0 0 0 / 0.18) 62%, transparent);
  opacity: 0.32;
  animation: gridDrift 18s linear infinite;
}

.hero__scan {
  z-index: -2;
  background:
    repeating-linear-gradient(
      180deg,
      transparent 0,
      transparent 1.1rem,
      rgb(255 255 255 / 0.035) 1.16rem,
      transparent 1.28rem
    );
  mix-blend-mode: screen;
  opacity: 0.26;
  animation: scanTravel 5.5s linear infinite;
}

.hero__sweep {
  z-index: -2;
  background: linear-gradient(
    105deg,
    transparent 16%,
    rgb(255 56 36 / 0.04) 38%,
    rgb(255 255 255 / 0.13) 48%,
    rgb(255 42 22 / 0.06) 58%,
    transparent 78%
  );
  mix-blend-mode: screen;
  opacity: 0.58;
  transform: translateX(-72%);
  animation: redSweep 8.5s ease-in-out infinite;
}

.hero__content {
  width: min(100%, 720px);
  margin-top: clamp(-1rem, -2vw, 0rem);
  margin-left: clamp(0rem, 1vw, 1.2rem);
  text-align: left;
}

.hero__kicker {
  margin: 0 0 1.1rem;
  color: #ffbeb8;
  font-size: clamp(0.78rem, 1.2vw, 0.98rem);
  font-weight: 700;
  line-height: 1.2;
  text-transform: uppercase;
}

.hero__title {
  display: flex;
  flex-direction: column;
  max-width: 720px;
  margin: 0;
  color: #fff7f2;
  font-family: 'Audiowide', system-ui, sans-serif;
  font-size: clamp(2.9rem, 5vw, 5.15rem);
  font-weight: 400;
  line-height: 0.95;
  text-shadow:
    0 0 22px rgb(255 31 31 / 0.5),
    0 6px 34px rgb(0 0 0 / 0.78);
}

.hero__title-accent {
  color: #ff321e;
}

.hero__copy-card {
  width: min(100%, 28rem);
  margin-top: clamp(2rem, 4vw, 3.8rem);
  padding: clamp(1rem, 1.8vw, 1.35rem);
  border: 1px solid rgb(255 255 255 / 0.18);
  border-radius: 0.9rem;
  background:
    linear-gradient(135deg, rgb(255 255 255 / 0.15), rgb(255 255 255 / 0.035)),
    rgb(11 3 3 / 0.34);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / 0.24),
    0 26px 60px rgb(0 0 0 / 0.34),
    0 0 36px rgb(255 46 29 / 0.12);
  backdrop-filter: blur(20px) saturate(165%);
}

@keyframes gridDrift {
  from {
    background-position: center;
  }

  to {
    background-position: calc(50% + 7rem) calc(50% + 7rem);
  }
}

@keyframes scanTravel {
  from {
    background-position-y: 0;
  }

  to {
    background-position-y: 5rem;
  }
}

@keyframes redSweep {
  0%,
  28% {
    transform: translateX(-72%);
    opacity: 0;
  }

  48% {
    opacity: 0.58;
  }

  76%,
  100% {
    transform: translateX(72%);
    opacity: 0;
  }
}

.hero__copy {
  max-width: 22rem;
  margin: 0;
  color: #ffe8e4;
  font-family: 'Proxima Nova', Arial, sans-serif;
  font-size: clamp(1rem, 1.35vw, 1.18rem);
  line-height: 1.35;
  text-shadow: 0 4px 24px rgb(0 0 0 / 0.86);
}

@media (max-width: 700px) {
  .nav-wrap {
    top: 0.85rem;
    width: min(calc(100% - 1rem), 24rem);
    justify-content: center;
  }

  .nav-brand {
    min-height: 2.65rem;
    padding: 0.48rem 0.72rem;
  }

  .nav-brand__logo {
    height: 1.45rem;
    max-width: 5.4rem;
  }

  .menu-bar__items {
    width: auto;
    justify-content: space-between;
  }

  .menu-tooltip {
    display: none;
  }

  .hero {
    align-items: start;
    padding: 7.25rem 1.25rem 2rem;
  }

  .hero__backdrop {
    background-position: 58% bottom;
  }

  .hero__content {
    width: 100%;
    margin-top: 0;
    margin-left: 0;
  }

  .hero__title {
    max-width: 100%;
    font-size: clamp(2.35rem, 11.5vw, 4rem);
  }

  .hero__copy-card {
    width: min(100%, 22rem);
    margin-top: 1.55rem;
  }
}
</style>
