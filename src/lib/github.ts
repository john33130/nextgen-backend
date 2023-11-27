import axios from 'axios';
import keyv from './keyv';

export default async () => {
	const cacheKey = 'cache/github-data';
	let data = await keyv.get(cacheKey);
	if (!data) {
		const url = 'https://api.github.com/repos/petervanderheijden/nextgen-app/commits/main';
		data = (await axios.get(url)).data;
		await keyv.set(cacheKey, data);
	}

	return data;
};
