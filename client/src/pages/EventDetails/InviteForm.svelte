<script>
    import { BASE_URL } from "../../stores/generalStore";
    import { userStore } from "../../stores/userStore";
    import { apiFetch } from "../../util/fetch";
    import toastr from "toastr";

    let { event } = $props();

    let inviteeEmail = $state("");
    let inviteeMessage = $state("");

    async function handleSendInvite() {
        const inviteDetails = {
            invitee_email: inviteeEmail,
            message: inviteeMessage,
        };

        const { result, ok, error } = await apiFetch(
            `${$BASE_URL}/api/events/${event.id}/invitations`,
            {
                method: "POST",
                body: inviteDetails,
            },
        );

        if (ok) {
            toastr.success(result.message, "User invited!");
            inviteeEmail = "";
            inviteeMessage = "";
        } else {
            toastr.error(
                error?.message || "Error sending invite.",
                "Unable to invite user:",
            );
            console.error("Error sending invite:", error);
        }
    }

</script>

{#if $userStore}
    {#if !event.isPrivate || ($userStore && event.createdById === $userStore.id)}
        <div class="invite-form">
            <input
                type="email"
                placeholder="Email to invite"
                bind:value={inviteeEmail}
                required
            />
            <textarea
                placeholder="Message to invitee (optional)"
                bind:value={inviteeMessage}
            ></textarea>
            <button
                class="btn btn-primary"
                type="button"
                onclick={handleSendInvite}>Send Invite</button
            >
        </div>
    {:else if event.isPrivate && $userStore && event.createdById !== $userStore.id}
        <p>Only the event creator can invite people to private events.</p>
    {/if}
{:else}
    <p>You must <a href="/login">log in</a> to send invites.</p>
{/if}

<style>
    .invite-form {
        padding: auto;
    }
</style>
