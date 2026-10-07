<script setup lang="ts">
import { useToast, type ToastItem } from '@/shared/lib/toast/toastService';
import {
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
  X
} from 'lucide-vue-next';

const { toasts, removeToast } = useToast();

function getToastStyles(type: ToastItem['type']) {
  switch (type) {
    case 'error':
      return {
        card: 'bg-rose-950/95 border-rose-500/60 shadow-[0_0_25px_rgba(244,63,94,0.3)] text-rose-100',
        icon: AlertCircle,
        iconClass: 'text-rose-400',
        titleClass: 'text-rose-200',
        actionClass: 'bg-rose-500 hover:bg-rose-400 text-white',
      };
    case 'success':
      return {
        card: 'bg-emerald-950/95 border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.3)] text-emerald-100',
        icon: CheckCircle2,
        iconClass: 'text-emerald-400',
        titleClass: 'text-emerald-200',
        actionClass: 'bg-emerald-500 hover:bg-emerald-400 text-black',
      };
    case 'warning':
      return {
        card: 'bg-amber-950/95 border-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.3)] text-amber-100',
        icon: AlertTriangle,
        iconClass: 'text-amber-400',
        titleClass: 'text-amber-200',
        actionClass: 'bg-amber-500 hover:bg-amber-400 text-black',
      };
    case 'info':
    default:
      return {
        card: 'bg-slate-900/95 border-cyan-500/60 shadow-[0_0_25px_rgba(6,182,212,0.3)] text-cyan-100',
        icon: Info,
        iconClass: 'text-cyan-400',
        titleClass: 'text-cyan-200',
        actionClass: 'bg-cyan-500 hover:bg-cyan-400 text-black',
      };
  }
}
</script>

<template>
  <div
    class="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm sm:max-w-md w-full pointer-events-none px-4"
    aria-live="assertive"
  >
    <transition-group name="toast">
      <div
        v-for="item in toasts"
        :key="item.id"
        :class="[
          'pointer-events-auto flex items-start gap-3.5 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all',
          getToastStyles(item.type).card
        ]"
      >
        <!-- Icon -->
        <div class="flex-shrink-0 mt-0.5">
          <component
            :is="getToastStyles(item.type).icon"
            :class="['w-5 h-5', getToastStyles(item.type).iconClass]"
          />
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <div
            v-if="item.title"
            :class="['text-xs font-extrabold uppercase tracking-wider mb-1', getToastStyles(item.type).titleClass]"
          >
            {{ item.title }}
          </div>
          <p class="text-xs leading-relaxed break-words font-medium">
            {{ item.message }}
          </p>

          <!-- Optional Action Button -->
          <div v-if="item.actionLabel && item.onAction" class="mt-2.5">
            <button
              type="button"
              :class="[
                'text-[11px] font-bold py-1 px-3 rounded-lg transition-all cursor-pointer shadow-md',
                getToastStyles(item.type).actionClass
              ]"
              @click="() => { item.onAction?.(); removeToast(item.id); }"
            >
              {{ item.actionLabel }}
            </button>
          </div>
        </div>

        <!-- Close button -->
        <button
          type="button"
          class="flex-shrink-0 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          title="Закрыть уведомление"
          @click="removeToast(item.id)"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}
</style>
