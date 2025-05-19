import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, 'src/index.ts'),
                define: resolve(__dirname, 'src/define.ts')
            },
            name: 'CCWebComponents',
            formats: ['es', 'umd'],
            fileName: (format, entryName) =>
                entryName === 'index'
                    ? `cc-web-components.${format}.js`
                    : `cc-web-components.${entryName}.${format}.js`
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
