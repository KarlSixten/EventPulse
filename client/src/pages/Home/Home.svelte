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
    .container {
        width: 90%;
        max-width: 1100px;
        margin: 0 auto;
        padding: 2rem 0;
    }
    .hero-section {
        background-color: var(--ep-primary);
        color: var(--ep-text-on-primary);
    }

    h1, h2 {
        text-align: center;
    }

    p {
        text-align: center;
        max-width: 700px;
        margin-left: auto;
        margin-right: auto;
    }

    .features-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 2rem;
        margin-top: 2rem;
    }

    .feature-item {
        text-align: center;
    }

    .feature-item ion-icon {
        font-size: 2.5rem;
        color: var(--ep-primary);
    }
    
    .hero-cta, .cta-section {
        text-align: center;
        padding-top: 1rem;
    }
</style>