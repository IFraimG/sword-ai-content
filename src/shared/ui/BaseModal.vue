<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';

interface Props {
  modelValue: boolean;
  title?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  maxWidth: 'xl',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'close'): void;
}>();

function close() {
  emit('update:modelValue', false);
  emit('close');
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && props.modelValue) {
    close();
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }
);
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      >
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
          @click="close"
        ></div>

        <!-- Modal panel -->
        <div
          :class="[
            'relative w-full rounded-2xl bg-sword-surface border border-sword-border p-6 shadow-2xl z-10 transition-all text-sword-text max-h-[90vh] overflow-y-auto',
            {
              'max-w-sm': maxWidth === 'sm',
              'max-w-md': maxWidth === 'md',
              'max-w-lg': maxWidth === 'lg',
              'max-w-xl': maxWidth === 'xl',
              'max-w-2xl': maxWidth === '2xl',
              'max-w-3xl': maxWidth === '3xl',
              'max-w-4xl': maxWidth === '4xl',
            }
          ]"
        >
          <!-- Header -->
          <div v-if="title || $slots.header" class="flex items-center justify-between pb-4 mb-4 border-b border-sword-border/60">
            <slot name="header">
              <h3 class="text-lg font-bold text-sword-text tracking-wide">{{ title }}</h3>
            </slot>
            <button
              type="button"
              class="rounded-lg p-1.5 text-sword-muted hover:text-sword-text hover:bg-sword-card transition-colors"
              @click="close"
            >
              <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div>
            <slot />
          </div>

          <!-- Footer -->
          <div v-if="$slots.footer" class="mt-6 pt-4 border-t border-sword-border/60 flex items-center justify-end gap-3">
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
