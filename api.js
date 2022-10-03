import got from 'got';
import cheerio from 'cheerio';

export const getUser = async (username, playmode = 'std') => {
	const playmodes = {
		std: '0',
		taiko: '1',
		catch: '2',
		mania: '3',
	}
	if (!playmodes[playmode]){
		return {
			error: `Invalid playmode ${playmode}`
		}
	}
	let response;
	try {
		response = await got({
			method: 'get',
			url: `https://kawata.pw/users/${username}?mode=${playmodes[playmode]}`,
		});	
	} catch (error) {
		if (error.response.statusCode === 404){
			return {
				error: `User ${username} not found`
			}
		}
		return {
			error: `Unknown Error`
		}
	}
	
    const body = response.body;
	let $ = cheerio.load(body);
	const data = JSON.parse($('.js-react--profile-page.ds').attr('data-initial-data'));
	data.current_mode = playmode;
	return data;
}
export const getImage = async (url) => {
	const response = await got({
		method: 'get',
		responseType: 'buffer',
		url,
	});
	return response.body;
}
export const getImageBase64 = async (url) => {
	const response = await got({
		method: 'get',
		responseType: 'buffer',
		url,
	});
	return "data:image/png;base64," + Buffer.from(response.body).toString('base64');
}
