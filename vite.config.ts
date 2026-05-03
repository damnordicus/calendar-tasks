import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vite';
import { existsSync, readFileSync } from 'fs';

const certKey = './localhost+1-key.pem';
const certFile = './localhost+1.pem';
const localHttps =
	existsSync(certKey) && existsSync(certFile)
		? { key: readFileSync(certKey), cert: readFileSync(certFile) }
		: undefined;

export default defineConfig({
	server: {
		https: localHttps,
		host: true,
	},
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
					{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
					{ src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
					{
						src: '/icons/icon-maskable-512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable'
					}
				]
			}
		})
	]
});
