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

	//https://api.kawata.pw/v1/get_player_scores?name=10pc&mode=4&scope=best&limit=1

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
	if(response.body.toString() == '{"status":404}'){
		return "0";
	} else {
		return response.body;
	}
}

//Buffer 7b 22 73 74 61 74 75 73 22 3a 34 30 zenosu
//Buffer ff d8 ff e1 00 16 45 78 69 66 00 00 femboyfeet
//Buffer 7b 22 73 74 61 74 75 73 22 3a 34 30
export const getImageBase64 = async (url) => {
	const response = await got({
		method: 'get',
		responseType: 'buffer',
		url,
	});
	return "data:image/png;base64," + Buffer.from(response.body).toString('base64');
}
