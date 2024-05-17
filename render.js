import fs from 'fs';
import path from 'path';
import cheerio from 'cheerio';
import TextToSVG from 'text-to-svg';
import Color from 'color';
import * as libs from './libs.js';

const regularFont = TextToSVG.loadSync(path.join(process.cwd(), '/assets/fonts/Comfortaa/Comfortaa-Regular.ttf'));
const boldFont = TextToSVG.loadSync(path.join(process.cwd(), '/assets/fonts/Comfortaa/Comfortaa-Bold.ttf'));

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

export const getSVGTemplete = (type, language) => {
	try {
		return fs.readFileSync(path.join(process.cwd(), `/assets/svg_template/${type}/template_${language}.svg`), 'utf8');
	} catch (e) {
		return fs.readFileSync(path.join(process.cwd(), `/assets/svg_template/${type}/template_cn.svg`), 'utf8');
	}
};
export const getSVGContent = (x) => {
	return fs.readFileSync(path.join(process.cwd(), x), 'utf8');
};

const getTransformedX = (x, w, anchor = 'center') => {
	switch (anchor) {
		case 'left':
			return x - 550 / 2 + w / 2;
		case 'right':
			return x - 550 / 2 + w;
		default:
			return x - 550 / 2;
	}
};
const getTransformedXMini = (x, w, anchor = 'center') => {
	switch (anchor) {
		case 'left':
			return x - 400 / 2 + w / 2;
		case 'right':
			return x - 400 / 2 + w;
		default:
			return x - 400 / 2;
	}
};

export const getFlagSVG = (countryCode, x, y, h) => {
	let svg = libs.getFlagSVGByCountryCode(countryCode.toUpperCase());
	let $ = cheerio.load(svg);
	$('svg').attr('x', getTransformedX(x, h * 0.72, 'left'));
	$('svg').attr('y', y);
	$('svg').attr('height', h);
	return $.html('svg');
};
export const getFlagSVGMini = (countryCode, x, y, h) => {
	let svg = libs.getFlagSVGByCountryCode(countryCode.toUpperCase());
	let $ = cheerio.load(svg);
	$('svg').attr('x', getTransformedXMini(x, h * 0.72, 'left'));
	$('svg').attr('y', y);
	$('svg').attr('height', h);
	return $.html('svg');
};
export const getPlaymodeSVG = (playmode, x, y, h) => {
	let svg = libs.getPlaymodeSVG(playmode);
	let $ = cheerio.load(svg);
	$('svg').attr('x', getTransformedX(x, h, 'left'));
	$('svg').attr('y', y);
	$('svg').attr('height', h);
	return $.html('svg');
};
export const getPlaymodeSVGMini = (playmode, x, y, h) => {
	let svg = libs.getPlaymodeSVG(playmode);
	let $ = cheerio.load(svg);
	$('svg').attr('x', getTransformedXMini(x, h, 'left'));
	$('svg').attr('y', y);
	$('svg').attr('height', h);
	return $.html('svg');
};
export const getSupporterSVG = (x, y, h, level = 1) => {
	let svg = fs.readFileSync(path.join(process.cwd(), `/assets/icons/supporter_${level}.svg`), 'utf8');
	let $ = cheerio.load(svg);
	let viewBoxW = parseFloat($(svg).attr('viewBox').split(' ')[2]);
	let viewBoxH = parseFloat($(svg).attr('viewBox').split(' ')[3]);
	let scale = h / viewBoxH;
	$('svg').attr('x', getTransformedX(x, viewBoxW * scale, 'left'));
	$('svg').attr('y', y);
	$('svg').attr('height', h);
	return $.html('svg');
};

export const getTextSVGPath = (TextToSVGObj, text, x, y, size, anchor = 'left top') => {
	let path = TextToSVGObj.getPath(text, {
		x: x,
		y: y,
		fontSize: size,
		anchor: anchor,
		fontFamily: 'Comfortaa',
		attributes: {
			fill: '#fff'
		}
	});
	return path;
};
export const getTextSVGMetrics = (TextToSVGObj, text, x, y, size, anchor = 'left top') => {
	let metrics = TextToSVGObj.getMetrics(text, {
		x: x,
		y: y,
		fontSize: size,
		anchor: anchor,
		fontFamily: 'Comfortaa',
		attributes: {
			fill: '#fff'
		}
	});
	return metrics;
};

