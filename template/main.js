document.addEventListener("magicbox.init", function(e)
{
	var manifest = e.detail.manifest;
	var container = e.detail.container;

	var p = document.createElement("p");
	p.innerText = "Hello World";

	container.appendChild(p);
});