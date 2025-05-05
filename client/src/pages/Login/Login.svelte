<script>
    import { BASE_URL } from "../../stores/generalStore.js";
    import { fetchPost } from "../../util/fetch.js";
    import { userStore } from "../../stores/userStore.js";
    import toastr from "toastr";

    let email = $state("");
    let password = $state("");

    const handleLogin = async () => {
        try {
            const result = await fetchPost($BASE_URL + "/api/login", {
                email,
                password,
            });

            if (result.status === 200) {

                const userData = result.data.user;

                userStore.set(userData);

                try {
                    sessionStorage.setItem(
                        "currentUser", JSON.stringify(userData),
                    );
                } catch (error) {
                    console.error("Error saving user data to sessionStorage:", error);
                }

                toastr.success("Logged in");
            } else {
                toastr.error(result.data.message, "Login failed");
            }
        } catch (error) {
            toastr.error("An error occured during login.");
            console.error("Login error:", error);
        }
    };
</script>

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
        <button class="form-button" type="button" onclick={handleLogin}
            >Login</button
        >
    </form>
</main>

<style>
</style>
