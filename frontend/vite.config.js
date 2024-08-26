import { resolve, join } from 'path';
import { defineConfig } from 'vite';
import license from 'rollup-plugin-license';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [
        vue(),
        license({
            sourcemap: true,
            banner: {
                commentStyle: 'regular',
                content: {
                    file: join(__dirname, 'LICENSE'),
                },
            },
            thirdParty: {
                output: {
                    file: join(__dirname, 'dist', 'js_dependencies.txt'),
                },
            },
        }),
    ],
    build: {
        cssCodeSplit: false,
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                processor: resolve(__dirname, 'audio.worklet.ts'),
            },
            // TODO: better names
            output: {
                assetFileNames: (info) => {
                    return `assets/[name].[ext]`;
                },
                entryFileNames: (info) => {
                    return `assets/[name].js`;
                },
            },
        },
    },
});
