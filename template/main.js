document.addEventListener("magicbox.init", function(e)
{
	var manifest = e.detail.manifest;
	var container = e.detail.container;
	var data = e.detail.data;
	var save = e.detail.save;

	var spinner = document.createElement("div");
	spinner.id = "spinner";
	spinner.style.backgroundImage = "url(" + manifest.assets["spinner"] + ")";

	var saveButton = document.createElement("div");
	saveButton.id = "save";
	saveButton.innerText = "SAVE";
	saveButton.addEventListener("click", function()
	{
		save(Math.round(Math.random() * 100));
	});

	container.appendChild(spinner);
	container.appendChild(saveButton);

	e.detail.ready();
});