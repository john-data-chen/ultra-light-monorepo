<script lang="ts">
  import { enhance } from "$app/forms";
  import { resolve } from "$app/paths";
  import { categoriesFor, categoryLabel, type TransactionType } from "$lib/categories";
  import Button from "$lib/components/ui/Button.svelte";
  import { inputClass } from "$lib/components/ui/field";
  import Field from "$lib/components/ui/Field.svelte";
  import * as m from "$lib/paraglide/messages";
  import type { TransactionFormValues } from "$lib/transaction";

  let {
    values,
    error,
    submitLabel,
    cancelHref = "/transactions"
  }: {
    values: TransactionFormValues;
    error?: string;
    submitLabel: string;
    // Cancel-link target, typed as the literal route so `resolve()` stays type-safe. Avoids
    // `Parameters<typeof resolve>[0]`, which collapses to `never` here (the generated
    // `$app/types` route union is absent under this SvelteKit setup).
    cancelHref?: "/transactions";
  } = $props();

  // Writable derived: seeded from the prop, re-set by the radios, and re-evaluated when
  // the prop changes (e.g. server echoes values back after a failed submit).
  // `bind:group` widens `type` to `string`; the ternary guarantees a valid TransactionType.
  let type = $derived(values.type === "income" ? "income" : "expense");
  let categories = $derived(categoriesFor(type as TransactionType));
</script>

<form method="POST" use:enhance class="grid gap-4">
  {#if error}
    <p class="rounded bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
      {error}
    </p>
  {/if}

  <fieldset class="grid gap-1">
    <span class="text-sm text-gray-500 dark:text-gray-400">{m.field_type()}</span>
    <div class="flex gap-4">
      <label class="flex items-center gap-2">
        <input type="radio" name="type" value="expense" bind:group={type} />
        {m.type_expense()}
      </label>
      <label class="flex items-center gap-2">
        <input type="radio" name="type" value="income" bind:group={type} />
        {m.type_income()}
      </label>
    </div>
  </fieldset>

  <Field label={m.field_category()}>
    <select name="category" class={inputClass}>
      {#each categories as category (category)}
        <option value={category} selected={category === values.category}
          >{categoryLabel(category)}</option
        >
      {/each}
    </select>
  </Field>

  <Field label={m.field_amount()}>
    <input
      type="number"
      name="amount"
      min="1"
      step="1"
      inputmode="numeric"
      value={values.amount}
      required
      class={inputClass}
    />
  </Field>

  <Field label={m.field_date()}>
    <input type="date" name="occurredOn" value={values.occurredOn} required class={inputClass} />
  </Field>

  <Field label={m.field_note()}>
    <input type="text" name="note" value={values.note} maxlength="200" class={inputClass} />
  </Field>

  <div class="flex gap-3">
    <Button type="submit" variant="primary">
      {submitLabel}
    </Button>
    <Button variant="ghost" href={resolve(cancelHref)}>
      {m.action_cancel()}
    </Button>
  </div>
</form>
