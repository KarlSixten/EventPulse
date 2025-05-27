<script>
  export let isOpen = false;
  export let title = 'Confirm Action';
  export let message = 'Are you sure you want to proceed?';

  export let onConfirm = () => {};
  export let onCancel = () => {};

  function handleConfirm() {
    onConfirm();
  }

  function handleCancel() {
    onCancel();
  }
</script>

{#if isOpen}
  <div class="modal-overlay" on:click={handleCancel}>
    <div class="modal-content" on:click|stopPropagation>
      <h2 id="modal-title">{title}</h2>
      <p>{message}</p>
      <div class="modal-actions">
        <button on:click={handleCancel} class="button-secondary">Cancel</button>
        <button on:click={handleConfirm} class="button-danger">Confirm</button>
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
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background-color: #2f2f2f;
    color: rgba(255, 255, 255, 0.87);
    padding: 2em;
    border-radius: 8px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
    min-width: 300px;
    max-width: 90%;
    text-align: center;
  }

  .modal-content h2 {
    font-size: 1.8em;
    line-height: 1.2;
    margin-top: 0;
    margin-bottom: 0.5em;
  }

  .modal-content p {
    margin-bottom: 1.5em;
    line-height: 1.6;
  }

  .modal-actions {
    display: flex;
    justify-content: center;
    gap: 1em;
  }

  .modal-actions button {
    padding: 0.6em 1.2em;
    font-size: 1em;
  }

  .button-secondary {
    background-color: #555;
  }

  .button-danger {
    background-color: #d9534f;
    color: white;
  }
</style>