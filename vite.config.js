export default {
    root: '.',
    publicDir: './static/',
    base: './',
    server:
        {
            host: true,
        },
    build:
        {
            outDir: '../dist',
            emptyOutDir: true,
            sourcemap: true
        }
}