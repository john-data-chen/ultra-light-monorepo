<script lang="ts">
  import * as m from "$lib/paraglide/messages";
  import { THEME_ORDER, type ThemePreference } from "$lib/theme";
  import { theme } from "$lib/theme.svelte";

  const labels: Record<ThemePreference, string> = {
    dark: m.theme_dark(),
    light: m.theme_light(),
    system: m.theme_system()
  };
</script>

<select
  aria-label={m.theme_label()}
  value={theme.preference}
  onchange={(event) => theme.set(event.currentTarget.value as ThemePreference)}
  class="rounded border border-gray-200 px-2 py-1 text-sm text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
>
  {#each THEME_ORDER as option (option)}
    <option value={option}>{labels[option]}</option>
  {/each}
</select>
