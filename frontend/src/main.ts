import App from './App.svelte';
import { init, captureMessage } from '@sentry/browser';
import { getConfig } from './config';

init({
  dsn: getConfig().sentry.dsn
});

captureMessage("testing");

const app = new App({
	target: document.body,
	props: {
		name: 'world'
	}
});

(window as any).app = app;

export default app;


