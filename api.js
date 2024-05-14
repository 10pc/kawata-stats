import got from 'got';
import cheerio from 'cheerio';

export const getUser = async (username, playmode = 'std') => {
	const playmodes = {
		std: '4',
		taiko: '0',
		catch: '1',
		mania: '2',
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
			url: `https://api.kawata.pw/v1/get_player_info?name=${username}&scope=all`,
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
    let res = JSON.parse(body)
	return res;
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
