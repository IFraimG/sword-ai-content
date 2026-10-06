<script setup lang="ts">
import { computed } from 'vue';
import { useReelsStore } from '@/entities/reel/model/reelsStore';
import { CONTINENTS, COUNTRIES } from '@/entities/reel/model/mockData';
import type { ContinentId, CountryId } from '@/entities/reel/model/types';
import { Globe, MapPin, X, ChevronDown, Compass } from 'lucide-vue-next';

const store = useReelsStore();

const isGeoFiltered = computed(
  () => store.selectedContinent !== 'all' || store.selectedCountry !== 'all'
);

function onContinentChange(e: Event) {
  const val = (e.target as HTMLSelectElement).value as ContinentId;
  store.setContinent(val);
}

function onCountryChange(e: Event) {
  const val = (e.target as HTMLSelectElement).value as CountryId;
  store.setCountry(val);
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-2 text-xs">
    <!-- Continent Selector -->
    <div class="relative flex items-center">
      <div class="absolute left-2.5 pointer-events-none text-sword-accent">
        <Globe class="w-3.5 h-3.5" />
      </div>
      <select
        :value="store.selectedContinent"
        class="bg-sword-card/90 hover:bg-sword-border/60 border border-sword-border/80 focus:border-sword-accent rounded-xl pl-8 pr-7 py-2 text-xs font-semibold text-sword-text outline-none cursor-pointer appearance-none transition-all shadow-sm"
        @change="onContinentChange"
      >
        <option
          v-for="continent in CONTINENTS"
          :key="continent.id"
          :value="continent.id"
          class="bg-sword-surface text-sword-text"
        >
          {{ continent.label }}
        </option>
      </select>
      <div class="absolute right-2 pointer-events-none text-sword-muted">
        <ChevronDown class="w-3.5 h-3.5" />
      </div>
    </div>

    <!-- Country Selector (Dynamically populated based on continent) -->
    <div class="relative flex items-center">
      <div class="absolute left-2.5 pointer-events-none text-sword-accent">
        <MapPin class="w-3.5 h-3.5" />
      </div>
      <select
        :value="store.selectedCountry"
        class="bg-sword-card/90 hover:bg-sword-border/60 border border-sword-border/80 focus:border-sword-accent rounded-xl pl-8 pr-7 py-2 text-xs font-semibold text-sword-text outline-none cursor-pointer appearance-none transition-all shadow-sm"
        @change="onCountryChange"
      >
        <option value="all" class="bg-sword-surface text-sword-text">
          Все страны ({{ store.selectedContinent === 'all' ? 'Мир' : 'Регион' }})
        </option>
        <option
          v-for="country in store.availableCountries"
          :key="country.id"
          :value="country.id"
          class="bg-sword-surface text-sword-text"
        >
          {{ country.flag }} {{ country.label }} ({{ country.code }})
        </option>
      </select>
      <div class="absolute right-2 pointer-events-none text-sword-muted">
        <ChevronDown class="w-3.5 h-3.5" />
      </div>
    </div>

    <!-- Active Location Badge & Quick Reset -->
    <div
      v-if="isGeoFiltered"
      class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 font-medium text-[11px] animate-fade-in"
    >
      <span class="text-sword-muted">Регион:</span>
      <span class="font-bold text-sword-accent">{{ store.currentGeoLabel }}</span>
      <button
        type="button"
        class="p-0.5 ml-1 text-cyan-400 hover:text-white rounded hover:bg-cyan-800/50 transition-colors"
        title="Сбросить географический фильтр"
        @click="store.resetGeoFilter"
      >
        <X class="w-3 h-3" />
      </button>
    </div>
  </div>
</template>
