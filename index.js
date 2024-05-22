import express from 'express';
import path from 'path';
import NodeCache from 'node-cache';
import * as libs from './libs.js';
import * as render from './render.js';
import * as api from './api.js';
import convert from 'svg2img';
import fs from 'fs';

const cacheControl = new NodeCache({ stdTTL: 600, checkperiod: 600, deleteOnExpire: true });
const app = express();

app.use('/', express.static(path.join(process.cwd(), '/static')));

app.get('/card', async function (req, res) {
	res.set({'Cache-Control': 'public, max-age=3600'})
	const username = req.query.user ?? '';
	const gamemode = req.query.gamemode ?? 'std';
	const mode = req.query.mode ?? 'vn';
	const type = req.query.type ?? 'svg';

	let userData, avatarBase64, userCoverImage;

	userData = await api.getUser(username, gamemode, mode);
	if (userData.error) return res.send(render.getErrorSVG('Error: ' + userData.error));
	avatarBase64 = await api.getImageBase64(`https://a.kawata.pw/${userData.player.info.id}`);
	userCoverImage = await api.getImage(`https://kawata.pw/banners/${userData.player.info.id}`);

	let blur = 0;
	if (req.query.blur != undefined && req.query.blur == '') {
		blur = 6;
	} else if (req.query.blur != undefined) {
		blur = parseFloat(req.query.blur);
	}
	const flop = req.query.flop != undefined;
	const isMini = req.query.mini != undefined && req.query.mini == 'true';
	let userCoverImageBase64, width, height;

	if(userCoverImage != "0"){
		if (isMini) {
			userCoverImageBase64 = await libs.getResizdCoverBase64(userCoverImage, 400, 120, blur, flop);
			[width, height] = [400, 120];
		} else {
			userCoverImageBase64 = await libs.getResizdCoverBase64(userCoverImage, 550, 120, blur, flop);
			[width, height] = [550, 320];
		}
	}

	const margin = (req.query.margin ?? '0,0,0,0').split(',').map((x) => parseInt(x));
	userData.options = {
		animation: req.query.animation != undefined && req.query.animation != 'false',
		size: {
			width: parseFloat(req.query.w ?? width),
			height: parseFloat(req.query.h ?? height)
		},
		round_avatar: req.query.round_avatar != undefined && req.query.round_avatar != 'false',
		color_hue: parseInt(req.query.hue ?? 333),
		margin
	};

	const svg = isMini
		? await render.getRenderedSVGMini(userData, gamemode, mode, avatarBase64, userCoverImageBase64)
		: await render.getRenderedSVGFull(userData, gamemode, mode, avatarBase64, userCoverImageBase64);

	if (type == 'svg'){
		res.set({'Content-Type': 'image/svg+xml'});
		res.send(svg);
	} else {
		res.set({'Content-Type': 'image/png'});

		await convert(svg, function(error, buffer) {
			if (error) {
	            res.status(500).send('Error converting SVG to PNG');
	            return;
	        }
	        res.send(buffer);
		});
	}
});

app.listen(process.env.PORT || 3000);
console.log("listening on port 3000")
