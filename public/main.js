const collapsibles = Array.from(document.getElementsByClassName("collapsible"));
const endpoints = Array.from(document.querySelectorAll(".endpoint"));
const currentEndpoint = document.getElementById("current-endpoint");

collapsibles.forEach((collapsible) => {
	collapsible.addEventListener("click", function () {
		const content = collapsible.querySelector(".collapsible-content");
		const icon = collapsible.querySelector("span");
		icon.classList.toggle("rotate");
		if (content.style.maxHeight) {
			content.style.maxHeight = null;
		} else {
			content.style.maxHeight = `${content.scrollHeight}px`;
		}
	});
});

endpoints.forEach((endpoint) => {
	endpoint.addEventListener("click", function (e) {
		const path = e.target.innerText;
		currentEndpoint.innerText = path;
		e.stopImmediatePropagation();
	});
});
