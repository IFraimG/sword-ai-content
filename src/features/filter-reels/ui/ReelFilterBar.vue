<script setup lang="ts">
import { computed } from 'vue';
import { useReelsStore } from '@/entities/reel/model/reelsStore';
import { NICHES } from '@/entities/reel/model/mockData';
import type { Niche, SortBy } from '@/entities/reel/model/types';
import BaseInput from '@/shared/ui/BaseInput.vue';
import {
  Search,
  SlidersHorizontal,
  Flame,
  Cpu,
  Laugh,
  TrendingUp,
  Dumbbell,
  Music,
  Utensils,
  Plane,
  Sparkles,
  Coffee,
  Check
} from 'lucide-vue-next';

const store = useReelsStore();

const nicheIcons: Record<string, any> = {
  Flame,
  Cpu,
  Laugh,
  TrendingUp,
  Dumbbell,
  Music,
  Utensils,
  Plane,
  Sparkles,
  Coffee,
};

const sortOptions: { id: SortBy; label: string }[] = [
  { id: 'rank', label: 'По рангу тренда' },
  { id: 'views', label: 'По просмотрам' },
  { id: 'velocity', label: 'По росту (Velocity)' },
  { id: 'engagement', label: 'По вовлеченности (ER)' },
  { id: 'recent', label: 'По новизне' },
];

function setNiche(niche: Niche) {
  store.selectedNiche = niche;
}

function setSort(sort: SortBy) {
  store.sortBy = sort;
}
</script>

<template>
  <div class="flex flex-col gap-3 w-full bg-sword-surface/90 border border-sword-border/60 rounded-2xl p-4 shadow-xl backdrop-blur-md">
    <!-- Top Row: Search and Sort controls -->
    <div class="flex flex-col sm:flex-row items-center gap-3">
      <!-- Search Input -->
      <div class="w-full sm:flex-1">
        <BaseInput
          v-model="store.searchQuery"
          placeholder="Поиск по названию, автору, звуку, хештегам (#ai, #мемы)..."
        >
          <template #prefix>
            <Search class="w-4 h-4 text-cyan-400" />
          </template>
        </BaseInput>
      </div>

      <!-- Sort Dropdown / Selector -->
      <div class="flex items-center gap-2 w-full sm:w-auto">
        <div class="flex items-center gap-1.5 text-xs text-sword-muted whitespace-nowrap pl-1">
          <SlidersHorizontal class="w-3.5 h-3.5 text-sword-accent" />
          <span>Сортировка:</span>
        </div>
        <select
          :value="store.sortBy"
          class="bg-sword-card border border-sword-border rounded-xl px-3 py-2 text-xs font-semibold text-sword-text outline-none focus:border-sword-accent cursor-pointer w-full sm:w-auto transition-colors"
          @change="(e) => setSort((e.target as HTMLSelectElement).value as SortBy)"
        >
          <option
            v-for="opt in sortOptions"
            :key="opt.id"
            :value="opt.id"
            class="bg-sword-surface text-sword-text"
          >
            {{ opt.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Bottom Row: Niche Categories Chips -->
    <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1">
      <button
        v-for="niche in NICHES"
        :key="niche.id"
        type="button"
        :class="[
          'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 select-none cursor-pointer',
          store.selectedNiche === niche.id
            ? 'bg-sword-accent text-black shadow-[0_0_12px_rgba(0,240,255,0.4)] scale-[1.02]'
            : 'bg-sword-card/80 text-sword-muted hover:text-sword-text hover:bg-sword-border/60 border border-sword-border/40'
        ]"
        @click="setNiche(niche.id)"
      >
        <component
          :is="nicheIcons[niche.icon] || Flame"
          :class="[
            'w-3.5 h-3.5',
            store.selectedNiche === niche.id ? 'text-black' : 'text-sword-accent'
          ]"
        />
        <span>{{ niche.label }}</span>
        <span
          v-if="store.selectedNiche === niche.id"
          class="w-1.5 h-1.5 rounded-full bg-black ml-0.5"
        ></span>
      </button>
    </div>
  </div>
</template>
