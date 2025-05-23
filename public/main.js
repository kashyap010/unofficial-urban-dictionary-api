const datePicker = document.getElementById("date-picker");
const endpoints = Array.from(document.querySelectorAll(".endpoint-name"));
const currentEndpoint = document.getElementById("current-endpoint");
const generatedUrl = document.getElementById("generated-url");
const clipboardIconContainer = document.getElementById(
	"clipboard-icon-container"
);
const jsonOutput = document.getElementById("json-output");
const loader = document.getElementById("loader");
const term = document.getElementById("term");

const baseUrl = "https://unofficialurbandictionaryapi.com/api";
const queryParams = {
	term: "",
	date: "",
	character: "",
	author: "",
	strict: false,
	matchCase: false,
	limit: "none",
	page: 1,
	multiPage: false,
};
const defaultQueryParams = JSON.parse(JSON.stringify(queryParams));

async function fetchMeaning() {
	jsonOutput.innerHTML = "";
	const url = generatedUrl.innerText;
	const response = await fetch(url);
	const data = await response.json();
	renderjson.set_show_to_level(1);
	jsonOutput.appendChild(renderjson(data));
}

function buildQueryParamString(path) {
	let queryParamString = "?";

	switch (path) {
		case "/search":
			queryParamString += `term=${queryParams.term}&`;
			break;
		case "/browse":
			queryParamString += `character=${queryParams.character}&`;
			break;
		case "/date":
			queryParamString += `date=${queryParams.date}&`;
			break;
		case "/author":
			queryParamString += `author=${queryParams.author}&`;
			break;
		default:
			break;
	}

	for (let [key, value] of Object.entries(queryParams)) {
		if (
			["term", "date", "character", "author"].includes(key) ||
			value === defaultQueryParams[key]
		)
			continue;

		if (value === "") value = defaultQueryParams[key];

		queryParamString += `${key}=${value}&`;
	}

	return queryParamString;
}

function handleInputChange(elem, type, isCheckbox = false) {
	const value = isCheckbox ? elem.checked : elem.value;
	const path = currentEndpoint.innerText;
	queryParams[type] = value;
	changeGeneratedUrl(path, buildQueryParamString(path));
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

function showExploreElements(list) {
	list.forEach((elem) => {
		document.querySelector(`.explore-${elem}`).classList.remove("hidden");
	});
}

function hideQueryParamElements(list) {
	list.forEach((elem) => {
		document.querySelector(`.query-param-${elem}`).classList.add("hidden");
	});
}

function showQueryParamElements(list) {
	list.forEach((elem) => {
		document.querySelector(`.query-param-${elem}`).classList.remove("hidden");
	});
}

function changeQueryParamsLayout(path) {
	switch (path) {
		case "/random":
			hideQueryParamElements([
				"author",
				"date",
				"character",
				"term",
				"strict",
				"matchCase",
			]);
			hideExploreElements([
				"author",
				"date",
				"character",
				"term",
				"strict",
				"matchCase",
			]);
			break;
		case "/search":
			showQueryParamElements(["term", "strict", "matchCase"]);
			hideQueryParamElements(["author", "date", "character"]);
			showExploreElements(["term", "strict", "matchCase"]);
			hideExploreElements(["author", "date", "character"]);
			break;
		case "/browse":
			document
				.querySelector(".query-param-character")
				.classList.remove("hidden");
			hideQueryParamElements(["author", "date", "term", "strict", "matchCase"]);
			document.querySelector(".explore-character").classList.remove("hidden");
			hideExploreElements(["author", "date", "term", "strict", "matchCase"]);
			break;
		case "/author":
			document.querySelector(".query-param-author").classList.remove("hidden");
			hideQueryParamElements([
				"term",
				"date",
				"character",
				"strict",
				"matchCase",
			]);
			document.querySelector(".explore-author").classList.remove("hidden");
			hideExploreElements(["term", "date", "character", "strict", "matchCase"]);
			break;
		case "/date":
			document.querySelector(".query-param-date").classList.remove("hidden");
			hideQueryParamElements([
				"author",
				"term",
				"character",
				"strict",
				"matchCase",
			]);
			document.querySelector(".explore-date").classList.remove("hidden");
			hideExploreElements([
				"author",
				"term",
				"character",
				"strict",
				"matchCase",
			]);
			break;
	}
}

function changeGeneratedUrl(path, queryParams = "") {
	generatedUrl.innerText = baseUrl + path + queryParams;
}

function handleSearchTerm(searchTerm) {
	if (!searchTerm) return;
	
	term.value = searchTerm;
	queryParams.term = searchTerm;
	const path = "/search";
	changeGeneratedUrl(path, buildQueryParamString(path));
	this.fetchMeaning().catch(console.error);
}

endpoints.forEach((endpoint) => {
	endpoint.addEventListener("click", function (e) {
		const path = e.target.innerText;
		currentEndpoint.innerText = path;

		changeQueryParamsLayout(path);

		changeGeneratedUrl(path);
	});
});

document.addEventListener("DOMContentLoaded", () => {
	datePicker.max = new Date().toISOString().split("T")[0];
	loader.classList.add("hidden");

	const urlQueryString = window.location.search;
	const urlParams = new URLSearchParams(urlQueryString);
	const searchTerm = urlParams.get('term'); 
	this.handleSearchTerm(searchTerm);
});
