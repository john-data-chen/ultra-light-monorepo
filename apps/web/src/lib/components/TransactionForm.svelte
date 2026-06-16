<script lang="ts">
  import { enhance } from "$app/forms";
  import { resolve } from "$app/paths";
  import { categoriesFor, categoryLabel, type TransactionType } from "$lib/categories";
  import * as m from "$lib/paraglide/messages";
  import type { TransactionFormValues } from "$lib/transaction";
  import { Button } from "@ultra-light/ui/button";
  import * as Field from "@ultra-light/ui/field";
  import { Input } from "@ultra-light/ui/input";

  let {
    values,
    error,
    submitLabel,
    cancelHref = "/transactions"
  }: {
    values: TransactionFormValues;
    error?: string;
    submitLabel: string;
    cancelHref?: "/transactions";
  } = $props();

  let type = $derived(values.type === "income" ? "income" : "expense");
  let categories = $derived(categoriesFor(type as TransactionType));
</script>

<form method="POST" use:enhance class="flex flex-col gap-4">
  {#if error}
    <p class="rounded bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
      {error}
    </p>
  {/if}

  <Field.FieldSet>
    <Field.FieldLegend variant="label">{m.field_type()}</Field.FieldLegend>
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
  </Field.FieldSet>

  <Field.Field>
    <Field.FieldLabel>{m.field_category()}</Field.FieldLabel>
    <select
      name="category"
      class="border-input bg-background flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-colors"
    >
      {#each categories as category (category)}
        <option value={category} selected={category === values.category}
          >{categoryLabel(category)}</option
        >
      {/each}
    </select>
  </Field.Field>

  <Field.Field>
    <Field.FieldLabel>{m.field_amount()}</Field.FieldLabel>
    <Input
      type="number"
      name="amount"
      min="1"
      step="1"
      inputmode="numeric"
      value={values.amount}
      required
    />
  </Field.Field>

  <Field.Field>
    <Field.FieldLabel>{m.field_date()}</Field.FieldLabel>
    <Input type="date" name="occurredOn" value={values.occurredOn} required />
  </Field.Field>

  <Field.Field>
    <Field.FieldLabel>{m.field_note()}</Field.FieldLabel>
    <Input type="text" name="note" value={values.note} maxlength={200} />
  </Field.Field>

  <div class="flex gap-3">
    <Button type="submit">
      {submitLabel}
    </Button>
    <Button variant="ghost" href={resolve(cancelHref)}>
      {m.action_cancel()}
    </Button>
  </div>
</form>
