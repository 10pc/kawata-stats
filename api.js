import got from 'got';
import cheerio from 'cheerio';

export const getUser = async (username, gamemode = 'std', mode = 'vn') => {
	const playmodes = {
		vn: {
			std: '0',
			taiko: '1',
			catch: '2',
			mania: '3',
		},
		rx: {
			std: '4',
			taiko: '5',
			catch: '6',
		},
		ap: {
			std: '8',
		},
	}
	if (!playmodes[mode][gamemode]){
		return {
			error: `Invalid playmode ${gamemode}+${mode}`
		}
	}
	let response1, response2;

	//https://api.kawata.pw/v1/get_player_scores?name=10pc&mode=4&scope=best&limit=1

	try {
		response1 = await got({
			method: 'get',
			url: `https://api.kawata.pw/v1/get_player_info?name=${username}&scope=all`,
		});
		response2 = await got({
			method: 'get',
			url: `https://api.kawata.pw/v1/get_player_scores?name=${username}&mode=${playmodes[mode][gamemode]}&scope=best&limit=1`,
		});
	} catch (error) {
		try {
			response1 = await got({
				method: 'get',
				url: `https://api.kawata.pw/v1/get_player_info?id=${username}&scope=all`,
			});
			response2 = await got({
				method: 'get',
				url: `https://api.kawata.pw/v1/get_player_scores?id=${username}&mode=${playmodes[mode][gamemode]}&scope=best&limit=1`,
			});	
		} catch (error) {
			return {
				error: `User/ID ${username} not found`
			}
		}
	}
	
    const body = response1.body;
    const body2 = response2.body;
    let ress = JSON.parse(body2);
    let res = JSON.parse(body);

    let bp;
    if(!ress.scores[0]){
        res.player.info.bp = 0;
    } else {
    	res.player.info.bp = ress.scores[0].pp;
    };
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
