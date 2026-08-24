import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),

      {
        name: 'copy-seo-files',

        closeBundle() {
          const rootDir = process.cwd();
          const distDir = path.resolve(rootDir, 'dist');

          const seoFiles = [
            'sitemap.xml',
            'robots.txt',
          ];

          if (!fs.existsSync(distDir)) {
            fs.mkdirSync(distDir, {
              recursive: true,
            });
          }

          for (const fileName of seoFiles) {
            const source = path.resolve(
              rootDir,
              fileName
            );

            const destination = path.resolve(
              distDir,
              fileName
            );

            if (fs.existsSync(source)) {
              fs.copyFileSync(
                source,
                destination
              );

              console.log(
                `[SEO] Copied ${fileName} → dist/${fileName}`
              );
            } else {
              console.warn(
                `[SEO] ${fileName} not found at project root`
              );
            }
          }
        },
      },
    ],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },

    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr:
        process.env.DISABLE_HMR !== 'true',

      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch:
        process.env.DISABLE_HMR === 'true'
          ? null
          : {},
    },

    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
  };
});
