<script>
    import { tick } from "svelte";
    import {
        BASE_URL,
        STRIPE_PUBLISHABLE_KEY,
    } from "../../stores/generalStore.js";
    import { apiFetch } from "../../util/fetch.js";
    import { formatCurrency } from "../../util/format.js";
    import toastr from "toastr";
    import { loadStripe } from "@stripe/stripe-js";

    let { isOpen, event } = $props();

    let clientSecret = $state("");
    let isLoading = $state(false);
    let errorMessage = $state("");
    let email = $state("");

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
            await tick(); // Sørg for at DOM er opdateret, ingen ventende opdateringer

            stripe = await loadStripe($STRIPE_PUBLISHABLE_KEY);

            const { result, ok, error } = await apiFetch(
                `${$BASE_URL}/api/payments/events/${event.id}/create-payment-intent`,
                { method: "POST" },
            );

            if (!ok) {
                errorMessage =
                    error?.message || "Could not initialize payment.";
                console.error("Failed to create payment intent:", error);
                return;
            }

            clientSecret = result.data.clientSecret;

            elements = stripe.elements({ clientSecret });

            const addressElement = elements.create("address", {
                mode: "billing",
            });
            const paymentElement = elements.create("payment");

            addressElement.mount("#address-element");
            paymentElement.mount("#payment-element");
        } catch (error) {
            console.error("Failed to setup Stripe Elements:", error);
            errorMessage =
                "A critical error occurred while setting up the payment form.";
        }
    }

    async function handleSubmit(clickEvent) {
        clickEvent.preventDefault();
        if (isLoading || !stripe || !elements) return;

        isLoading = true;
        errorMessage = "";

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                payment_method_data: {
                    billing_details: {
                        email: email,
                    },
                },
            },
            redirect: "if_required",
        });

        if (error) {
            errorMessage = error.message;
            isLoading = false;
        } else {
            toastr.success(`Your ticket for "${event.title}" has been confirmed!`);
            isOpen = false;
        }
    }

</script>

{#if isOpen}
    <div class="modal-backdrop">
        <div class="modal-content">
            <button
                class="close-button"
                onclick={() => (isOpen = false)}
                aria-label="Close modal">&times;</button
            >

            <h2>Complete Your Registration</h2>
            <p class="subtitle">
                Enter your details and payment information below.
            </p>

            {#if !isInitialized}
                <div class="loading-state">
                    <p>Loading secure payment form...</p>
                </div>
            {:else}
                <form onsubmit={handleSubmit}>
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            bind:value={email}
                            required
                            placeholder="you@example.com"
                        />
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
                        {isLoading
                            ? "Processing..."
                            : `${formatCurrency(event.price)} - Pay Now`}
                    </button>
                </form>
            {/if}
        </div>
    </div>
{/if}

<style>
    .modal-content {
        background-color: var(--ep-background-light);
        padding: 2rem;
        border-radius: 8px;
        width: 90%;
        position: relative;
    }

    .close-button {
        position: absolute;
        top: 10px;
        right: 15px;
        border: none;
        font-size: 1rem;
        cursor: pointer;
        padding: 0.5rem;
        color: var(--ep-text-on-primary);
    }

    .subtitle {
        color: var(--ep-text-secondary);
    }

    .form-group {
        margin-bottom: 1.5rem;
    }

    label {
        color: var(--ep-text-primary);
    }

    input {
        width: 100%;
        border: 1px solid var(--ep-border);
        border-radius: 8px;
        font-size: 1em;
    }

    #address-element,
    #payment-element {
        border: 1px solid var(--ep-border);
        padding: 1rem;
        border-radius: 8px;
    }

    button[type="submit"] {
        width: 100%;
    }

    button[type="submit"]:disabled {
        background-color: var(--ep-disabled);
        cursor: not-allowed;
    }

    .error-message {
        color: var(--ep-error);
        margin-bottom: 1rem;
        text-align: center;
    }

    .loading-state {
        padding: 2rem 0;
        text-align: center;
        color: var(--ep-text-secondary);
    }
</style>
