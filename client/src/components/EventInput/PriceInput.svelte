<script>
    let { price = $bindable() } = $props();
</script>

<label for="event-price">Price</label>
    <div class="price-input-wrapper">
        <span class="currency-symbol">DKK</span>
        <input
            id="event-price"
            type="number"
            bind:value={price}
            min="0"
            step="1"
            placeholder="0.00"
        />
    </div>
<small class="field-hint">Leave as 0 for a FREE event.</small>
