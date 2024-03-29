import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import mkcert from 'vite-plugin-mkcert';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact(), mkcert()],
  define: {
    "process.env.IS_PREACT": JSON.stringify("true"),
  },
});
