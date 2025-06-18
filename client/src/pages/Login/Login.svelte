<script>
    import { navigate, Link } from "svelte-routing";
    import { BASE_URL } from "../../stores/generalStore.js";
    import { userStore } from "../../stores/userStore.js";
    import { apiFetch } from "../../util/fetch.js";
    import toastr from "toastr";

    let email = $state("");
    let password = $state("");

    const handleLogin = async () => {
        const loginPayload = {
            email,
            password,
        };

        const { result, ok, error } = await apiFetch(
            `${$BASE_URL}/api/auth/login`,
            {
                method: "POST",
                body: loginPayload,
            },
        );

        if (ok) {
            const userData = result.data.user;
            userStore.set(userData);
            sessionStorage.setItem("currentUser", JSON.stringify(userData));

            toastr.success("Logged in successfully!");
            navigate("/discover");
        } else {
            toastr.error(
                error?.message ||
                    "Login failed. Please check your credentials.",
            );
            console.error("Login failed:", error);
        }
    };
</script>

<svelte:head>
    <title>EventPulse | Login</title>
</svelte:head>

<main>
    <form class="form-container">
        <h2 class="form-title">Login</h2>
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
        <Link to="/forgot-password"
            >Forgot password</Link
        >
        <button
            class="form-button"
            type="button"
            onclick={handleLogin}
            disabled={!email || !password}>Login</button
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
