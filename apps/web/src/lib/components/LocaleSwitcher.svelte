<script lang="ts">
  import * as Select from "$lib/components/ui/select";
  import * as m from "$lib/paraglide/messages";
  import { getLocale, locales, setLocale, type Locale } from "$lib/paraglide/runtime";

  const labels: Record<Locale, string> = {
    "zh-tw": "中文",
    en: "EN"
  };

  let value = $state(getLocale());

  function handleChange(newValue: string | undefined) {
    if (newValue) {
      value = newValue as Locale;
      setLocale(newValue as Locale);
    }
  }
</script>

<Select.Root type="single" {value} onValueChange={handleChange}>
  <Select.Trigger class="h-8 w-auto px-2 text-sm" aria-label={m.locale_label()} />
  <Select.Content>
    <Select.Group>
      {#each locales as locale (locale)}
        <Select.Item value={locale}>{labels[locale]}</Select.Item>
      {/each}
    </Select.Group>
  </Select.Content>
</Select.Root>
