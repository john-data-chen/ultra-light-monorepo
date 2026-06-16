<script lang="ts">
  import TransactionForm from "$lib/components/TransactionForm.svelte";
  import { pageTitle } from "$lib/constants";
  import * as m from "$lib/paraglide/messages";

  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();

  let values = $derived({
    type: form?.values?.type ?? "expense",
    category: form?.values?.category ?? "",
    amount: form?.values?.amount ?? "",
    occurredOn: form?.values?.occurredOn ?? data.today,
    note: form?.values?.note ?? ""
  });
</script>

<svelte:head><title>{pageTitle(m.new_transaction_title())}</title></svelte:head>

<section class="grid max-w-md gap-6">
  <h1 class="text-xl font-bold">{m.new_transaction_title()}</h1>
  <TransactionForm {values} error={form?.error} submitLabel={m.add_transaction()} />
</section>
