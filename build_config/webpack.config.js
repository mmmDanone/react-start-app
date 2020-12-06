import path from 'path';
import paths from './paths.js';
import webpack from 'webpack';
import HTMLWPP from 'html-webpack-plugin';
import HTMLReplaceWPP from 'html-replace-webpack-plugin';
import {CleanWebpackPlugin as CleanWPP} from 'clean-webpack-plugin';
import CopyWPP from 'copy-webpack-plugin';
import MiniCSSExtractPlugin from 'mini-css-extract-plugin';
import MinifyCSSWPP from 'css-minimizer-webpack-plugin';
import terserWPP from 'terser-webpack-plugin';
import {deviceFirst} from '../project_config/config.js';
global.deviceFirst = deviceFirst;

const isDev = process.env.NODE_ENV == 'development';
const isProd = process.env.NODE_ENV == 'production';

function stylesLoaders(preprocessor, module) {
	let loaders = [{
			loader: (isProd) ? MiniCSSExtractPlugin.loader : 'style-loader'
		}];

	let css = {
		loader: 'css-loader',
		options: {
			importLoaders: 1,
		}
	};
	if(!!module) {
		css.options.modules = {
			localIdentName: '[local]--[hash:base64:5]'
		}
	}
	loaders.push(css);

	let postCSS = {
		loader: 'postcss-loader',
		options: {
			postcssOptions: {
				 plugins: [
					['autoprefixer']
				]
			}
		}
	}
	if(isDev) {
		postCSS.options.postcssOptions.plugins.push(['postcss-combine-media-query']);
		postCSS.options.postcssOptions.plugins.push(['postcss-sort-media-queries', {sort: deviceFirst}]);
	}
	loaders.push(postCSS);

	loaders.push({
		loader: preprocessor + '-loader',
	});

	return loaders;
}

function styleMinify(data, inputMap, minimizerOptions) {
	const postcss = require('postcss');
	const postcssgmq = require('postcss-combine-media-query');
	const postcsssmq = require('postcss-sort-media-queries');
	const postcsso = require('postcss-csso');
	const [[filename, input]] = Object.entries(data);

	const postcssOptions = {
		from: filename,
		to: filename
	};

	//minimizerOptions.deviceFirst galactic hack xD

	return postcss([postcssgmq, postcsssmq({sort: minimizerOptions.deviceFirst}), postcsso])
	.process(input, postcssOptions)
	.then((result) => {
		return {
			css: result.css,
			warnings: result.warnings()
		};
	});
};

function entry() {
	let conf = {
		polyfill: '@babel/polyfill',
		index: paths.mainEntry
	}

	if(isDev) {
		conf.livereload = 'webpack-dev-server/client';
	}

	return conf;
}

function optimization() {
	let conf = {
		splitChunks: {
			chunks: 'all',
			minChunks: 2,
			name: false
		},
		runtimeChunk: 'single'
	}

	if(isProd) {
		conf.minimize = true;
		conf.minimizer = [
			new MinifyCSSWPP({
				minimizerOptions: {
					deviceFirst: deviceFirst//galactic hack xD
				},
				sourceMap: false,
				minify: styleMinify
			}),
			new terserWPP({
				terserOptions: {
					format: {
						comments: false,
					},
				},
				extractComments: false
			})
		];
	}

	return conf;
}

function plugins() {
	let wpPlugins = [
		new HTMLWPP({
			inject: true,
			template: paths.tplHTML,
			minify: {
				collapseWhitespace: isProd,
				removeComments: isProd
			}
		}),
		new HTMLReplaceWPP([
			{
				pattern: '%PUBLIC_URL%',
				replacement: paths.publicURL
			}
		]),
		new CleanWPP(),
		new CopyWPP({
			patterns: [
				{
					from: paths.publicPath,
					to: paths.output,
					filter: (resourcePath) => {
						if(path.resolve(resourcePath) == paths.tplHTML) {
							return false;
						}
						return true;
					}
				}
			]
		}),
		new webpack.ids.HashedModuleIdsPlugin({
			context: paths.root,
			hashFunction: 'sha256',
			hashDigest: 'hex',
			hashDigestLength: 5
		})
	];

	if(isProd) {
		wpPlugins.push(new MiniCSSExtractPlugin({
			filename: 'static/styles/style_[contenthash].css',
			chunkFilename: 'static/styles/[id]_[contenthash].css',
			linkType: false,
			ignoreOrder: false
		}));
	}

	return wpPlugins;
}

export default {
	mode: (isDev) ? 'development' : 'production',
	devtool: (isDev) ? 'inline-cheap-module-source-map' : undefined,
	stats: 'verbose',
	entry: entry(),
	output: {
		path: paths.output,
		publicPath: paths.publicURL + '/',
		filename: 'static/javascript/[name]_[contenthash].js',
		chunkFilename: 'static/javascript/[name]_[contenthash]_chunk.js'
	},
	resolve: {
		alias: paths.alias
	},
	optimization: optimization(),
	module: {
		rules: [
			{
				test: /\.js$/,
				exclude: /node_modules/,
				use: [
					{
						loader: 'babel-loader',
						options: {
							presets: [['@babel/preset-env', {loose: true}], '@babel/preset-react'],
							plugins: [['@babel/plugin-proposal-class-properties', {loose: true}]]
						}
					}
				]
			},
			{
				test: /\.(less|css)$/,
				exclude: /\.module\.(less|css)$/,
				use: stylesLoaders('less')
			},
			{
				test: /\.module\.(less|css)$/,
				use: stylesLoaders('less', true)
			},
			{
				test: /\.(gif|png|jpe?g|svg)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							name: 'static/media/[name]_[contenthash].[ext]',
						}
					},
					{
						loader: 'image-webpack-loader',
						options: {
							mozjpeg: {quality: 95, progressive: true},
							pngquant: {enabled: false},
							optipng: {optimizationLevel: 3},
							gifsicle: {interlaced: true},
							svgo: {plugins: [{removeViewBox: false}, {cleanupIDs: false}]}
						}
					}
				]
			},
			{
				test: /\.(eot|woff2|woff|ttf)$/,
				use: [
					{
						loader: 'file-loader',
						options: {
							//name: 'static/fonts/[name]_[contenthash].[ext]',
							name: function(resourcePath, resourceQuery) {
								return resourcePath.replace(paths.srcPath, 'static').replace(/\\/g, '/');
							}
						}
					}
				]
			}
		]
	},
	plugins: plugins()
}