<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/entities/user/model/authStore';
import { toast } from '@/shared/lib/toast/toastService';
import {
  User,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-vue-next';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const mode = ref<'login' | 'register'>('login');

// Form state
const loginOrEmail = ref('');
const registerEmail = ref('');
const registerLogin = ref('');
const password = ref('');
const confirmPassword = ref('');
const localError = ref<string | null>(null);
const isSubmitting = ref(false);

function switchMode(newMode: 'login' | 'register') {
  mode.value = newMode;
  localError.value = null;
  authStore.error = null;
}

const displayError = computed(() => {
  return localError.value || authStore.error;
});

async function handleSubmit() {
  localError.value = null;
  authStore.error = null;

  if (mode.value === 'login') {
    if (!loginOrEmail.value.trim()) {
      localError.value = 'Пожалуйста, введите ваш логин или email';
      return;
    }
    if (!password.value) {
      localError.value = 'Пожалуйста, введите пароль';
      return;
    }

    try {
      isSubmitting.value = true;
      const user = await authStore.login(loginOrEmail.value.trim(), password.value);
      toast.success(`С возвращением, @${user.login}!`);
      const redirectPath = (route.query.redirect as string) || '/';
      router.push(redirectPath);
    } catch (err: any) {
      localError.value = err.message || 'Не удалось выполнить вход';
    } finally {
      isSubmitting.value = false;
    }
  } else {
    // Registration mode
    if (!registerEmail.value.trim()) {
      localError.value = 'Email обязателен для регистрации';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerEmail.value.trim())) {
      localError.value = 'Введите корректный email адрес';
      return;
    }
    if (!registerLogin.value.trim()) {
      localError.value = 'Логин обязателен для регистрации';
      return;
    }
    if (registerLogin.value.trim().length < 3) {
      localError.value = 'Логин должен содержать не менее 3 символов';
      return;
    }
    if (!password.value) {
      localError.value = 'Пароль обязателен для заполнения';
      return;
    }
    if (password.value.length < 6) {
      localError.value = 'Пароль должен содержать минимум 6 символов';
      return;
    }
    if (password.value !== confirmPassword.value) {
      localError.value = 'Пароли не совпадают';
      return;
    }

    try {
      isSubmitting.value = true;
      const user = await authStore.register(
        registerEmail.value.trim(),
        registerLogin.value.trim(),
        password.value
      );
      toast.success(`Аккаунт @${user.login} успешно создан!`);
      const redirectPath = (route.query.redirect as string) || '/';
      router.push(redirectPath);
    } catch (err: any) {
      localError.value = err.message || 'Ошибка при регистрации';
    } finally {
      isSubmitting.value = false;
    }
  }
}
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center p-4 bg-sword-bg text-sword-text select-none">
    <!-- Subtle Background Glow Effects -->
    <div class="fixed inset-0 pointer-events-none overflow-hidden">
      <div class="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-sword-accent/10 rounded-full blur-[140px]"></div>
      <div class="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[500px] h-[400px] bg-purple-600/10 rounded-full blur-[140px]"></div>
    </div>

    <!-- Centered Auth Card -->
    <div class="relative w-full max-w-md bg-sword-surface/90 backdrop-blur-2xl border border-sword-border/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col gap-6 animate-fade-in z-10">
      <!-- App Brand Logo Header -->
      <div class="flex flex-col items-center text-center gap-2">
        <div class="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-sword-surface to-sword-card border border-sword-border flex items-center justify-center shadow-xl mb-1">
          <svg class="w-6 h-6 text-sword-accent transform -rotate-45" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"></polyline>
            <line x1="13" y1="19" x2="19" y2="13"></line>
            <line x1="16" y1="16" x2="20" y2="20"></line>
            <line x1="19" y1="21" x2="21" y2="19"></line>
          </svg>
          <span class="absolute -top-1 -right-1 w-3 h-3 bg-tiktok-pink rounded-full"></span>
        </div>

        <div class="flex items-center gap-2">
          <h1 class="text-2xl font-black tracking-wider text-white">SWORD</h1>
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sword-accent/15 text-sword-accent border border-sword-accent/30 tracking-tight">
            V2.0
          </span>
        </div>

        <p class="text-xs text-sword-muted">
          {{ mode === 'login' ? 'Авторизуйтесь для доступа к платформе' : 'Создайте аккаунт для начала работы' }}
        </p>
      </div>

      <!-- Mode Switcher Tabs: [ Вход ] | [ Регистрация ] -->
      <div class="grid grid-cols-2 p-1 bg-sword-card/90 rounded-2xl border border-sword-border/70 text-xs font-bold">
        <button
          type="button"
          :class="[
            'py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5',
            mode === 'login'
              ? 'bg-sword-surface text-sword-accent border border-sword-border shadow-md'
              : 'text-sword-muted hover:text-sword-text'
          ]"
          @click="switchMode('login')"
        >
          <span>Вход</span>
        </button>

        <button
          type="button"
          :class="[
            'py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5',
            mode === 'register'
              ? 'bg-sword-surface text-sword-accent border border-sword-border shadow-md'
              : 'text-sword-muted hover:text-sword-text'
          ]"
          @click="switchMode('register')"
        >
          <span>Регистрация</span>
        </button>
      </div>

      <!-- Error Alert Message -->
      <div
        v-if="displayError"
        class="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-center gap-2.5 animate-shake"
      >
        <AlertCircle class="w-4 h-4 shrink-0 text-red-400" />
        <span class="flex-1">{{ displayError }}</span>
      </div>

      <!-- Auth Form -->
      <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
        <!-- ======================= LOGIN FORM ======================= -->
        <template v-if="mode === 'login'">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-sword-muted">Логин или Email</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sword-muted">
                <User class="w-4 h-4" />
              </div>
              <input
                v-model="loginOrEmail"
                type="text"
                required
                autocomplete="username"
                placeholder="Ваш логин или email"
                class="w-full pl-10 pr-4 py-2.5 bg-sword-card/80 border border-sword-border rounded-xl text-xs text-white placeholder:text-sword-muted/50 focus:outline-none focus:border-sword-accent focus:ring-1 focus:ring-sword-accent transition-all"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-sword-muted">Пароль</label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sword-muted">
                <Lock class="w-4 h-4" />
              </div>
              <input
                v-model="password"
                type="password"
                required
                autocomplete="current-password"
                placeholder="••••••••"
                class="w-full pl-10 pr-4 py-2.5 bg-sword-card/80 border border-sword-border rounded-xl text-xs text-white placeholder:text-sword-muted/50 focus:outline-none focus:border-sword-accent focus:ring-1 focus:ring-sword-accent transition-all"
              />
            </div>
          </div>
        </template>

        <!-- ===================== REGISTER FORM ===================== -->
        <template v-else>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-sword-muted">
              Email <span class="text-sword-accent">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sword-muted">
                <Mail class="w-4 h-4" />
              </div>
              <input
                v-model="registerEmail"
                type="email"
                required
                autocomplete="email"
                placeholder="name@example.com"
                class="w-full pl-10 pr-4 py-2.5 bg-sword-card/80 border border-sword-border rounded-xl text-xs text-white placeholder:text-sword-muted/50 focus:outline-none focus:border-sword-accent focus:ring-1 focus:ring-sword-accent transition-all"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-sword-muted">
              Логин <span class="text-sword-accent">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sword-muted">
                <User class="w-4 h-4" />
              </div>
              <input
                v-model="registerLogin"
                type="text"
                required
                autocomplete="username"
                placeholder="my_nickname"
                class="w-full pl-10 pr-4 py-2.5 bg-sword-card/80 border border-sword-border rounded-xl text-xs text-white placeholder:text-sword-muted/50 focus:outline-none focus:border-sword-accent focus:ring-1 focus:ring-sword-accent transition-all"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-sword-muted">
              Пароль (мин. 6 символов) <span class="text-sword-accent">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sword-muted">
                <Lock class="w-4 h-4" />
              </div>
              <input
                v-model="password"
                type="password"
                required
                autocomplete="new-password"
                placeholder="••••••••"
                class="w-full pl-10 pr-4 py-2.5 bg-sword-card/80 border border-sword-border rounded-xl text-xs text-white placeholder:text-sword-muted/50 focus:outline-none focus:border-sword-accent focus:ring-1 focus:ring-sword-accent transition-all"
              />
            </div>
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-sword-muted">
              Подтверждение пароля <span class="text-sword-accent">*</span>
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sword-muted">
                <ShieldCheck class="w-4 h-4" />
              </div>
              <input
                v-model="confirmPassword"
                type="password"
                required
                autocomplete="new-password"
                placeholder="••••••••"
                class="w-full pl-10 pr-4 py-2.5 bg-sword-card/80 border border-sword-border rounded-xl text-xs text-white placeholder:text-sword-muted/50 focus:outline-none focus:border-sword-accent focus:ring-1 focus:ring-sword-accent transition-all"
              />
            </div>
          </div>
        </template>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="isSubmitting"
          class="mt-2 w-full py-3 rounded-xl bg-sword-accent hover:bg-sword-accent/90 text-black font-extrabold text-xs tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.3)] transition-all cursor-pointer disabled:opacity-50"
        >
          <RefreshCw v-if="isSubmitting" class="w-4 h-4 animate-spin text-black" />
          <template v-else>
            <span>{{ mode === 'login' ? 'Войти в аккаунт' : 'Создать аккаунт' }}</span>
            <ArrowRight class="w-4 h-4" />
          </template>
        </button>
      </form>

      <!-- Bottom Security Tagline -->
      <div class="pt-2 border-t border-sword-border/60 text-center">
        <span class="text-[10px] text-sword-muted/60 font-mono">
          JWT Token (7 дней) • PostgreSQL Render Security
        </span>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-4px); }
  40%, 80% { transform: translateX(4px); }
}
.animate-shake {
  animation: shake 0.3s ease-in-out;
}
</style>
