<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'tiktok' | 'insta' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'secondary',
  size: 'md',
  disabled: false,
  loading: false,
});

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void;
}>();

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-sword-accent text-black font-semibold hover:bg-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.3)] hover:shadow-[0_0_20px_rgba(0,240,255,0.5)] border border-cyan-400';
    case 'secondary':
      return 'bg-sword-card text-sword-text hover:bg-sword-border border border-sword-border/60 hover:border-sword-accent/50';
    case 'outline':
      return 'bg-transparent text-sword-text border border-sword-border hover:border-sword-accent hover:text-sword-accent';
    case 'ghost':
      return 'bg-transparent text-sword-muted hover:text-sword-text hover:bg-sword-surface';
    case 'tiktok':
      return 'bg-tiktok-pink text-white hover:bg-rose-600 shadow-[0_0_15px_rgba(254,44,85,0.3)]';
    case 'insta':
      return 'bg-gradient-to-r from-insta-purple via-insta-pink to-insta-orange text-white hover:opacity-95 shadow-[0_0_15px_rgba(253,29,29,0.3)]';
    case 'danger':
      return 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30';
    default:
      return 'bg-sword-card text-sword-text';
  }
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-2.5 py-1.5 text-xs rounded-lg gap-1.5';
    case 'lg':
      return 'px-5 py-3 text-base rounded-xl gap-2.5';
    case 'md':
    default:
      return 'px-3.5 py-2 text-sm rounded-lg gap-2';
  }
});
</script>

<template>
  <button
    type="button"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center font-medium transition-all duration-200 select-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
      variantClasses,
      sizeClasses,
    ]"
    @click="emit('click', $event)"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
    </svg>
    <slot />
  </button>
</template>
