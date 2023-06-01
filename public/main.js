const endpoints = Array.from(document.querySelectorAll(".endpoint-name"));
const currentEndpoint = document.getElementById("current-endpoint");
const generatedUrl = document.getElementById("generated-url");
const clipboardIconContainer = document.getElementById(
	"clipboard-icon-container"
);
const baseUrl = "https://www.unofficialurbandictionaryapi.com/api";
let queryParams = "";

function fetchMeaning() {}

function handleInputChange(elem, type, isCheckbox = false) {
	const value = isCheckbox ? elem.checked : elem.value;
	queryParams += `${type}=${value}&`;
	changeGeneratedUrl(currentEndpoint.innerText, queryParams);
}

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

function hideExploreElements(list) {
	list.forEach((elem) => {
		document.querySelector(`.explore-${elem}`).classList.add("hidden");
	});
}

function hideQueryParamElements(list) {
	list.forEach((elem) => {
		document.querySelector(`.query-param-${elem}`).classList.add("hidden");
	});
}

function changeQueryParamsLayout(path) {
	switch (path) {
		case "/random":
			hideQueryParamElements(["author", "date", "character", "term"]);
			hideExploreElements(["author", "date", "character", "term"]);
			break;
		case "/search":
			document.querySelector(".query-param-term").classList.remove("hidden");
			hideQueryParamElements(["author", "date", "character"]);
			document.querySelector(".explore-term").classList.remove("hidden");
			hideExploreElements(["author", "date", "character"]);
			break;
		case "/browse":
			document
				.querySelector(".query-param-character")
				.classList.remove("hidden");
			hideQueryParamElements(["author", "date", "term"]);
			document.querySelector(".explore-character").classList.remove("hidden");
			hideExploreElements(["author", "date", "term"]);
			break;
		case "/author":
			document.querySelector(".query-param-author").classList.remove("hidden");
			hideQueryParamElements(["term", "date", "character"]);
			document.querySelector(".explore-author").classList.remove("hidden");
			hideExploreElements(["term", "date", "character"]);
			break;
		case "/date":
			document.querySelector(".query-param-date").classList.remove("hidden");
			hideQueryParamElements(["author", "term", "character"]);
			document.querySelector(".explore-date").classList.remove("hidden");
			hideExploreElements(["author", "term", "character"]);
			break;
	}
}

function changeGeneratedUrl(path, queryParams = "") {
	generatedUrl.innerText = baseUrl + path + "?" + queryParams;
}

endpoints.forEach((endpoint) => {
	endpoint.addEventListener("click", function (e) {
		const path = e.target.innerText;
		currentEndpoint.innerText = path;

		changeQueryParamsLayout(path);

		changeGeneratedUrl(path);
	});
});
