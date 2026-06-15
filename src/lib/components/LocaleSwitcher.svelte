<script lang="ts">
  import * as m from "$lib/paraglide/messages";
  import { getLocale, locales, setLocale, type Locale } from "$lib/paraglide/runtime";

  const labels: Record<Locale, string> = {
    "zh-tw": "中文",
    en: "EN"
  };
</script>

<select
  aria-label={m.locale_label()}
  value={getLocale()}
  onchange={(event) => setLocale(event.currentTarget.value as Locale)}
  class="rounded border border-gray-200 px-2 py-1 text-sm text-gray-900 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
>
  {#each locales as locale (locale)}
    <option value={locale}>{labels[locale]}</option>
  {/each}
</select>
