import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'CCWebComponents',
            formats: ['es', 'umd'],
            fileName: (format) => `cc-web-components.${format}.js`
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
