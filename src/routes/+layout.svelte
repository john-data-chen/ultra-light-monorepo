<script lang="ts">
  import "./layout.css";

  import { dev } from "$app/environment";
  import { enhance } from "$app/forms";
  import { resolve } from "$app/paths";
  import favicon from "$lib/assets/favicon.svg";
  import LocaleSwitcher from "$lib/components/LocaleSwitcher.svelte";
  import ThemeToggle from "$lib/components/ThemeToggle.svelte";
  import Button from "$lib/components/ui/Button.svelte";
  import * as m from "$lib/paraglide/messages";
  import { injectAnalytics } from "@vercel/analytics/sveltekit";

  import type { LayoutProps } from "./$types";

  injectAnalytics({ mode: dev ? "development" : "production" });

  let { children, data }: LayoutProps = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

{#if data.user}
  <header class="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
    <div
      class="mx-auto flex max-w-3xl flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
    >
      <nav class="flex w-full flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium sm:w-auto">
        <a href={resolve("/")} class="whitespace-nowrap hover:underline">{m.nav_dashboard()}</a>
        <a href={resolve("/transactions")} class="whitespace-nowrap hover:underline">
          {m.nav_transactions()}
        </a>
        {#if data.user.role === "admin"}
          <a href={resolve("/admin")} class="whitespace-nowrap hover:underline">{m.nav_admin()}</a>
          <a href={resolve("/api/docs")} class="whitespace-nowrap text-gray-500 hover:underline"
            >{m.nav_api_docs()}</a
          >
        {/if}
      </nav>
      <div
        class="flex w-full flex-wrap items-center gap-2 text-sm sm:w-auto sm:justify-end sm:gap-3"
      >
        <LocaleSwitcher />
        <ThemeToggle />
        <span aria-hidden="true" class="shrink-0">{data.user.avatar}</span>
        <span class="font-medium whitespace-nowrap">{data.user.name}</span>
        <form method="POST" action="/logout" class="shrink-0" use:enhance>
          <Button type="submit" variant="secondary" class="px-3 py-1 whitespace-nowrap">
            {m.sign_out()}
          </Button>
        </form>
      </div>
    </div>
  </header>
  <main class="mx-auto max-w-3xl p-4">{@render children()}</main>
{:else}
  <div class="fixed top-4 right-4 z-10 flex gap-2"><LocaleSwitcher /><ThemeToggle /></div>
  {@render children()}
{/if}
