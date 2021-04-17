import produce from 'immer';
import { writable } from 'svelte/store';
import { AutomaticPopup, profileApi, UserProfile } from './profileApi';

function createProfileStore() {
  const { subscribe, set } = writable(null);
  let latestProfile: UserProfile | null = null;

  const load = () => {
    return profileApi.get()
      .then(profile => {
        latestProfile = profile;
        set(profile);
      });
  };

  // quick reminder on flags in typescript: https://stackoverflow.com/questions/39359740/what-are-enum-flags-in-typescript

  const markPopupSeen = (popup: AutomaticPopup): Promise<void> => {
    if (!latestProfile) return;
    if ((latestProfile.hasSeenPopup & popup) == popup) return;

    latestProfile = produce(latestProfile, draft => {
      draft.hasSeenPopup |= popup;
    });
    set(latestProfile);
    return profileApi.update(latestProfile);

    // expect a websocket event to come through and hit load to keep everything in sync
  };

  return {
    subscribe,
    load,
    markPopupSeen
  };
}

export const profileStore = createProfileStore();
