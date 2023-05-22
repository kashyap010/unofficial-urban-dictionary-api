const collapsibles = document.getElementsByClassName("collapsible");

Array.from(collapsibles).forEach((collapsible) => {
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
