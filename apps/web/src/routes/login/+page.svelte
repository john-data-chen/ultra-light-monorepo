<script lang="ts">
  import { pageTitle } from "$lib/constants";
  import * as m from "$lib/paraglide/messages";
  import { Button } from "@ultra-light/ui/button";
  import { Input } from "@ultra-light/ui/input";

  import type { PageProps } from "./$types";

  let { data, form }: PageProps = $props();
</script>

<svelte:head>
  <title>{pageTitle(m.sign_in())}</title>
  <meta name="description" content={m.seo_description()} />
  <link rel="canonical" href="https://sveltekit-starter-kit.vercel.app/login" />
  <meta name="theme-color" content="#0f172a" />

  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://sveltekit-starter-kit.vercel.app/login" />
  <meta property="og:title" content={pageTitle(m.sign_in())} />
  <meta property="og:description" content={m.seo_description()} />

  <!-- Twitter -->
  <meta name="twitter:card" content="summary" />
  <meta name="twitter:url" content="https://sveltekit-starter-kit.vercel.app/login" />
  <meta name="twitter:title" content={pageTitle(m.sign_in())} />
  <meta name="twitter:description" content={m.seo_description()} />

  <!-- JSON-LD WebApplication schema -->
  <!-- eslint-disable-next-line svelte/no-at-html-tags -->
  {@html "<" +
    'script type="application/ld+json">' +
    `
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Expense Tracker",
      "url": "https://sveltekit-starter-kit.vercel.app",
      "description": "A secure, multi-user expense tracker showing modern SvelteKit best practices.",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "All"
    }
  ` +
    "</" +
    "script>"}
</svelte:head>

<main class="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 p-6">
  <header class="text-center">
    <h1 class="text-2xl font-bold">{m.login_heading()}</h1>
    <p class="text-muted-foreground mt-1 text-sm">
      {m.login_subtitle()}
    </p>
  </header>

  {#if form?.message}
    <p
      class="rounded bg-red-50 p-3 text-center text-sm text-red-700 dark:bg-red-950 dark:text-red-300"
    >
      {form.message}
    </p>
  {/if}

  <!-- Native submit (no use:enhance): the login action sets the session cookie and 303s to "/".
       Safari/WebKit only persists that Set-Cookie on a top-level navigation, not on an enhance
       fetch response, so a native submit is required for cross-browser sign-in. -->
  <form method="POST" class="flex flex-col gap-3">
    <label class="flex flex-col gap-1">
      <span class="text-sm font-medium">{m.login_email_label()}</span>
      <Input
        type="email"
        name="email"
        value={form?.email ?? data.defaultEmail}
        required
        autocomplete="email"
      />
    </label>
    <Button type="submit">
      {m.continue_with_email()}
    </Button>
  </form>
</main>
