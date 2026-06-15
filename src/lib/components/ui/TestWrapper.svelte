<script lang="ts">
  import type { Component } from "svelte";

  let {
    component: ComponentToRender,
    props = {},
    text = ""
  }: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    component: Component<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    props?: Record<string, any>;
    text?: string;
  } = $props();
</script>

<ComponentToRender {...props}>
  {text}
</ComponentToRender>
