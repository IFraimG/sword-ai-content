<script setup lang="ts">
interface Props {
  icon?: string;
  label: string;
  value: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: string;
}

withDefaults(defineProps<Props>(), {
  trend: 'neutral',
  color: 'text-sword-text',
});
</script>

<template>
  <div class="flex items-center gap-1.5 px-2 py-1 rounded-md bg-sword-surface/60 border border-sword-border/40 text-xs font-medium">
    <slot name="icon">
      <span v-if="trend === 'up'" class="text-emerald-400 font-bold">▲</span>
      <span v-else-if="trend === 'down'" class="text-rose-400 font-bold">▼</span>
    </slot>
    <span class="text-sword-muted text-[11px]">{{ label }}:</span>
    <span :class="['font-semibold', color]">{{ value }}</span>
  </div>
</template>
