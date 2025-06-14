<script>
    import { tick } from "svelte";
    import { BASE_URL, STRIPE_PUBLISHABLE_KEY } from "../../stores/generalStore.js";
    import { apiFetch } from "../../util/fetch.js";
    import { formatCurrency } from "../../util/format.js";
    import toastr from "toastr";
    import { loadStripe } from "@stripe/stripe-js";

    let { isOpen, event } = $props();

    let clientSecret = $state("");
    let isLoading = $state(false);
    let errorMessage = $state("");
    let email = $state('');
    
    let stripe = $state(null);
    let elements = $state(null);
    let isInitialized = $state(false);

    $effect(() => {
        if (isOpen && !isInitialized) {
            setupStripe();
        }
    });

async function setupStripe() {
    try {
        isInitialized = true;
        await tick();
        
        stripe = await loadStripe($STRIPE_PUBLISHABLE_KEY);

        const { result, ok, error } = await apiFetch(
            `${$BASE_URL}/api/payments/events/${event.id}/create-payment-intent`, 
            { method: "POST" }
        );

        if (!ok) {
            errorMessage = error?.message || 'Could not initialize payment.';
            console.error("Failed to create payment intent:", error);
            return;
        }

        const clientSecret = result.data.clientSecret;
        const elements = stripe.elements({ clientSecret });
        
        const addressElement = elements.create('address', { mode: 'billing' });
        const paymentElement = elements.create('payment');

        addressElement.mount('#address-element');
        paymentElement.mount('#payment-element');
        
    } catch (error) {
        console.error('Failed to setup Stripe Elements:', error);
        errorMessage = 'A critical error occurred while setting up the payment form.';
    }
}

    async function handleSubmit(event) {
        event.preventDefault();
        if (isLoading || !stripe || !elements) return;

        isLoading = true;
        errorMessage = "";

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                payment_method_data: {
                    billing_details: {
                        email: email
                    }
                }
            },
            redirect: 'if_required' 
        });

        if (error) {
            errorMessage = error.message;
            isLoading = false;
        } else {
            handlePaymentSuccess();
        }
    }

    function handlePaymentSuccess() {
        toastr.success(`Your ticket for "${event.title}" has been confirmed!`);
        isOpen = false;
    }
</script>

{#if isOpen}
    <div class="modal-backdrop">
        <div class="modal-content">
            <button class="close-button" onclick={() => isOpen = false} aria-label="Close modal">&times;</button>
            
            <h2>Complete Your Registration</h2>
            <p class="subtitle">Enter your details and payment information below.</p>

            {#if !isInitialized}
                <div class="loading-state">
                    <p>Loading secure payment form...</p>
                </div>
            {:else}
                <form onsubmit={handleSubmit}>
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" bind:value={email} required placeholder="you@example.com" />
                    </div>
                    
                    <div class="form-group">
                        <label for="address-element">Billing Address</label>
                        <div id="address-element"></div>
                    </div>

                    <div class="form-group">
                        <label>Payment</label>
                        <div id="payment-element"></div>
                    </div>

                    {#if errorMessage}
                        <div class="error-message">{errorMessage}</div>
                    {/if}

                    <button type="submit" disabled={isLoading || !stripe}>
                        {isLoading ? "Processing..." : `${formatCurrency(event.price)} - Pay Now`}
                    </button>
                </form>
            {/if}
        </div>
    </div>
{/if}

<style>
    .modal-content {
        background-color: white;
        padding: 2rem;
        border-radius: 8px;
        width: 90%;
        max-width: 700px;
        position: relative;
        
    }
    
    .close-button {
        position: absolute;
        top: 10px;
        right: 15px;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: var(--ep-text-secondary, #6c757d);
    }
    
    h2 {
        margin-top: 0;
    }

    .subtitle {
        margin-bottom: 1.5rem;
        color: var(--ep-text-secondary, #6c757d);
    }
    
    .form-group {
        margin-bottom: 1.5rem;
    }

    label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: var(--ep-text-primary, #333);
    }
    
    input {
        width: 100%;
        padding: 10px;
        border: 1px solid var(--ep-border, #ccc);
        border-radius: 4px;
        font-size: 1em;
        box-sizing: border-box; 
    }

    #address-element,
    #payment-element {
        border: 1px solid var(--ep-border, #ccc);
        padding: 10px;
        border-radius: 4px;
    }

    input:focus {
        border-color: var(--ep-primary, #00adb5);
        outline: none;
    }
    
    button[type="submit"] {
        width: 100%;
        padding: 12px;
        font-size: 1.1em;
        font-weight: 600;
        color: var(--ep-text-on-primary, white);
        background-color: var(--ep-primary, #00adb5);
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    button[type="submit"]:disabled {
        background-color: var(--ep-disabled, #ccc);
        cursor: not-allowed;
    }
    
    .error-message {
        color: var(--ep-error, red);
        margin-bottom: 1rem;
        text-align: center;
    }

    .loading-state {
        padding: 2rem 0;
        text-align: center;
        color: var(--ep-text-secondary, #6c757d);
    }
</style>