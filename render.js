import fs from 'fs';
import path from 'path';
import cheerio from 'cheerio';
import TextToSVG from 'text-to-svg';
import * as libs from './libs.js';
const __dirname = path.resolve();
const textToSVGRegular = TextToSVG.loadSync(path.join(__dirname, '/assets/fonts/Comfortaa/Comfortaa-Regular.ttf'));
const textToSVGBold = TextToSVG.loadSync(path.join(__dirname, '/assets/fonts/Comfortaa/Comfortaa-Bold.ttf'));

const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

export const getSVGTemplete = () => {
	return fs.readFileSync(path.join(__dirname, '/assets/template.svg'), 'utf8');
}

const getTransformedX = (x, w) => {
	return x + w / 2 - 550 / 2;
}

export const getFlagSVG = (countryCode, x, y, h) => {
	let svg = libs.getFlagSVGByCountryCode(countryCode);
	var $ = cheerio.load(svg);
	$('svg').attr('x', getTransformedX(x, h * 0.72));
	$('svg').attr('y', y);
	$('svg').attr('height', h);
	return $.html('svg');
}
export const getPlaymodeSVG = (playmode, x, y, h) => {
	let svg = libs.getPlaymodeSVG(playmode);
	var $ = cheerio.load(svg);
	$('svg').attr('x', getTransformedX(x, h));
	$('svg').attr('y', y);
	$('svg').attr('height', h);
	return $.html('svg');
}
export const getTextSVGPath = (TextToSVGObj, text, x, y, size, anchor = 'left baseline') => {
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
}


export const getRenderedSVG = (data, avatarBase64, userCoverImageBase64) => {
	let templete = getSVGTemplete();


	//名字
	templete = templete.replace('{{name}}', getTextSVGPath(textToSVGBold, data.username, 130, 45, 28));

	//头像和封面
	templete = templete.replace('{{avatar-base64}}', avatarBase64);
	templete = templete.replace('{{user-cover-base64}}', userCoverImageBase64);

	//模式
	templete = templete.replace('{{playmode-icon}}', getPlaymodeSVG(data.current_mode, 130, 88, 15));
	templete = templete.replace('{{playmode}}', getTextSVGPath(textToSVGRegular, libs.getPlaymodeFullName(data.current_mode), 150, 99, 12));

	//国旗和国家名
	templete = templete.replace('{{flag}}', getFlagSVG(data.country_code, 135, 56, 20));
	templete = templete.replace('{{country}}', getTextSVGPath(textToSVGRegular, data.country.name, 161, 72, 14));

	//等级
	templete = templete.replace('{{level}}', getTextSVGPath(textToSVGBold, data.statistics.level.current.toString(), 290, 143, 12, 'center middle'));
	templete = templete.replace('{{level-percent}}', getTextSVGPath(textToSVGRegular, data.statistics.level.progress + "%", 259.5, 152.5, 9, 'right'));
	templete = templete.replace('{{level-bar-fg}}', `<path class="cls-10" d="M20,135a2.5,2.5,0,0,0,2.5,2.5H${clamp(Math.round(data.statistics.level.progress / 100 * (256 - 21) + 21), 21, 256)}.833a2.5,2.5,0,0,0,0-5H22.5A2.5,2.5,0,0,0,20,135Z" transform="translate(0 2)" />`);

	//成绩计数
	const gradesName = ["ssh", "ss", "sh", "s", "a"];
	let gradeTextX = 360.7;
	for (let grade of gradesName) {
		templete = templete.replace(`{{${grade}-count}}`, getTextSVGPath(textToSVGRegular, data.statistics.grade_counts[grade].toString(), gradeTextX, 153, 9, 'center middle'));
		gradeTextX += 38.62;
	}

	//pp
	templete = templete.replace('{{pp}}', getTextSVGPath(textToSVGRegular, libs.formatNumber(Math.round(data.statistics.pp)), 20, 213, 13));

	//奖章
	templete = templete.replace('{{medals}}', getTextSVGPath(textToSVGRegular, libs.formatNumber(data.user_achievements.length), 82.1, 213, 13));

	//游戏时间
	templete = templete.replace('{{playtime}}', getTextSVGPath(textToSVGRegular, libs.formatPlaytime(data.statistics.play_time), 126, 213, 13));

	//全球排名/区内排名
	let globalRanking = libs.formatNumber(data.statistics.global_rank, '#');
	templete = templete.replace('{{global-ranking}}', getTextSVGPath(textToSVGRegular, globalRanking, 268, 235, globalRanking.length < 10 ? 27 : 25));
	templete = templete.replace('{{country-ranking}}', getTextSVGPath(textToSVGRegular, libs.formatNumber(data.statistics.country_rank, '#'), 269, 292, 17));

	//其他统计信息
	const statsName = ["ranked_score", "play_count", "total_score", "total_hits", "replays_watched_by_others"];
	let statsTextY = 235;
	for (let stat of statsName) {
		templete = templete.replace(`{{${stat.replace(/_/g, '-')}}}`, getTextSVGPath(textToSVGRegular, libs.formatNumber(data.statistics[stat]), 215, statsTextY, 10, 'right'));
		statsTextY += 16;
	}

	//acc
	templete = templete.replace('{{acc}}', getTextSVGPath(textToSVGRegular, data.statistics.hit_accuracy.toFixed(2).toString() + "%", 424, 213, 13));
	//最大连击
	templete = templete.replace('{{max-combo}}', getTextSVGPath(textToSVGRegular, libs.formatNumber(data.statistics.maximum_combo) + "x", 483, 213, 13));
	//bp
	templete = templete.replace('{{bp}}', getTextSVGPath(textToSVGRegular, libs.formatNumber(Math.round(data.extra_data?.scoresBest[0]?.pp ?? 0)) + "pp", 424, 260, 13));
	//第一名
	templete = templete.replace('{{first-place}}', getTextSVGPath(textToSVGRegular, libs.formatNumber(data.extra_data.scoresFirsts.length), 483, 260, 13));

	return templete;
}

export const getErrorSVG = (err) => {
	return textToSVGRegular.getSVG(err, {
		x: 0,
		y: 0,
		fontSize: 30,
		anchor: 'left top',
		attributes: {
			fill: '#ff66ab'
		}
	});
}