import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://atlas.z-ai.cc",
  output: "static",
  integrations: [mdx(), sitemap(), svelte()],
});
