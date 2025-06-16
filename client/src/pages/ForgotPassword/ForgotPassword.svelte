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
        <button class="form-button" type="button" onclick={handleSubmit}
            >Send recovery email</button
        >
    </form>
</main>

<style>
    main {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
    }

    .form-container {
        background-color: #ffffff;
        padding: 2rem 2.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 400px;
        box-sizing: border-box;
    }

    .form-title {
        color: #333333;
        margin-bottom: 1.5rem;
        text-align: center;
        font-size: 1.8rem;
        font-weight: 600;
    }

    .form-input {
        width: 100%;
        padding: 0.9rem 1rem;
        margin-bottom: 1rem;
        border: 1px solid #dddddd;
        border-radius: 6px;
        box-sizing: border-box;
        font-size: 1rem;
        color: #333333;
        transition:
            border-color 0.3s ease,
            box-shadow 0.3s ease;
    }

    .form-input::placeholder {
        color: #999999;
    }

    .form-input:focus {
        outline: none;
        border-color: #007bff;
        box-shadow: 0 0 0 0.2rem #00adb5;
    }

    .form-input:last-of-type {
        margin-bottom: 1.5rem;
    }

    .form-button {
        width: 100%;
        padding: 0.9rem 1rem;
        background-color: #00adb5;
        color: #ffffff;
        border: none;
        border-radius: 6px;
        font-size: 1.1rem;
        font-weight: 500;
        cursor: pointer;
        transition:
            background-color 0.3s ease,
            transform 0.2s ease;
    }

    .form-button:hover {
        background-color: #007980;
        transform: translateY(-2px);
    }
</style>
