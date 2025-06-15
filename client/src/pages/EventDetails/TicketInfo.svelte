<script>
    import { formatCurrency } from "../../util/format";

    import CheckoutForm from "./CheckoutForm.svelte";

    let { event } = $props();

    let paymentModalVisible = $state(false);
</script>

{#if event.price > 0}
    <div class="ticket-info-box">
        <h3 class="ticket-header">
            <ion-icon name="ticket-outline"></ion-icon>
            Tickets
        </h3>

        <div class="price-display">
            {formatCurrency(event.price)}
        </div>

        <div class="payment-options">
            {#if event.acceptsOnlinePayment}
                <div class="option">
                    <button
                        class="buy-button"
                        onclick={() => (paymentModalVisible = true)}
                    >
                        Buy Ticket Online
                    </button>
                </div>
                <CheckoutForm isOpen={paymentModalVisible} {event} />
            {/if}

            {#if event.acceptsVenuePayment}
                <div class="option venue-info">
                    <ion-icon name="business-outline"></ion-icon>
                    <span>
                        {#if event.acceptsOnlinePayment}
                            Tickets also available at the venue.
                        {:else}
                            Tickets sold at the venue only.
                        {/if}
                    </span>
                </div>
            {/if}
        </div>
    </div>
{/if}

<style>
    .ticket-info-box {
        background-color: var(--ep-background-dark);
        border: 1px solid var(--ep-border);
        border-radius: 8px;
        padding: 1.5rem;
        margin-top: 2rem;
    }

    .ticket-header {
        font-size: 1.4em;
        font-weight: 600;
        color: var(--ep-text-primary);
        margin: 0 0 1rem 0;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        border-bottom: 1px solid var(--ep-border);
        padding-bottom: 1rem;
    }

    .price-display {
        font-size: 2em;
        font-weight: 700;
        color: var(--ep-primary);
        margin-bottom: 1.5rem;
        text-align: center;
    }

    .payment-options {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .option {
        display: flex;
        justify-content: center;
    }

    .buy-button {
        width: 100%;
        max-width: 300px;
        padding: 0.8em 1.5em;
        font-size: 1.1em;
        font-weight: 600;
        background-color: var(--ep-primary);
        color: var(--ep-text-on-primary);
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .buy-button:hover {
        background-color: #008a91;
    }

    .venue-info {
        font-size: 0.9em;
        color: var(--ep-text-secondary);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        padding: 0.5rem;
        background-color: var(--ep-accent);
        border-radius: 8px;
    }
</style>
