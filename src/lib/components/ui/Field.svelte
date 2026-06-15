<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    label,
    children
  }: {
    label: string;
    children: Snippet;
  } = $props();
</script>

<label class="grid gap-1">
  <span class="text-sm text-gray-500 dark:text-gray-400">{label}</span>
  {@render children()}
</label>
