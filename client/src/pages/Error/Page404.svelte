<script>
    import { Link } from "svelte-routing";
</script>

<div class="not-found-container">
    <h1 class="status-code">404</h1>
    <h2 class="status-message">Page Not Found</h2>
    <p class="details">
        Sorry, the page you are looking for does not exist or may have been moved.
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
        padding: 2rem;
        flex-grow: 1; /* This helps center it in the viewport */
    }

    .status-code {
        font-size: 6rem;
        font-weight: 700;
        color: var(--ep-primary, #00adb5);
        margin: 0;
        line-height: 1;
    }

    .status-message {
        font-size: 1.75rem;
        margin: 0.5rem 0;
        color: var(--ep-text-primary, #222831);
    }

    .details {
        color: var(--ep-text-secondary, #6c757d);
        max-width: 400px;
        margin-bottom: 2rem;
    }
</style>