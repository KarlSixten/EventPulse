<script>
    import { onMount } from "svelte";
    import { navigate } from "svelte-routing";
    import { BASE_URL } from "../../stores/generalStore.js";
    import { apiFetch } from "../../util/fetch.js";
    import toastr from "toastr";

    let token = $state();
    let newPassword = $state("");
    let confirmPassword = $state("");

    let passwordError = $derived(confirmPassword && newPassword !== confirmPassword);
    let canSubmit = $derived(newPassword && newPassword === confirmPassword);

    onMount(() => {
        const urlParams = new URLSearchParams(window.location.search);
        token = urlParams.get("token");
        if (!token) {
            toastr.error("Invalid reset link");
        }
    });

    const handleSubmit = async () => {
        if (!canSubmit) {
            console.error("Attempted to submit with non-matching passwords.");
            return;
        }

        const payload = {
            newPassword,
        };

        const { ok, error } = await apiFetch(
            `${$BASE_URL}/api/auth/reset-password?token=${token}`,
            {
                method: "POST",
                body: payload,
            },
        );

        if (ok) {
            toastr.success("Password reset successfully!");
            navigate("/login");
        } else {
            toastr.error(error?.message || "Reset password failed.");
            console.error("Login failed:", error);
        }
    };
</script>

<svelte:head>
    <title>EventPulse | Reset Password</title>
</svelte:head>

<main>
    <form class="form-container">
        <h2 class="form-title">Reset password</h2>
        <input
            type="password"
            placeholder="Password"
            bind:value={newPassword}
            required
            class="form-input"
        />
        <input
            type="password"
            placeholder="Confirm New Password"
            bind:value={confirmPassword}
            required
            class="form-input"
            class:invalid={passwordError}
        />
        {#if passwordError}
            <p class="error-text">Passwords do not match.</p>
        {/if}
        <button class="form-button" type="button" onclick={handleSubmit} disabled={!canSubmit}
            >Reset password</button
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
