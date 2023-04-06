function validateQueryParams(params) {
	const validParams = {
		strict: (value) => value === "true" || value === "false",
		limit: (value) => !isNaN(value) && value > 0,
	};

	for (const [param, value] of Object.entries(params)) {
		if (!validParams[param] || !validParams[param](value)) {
			return {
				valid: false,
				message: `Invalid value for query parameter '${param}'`,
			};
		}
	}

	return {
		valid: true,
	};
}

module.exports = validateQueryParams;
