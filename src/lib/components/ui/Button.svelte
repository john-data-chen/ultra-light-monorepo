<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  type Variant = "primary" | "secondary" | "ghost" | "danger";

  /* Exact Tailwind strings extracted from existing consumers — visual parity guaranteed. */
  const variantClasses: Record<Variant, string> = {
    primary:
      "rounded bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300",
    secondary:
      "rounded border border-gray-200 px-3 py-2 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800",
    ghost: "px-4 py-2 text-sm text-gray-500 hover:underline dark:text-gray-400",
    danger: "text-sm text-red-500 hover:underline dark:text-red-400"
  };

  let {
    variant = "primary",
    href,
    type = "button",
    disabled = false,
    class: className = "",
    children,
    ...rest
  }: {
    variant?: Variant;
    href?: string;
    type?: HTMLButtonAttributes["type"];
    disabled?: boolean;
    class?: string;
    children: Snippet;
  } & Record<string, unknown> = $props();

  let classes = $derived([variantClasses[variant], className].filter(Boolean).join(" "));
</script>

{#if href}
  <!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- href is pre-resolved by caller -->
  <a {href} class={classes} {...rest}>
    {@render children()}
  </a>
{:else}
  <button {type} {disabled} class={classes} {...rest}>
    {@render children()}
  </button>
{/if}
