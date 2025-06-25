/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Handle binary files on the server side
      config.module.rules.push({
        test: /\.(pdf|png|jpg|jpeg|gif)$/,
        type: 'asset/resource',
      });
    }
    return config;
  },
};

export default config;
