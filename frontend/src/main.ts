import App from './App.svelte';
import './styles/base.scss';

const app = new App({ target: document.body });

(window as any).app = app;
// hack for immer: https://github.com/immerjs/immer/issues/557
(window as any).process = {
  env: {
    NODE_ENV: "production"
  }
};
export default app;
