document.addEventListener("magicbox.init", function(e)
{
	var manifest = e.detail.manifest;
	var container = e.detail.container;
	var data = e.detail.data;
	var save = e.detail.save;

	var spinner = document.createElement("div");
	spinner.id = "spinner";
	spinner.style.backgroundImage = "url(" + manifest.assets["spinner"] + ")";

	var number = document.createElement("input");
	number.id = "number";
	number.value = data.number || Math.round(Math.random() * 100);

	var saveButton = document.createElement("div");
	saveButton.id = "save";
	saveButton.innerText = "SAVE";
	saveButton.addEventListener("click", function()
	{
		save({number: parseInt(number.value)});
	});

	container.appendChild(spinner);
	container.appendChild(saveButton);
	container.appendChild(number);

	e.detail.ready();
});