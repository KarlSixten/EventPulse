<script>
  import { onMount, onDestroy } from "svelte";
  import { navigate } from "svelte-routing";
  import { BASE_URL } from "../../stores/generalStore.js";
  import { userStore } from "../../stores/userStore.js";
  import { eventForEditing } from "../../stores/eventStore.js";
  import { apiFetch } from "../../util/fetch.js";
  import { formatDateTimeForInput } from "../../util/format.js";
  import toastr from "toastr";

  import EventLocationMapInput from "../../components/EventInput/EventLocationMapInput.svelte";
  import ConfirmationModal from "./ConfirmationModal.svelte";
  import PriceInput from "../../components/EventInput/PriceInput.svelte";
  import TicketTypeInput from "../../components/EventInput/TicketTypeInput.svelte";
  import PublicityInput from "../../components/EventInput/PublicityInput.svelte";
  import DateTimeInput from "../../components/EventInput/DateTimeInput.svelte";
  import EventTypeInput from "../../components/EventInput/EventTypeInput.svelte";
  import TitleDesctiptionInput from "../../components/EventInput/TitleDescriptionInput.svelte";

  let { id } = $props();

  let title = $state("");
  let description = $state("");
  let dateTime = $state("");
  let isPrivate = $state(false);
  let latitude = $state(null);
  let longitude = $state(null);
  let typeId = $state(null);
  let price = $state(null);
  let acceptsOnlinePayment = $state(false);
  let acceptsVenuePayment = $state(false);

  let eventToEdit = $state(null);
  let isLoading = $state(true);
  let storeSubscription;

  let showConfirmationModal = $state(false);

  $effect(() => {
    if (price <= 0) {
      acceptsOnlinePayment = false;
      acceptsVenuePayment = false;
    }
  });

  function checkAuthorizationAndInitialize(loadedEvent) {
    if (!loadedEvent) {
      toastr.error("Event data is missing. Cannot proceed with editing.");
      navigate("/");
      isLoading = false;
      return false;
    }

    if (!$userStore || $userStore.id !== loadedEvent.createdById) {
      toastr.error("You are not authorized to edit this event.");
      navigate(`/events/${loadedEvent.id || id}`);
      isLoading = false;
      return false;
    }

    initializeFormFields(loadedEvent);
    return true;
  }

  onMount(async () => {
    storeSubscription = eventForEditing.subscribe(async (valueFromStore) => {
      isLoading = true;
      if (valueFromStore && valueFromStore.id == id) {
        eventToEdit = valueFromStore;
        if (checkAuthorizationAndInitialize(eventToEdit)) {
          isLoading = false;
        }
      } else {
        if (id) {
          await fetchEventDetails();
        } else {
          toastr.error("No event ID provided. Cannot edit event.");
          console.warn(
            "No valid ID prop available. Cannot fetch event details.",
          );
          navigate("/");
          isLoading = false;
        }
      }
    });
  });

  async function fetchEventDetails() {
    isLoading = true;

    const { result, ok, error } = await apiFetch(
      `${$BASE_URL}/api/events/${id}`,
    );

    isLoading = false;

    if (ok) {
      eventToEdit = result.data;
      checkAuthorizationAndInitialize(eventToEdit);
    } else {
      toastr.error(error?.message || "Could not fetch event details.");
      console.error("Failed to fetch event data:", error);
      navigate("/");
    }
  }

  function initializeFormFields(loadedEvent) {
    if (loadedEvent) {
      title = loadedEvent.title || "";
      description = loadedEvent.description || "";
      typeId = loadedEvent.type.id || null;
      dateTime = formatDateTimeForInput(loadedEvent.dateTime);
      isPrivate = loadedEvent.isPrivate || false;
      price = loadedEvent.price || 0;
      acceptsOnlinePayment = loadedEvent.acceptsOnlinePayment || false;
      acceptsVenuePayment = loadedEvent.acceptsVenuePayment || false;
      latitude = loadedEvent.location?.latitude ?? null;
      longitude = loadedEvent.location?.longitude ?? null;
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const eventData = {
      title: title.trim(),
      description: description.trim(),
      typeId: typeId,
      dateTime: dateTime,
      latitude: latitude,
      longitude: longitude,
      isPrivate: isPrivate,
      price: price,
      acceptsOnlinePayment: acceptsOnlinePayment,
      acceptsVenuePayment: acceptsVenuePayment,
    };

    const { result, ok, error } = await apiFetch(
      `${$BASE_URL}/api/events/${id}`,
      {
        method: "PUT",
        body: eventData,
      },
    );

    if (ok) {
      const eventId = result.data.event.id;
      toastr.success("Event saved!");
      navigate(`/events/${eventId}`);
    } else {
      toastr.error(error?.message || "Event could not be saved.");
      console.error("Submission error:", error);
    }
  }

  function handleDeleteEvent() {
    showConfirmationModal = true;
  }

  function cancelDeletion() {
    showConfirmationModal = false;
  }

  async function confirmAndDeleteEvent() {
    showConfirmationModal = false;
    isLoading = true;

    const { ok, error } = await apiFetch(`${$BASE_URL}/api/events/${id}`, {
      method: "DELETE",
    });

    isLoading = false;

    if (ok) {
      if (storeSubscription) {
        storeSubscription();
      }

      toastr.success("Event deleted successfully.");
      eventForEditing.set(null);
      navigate("/home");
    } else {
      toastr.error(error?.message || "Failed to delete event.");
      console.error("Error deleting event:", error);
    }
  }

  onDestroy(() => {
    if (storeSubscription) {
      storeSubscription();
    }
    eventForEditing.set(null);
  });
</script>

<svelte:head>
  <title>EventPulse | Edit: {title || "Event"}</title>
</svelte:head>

{#if isLoading}
  <p class="loading-message">Loading event data...</p>
{:else if eventToEdit}
  <main>
    <div class="edit-event-container">
      <h1>
        Editing Event: <span class="event-title-display"
          >{eventToEdit.title}</span
        >
      </h1>

      <form onsubmit={handleSubmit}>
        <fieldset>
          <legend>Event Details</legend>
          <TitleDesctiptionInput bind:title bind:description />
          <EventTypeInput bind:typeId />
          <PublicityInput bind:isPrivate />
        </fieldset>

        <fieldset class="form-fieldset">
          <legend>Date & Time</legend>
          <DateTimeInput bind:dateTime />
        </fieldset>

        <fieldset class="form-fieldset">
          <legend>Tickets & Pricing</legend>
          <div class="field-group">
            <div class="form-field">
              <PriceInput bind:price />
              <TicketTypeInput
                bind:price
                bind:acceptsOnlinePayment
                bind:acceptsVenuePayment
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>Location (Optional)</legend>
          <EventLocationMapInput bind:latitude bind:longitude />
        </fieldset>

        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Save Changes</button>
        </div>
      </form>

      <div class="delete-action-section">
        <button class="btn btn-danger" onclick={handleDeleteEvent}
          >Delete Event</button
        >
      </div>

      <ConfirmationModal
        isOpen={showConfirmationModal}
        title="Confirm Event Deletion"
        message="Are you sure you want to delete this event? This action cannot be undone."
        onConfirm={confirmAndDeleteEvent}
        onCancel={cancelDeletion}
      />
    </div>
  </main>
{:else}
  <p class="error-message">
    Event data could not be loaded or event not found.
  </p>
{/if}

<style>
  .edit-event-container {
    max-width: 650px;
    margin: 30px auto;
    padding: 25px;
    background-color: var(--ep-background-dark);
    border-radius: 8px;
  }

  h1 {
    text-align: center;
    color: var(--ep-text-primary);
    margin-bottom: 25px;
    font-size: 1.8em;
  }
  .event-title-display {
    color: var(--ep-primary);
    font-style: italic;
  }

  .form-actions,
  .delete-action-section {
    margin-top: 20px;
  }

  .form-actions .btn-primary {
    display: block;
    width: 60%;
    height: 50px;
    margin-left: auto;
    margin-right: auto;
    margin-top: 20px;
    font-size: 1.3em;
  }

  .form-actions .btn-primary,
  .delete-action-section .btn-danger {
    display: block;
  }
  .delete-action-section .btn-danger {
    margin-top: 100px;
    width: 20%;
    margin-left: auto;
    margin-right: auto;
    background-color: var(--ep-error);
    color: var(--ep-text-on-primary);
  }
  .delete-action-section .btn-danger:hover {
    background-color: color-mix(in srgb, var(--ep-error) 85%, black);
  }

  .loading-message,
  .error-message {
    text-align: center;
    padding: 20px;
    font-size: 1.1em;
    color: var(--ep-text-secondary);
  }
</style>
