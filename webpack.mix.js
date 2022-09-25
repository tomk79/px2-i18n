const mix = require('laravel-mix');

/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */

mix
	.webpackConfig({
		module: {
			rules:[
				{
					test: /\.txt$/i,
					use: ['raw-loader'],
				},
				{
					test: /\.csv$/i,
					loader: 'csv-loader',
					options: {
						dynamicTyping: true,
						header: false,
						skipEmptyLines: false,
					},
				},
				{
					test:/\.twig$/,
					use:['twig-loader']
				}
			]
		},
		resolve: {
			fallback: {
				"fs": false,
				"path": false,
				"crypto": false,
				"stream": false,
			}
		}
	})


	// --------------------------------------
	// multitext
	.js('./src/fields/i18n_multitext/multitext.js', './fields/i18n_multitext/frontend/')
	.sass('./src/fields/i18n_multitext/multitext.scss', './fields/i18n_multitext/frontend/')

	// --------------------------------------
	// summernote
	.js('./src/fields/i18n_summernote/summernote.js', './fields/i18n_summernote/frontend/')
	.sass('./src/fields/i18n_summernote/summernote.scss', './fields/i18n_summernote/frontend/')

	// --------------------------------------
	// text
	.js('./src/fields/i18n_text/text.js', './fields/i18n_text/frontend/')
	.sass('./src/fields/i18n_text/text.scss', './fields/i18n_text/frontend/')

	// --------------------------------------
	// html_attr_text
	.js('./src/fields/i18n_html_attr_text/html_attr_text.js', './fields/i18n_html_attr_text/frontend/')
	.sass('./src/fields/i18n_html_attr_text/html_attr_text.scss', './fields/i18n_html_attr_text/frontend/')
;
