<script lang="ts">
  import CategoryChart from "$lib/components/CategoryChart.svelte";
  import { pageTitle } from "$lib/constants";
  import { formatTWD } from "$lib/money";
  import * as m from "$lib/paraglide/messages";

  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<svelte:head><title>{pageTitle(m.nav_dashboard())}</title></svelte:head>

<section class="grid gap-6">
  <div class="flex items-center justify-between gap-4">
    <h1 class="text-xl font-bold">{m.nav_dashboard()}</h1>
    <form method="GET">
      <input
        type="month"
        name="month"
        value={data.month}
        onchange={(event) => event.currentTarget.form?.requestSubmit()}
        class="rounded border border-gray-300 p-2 text-sm text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      />
    </form>
  </div>

  <div class="grid gap-4 sm:grid-cols-3">
    <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <p class="text-sm text-gray-500 dark:text-gray-400">{m.type_income()}</p>
      <p class="text-2xl font-bold text-green-600 dark:text-green-400">
        {formatTWD(data.stats.income)}
      </p>
    </div>
    <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <p class="text-sm text-gray-500 dark:text-gray-400">{m.type_expense()}</p>
      <p class="text-2xl font-bold text-red-600 dark:text-red-400">
        {formatTWD(data.stats.expense)}
      </p>
    </div>
    <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <p class="text-sm text-gray-500 dark:text-gray-400">{m.stat_balance()}</p>
      <p
        class={[
          "text-2xl font-bold",
          data.stats.balance < 0
            ? "text-red-600 dark:text-red-400"
            : "text-gray-900 dark:text-gray-100"
        ]}
      >
        {formatTWD(data.stats.balance)}
      </p>
    </div>
  </div>

  <div class="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
    <h2 class="mb-4 font-semibold">{m.expenses_by_category()}</h2>
    <CategoryChart items={data.stats.expenseByCategory} total={data.stats.expense} />
  </div>
</section>
