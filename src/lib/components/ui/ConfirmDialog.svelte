<script lang="ts">
  import Button from "./Button.svelte";

  let {
    open = $bindable(false),
    title,
    message,
    confirmLabel,
    cancelLabel,
    onconfirm,
    oncancel
  }: {
    open?: boolean;
    title: string;
    message: string;
    confirmLabel: string;
    cancelLabel: string;
    onconfirm: () => void;
    oncancel: () => void;
  } = $props();

  let dialog: HTMLDialogElement | undefined = $state();

  $effect(() => {
    if (open && dialog && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog && dialog.open) {
      dialog.close();
    }
  });

  function close(action: "confirm" | "cancel") {
    open = false;
    if (action === "confirm") {
      onconfirm();
    } else {
      oncancel();
    }
  }
</script>

<dialog
  bind:this={dialog}
  class="m-auto w-full max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow-xl backdrop:bg-gray-900/50 dark:border-gray-800 dark:bg-gray-900 dark:backdrop:bg-black/80"
  onclose={() => {
    // Synchronize state if dialog is closed via ESC
    if (open) {
      close("cancel");
    }
  }}
  onclick={(e) => {
    // Close on backdrop click. The backdrop is part of the <dialog> element.
    // If the click is directly on the dialog element (not its children), it's a backdrop click.
    if (e.target === dialog) {
      close("cancel");
    }
  }}
>
  <div class="grid gap-4">
    <h2 class="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h2>
    <p class="text-sm text-gray-500 dark:text-gray-400">{message}</p>
    <div class="mt-2 flex items-center justify-end gap-3">
      <Button variant="secondary" onclick={() => close("cancel")}>{cancelLabel}</Button>
      <Button variant="danger" onclick={() => close("confirm")}>{confirmLabel}</Button>
    </div>
  </div>
</dialog>
