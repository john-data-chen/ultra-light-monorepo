<script lang="ts">
  import * as m from "$lib/paraglide/messages";
  import { THEME_ORDER, type ThemePreference } from "$lib/theme";
  import { theme } from "$lib/theme.svelte";
  import * as Select from "@ultra-light/ui/select";

  const labels: Record<ThemePreference, string> = {
    dark: m.theme_dark(),
    light: m.theme_light(),
    system: m.theme_system()
  };

  function handleChange(newValue: string | undefined) {
    if (newValue) {
      theme.set(newValue as ThemePreference);
    }
  }
</script>

<Select.Root type="single" value={theme.preference} onValueChange={handleChange}>
  <Select.Trigger class="h-8 w-auto px-2 text-sm" aria-label={m.theme_label()}>
    {labels[theme.preference]}
  </Select.Trigger>
  <Select.Content>
    <Select.Group>
      {#each THEME_ORDER as option (option)}
        <Select.Item value={option}>{labels[option]}</Select.Item>
      {/each}
    </Select.Group>
  </Select.Content>
</Select.Root>