const replaceCalcedColors = (data, svg) => {
	let baseHue = data.options.color_hue;

	svg = svg.replace('{{hsl-b5}}', new Color(`hsl(${baseHue}, 10%, 15%)`).hex());
	svg = svg.replace('{{hsl-b4}}', new Color(`hsl(${baseHue}, 10%, 20%)`).hex());
	svg = svg.replace('{{hsl-h1}}', new Color(`hsl(${baseHue}, 100%, 70%)`).hex());

	return svg;
};
const replaceRoundAvatarClipPath = (data, ismini, svg) => {
	if (!data.options.round_avatar) {
		return svg;
	}
	if (ismini) {
		svg = svg.replace(/<path id="avatar_clip"(.*?)\/>/, '<circle id="avatar_clip" class="cls-1" cx="61" cy="6" r="45"/>');
	} else {
		svg = svg.replace(/<path id="avatar_clip"(.*?)\/>/, '<circle id="avatar_clip" class="cls-4" cx="62.5" cy="60.5" r="42.2"/>');
	}
	return svg;
};
const setMargin = (data, svg) => {
	let margin = data.options.margin;
	if (margin.reduce((a, b) => a + b) == 0) {
		return svg;
	}
	if (margin.length > 4) {
		margin = margin.slice(0, 4);
	}
	if (margin.length == 3) {
		margin.push(0);
	}
	let $ = cheerio.load(svg);
	$('svg').attr('style', `margin: ${margin.join('px ')}px;`);
	return $.html('svg');
};

/**
 * @param {string} svg
 */
const minifySVG = (svg) => {
	return `<!-- Generated by osu-stats-signature -->\n<!-- https://github.com/10pc/kawata-stats -->\n${svg
		.replace(/[\n\t\r]/g, '')
		.replace(/\s+/g, ' ')}`;
};

// data(api, user config), mode(str)
export const getRenderedSVGFull = (data, mode, avatarBase64, userCoverImageBase64) => {
	let templete = getSVGTemplete('full', 'en');
	let info = data.player.info;
	let stats = data.player.stats;

	const playmodes = {
		std: '4',
		taiko: '0',
		catch: '1',
		mania: '2',
	}

	//尺寸
	templete = templete.replace('{{width}}', 550);
	templete = templete.replace('{{height}}', 320);
	//外边距
	templete = setMargin(data, templete);

	//动画
	templete = templete.replace('{{fg-extra-class}}', 'true' ? 'animation-enabled' : '');

	//颜色
	templete = replaceCalcedColors(data, templete);

	//圆头像
	templete = replaceRoundAvatarClipPath(data, false, templete);

	//名字
	templete = templete.replace('{{name}}', getTextSVGPath(boldFont, info.name, 130, 20, 28));
	let nameWidth = getTextSVGMetrics(boldFont, info.name, 130, 20, 28).width;
	//Support Tag
	if (info.donor_end > 0) {
		templete = templete.replace('{{supporter-tag}}', getSupporterSVG(130 + nameWidth + 10, 24, 22, 2));
	} else {
		templete = templete.replace('{{supporter-tag}}', '');
	}

	templete = templete.replace('{{avatar-base64}}', avatarBase64);
	templete = templete.replace('{{user-cover-base64}}', userCoverImageBase64);

	templete = templete.replace('{{flag}}', getFlagSVG(info.country, 135, 56, 20));
	templete = templete.replace('{{country}}', getTextSVGPath(regularFont, info.country.toUpperCase(), 161, 59.5, 14));

	templete = templete.replace('{{playmode-icon}}', getPlaymodeSVG(playmodes[mode], 130, 88, 15));
	templete = templete.replace('{{playmode}}', getTextSVGPath(regularFont, libs.getPlaymodeFullName(mode), 150, 89, 12));

	// until api update, no way of showing level
	templete = templete.replace('{{level}}', getTextSVGPath(boldFont, 'NULL', 290, 143, 12, 'center middle'));
	//user.statistics.level.current.toString()
	templete = templete.replace(
		'{{level-percent}}',
		getTextSVGPath(regularFont, 'NULL' + '%', 259.5, 145, 9, 'right top') //user.statistics.level.progress
	);
	templete = templete.replace(
		'{{level-bar-fg}}',
		`<path class="cls-10" d="M20,135a2.5,2.5,0,0,0,2.5,2.5H${clamp(
			Math.round((100 / 100) * (256 - 21) + 21), //user.statistics.level.progress
			21,
			256
		)}.833a2.5,2.5,0,0,0,0-5H22.5A2.5,2.5,0,0,0,20,135Z" transform="translate(0 2)" />`
	);

	const gradesName = ['xh_count', 'x_count', 'sh_count', 's_count', 'a_count'];
	let gradeTextX = 360.7;
	for (let grade of gradesName) {
		templete = templete.replace(
			`{{${grade}}}`,
			getTextSVGPath(regularFont, stats[playmodes[mode]][grade].toString(), gradeTextX, 153, 9, 'center middle')
		);
		gradeTextX += 38.62;
	}

	templete = templete.replace('{{pp}}', getTextSVGPath(regularFont, libs.formatNumber(Math.round(stats[playmodes[mode]].pp)), 20, 202, 13));

	templete = templete.replace('{{medals}}', getTextSVGPath(regularFont, libs.formatNumber(info.badges.length), 82, 202, 13));

	templete = templete.replace('{{playtime}}', getTextSVGPath(regularFont, libs.formatPlaytime(stats[playmodes[mode]].playtime), 126, 202, 13));

	let globalRanking = libs.formatNumber(stats[playmodes[mode]].rank, '#');
	templete = templete.replace('{{global-ranking}}', getTextSVGPath(regularFont, globalRanking, 268, 211, globalRanking.length < 10 ? 27 : 25));
	templete = templete.replace(
		'{{country-ranking}}',
		getTextSVGPath(regularFont, libs.formatNumber(stats[playmodes[mode]].country_rank, '#'), 269, 277, 17)
	);

	const statsName = ['rscore', 'plays', 'tscore', 'total_hits', 'replay_views'];
	let statsTextY = 227;
	for (let stat of statsName) {
		templete = templete.replace(
			`{{${stat}}}`,
			getTextSVGPath(regularFont, libs.formatNumber(stats[playmodes[mode]][stat]), 218, statsTextY, 10, 'right top')
		);
		statsTextY += 16;
	}

	templete = templete.replace('{{acc}}', getTextSVGPath(regularFont, stats[playmodes[mode]].acc.toFixed(2).toString() + '%', 424, 202, 13));

	templete = templete.replace(
		'{{max-combo}}',
		getTextSVGPath(regularFont, libs.formatNumber(stats[playmodes[mode]].max_combo) + 'x', 483, 202, 13)
	);
	//bp -> replace NULL with libs.formatNumber(Math.round(data.extras?.scoresBest[0]?.pp ?? 0))
	templete = templete.replace(
		'{{bp}}',
		getTextSVGPath(regularFont, 'NULL' + 'pp', 424, 249, 13)
	);
	//第一名 -> replace NULL with libs.formatNumber(user.scores_first_count)
	templete = templete.replace('{{first-place}}', getTextSVGPath(regularFont, 'NULL', 483, 249, 13));

	return templete;
};

