import { AppState } from './app.svelte';
import { IndexedDbStore } from './store';

/** The one app state for the running page. Opening the database is deferred to `init()`. */
export const app = new AppState(new IndexedDbStore());
