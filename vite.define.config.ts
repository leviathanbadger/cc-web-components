import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        emptyOutDir: false,
        lib: {
            entry: resolve(__dirname, 'src/define.ts'),
            name: 'CCWebComponents',
            formats: ['es'],
            fileName: format => `cc-web-components.define.${format}.js`
        },
        rollupOptions: {
            external: [],
            output: {
                globals: {}
            }
        }
    },
    test: {
        environment: 'jsdom',
        setupFiles: './vitest.setup.ts'
    }
});
