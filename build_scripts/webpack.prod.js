import webpack from 'webpack';
import webpackConfig from '../build_config/webpack.config.js';

webpack(webpackConfig, (err, stats) => {
	if (err) {
		console.error(err);
		return;
	}

	console.log(stats.toString({
		chunks: false,  // Makes the build much quieter
		colors: true    // Shows colors in the console
	}));
});