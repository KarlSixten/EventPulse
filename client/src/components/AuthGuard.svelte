<script>
    import { navigate } from 'svelte-routing';
    import { userStore } from '../stores/userStore.js';
    import toastr from 'toastr';

    let { children } = $props();

    $effect(() => {
        if ($userStore === null) {
            toastr.error('Login required');
            navigate('/login', { replace: true });
        }
    });

</script>

{#if $userStore}
    {@render children()}
{:else if $userStore === undefined}
    <p>Authenticating...</p>
{/if}