export const getRenderedSVGMini = (data, mode, avatarBase64, userCoverImageBase64) => {
	let templete = getSVGTemplete('mini', data.options.language);
	let user = data.user;

	//尺寸
	templete = templete.replace('{{width}}', data.options.size.width);
	templete = templete.replace('{{height}}', data.options.size.height);
	//外边距
	templete = setMargin(data, templete);

	//动画
	templete = templete.replace('{{fg-extra-class}}', data.options.animation ? 'animation-enabled' : '');

	//颜色
	templete = replaceCalcedColors(data, templete);

	//圆头像
	templete = replaceRoundAvatarClipPath(data, false, templete);

	//名字
	templete = templete.replace('{{name}}', getTextSVGPath(boldFont, user.username, 118, 14, 25));

	//头像和封面
	templete = templete.replace('{{avatar-base64}}', avatarBase64);
	templete = templete.replace('{{user-cover-base64}}', userCoverImageBase64);

	//国旗
	templete = templete.replace('{{flag}}', getFlagSVGMini(user.country_code, 368, 8, 18));

	//区内排名
	templete = templete.replace(
		'{{country-ranking}}',
		getTextSVGPath(regularFont, libs.formatNumber(user.statistics.country_rank, '#'), 360, 12, 10, 'right top')
	);

	//模式
	templete = templete.replace('{{playmode-icon}}', getPlaymodeSVGMini(data.current_mode, 372, 30, 12));

	//等级 -> replace NULL with user.statistics.level.current.toString()
	templete = templete.replace(
		'{{level}}',
		getTextSVGPath(regularFont, 'lv.' + 'NULL', 369, 31, 10, 'right top')
	);

	//全球排名
	let globalRanking = libs.formatNumber(user.statistics.global_rank, '#');
	templete = templete.replace('{{global-ranking}}', getTextSVGPath(regularFont, globalRanking, 120, 86, globalRanking.length < 10 ? 18 : 17));

	//pp
	templete = templete.replace('{{pp}}', getTextSVGPath(regularFont, libs.formatNumber(Math.round(user.statistics.pp)), 226, 81.5, 13));
	//acc
	templete = templete.replace('{{acc}}', getTextSVGPath(regularFont, user.statistics.hit_accuracy.toFixed(2).toString() + '%', 281, 81.5, 13));
	//游戏次数
	templete = templete.replace('{{play-count}}', getTextSVGPath(regularFont, libs.formatNumber(user.statistics.play_count), 336, 81.5, 13));

	return templete;
};

export const getErrorSVG = (err) => {
	return regularFont.getSVG(err, {
		x: 0,
		y: 0,
		fontSize: 30,
		anchor: 'left top',
		attributes: {
			fill: '#ff66ab'
		}
	});
};
