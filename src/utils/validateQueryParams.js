function validateQueryParams(params) {
	const validParams = {
		term: (value) => value.trim().length > 0,
		strict: (value) => value === "true" || value === "false",
		limit: (value) => value === "none" || (!isNaN(value) && value > 0),
		matchCase: (value) => value === "true" || value === "false",
		character: (value) => /^([A-Z*]|new)$/.test(value),
		page: (value) => (!isNaN(value) && value >= 1) || value === "false",
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
