import App from './App.svelte';
import './styles/base.scss';

const app = new App({ target: document.body });

(window as any).app = app;

export default app;
