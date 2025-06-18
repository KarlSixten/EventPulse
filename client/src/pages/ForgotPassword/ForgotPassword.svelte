<script>
    import { BASE_URL } from "../../stores/generalStore.js";
    import { apiFetch } from "../../util/fetch.js";
    import toastr from "toastr";

    let email = $state("");

    const handleSubmit = async () => {
        const payload = {
            email,
        };

        const { ok, error } = await apiFetch(
            `${$BASE_URL}/api/auth/forgot-password`,
            {
                method: "POST",
                body: payload,
            },
        );

        if (ok) {
            toastr.success("Check your email inbox.", "Reset link sent!");
        } else {
            toastr.error(error?.message || "Could not send reset link");
            console.error("Reset password failed:", error);
        }
    };
</script>

<svelte:head>
    <title>EventPulse | Forgot Password</title>
</svelte:head>

<main>
    <form class="form-container">
        <h2 class="form-title">Forgot password</h2>
        <input
            type="email"
            placeholder="Email"
            bind:value={email}
            required
            class="form-input"
        />
        <button class="form-button" type="button" onclick={handleSubmit} disabled={email == ''}
            >Send recovery email</button
        >
    </form>
</main>

<style>
    main {
        display: flex;
        justify-content: center;
    }

    .form-container {
        padding: 2rem 2.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px var(--ep-accent);
        width: 100%;
        max-width: 400px;
        box-sizing: border-box;
    }

    .form-title {
        color: var(--ep-text-primary);
        margin-bottom: 1.5rem;
        text-align: center;
        font-size: 1.8rem;
        font-weight: 600;
    }

    .form-input {
        width: 100%;
        padding: 0.9rem 1rem;
        margin-bottom: 1rem;
        border: 1px solid var(--ep-border);
        border-radius: 8px;
        box-sizing: border-box;
        font-size: 1rem;
        color: var(--ep-text-primary);
    }

    .form-input::placeholder {
        color: var(--ep-text-placeholder);
    }

    .form-input:focus {
        outline: none;
        box-shadow: 0 0 0 0.2rem var(--ep-primary);
    }

    button {
        width: 100%;
    }
</style>
