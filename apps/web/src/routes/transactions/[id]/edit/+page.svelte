<script lang="ts">
  import TransactionForm from "$lib/components/TransactionForm.svelte";
  import { pageTitle } from "$lib/constants";
  import * as m from "$lib/paraglide/messages";

  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();

  let values = $derived({
    type: form?.values?.type ?? data.transaction.type,
    category: form?.values?.category ?? data.transaction.category,
    amount: form?.values?.amount ?? String(data.transaction.amount),
    occurredOn: form?.values?.occurredOn ?? data.transaction.occurredOn,
    note: form?.values?.note ?? data.transaction.note ?? ""
  });
</script>

<svelte:head><title>{pageTitle(m.edit_transaction_title())}</title></svelte:head>

<section class="grid max-w-md gap-6">
  <h1 class="text-xl font-bold">{m.edit_transaction_title()}</h1>
  <TransactionForm {values} error={form?.error} submitLabel={m.save_changes()} />
</section>
