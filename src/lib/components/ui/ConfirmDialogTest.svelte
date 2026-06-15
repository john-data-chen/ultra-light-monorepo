<script lang="ts">
  import ConfirmDialog from "./ConfirmDialog.svelte";

  let {
    open = $bindable(true),
    title = "Test Title",
    message = "Test Message",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    onconfirm,
    oncancel
  }: {
    open?: boolean;
    title?: string;
    message?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onconfirm: () => void;
    oncancel: () => void;
  } = $props();
</script>

<ConfirmDialog bind:open {title} {message} {confirmLabel} {cancelLabel} {onconfirm} {oncancel} />
