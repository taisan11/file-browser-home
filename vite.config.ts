import {defineConfig} from "vite"
import fs from "node:fs";
import path from "node:path";
import {ViteMinifyPlugin} from "vite-plugin-minify"

function htmlspath() {
    const srcDir = path.resolve(__dirname, "src");
    const files = fs.readdirSync(srcDir);
    return files
        .filter(file => file.endsWith(".html"))
        .map(file => path.join("src", file));
}

export default defineConfig({
    css:{
        transformer:"lightningcss"
    },
    build:{
        cssMinify:"lightningcss",
        rollupOptions:{
            input:htmlspath()
        },
        outDir:"../dist",
        emptyOutDir:true,
    },
    root:"src",
    publicDir:"../public",
    plugins:[ViteMinifyPlugin({})]
})