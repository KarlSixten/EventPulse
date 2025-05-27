<script>
    import { Link } from "svelte-routing";
</script>

<svelte:head>
    <title>EventPulse | Home</title>
</svelte:head>

<main class="home-page">
    <section class="hero-section">
        <div class="hero-content container">
            <h1>Discover & Create Local Events Effortlessly</h1>
            <p class="subtitle">
                EventPulse is your vibrant, user-friendly hub for discovering the best local happenings and effortlessly sharing your own events. 
                Dive into a world of experiences, from concerts and workshops to community meetups and festivals, all just around the corner.
            </p>
            <div class="hero-cta">
                <Link to="/discover">Explore Events</Link>
                <Link to="/sign-up">Join Now</Link>
            </div>
        </div>
    </section>

    <section class="features-section">
        <div class="container">
            <h2>Why EventPulse?</h2>
            <div class="features-grid">
                <div class="feature-item">
                    <ion-icon name="search-outline"></ion-icon>
                    <h3>Find Local Gems</h3>
                    <p>
                        Stop missing out! Our intuitive search, smart filtering, and personalized recommendations help you unearth a rich tapestry 
                        of events tailored to your interests. Whether it's a niche workshop, a lively street festival, a local market, or a charity run, 
                        find your next favorite experience in just a few clicks.
                    </p>
                </div>
                <div class="feature-item">
                    <ion-icon name="create-outline"></ion-icon>
                    <h3>Create & Share with Ease</h3>
                    <p>
                        Bring your vision to life. EventPulse offers simple yet powerful tools to create, manage, and promote your events. 
                        Customize your event page, set ticketing (optional), send invitations for public or private gatherings, and reach your target 
                        local audience effectively. We handle the tech so you can focus on the experience.
                    </p>
                </div>
                <div class="feature-item">
                    <ion-icon name="people-outline"></ion-icon>
                    <h3>Connect & Engage Meaningfully</h3>
                    <p>
                        More than just an event listing, EventPulse fosters real connections. Discover events your friends are attending, share events 
                        you love, participate in pre-event discussions (feature coming soon!), and meet people who share your passions. Build your local 
                        network and create lasting memories together.
                    </p>
                </div>
            </div>
        </div>
    </section>

    <section class="cta-section">
        <div class="container">
            <h2>Ready to Feel the Pulse?</h2>
            <p class="cta-subtitle">
                The best local experiences are just a click away. Join free today and start connecting!
            </p>
            <Link to="/sign-up" class="final-cta-link">Sign Up Free & Start Exploring</Link>
        </div>
    </section>
</main>

<style>
    .home-page {
        color: var(--ep-text-primary);
    }
    section {
        padding: 25px 15px;
        text-align: center;
    }
    .container {
        max-width: 800px;
        margin-left: auto;
        margin-right: auto;
    }
    h1, h2, h3 {
        margin-top: 0;
        margin-bottom: 0.75rem;
        font-weight: 600;
        line-height: 1.3;
        color: var(--ep-text-primary);
    }
    h3 { color: var(--ep-primary); }
    p {
        color: var(--ep-text-secondary);
    }
    .subtitle, .cta-subtitle {
        font-size: 1em;
        margin-bottom: 1.25rem;
        max-width: 550px;
        margin-left: auto;
        margin-right: auto;
    }
    .hero-section {
        background-color: var(--ep-primary); 
        color: var(--ep-text-on-primary); 
    }
    .hero-section h1, .hero-section .subtitle, .hero-section :global(a) {
        color: var(--ep-text-on-primary) !important;
    }
    .hero-cta :global(a) {
        margin: 0 10px;
        font-weight: 500;
        text-decoration: underline;
    }
    .hero-cta :global(a:hover) {
        opacity: 0.8;
    }
    .features-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
        gap: 20px;
        margin-top: 20px;
    }
    .feature-item {
        padding: 15px;
    }
    .feature-item ion-icon {
        font-size: 1.8rem;
        color: var(--ep-primary);
        margin-bottom: 8px;
    }
</style>