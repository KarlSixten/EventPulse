<script>
    import { userStore } from "../../stores/userStore";

    let { attendees } = $props();
</script>

{#if attendees && attendees.length > 0}
    <h3>People going:</h3>
    <ul class="attendee-list">
        {#each attendees as attendee}
            <li class="attendee-item">
                <ion-icon name="person-circle-outline"></ion-icon>
                {attendee.firstName}
                {attendee.lastName}
                {#if attendee.userId == $userStore.id}
                    (You)
                {/if}
            </li>
        {/each}
    </ul>
{/if}
