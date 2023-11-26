import Joi from 'joi';

export default Joi.object({
	DB_CONNECTION_URL: Joi.string().required(),
	HTTP_PORT: Joi.string().required(),
	HTTP_HOST: Joi.string().required(),
	ENCRYPTION_KEY: Joi.string().required(),
}).pattern(Joi.string(), Joi.string());
