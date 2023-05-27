const endpoints = Array.from(document.querySelectorAll(".endpoint-name"));
const currentEndpoint = document.getElementById("current-endpoint");

function hideElements(list) {
	list.forEach((elem) => {
		document.querySelector(`.query-param-${elem}`).classList.add("hidden");
	});
}

function changeQueryParamsLayout(path) {
	switch (path) {
		case "/random":
			hideElements(["author", "date", "character", "term"]);
			break;
		case "/search":
			document.querySelector(".query-param-term").classList.remove("hidden");
			hideElements(["author", "date", "character"]);
			break;
		case "/browse":
			document
				.querySelector(".query-param-character")
				.classList.remove("hidden");
			hideElements(["author", "date", "term"]);
			break;
		case "/author":
			document.querySelector(".query-param-author").classList.remove("hidden");
			hideElements(["term", "date", "character"]);
			break;
		case "/date":
			document.querySelector(".query-param-date").classList.remove("hidden");
			hideElements(["author", "term", "character"]);
			break;
	}
}

endpoints.forEach((endpoint) => {
	endpoint.addEventListener("click", function (e) {
		const path = e.target.innerText;
		currentEndpoint.innerText = path;

		changeQueryParamsLayout(path);
	});
});
