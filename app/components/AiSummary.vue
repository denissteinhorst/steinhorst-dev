<script setup lang="ts">
const props = defineProps<{
  title: string;
  target: string;
}>();
</script>

<template>
  <div class="ai-summary">
    <button
      type="button"
      aria-haspopup="dialog"
      class="ai-summary__btn ai-summary-btn"
    >
      <span class="ai-summary__icon-wrapper">
        <UIcon
          name="i-heroicons-sparkles"
          class="ai-summary__icon bell-ring-icon"
        />
        <span class="visually-hidden">{{ props.title }}</span>

        <span
          class="pointer-events-none absolute -inset-3 overflow-visible sparkle-wrapper"
        >
          <span class="sparkle"></span>
          <span class="sparkle"></span>
          <span class="sparkle"></span>
          <span class="sparkle"></span>
          <span class="sparkle"></span>
          <span class="sparkle"></span>
        </span>
      </span>

      <span
        class="ai-summary__label ai-summary-label"
        :data-label="props.target"
      >
        {{ props.title }}
      </span>
    </button>
  </div>
</template>

<style scoped lang="scss">
$block: "ai-summary";

.#{$block} {
  &__btn {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem 0.75rem;
    background-color: transparent;
    border: none;
    color: rgb(226, 232, 240);
    font-size: 0.875rem;
    font-weight: 500;
    letter-spacing: 0.025em;
    cursor: pointer;
    transition: all 150ms ease;
    user-select: none;
    width: 100%;
    justify-content: center;
    box-shadow: none;
    backdrop-filter: none;

    @media (min-width: 640px) {
      width: auto;
    }

    &:hover {
      background-color: transparent;
      color: white;

      .#{$block}__icon {
        transform: rotate(12deg) scale(1.1);
      }
    }

    &:focus {
      background-color: transparent;
      outline: none;
    }

    &:focus-visible {
      box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.7);
    }
  }

  &__icon-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  &__icon {
    height: 1rem;
    width: 1rem;
    color: rgb(196, 181, 253);
    transition: transform 150ms ease;
  }

  &__label {
    font-weight: 600;
  }

  @keyframes sparkleRise {
    0% {
      transform: translate3d(0, 6px, 0) scale(var(--scale));
      opacity: 0;
    }
    10% {
      opacity: 1;
    }
    55% {
      opacity: 0.9;
    }
    100% {
      transform: translate3d(var(--tx), -18px, 0)
        scale(calc(var(--scale) * 0.85));
      opacity: 0;
    }
  }

  @keyframes bellRing {
    0% {
      transform: rotate(0deg);
    }
    4% {
      transform: rotate(15deg);
    }
    8% {
      transform: rotate(-12deg);
    }
    12% {
      transform: rotate(9deg);
    }
    16% {
      transform: rotate(-6deg);
    }
    20% {
      transform: rotate(3deg);
    }
    24% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(0deg);
    }
  }

  @keyframes textGlowSweep {
    0% {
      opacity: 0;
      background-position: 160% 0;
    }
    4% {
      opacity: 1;
    }
    16% {
      opacity: 0.85;
    }
    20% {
      opacity: 0;
      background-position: -160% 0;
    }
    24% {
      opacity: 0;
      background-position: -160% 0;
    }
    100% {
      opacity: 0;
      background-position: -160% 0;
    }
  }

  .sparkle-wrapper {
    z-index: 5;
  }

  .sparkle-wrapper .sparkle:nth-child(1) {
    left: 18%;
    --delay: 0s;
    --dur: 0.9s;
    --scale: 0.85;
    --tx: -6px;
  }
  .sparkle-wrapper .sparkle:nth-child(2) {
    left: 34%;
    --delay: 0.12s;
    --dur: 0.75s;
    --scale: 0.6;
    --tx: 4px;
  }
  .sparkle-wrapper .sparkle:nth-child(3) {
    left: 50%;
    --delay: 0.22s;
    --dur: 1.05s;
    --scale: 0.45;
    --tx: 2px;
  }
  .sparkle-wrapper .sparkle:nth-child(4) {
    left: 66%;
    --delay: 0.34s;
    --dur: 0.82s;
    --scale: 0.7;
    --tx: -3px;
  }
  .sparkle-wrapper .sparkle:nth-child(5) {
    left: 78%;
    --delay: 0.46s;
    --dur: 1.15s;
    --scale: 0.5;
    --tx: 6px;
  }
  .sparkle-wrapper .sparkle:nth-child(6) {
    left: 42%;
    --delay: 0.6s;
    --dur: 0.7s;
    --scale: 0.4;
    --tx: -2px;
  }

  .ai-summary-btn .sparkle {
    position: absolute;
    top: 50%;
    width: 3px;
    height: 3px;
    margin-top: -1.5px;
    border-radius: 50%;
    background: radial-gradient(
      circle at 35% 30%,
      #fff9c2,
      #fde68a 60%,
      #facc15 85%
    );
    box-shadow: 0 0 3px 1px rgba(250, 240, 180, 0.9),
      0 0 6px 2px rgba(250, 204, 21, 0.35);
    pointer-events: none;
    opacity: 0;
    transform-origin: center;
    filter: saturate(120%);
    --dur: var(--dur, 0.9s);
    --delay: var(--delay, 0s);
    --scale: var(--scale, 0.6);
    --tx: var(--tx, 0px);
    animation: sparkleRise var(--dur) ease-out var(--delay) infinite paused;
  }

  .ai-summary-btn:not(:hover) .sparkle {
    opacity: 0 !important;
  }

  .ai-summary-btn:hover .sparkle {
    animation-play-state: running;
  }

  @media (prefers-reduced-motion: reduce) {
    .ai-summary-btn .sparkle {
      animation: none;
      opacity: 0;
    }
  }

  .ai-summary-btn:not(:hover) .bell-ring-icon {
    animation: bellRing 5s ease-in-out infinite;
    transform-origin: 50% 14%;
    will-change: transform;
  }

  .ai-summary-btn:hover .bell-ring-icon,
  .ai-summary-btn:focus .bell-ring-icon {
    animation: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .ai-summary-btn:not(:hover) .bell-ring-icon {
      animation: none !important;
    }
  }

  .ai-summary-btn .ai-summary-label {
    position: relative;
    display: inline-block;
  }

  .ai-summary-btn .ai-summary-label::after {
    content: attr(data-label);
    position: absolute;
    inset: 0;
    background: linear-gradient(
      115deg,
      transparent 0%,
      transparent 35%,
      var(--ai-summary-glow-color, #bb00ff) 100%,
      transparent 65%,
      transparent 100%
    );
    background-size: 220% 220%;
    background-position: 160% 0;
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    opacity: 0;
    pointer-events: none;
    mix-blend-mode: screen;
  }

  .ai-summary-btn:not(:hover) .ai-summary-label::after {
    animation: textGlowSweep 5s ease-in-out infinite;
    will-change: background-position, opacity;
  }

  .ai-summary-btn:hover .ai-summary-label::after,
  .ai-summary-btn:focus .ai-summary-label::after {
    animation: none;
    opacity: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .ai-summary-btn:not(:hover) .ai-summary-label::after {
      animation: none !important;
      opacity: 0;
    }
  }
}
</style>
