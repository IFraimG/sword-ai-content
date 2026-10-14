<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/entities/user/model/authStore';
import { useChatStore } from '@/entities/chat/model/chatStore';
import { getApiBaseUrl } from '@/shared/api/reelsApi';
import {
  Users,
  Search,
  Calendar,
  Mail,
  Fingerprint,
  RefreshCw,
  Sparkles,
  UserCheck,
  X,
  MessageSquare,
} from 'lucide-vue-next';

interface RegisteredUser {
  id: string;
  login: string;
  email: string;
  created_at_formatted: string;
  created_at?: string;
}

const router = useRouter();
const authStore = useAuthStore();
const chatStore = useChatStore();
const startingChatUserId = ref<string | null>(null);

async function startChatWithUser(targetUser: RegisteredUser) {
  startingChatUserId.value = targetUser.id;
  try {
    const chat = await chatStore.openDirectChat(targetUser.id);
    if (chat) {
      router.push({ path: '/chats', query: { id: chat.id } });
    }
  } catch (err: any) {
    console.error('Failed to start chat:', err);
  } finally {
    startingChatUserId.value = null;
  }
}

const users = ref<RegisteredUser[]>([]);
const searchQuery = ref('');
const isLoading = ref(false);
const error = ref<string | null>(null);

async function loadUsers(query = searchQuery.value) {
  isLoading.value = true;
  error.value = null;

  try {
    const apiBase = getApiBaseUrl();
    const url = new URL(`${apiBase}/api/users`);
    if (query.trim()) {
      url.searchParams.set('query', query.trim());
    }

    const res = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!res.ok) {
      throw new Error('Не удалось загрузить список пользователей');
    }

    const data = await res.json();
    users.value = data.users || [];
  } catch (err: any) {
    error.value = err.message || 'Ошибка соединения с сервером';
  } finally {
    isLoading.value = false;
  }
}

// Filtered users computed (local filtering or instant feedback)
const filteredUsers = computed(() => {
  if (!searchQuery.value.trim()) return users.value;
  const q = searchQuery.value.trim().toLowerCase().replace(/^@/, '');
  return users.value.filter(
    (u) =>
      u.login.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
  );
});

function handleSearchInput() {
  // If needed, we can also query the server debounced, or filter reactively locally
  loadUsers(searchQuery.value);
}

function clearSearch() {
  searchQuery.value = '';
  loadUsers('');
}

