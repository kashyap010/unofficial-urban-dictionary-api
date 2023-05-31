const endpoints = Array.from(document.querySelectorAll(".endpoint-name"));
const currentEndpoint = document.getElementById("current-endpoint");
const generatedUrl = document.getElementById("generated-url");
const clipboardIconContainer = document.getElementById(
	"clipboard-icon-container"
);

function copyToClipboard() {
	navigator.clipboard.writeText(generatedUrl.innerText);

	const i = clipboardIconContainer.querySelector("i");
	i.classList.remove("fa-copy");
	i.classList.add("fa-clipboard");
	setTimeout(() => {
		i.classList.remove("fa-clipboard");
		i.classList.add("fa-copy");
	}, 3000);
}

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
