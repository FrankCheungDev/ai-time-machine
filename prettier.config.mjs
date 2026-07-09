export default {
  plugins: ["prettier-plugin-astro", "prettier-plugin-svelte"],
  overrides: [
    {
      files: "pnpm-lock.yaml",
      options: {
        bracketSpacing: false,
        printWidth: 1000,
        singleQuote: true,
      },
    },
  ],
};
