<script>
    import { navigate } from 'svelte-routing';
    import { userStore } from '../stores/userStore.js';
    import toastr from 'toastr';

    $: {
        if ($userStore === null) {
            toastr.error('Login required');
            navigate('/login', { replace: true });
        }
    }
</script>

{#if $userStore}
    <slot></slot>
{:else if $userStore === undefined}
    <p>Authenticating...</p>
{/if}