<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'cyan' | 'pink' | 'purple' | 'amber' | 'emerald' | 'gray';
  size?: 'sm' | 'md';
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'cyan',
  size: 'md',
});

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'pink':
      return 'bg-tiktok-pink/15 text-tiktok-pink border-tiktok-pink/30';
    case 'purple':
      return 'bg-purple-500/15 text-purple-300 border-purple-500/30';
    case 'amber':
      return 'bg-amber-500/15 text-amber-300 border-amber-500/30';
    case 'emerald':
      return 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30';
    case 'gray':
      return 'bg-slate-700/30 text-slate-300 border-slate-700/50';
    case 'cyan':
    default:
      return 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30';
  }
});

const sizeClasses = computed(() => {
  return props.size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';
});
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1 font-medium rounded-full border backdrop-blur-sm',
      variantClasses,
      sizeClasses,
    ]"
  >
    <slot />
  </span>
</template>
