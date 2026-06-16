<script lang="ts">
  import * as AlertDialog from "./alert-dialog";

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
</script>

<AlertDialog.Root bind:open>
  <AlertDialog.Content size="sm">
    <AlertDialog.Header>
      <AlertDialog.Title>{title}</AlertDialog.Title>
      <AlertDialog.Description>{message}</AlertDialog.Description>
    </AlertDialog.Header>
    <AlertDialog.Footer>
      <AlertDialog.Cancel onclick={oncancel}>{cancelLabel}</AlertDialog.Cancel>
      <AlertDialog.Action variant="destructive" onclick={onconfirm}
        >{confirmLabel}</AlertDialog.Action
      >
    </AlertDialog.Footer>
  </AlertDialog.Content>
</AlertDialog.Root>
