<script>
    let { price = $bindable(), acceptsOnlinePayment = $bindable(), acceptsVenuePayment = $bindable() } = $props();
</script>

<div class="checkbox-group">
    <div class="form-group">
        <label>Ticket Sales Method</label>
        <div class="checkbox-group">
            <div class="checkbox-item">
                <input
                    type="checkbox"
                    id="accepts-online-payment"
                    disabled={price <= 0}
                    bind:checked={acceptsOnlinePayment}
                />
                <label for="accepts-online-payment">Tickets sold online</label>
            </div>
            <div class="checkbox-item">
                <input
                    type="checkbox"
                    id="accepts-venue-payment"
                    disabled={price <= 0}
                    bind:checked={acceptsVenuePayment}
                />
                <label for="accepts-venue-payment">Tickets sold at venue</label>
            </div>
        </div>
    </div>
</div>
