<script>
    import { navigate } from "svelte-routing";
    import { BASE_URL } from "../../stores/generalStore.js";
    import { apiFetch } from "../../util/fetch.js";
    import toastr from "toastr";

    let email = $state("");
    let password = $state("");
    let confirmPassword = $state("");
    let firstName = $state("");
    let lastName = $state("");

    let passwordError = $derived(confirmPassword && password !== confirmPassword);
    let canSubmit = $derived(password && firstName && lastName && password === confirmPassword);

    const handleSignUp = async () => {
        const userData = {
            email,
            password,
            firstName,
            lastName,
        };

        const { ok, error } = await apiFetch(`${$BASE_URL}/api/auth/sign-up`, {
            method: "POST",
            body: userData,
        });

        if (ok) {
            toastr.success("User created, you can now log in!");
            navigate("/login");
        } else {
            toastr.error(
                error?.message || "An unknown error occurred.",
                "Sign-up failed",
            );
            console.error("User creation error:", error);
        }
    };
</script>

<svelte:head>
    <title>EventPulse | Sign Up</title>
</svelte:head>

<main>
    <form class="form-container">
        <h2 class="form-title">Sign Up</h2>
        <input
            type="email"
            placeholder="Email"
            bind:value={email}
            required
            class="form-input"
        />
        <input
            type="password"
            placeholder="Password"
            bind:value={password}
            required
            class="form-input"
        />
        <input
            type="password"
            placeholder="Confirm Password"
            bind:value={confirmPassword}
            required
            class="form-input"
            class:invalid={passwordError}
        />
        <input
            type="text"
            placeholder="First Name"
            bind:value={firstName}
            required
            class="form-input"
        />
        <input
            type="text"
            placeholder="Last Name"
            bind:value={lastName}
            required
            class="form-input"
        />
        <button type="button" onclick={handleSignUp} disabled={!canSubmit}
            >Sign up</button
        >
        {#if passwordError} 
         <p>Passwords do not match!</p>
        {/if}
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
