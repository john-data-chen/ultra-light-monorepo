import adapter from "@sveltejs/adapter-vercel";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  compilerOptions: {
    // Force runes mode for the project, except for libraries. Can be removed in svelte 6.
    runes: ({ filename }) => (filename.split(/[/\\]/).includes("node_modules") ? undefined : true)
  },
  kit: {
    // Targets Vercel. The default Node.js serverless runtime is required because the app
    // talks to PostgreSQL over TCP via `pg` (the edge runtime can't). See
    // https://svelte.dev/docs/kit/adapter-vercel for runtime/region options.
    adapter: adapter(),

    csp: {
      mode: "nonce",
      directives: {
        "default-src": ["self"],
        "script-src": ["self", "https://va.vercel-scripts.com"],
        "style-src": ["self", "unsafe-inline"],
        "img-src": ["self", "data:"],
        "font-src": ["self", "data:"],
        "connect-src": ["self", "https://va.vercel-scripts.com"],
        "frame-ancestors": ["none"],
        "object-src": ["none"],
        "base-uri": ["self"]
      }
    },

    typescript: {
      config: (config) => ({
        ...config,
        include: [...config.include]
      })
    }
  }
};

export default config;
