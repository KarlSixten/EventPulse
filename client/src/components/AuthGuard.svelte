<script>
    import toastr from 'toastr';
    import { userStore } from '../stores/userStore.js';
    import { navigate } from 'svelte-routing';

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