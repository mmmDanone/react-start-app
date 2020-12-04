import os from 'os';
import path from 'path';
const __dirname = path.resolve();
import fs from 'fs';
const packageJSON = JSON.parse(fs.readFileSync('./package.json', 'utf8'));

function getIP() {
	let ifaces = os.networkInterfaces();
	let ip = [];

	Object.keys(ifaces).forEach(function (ifname) {
		ifaces[ifname].forEach(function (iface) {
			if ('IPv4' !== iface.family) {
				return;
			}

			ip.push(iface.address);
		});
	});

	return ip;
}

export default {
	root: __dirname,
	publicURL: (!!packageJSON.homepage) ? packageJSON.homepage : '',
	mainEntry: path.resolve(__dirname, 'src/index.js'),
	srcPath: path.resolve(__dirname, 'src'),
	publicPath: path.resolve(__dirname, 'public'),
	tplHTML: path.resolve(__dirname, 'public/index.html'),
	output: path.resolve(__dirname, 'build'),
	alias: {
		'@': path.resolve(__dirname, 'src'),
		'^': path.resolve(__dirname, 'project_config/config.js')
	},
	IPaddresses: getIP(),
	IP: '0.0.0.0',
	PORT: 3000
}