<script lang="ts">
  import { categoryLabel } from "$lib/categories";
  import { formatTWD } from "$lib/money";
  import * as m from "$lib/paraglide/messages";

  interface Slice {
    category: string;
    total: number;
  }

  let { items, total }: { items: Slice[]; total: number } = $props();

  let sortAscending = $state(false);

  // Fixed palette; assigned by index. Pure CSS — no charting dependency.
  const palette = ["#0ea5e9", "#f97316", "#22c55e", "#a855f7", "#ef4444", "#eab308", "#14b8a6"];

  let itemsWithColors = $derived(
    items.map((item, i) => ({
      ...item,
      color: palette[i % palette.length]
    }))
  );

  let sortedItems = $derived.by(() => {
    return sortAscending ? [...itemsWithColors].reverse() : itemsWithColors;
  });

  let slices = $derived.by(() => {
    let acc = 0;
    return sortedItems.map((item) => {
      const start = total > 0 ? (acc / total) * 100 : 0;
      acc += item.total;
      const end = total > 0 ? (acc / total) * 100 : 0;
      const pct = total > 0 ? Math.round((item.total / total) * 100) : 0;
      return { ...item, start, end, pct };
    });
  });

  let gradient = $derived(
    slices.length > 0
      ? `conic-gradient(${slices.map((s) => `${s.color} ${s.start}% ${s.end}%`).join(", ")})`
      : "#e5e7eb"
  );
</script>

{#if items.length === 0}
  <p class="text-sm text-gray-500 dark:text-gray-400">{m.no_expenses_this_month()}</p>
{:else}
  <div class="mb-4 flex justify-end">
    <button
      type="button"
      onclick={() => (sortAscending = !sortAscending)}
      class="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
    >
      {sortAscending ? m.action_sort_asc() : m.action_sort_desc()}
      <span aria-hidden="true">{sortAscending ? "▲" : "▼"}</span>
    </button>
  </div>
  <div class="flex flex-wrap items-center gap-6">
    <div class="relative size-40 shrink-0">
      <div class="size-40 rounded-full" style:background={gradient}></div>
      <div class="absolute inset-0 m-auto size-20 rounded-full bg-white dark:bg-gray-950"></div>
    </div>
    <ul class="grid gap-2 text-sm">
      {#each slices as slice (slice.category)}
        <li class="flex items-center gap-2">
          <span class="size-3 shrink-0 rounded-sm" style:background={slice.color}></span>
          <span class="font-medium">{categoryLabel(slice.category)}</span>
          <span class="text-gray-500 dark:text-gray-400"
            >{formatTWD(slice.total)} · {slice.pct}%</span
          >
        </li>
      {/each}
    </ul>
  </div>
{/if}
