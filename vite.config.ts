import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit(),
		VitePWA({
			strategies: 'injectManifest',
			srcDir: 'src',
			filename: 'sw.ts',
			registerType: 'autoUpdate',
			injectManifest: {
				globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}']
			},
			manifest: {
				name: 'DayTasks',
				short_name: 'DayTasks',
				description: 'Daily task manager with smart reminders',
				theme_color: '#6366f1',
				background_color: '#020617',
				display: 'standalone',
				orientation: 'portrait-primary',
				start_url: '/',
				scope: '/',
				icons: [
					{ src: '/icons/icon-192.svg', sizes: '192x192', type: 'image/svg+xml' },
					{ src: '/icons/icon-512.svg', sizes: '512x512', type: 'image/svg+xml' },
					{
						src: '/icons/icon-maskable-512.svg',
						sizes: '512x512',
						type: 'image/svg+xml',
						purpose: 'maskable'
					}
				]
			}
		})
	]
});
