const path = require('path');
let webpack = require('webpack');

module.exports = {
	mode: 'development',
	context: path.resolve(__dirname),
	entry: {
		index: path.join(__dirname, 'frontend', 'index.js')
		// index: {
		// 	import: path.join(__dirname, 'frontend', 'index.js'),
		// 	dependOn: ['vendors']
		// },
		// vendors: [
		// 	'axios',
		// 	'bowser',
		// 	'jsx-render',
		// 	'jwt-decode',
		// 	'leaflet',
		// 	'leaflet-rotatedmarker',
		// 	'marzipano',
		// 	'screenfull'
		// ]
	},
	output: {
		path: path.join(__dirname, 'backend', 'public'),
		filename: '[name].bundle.js',
		// chunkFilename: '[name].bundle.js'
	},
	// optimization: {
		// splitChunks: {
		// 	chunks: 'all'
		// }
	// },
	module: {
		rules: [{
			test: /\.m?js$/,
			// include: path.resolve(__dirname, 'frontend'),
			exclude: [/node_modules/, /bower_components/],
			use: {
				loader: 'babel-loader',
				options: {
					presets: [
						[
							"@babel/preset-env",
							{
								targets: {
									ie: 11
								},
								useBuiltIns: "usage",
								corejs: 3
							}
						]
					],
					plugins: [
						"@babel/plugin-syntax-jsx",
						[
							"@babel/plugin-transform-react-jsx",
							{ "pragma": "dom" }
						]
					]
				}
			}
		}]
	},
	plugins: [
		new webpack.ProvidePlugin({
            dom: ['jsx-render', 'default'] // imports the dom() function for JSX support to each file
        })
	],
	resolve: {
		extensions: ['.json', '.js'],
		alias: {
			'frontend': path.join(__dirname, 'frontend'),
			'editor': path.join(__dirname, 'frontend', 'editor'),
			'node_modules': path.join(__dirname, 'node_modules'),
			'marzipano': path.join(__dirname, 'node_modules', 'marzipano', 'dist', 'marzipano.js')
		}
	},
	watchOptions: {
		ignored: ['node_modules/**']
	},
	devtool: 'source-map',
	devServer: {
		contentBase: path.join(__dirname, 'backend', 'public'),
		inline: true,
		host: 'localhost',
		port: 3000,
	}
};