// Generate deterministic avatar gradient colors based on login
function getAvatarGradient(login: string) {
  const gradients = [
    'from-cyan-500 to-blue-600',
    'from-purple-500 to-pink-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-red-600',
    'from-violet-500 to-purple-600',
  ];
  let hash = 0;
  for (let i = 0; i < login.length; i++) {
    hash = login.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % gradients.length;
  return gradients[index];
}

onMounted(() => {
  loadUsers();
});
</script>

<template>
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-6">
    <!-- Hero / Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-sword-border/60">
      <div class="flex items-center gap-3.5">
        <div class="w-12 h-12 rounded-2xl bg-sword-surface border border-sword-border flex items-center justify-center text-sword-accent shadow-lg shadow-sword-accent/5">
          <Users class="w-6 h-6 text-sword-accent" />
        </div>
        <div>
          <div class="flex items-center gap-2.5">
            <h1 class="text-2xl font-black text-white tracking-tight">Пользователи платформы</h1>
            <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-sword-card text-sword-accent border border-sword-border shadow-sm">
              {{ users.length }}
            </span>
          </div>
          <p class="text-xs text-sword-muted mt-0.5">
            Список всех зарегистрированных участников системы с поиском по логину
          </p>
        </div>
      </div>

      <!-- Refresh Button -->
      <div class="flex items-center gap-2">
        <button
          type="button"
          :disabled="isLoading"
          class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-sword-card hover:bg-sword-surface border border-sword-border hover:border-sword-accent/50 text-sword-muted hover:text-white transition-all cursor-pointer disabled:opacity-50"
          title="Обновить список пользователей"
          @click="loadUsers(searchQuery)"
        >
          <RefreshCw :class="['w-3.5 h-3.5 text-sword-accent', isLoading ? 'animate-spin' : '']" />
          <span>Обновить</span>
        </button>
      </div>
    </div>

    <!-- Search Bar -->
    <div class="relative w-full max-w-xl">
      <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-sword-muted">
        <Search class="w-4 h-4" />
      </div>
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Поиск пользователей по логину (например: @alex)..."
        class="w-full pl-10 pr-10 py-3 bg-sword-surface/80 border border-sword-border/80 rounded-2xl text-xs text-white placeholder:text-sword-muted/60 focus:outline-none focus:border-sword-accent focus:ring-1 focus:ring-sword-accent shadow-md transition-all"
        @input="handleSearchInput"
      />
      <button
        v-if="searchQuery"
        type="button"
        class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-sword-muted hover:text-white transition-colors cursor-pointer"
        @click="clearSearch"
      >
        <X class="w-4 h-4" />
      </button>
    </div>

    <!-- Error State -->
    <div
      v-if="error"
      class="p-4 rounded-2xl bg-red-950/30 border border-red-500/40 text-red-300 text-xs flex items-center justify-between gap-3"
    >
      <span>{{ error }}</span>
      <button
        type="button"
        class="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-white font-bold transition-colors cursor-pointer"
        @click="loadUsers(searchQuery)"
      >
        Повторить
      </button>
    </div>

    <!-- Loading Skeleton State -->
    <div
      v-if="isLoading && users.length === 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <div
        v-for="i in 6"
        :key="i"
        class="p-5 rounded-2xl bg-sword-surface/40 border border-sword-border/40 animate-pulse flex flex-col gap-3"
      >
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-sword-card"></div>
          <div class="flex-1 flex flex-col gap-1.5">
            <div class="w-24 h-4 bg-sword-card rounded"></div>
            <div class="w-32 h-3 bg-sword-card rounded"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Users Grid -->
    <div
      v-else-if="filteredUsers.length > 0"
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      <div
        v-for="u in filteredUsers"
        :key="u.id"
        class="group p-5 rounded-2xl bg-sword-surface/80 border border-sword-border/70 hover:border-sword-accent/50 shadow-md hover:shadow-[0_0_20px_rgba(0,240,255,0.1)] transition-all flex flex-col justify-between gap-4"
      >
        <!-- Top: Avatar & User Info -->
        <div class="flex items-start gap-3.5">
          <!-- User Avatar with Initials -->
          <div
            :class="[
              'w-11 h-11 rounded-2xl bg-gradient-to-br flex items-center justify-center text-white font-black text-sm shadow-md shrink-0 border border-white/10 uppercase',
              getAvatarGradient(u.login)
            ]"
          >
            {{ u.login.substring(0, 2) }}
          </div>

          <div class="flex flex-col min-w-0 flex-1">
            <div class="flex items-center gap-2">
              <span class="text-sm font-extrabold text-white truncate group-hover:text-sword-accent transition-colors">
                @{{ u.login }}
              </span>

              <!-- Current User Badge -->
              <span
                v-if="authStore.user?.id === u.id"
                class="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sword-accent text-black uppercase tracking-tight shrink-0 shadow-sm"
              >
                Вы
              </span>
            </div>

            <!-- Email -->
            <div class="flex items-center gap-1.5 text-xs text-sword-muted mt-0.5 truncate">
              <Mail class="w-3.5 h-3.5 shrink-0 text-sword-muted/60" />
              <span class="truncate">{{ u.email }}</span>
            </div>
          </div>
        </div>

        <!-- Bottom: User ID & Creation Date (DD:MM:YYYY) -->
        <div class="pt-3 border-t border-sword-border/60 flex items-center justify-between text-[11px] text-sword-muted font-mono">
          <!-- Date created in exact format DD:MM:YYYY -->
          <div class="flex items-center gap-1.5" title="Дата создания аккаунта">
            <Calendar class="w-3.5 h-3.5 text-cyan-400" />
            <span class="text-slate-300 font-semibold">{{ u.created_at_formatted }}</span>
          </div>

          <!-- User ID Badge -->
          <div class="flex items-center gap-1 text-[10px] text-sword-muted/70" :title="`ID: ${u.id}`">
            <Fingerprint class="w-3 h-3 text-sword-muted/50" />
            <span>{{ u.id.length > 10 ? u.id.substring(0, 8) + '...' : u.id }}</span>
          </div>
        </div>

        <!-- Action: Write Message -->
        <button
          v-if="authStore.user?.id !== u.id"
          type="button"
          :disabled="startingChatUserId === u.id"
          class="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold bg-sword-card hover:bg-sword-accent hover:text-black text-white border border-sword-border hover:border-sword-accent transition-all cursor-pointer shadow-sm group/btn disabled:opacity-50"
          @click="startChatWithUser(u)"
        >
          <MessageSquare class="w-3.5 h-3.5 text-sword-accent group-hover/btn:text-black transition-colors" />
          <span>{{ startingChatUserId === u.id ? 'Открытие диалога...' : 'Написать сообщение' }}</span>
        </button>
      </div>
    </div>

    <!-- Empty Search State -->
    <div
      v-else
      class="py-16 text-center flex flex-col items-center justify-center gap-3 bg-sword-surface/40 rounded-3xl border border-sword-border/60"
    >
      <div class="w-12 h-12 rounded-2xl bg-sword-card flex items-center justify-center text-sword-muted">
        <Search class="w-6 h-6" />
      </div>
      <h3 class="text-base font-bold text-white">Пользователи не найдены</h3>
      <p class="text-xs text-sword-muted max-w-sm">
        По запросу «{{ searchQuery }}» нет совпадений. Попробуйте изменить поисковый запрос.
      </p>
      <button
        type="button"
        class="mt-2 px-4 py-2 rounded-xl bg-sword-card hover:bg-sword-card/80 text-xs font-semibold text-sword-accent border border-sword-border transition-colors cursor-pointer"
        @click="clearSearch"
      >
        Сбросить поиск
      </button>
    </div>
  </div>
</template>
