import { resolve, join } from 'path';
import { defineConfig } from 'vite';
import license from 'rollup-plugin-license';
import vue from '@vitejs/plugin-vue';

function basePath() {
    try {
        return process.env.BASE_PATH;
    } catch (e) {
        return '';
    }
}

function hasBackend() {
    try {
        let i = parseInt(process.env.HAS_BACKEND);
        return !!i;
    } catch (e) {
        return false;
    }
}
export default defineConfig({
    base: basePath(),
    define: {
        __HAS_BACKEND__: hasBackend(),
    },
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
