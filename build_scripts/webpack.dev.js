import paths from '../build_config/paths.js';
import webpack from 'webpack';
import WebpackDevServ from 'webpack-dev-server';
import webpackConfig from '../build_config/webpack.config.js';

const wpc = webpack(webpackConfig);
const server = new WebpackDevServ(wpc, {
	contentBase: paths.publicPath,
	watchContentBase: true,
	liveReload: true
});

server.listen(paths.PORT, paths.IP, () => {
	if(paths.IP == '0.0.0.0') {
		console.log('\x1b[33m%s\x1b[0m', 'Starting server on:');
		paths.IPaddresses.forEach(function(IP) {
			console.log('\x1b[33m%s\x1b[0m', 'http://' + IP + ':' + paths.PORT);
		});
	} else {
		console.log('\x1b[33m%s\x1b[0m', 'Starting server on http://' + paths.IP + ':' + paths.PORT);
	}
});