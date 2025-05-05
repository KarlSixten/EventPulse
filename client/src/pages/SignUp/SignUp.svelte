<script>
    import { BASE_URL } from "../../stores/generalStore.js";
    import { fetchPost } from "../../util/fetch.js";
    import toastr from "toastr";

    let email = $state("");
    let password = $state("");
    let firstName = $state("");
    let lastName = $state("");


    const handleSignUp = async () => {
        try {
            const result = await fetchPost($BASE_URL + "/api/sign-up", {
                email,
                password,
                firstName,
                lastName
            });

            if (result.status === 201) {
                toastr.success("User created, you can now log in!");
            } else {
                toastr.error(result.data.message, "User creation failed");
            }
        } catch (error) {
            toastr.error("An error occured during user creation.");
            console.error("User creation error:", error);
        }
    };
</script>

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
        <button class="form-button" type="button" onclick={handleSignUp}>Sign up</button
        >
    </form>
</main>

<style>
</style>
