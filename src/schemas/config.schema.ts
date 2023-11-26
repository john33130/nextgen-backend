import Joi from 'joi';

export default Joi.object({
	logs: Joi.object({
		files: Joi.object({
			directory: Joi.string().required(),
			enabled: Joi.boolean().required(),
			keepFor: Joi.number().optional(),
		}),
		level: Joi.string().required(),
	}),
	cache: Joi.object({
		keepFor: Joi.number().required(),
	}).required(),
	auth: Joi.object({
		expiresIn: Joi.number().required(),
	}).required(),
	rateLimit: Joi.object({
		interval: Joi.number().required(),
		tokens: Joi.number().required(),
	}),
});
