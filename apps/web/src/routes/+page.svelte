<script lang="ts">
  import CategoryChart from "$lib/components/CategoryChart.svelte";
  import { pageTitle } from "$lib/constants";
  import { formatTWD } from "$lib/money";
  import * as m from "$lib/paraglide/messages";
  import * as Card from "@ultra-light/ui/card";
  import { Input } from "@ultra-light/ui/input";

  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<svelte:head><title>{pageTitle(m.nav_dashboard())}</title></svelte:head>

<section class="flex flex-col gap-6">
  <div class="flex items-center justify-between gap-4">
    <h1 class="text-xl font-bold">{m.nav_dashboard()}</h1>
    <form method="GET">
      <Input
        type="month"
        name="month"
        value={data.month}
        onchange={(event) => event.currentTarget.form?.requestSubmit()}
        class="w-auto text-sm"
      />
    </form>
  </div>

  <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
    <Card.Root class="p-4">
      <Card.Content class="p-0">
        <p class="text-muted-foreground text-sm">{m.type_income()}</p>
        <p class="text-2xl font-bold text-green-600 dark:text-green-400">
          {formatTWD(data.stats.income)}
        </p>
      </Card.Content>
    </Card.Root>
    <Card.Root class="p-4">
      <Card.Content class="p-0">
        <p class="text-muted-foreground text-sm">{m.type_expense()}</p>
        <p class="text-2xl font-bold text-red-600 dark:text-red-400">
          {formatTWD(data.stats.expense)}
        </p>
      </Card.Content>
    </Card.Root>
    <Card.Root class="p-4">
      <Card.Content class="p-0">
        <p class="text-muted-foreground text-sm">{m.stat_balance()}</p>
        <p
          class={[
            "text-2xl font-bold",
            data.stats.balance < 0 ? "text-red-600 dark:text-red-400" : "text-foreground"
          ]}
        >
          {formatTWD(data.stats.balance)}
        </p>
      </Card.Content>
    </Card.Root>
  </div>

  <Card.Root class="p-4">
    <Card.Content class="p-0">
      <h2 class="mb-4 font-semibold">{m.expenses_by_category()}</h2>
      <CategoryChart items={data.stats.expenseByCategory} total={data.stats.expense} />
    </Card.Content>
  </Card.Root>
</section>
