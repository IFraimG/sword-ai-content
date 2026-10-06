<script setup lang="ts">
interface Props {
  modelValue: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}

withDefaults(defineProps<Props>(), {
  placeholder: '',
  type: 'text',
  disabled: false,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'clear'): void;
}>();

function onInput(e: Event) {
  const target = e.target as HTMLInputElement;
  emit('update:modelValue', target.value);
}
</script>

<template>
  <div class="relative flex items-center w-full">
    <div v-if="$slots.prefix" class="absolute left-3.5 flex items-center pointer-events-none text-sword-muted">
      <slot name="prefix" />
    </div>

    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[
        'w-full bg-sword-surface/80 border border-sword-border/80 rounded-xl py-2.5 text-sm text-sword-text placeholder:text-sword-muted/60 transition-all duration-200 outline-none focus:border-sword-accent focus:ring-1 focus:ring-sword-accent focus:bg-sword-card/80',
        $slots.prefix ? 'pl-10' : 'pl-4',
        modelValue ? 'pr-9' : 'pr-4',
        disabled ? 'opacity-50 cursor-not-allowed' : '',
      ]"
      @input="onInput"
    />

    <button
      v-if="modelValue"
      type="button"
      class="absolute right-3 p-1 text-sword-muted hover:text-sword-text rounded transition-colors"
      @click="emit('update:modelValue', ''); emit('clear')"
    >
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
  </div>
</template>
