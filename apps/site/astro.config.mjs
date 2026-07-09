import mdx from "@astrojs/mdx";
import svelte from "@astrojs/svelte";
import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  integrations: [mdx(), svelte()],
});
