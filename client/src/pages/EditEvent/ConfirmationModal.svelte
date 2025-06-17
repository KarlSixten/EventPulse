<script>
  let { 
    isOpen, 
    onConfirm, 
    onCancel, 
    title = 'Confirm Action', 
    message = 'Are you sure you want to proceed?'
  } = $props();

  function handleConfirm() {
    onConfirm();
  }

  function handleCancel() {
    onCancel();
  }
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <!-- svelte-ignore a11y_interactive_supports_focus -->
  <!-- svelte-ignore a11y_click_events_have_key_events -->
  <div class="modal-overlay" onclick={handleCancel} role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div class="modal-content" onclick={(event) => event.stopImmediatePropagation()} role="document">
      <h2 id="modal-title">{title}</h2>
      <p id="modal-description">{message}</p>
      <div class="modal-actions">
        <button class="btn-cancel" onclick={handleCancel}>Cancel</button>
        <button class="btn-delete" onclick={handleConfirm}>Confirm</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1050;
    padding: 15px;
    box-sizing: border-box;
  }

  .modal-content {
    background-color: var(--ep-background-light);
    color: var(--ep-text-primary);
    padding: 20px;
    border-radius: 6px;
    min-width: 280px;
    max-width: 400px;
    width: 100%;
    text-align: center;
  }

  .modal-content h2 {
    font-size: 1.4em;
    margin-top: 0;
    margin-bottom: 0.75em;
    color: var(--ep-text-primary);
  }

  .modal-content p {
    margin-bottom: 1.5em;
    line-height: 1.5;
    color: var(--ep-text-secondary);
  }

  .modal-actions {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 15px;
  }

  .btn-delete {
    background-color: var(--ep-error);
  }

  .btn-cancel {
    background-color: var(--ep-background-light);
    color: var(--ep-text-primary);
  }

</style>