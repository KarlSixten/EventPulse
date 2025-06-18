<script>
    import { Link } from "svelte-routing";
</script>

<div class="not-found-container">
    <h1 class="status-code">404</h1>
    <h2 class="status-message">Page Not Found</h2>
    <p class="details">
        Sorry, the page you are looking for does not exist or may have been
        moved.
    </p>
    <Link to="/" class="home-button">Go to Homepage</Link>
</div>

<style>
    .not-found-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
    }

    .status-code {
        font-size: 6rem;
        color: var(--ep-primary);
    }

    .status-message {
        color: var(--ep-text-primary);
    }

    .details {
        color: var(--ep-text-secondary);
        max-width: 50vw;
    }
</style>
