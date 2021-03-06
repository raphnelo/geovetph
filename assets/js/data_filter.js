function DataFilter(element, defaultFilter) {
	this.define = {
		url: 'http://localhost/geovetph/server/index.php',
		elem: element,
		opened: false,
		location: {},
		animal: {},
		disease: {},
		severity: {},
		date: {}
	};

	if(defaultFilter.location.regionId === null &&
		defaultFilter.location.provinceId === null &&
		defaultFilter.location.localityId === null) 
			this.define.location.defaultValue = "All";
	else {
		// changing default value for location is not yet available
		this.define.location.defaultValue = "All";
	}

	if(Array.isArray(defaultFilter.animal) &&
		defaultFilter.animal.length === 0)
			this.define.animal.defaultValue = "All";
	else {
		// changing default value for animal is not yet available
		this.define.animal.defaultValue = "All";
	}

	if(Array.isArray(defaultFilter.disease) &&
		defaultFilter.disease.length === 0)
			this.define.disease.defaultValue = "All";
	else {
		// changing default value for disease is not yet available
		this.define.disease.defaultValue = "All";
	}

	if(Array.isArray(defaultFilter.severity) &&
		defaultFilter.severity.length !== 0)
			this.define.severity.defaultValue = defaultFilter.severity;
	else {
		// changing default value for severity is not yet available
		this.define.severity = [
			{name: "Alert", selected: true},
			{name: "Warning", selected: true},
			{name: "Outbreak", selected: true}
		];
	}

	var defaults = ["Today", "Past 2 days", "Past 3 days", "Past 4 days", "Past 5 days", "Past 6 days", "Past week", "Past 2 weeks", "Past month"];
	for(var i=0; i<defaults.length; i++)
		if(defaults[i] === defaultFilter.date.selected) this.define.date.defaultValue = defaultFilter.date.selected;
	if(!this.define.date.defaultValue) this.define.date.defaultValue = "Past week";

	this._initializeComponents();
	this._initializeEvents();
}

DataFilter.prototype = {
	_initializeComponents: function() {
		var elem = this.define.elem;

		this._initializeLocation();
		this._initializeAnimal();
		this._initializeDisease();
		this._initializeSeverity();
		this._initializeDate();
	},

	_initializeLocation: function() {
		var locationValues = this.define.location;
		var self = this;

		$('#curr-location').html("All");
		locationValues.currentValue = locationValues.defaultValue;
		
		var autocompleteOptions = {
			types : ['(cities)'],
			componentRestrictions : {country : 'ph'}
		};
		this.define.autocomplete = new google.maps.places.Autocomplete(document.getElementById('location'), autocompleteOptions);
		this.define.autocomplete.addListener('place_changed', function() {
			var locationValue = self.define.autocomplete.getPlace();
			$('#curr-location').html(locationValue.name);
			locationValues.currentValue = locationValue;
		});

		$('#location').on('keyup', function() {
			if($(this).val() === "") {
				$('#curr-location').html("All");
				locationValues.currentValue = "All";	
			}
		});
	},

	_initializeAnimal: function() {
		var animalValues = this.define.animal;
		var self = this;
		var _populateElement = function(results, animalValues) {
			var animalGroups = results.animalGroups;
			var animalSpecies = results.animalSpecies;
			var $animalGroupsList = $('#animal-group .animal-list');
			var $animalSpeciesList = $('#animal-species .animal-list');

			var animalGroupsLength = animalGroups.length;
			for(var i=0; i<animalGroupsLength; i++) {
				var $newItem = $('<li></li>', {class: 'animal-item card-panel z-depth-1 selected'});

				$newItem.html(animalGroups[i].animal_group);
				$newItem.data('type', 'group');
				$newItem.data('group', animalGroups[i].animal_group);
				$newItem.data('speciesCount', Number.parseInt(animalGroups[i].species_count));
				$newItem.data('speciesSelected', animalGroups[i].species_count);
				$animalGroupsList.append($newItem);

				animalValues.groupCount++;
				animalValues.selectedGroupCount++;
			}

			var animalSpeciesLength = animalSpecies.length;
			for(var i=0; i<animalSpeciesLength; i++) {
				var $newItem = $('<li></li>', {class: 'animal-item card-panel z-depth-1 selected'});
				var $newItemSpecies = $('<div></div>', {class: 'species'});
				var $newItemGroup = $('<div></div>', {class: 'group'});

				$newItemSpecies.html(animalSpecies[i].common_name);
				$newItemGroup.html(animalSpecies[i].animal_group);
				$newItem.append($newItemSpecies);
				$newItem.append($newItemGroup);
				$newItem.data('type', 'species');
				$newItem.data('id', Number.parseInt(animalSpecies[i].animal_id));
				$newItem.data('species', animalSpecies[i].common_name);
				$newItem.data('group', animalSpecies[i].animal_group);
				$animalSpeciesList.append($newItem);

				animalValues.speciesCount++;
				animalValues.selectedSpeciesCount++;
			}

			$('#curr-animal').html("All");

			$('#animal-all').on('click', function() {
				selectAllAnimals();
			});

			$('#animal-clear:not(.disabled)').on('click', function() {
				clearAllAnimals();
			});

			$('#animal-select').on('click', function() {
				if(animalValues.selectOpen) {
					self._toggleButton($(this), 'unselect');
					$('#animal-select-panel').removeClass('open');
					animalValues.selectOpen = false;
				}
				else {
					self._toggleButton($(this), 'select');
					$('#animal-select-panel').addClass('open');
					animalValues.selectOpen = true;
				}
			});

			$('#animal-group .animal-item').on('click', function() {
				if($(this).hasClass('selected')) {
					clearAllAnimals(this);
				}
				else {
					selectAllAnimals(this);
				}
			});

			$('#animal-species .animal-item').on('click', function() {
				if($(this).hasClass('selected')) {
					unselectAnimal(this);
				}
				else {
					selectAnimal(this);
				}
			})
		};
		var selectAllAnimals = function(groupElem) {
			if(groupElem === undefined) {
				$('#curr-animal').html("All");
				self.define.animal.currentValue = "All";
				self.define.animal.selectedSpeciesCount = self.define.animal.speciesCount;
				self.define.animal.selectedGroupCount = self.define.animal.groupCount;

				$.each($('#animal-group .animal-item'), function(i, val) {
					$(val).data('speciesSelected', $(val).data('speciesCount'));
				});

				self._toggleButton($('#animal-group .animal-item:not(.selected)'), 'select');
				self._toggleButton($('#animal-species .animal-item:not(.selected)'), 'select');
				self._toggleButton($('#animal-all'), 'select');
			}
			else {
				self._toggleButton($(groupElem), 'select');
				self.define.animal.selectedGroupCount++;
				var group = $(groupElem).data('group');

				$(groupElem).data('speciesSelected', $(groupElem).data('speciesCount'));

				$.each($('#animal-species .animal-item:not(.selected)'), function(i, val) {
					if($(val).data('group') === group) {
						self._toggleButton($(val), 'select');
						self.define.animal.selectedSpeciesCount++;
					}
				});

				if(self.define.animal.selectedSpeciesCount === self.define.animal.speciesCount) {
					self._toggleButton($('#animal-all'), 'select');
					$('#curr-animal').html("All");
					self.define.animal.currentValue = "All";
				}
				else {
					$('#curr-animal').html("Selected "+self.define.animal.selectedSpeciesCount+" species");
					self.define.animal.currentValue = "Selected";
				}
			}
			$('#animal-clear').removeClass('disabled');
		};
		var clearAllAnimals = function(groupElem) {
			if(groupElem === undefined) {
				$('#curr-animal').html("Selected 0 species");
				self.define.animal.selectedSpeciesCount = 0;
				self.define.animal.selectedGroupCount = 0;

				$.each($('#animal-group .animal-item'), function(i, val) {
					$(val).data('speciesSelected', 0);
				});

				self._toggleButton($('#animal-group .animal-item'), 'unselect');
				self._toggleButton($('#animal-species .animal-item'), 'unselect');
			}
			else {
				self._toggleButton($(groupElem), 'unselect');
				self.define.animal.selectedGroupCount--;
				var group = $(groupElem).data('group');

				$(groupElem).data('speciesSelected', 0);

				$.each($('#animal-species .animal-item.selected'), function(i, val) {
					if($(val).data('group') === group) {
						self._toggleButton($(val), 'unselect');
						self.define.animal.selectedSpeciesCount--;
					}
				});
				$('#curr-animal').html("Selected "+self.define.animal.selectedSpeciesCount+" species");
			}
			self.define.animal.currentValue = "Selected";
			self._toggleButton($('#animal-all'), 'unselect');
			if(self.define.animal.selectedSpeciesCount === 0) $('#animal-clear').addClass('disabled');
		};
		var selectAnimal = function(speciesElem) {
			self._toggleButton($(speciesElem), 'select');
			self.define.animal.selectedSpeciesCount++;
			var groupElem = findAnimalGroup($(speciesElem).data('group'));
			var count = $(groupElem).data('speciesSelected');
			$(groupElem).data('speciesSelected', count+1);

			if($(groupElem).data('speciesSelected') === $(groupElem).data('speciesCount')) {
				self.define.animal.selectedGroupCount++;
				self._toggleButton($(groupElem), 'select');
			}
			$('#animal-clear').removeClass('disabled');

			if(self.define.animal.selectedGroupCount === self.define.animal.groupCount) {
				$('#curr-animal').html("All");
				self.define.animal.currentValue = "All";
				self.define.animal.selectedSpeciesCount = self.define.animal.speciesCount;
				self.define.animal.selectedGroupCount = self.define.animal.groupCount;
				self._toggleButton($('#animal-all'), 'select');
			}
			else {
				$('#curr-animal').html("Selected "+self.define.animal.selectedSpeciesCount+" species");
			}
		};
		var unselectAnimal = function(speciesElem) {
			self._toggleButton($(speciesElem), 'unselect');
			self._toggleButton($('#animal-all'), 'unselect');
			self.define.animal.selectedSpeciesCount--;
			var groupElem = findAnimalGroup($(speciesElem).data('group'));
			var count = $(groupElem).data('speciesSelected');
			$(groupElem).data('speciesSelected', count-1);

			if($(groupElem).data('speciesSelected') !== $(groupElem).data('speciesCount')) {
				self.define.animal.selectedGroupCount--;
				self._toggleButton($(groupElem), 'unselect');
			}

			if(self.define.animal.selectedSpeciesCount === 0) $('#animal-clear').addClass('disabled');
			$('#curr-animal').html("Selected "+self.define.animal.selectedSpeciesCount+" species");
			self.define.animal.currentValue = "Selected";
		};
		var findAnimalGroup = function(group) {
			var items = $('#animal-group .animal-item');
			var itemLength = items.length;
			for(var i=0; i<itemLength; i++) {
				if($(items[i]).data('group') === group) {
					return items[i];
				}
			}
		};

		animalValues.currentValue = animalValues.defaultValue;
		animalValues.selectOpen = false;
		animalValues.speciesCount = 0;
		animalValues.groupCount = 0;
		animalValues.selectedSpeciesCount = 0;
		animalValues.selectedGroupCount = 0;

		$.ajax({
			url: this.define.url,
			type: 'POST',
			data: {
				func: 'get',
				type: 3
			},
			success: function(results) {
				var data = JSON.parse(results);
				if(data !== -1) {
					_populateElement(data, animalValues);
				}
			}
		});
	},

	_initializeDisease: function() {
		var self = this;
		var _populateElement = function(results) {
			var $diseaseList = $('#disease-list');
			var $diseaseAll = $('<div></div>', {id: 'disease-all', class: 'disease-item control-btn card-panel z-index-1 selected'});
			var $diseaseClear = $('<div></div>', {id: 'disease-clear', class: 'disease-item control-btn card-panel z-index-1'});
			$diseaseAll.html("All");
			$diseaseClear.html("Clear All");
			$diseaseList.append($diseaseAll);
			$diseaseList.append($diseaseClear);
			$('#curr-disease').html(self.define.disease.defaultValue);

			var resultsLength = results.length;
			for(var i=0; i<resultsLength; i++) {
				var $newItem = $("<li></li>", {class: 'disease-item card-panel z-index-1 selected'});
				var $newItemName = $('<span></span>', {class: 'name'});
				var $newItemStrain = $('<span></span>', {class: 'strain'});
				$newItem.append($newItemName);
				$newItem.append($newItemStrain);

				$newItemName.html(results[i].disease_name);
				$newItemStrain.html(results[i].strain);
				$newItem.data('id', Number.parseInt(results[i].disease_id));
				$newItem.data('name', results[i].disease_name);

				$diseaseList.append($newItem);

				self.define.disease.selectedDiseaseCount++;
				self.define.disease.diseaseCount++;
			}

			$('#disease-all').on('click', function() {
				$('#curr-disease').html("All");
				$('#disease-clear').removeClass('disabled');
				self.define.disease.currentValue = "All";
				self._toggleButton($('#disease-all'), 'select');
				self.define.disease.selectedDiseaseCount = self.define.disease.diseaseCount;
				self._toggleButton($('#disease-list .disease-item:not(.control-btn):not(.selected)'), 'select');
			});

			$('#disease-clear:not(.disabled)').on('click', function() {
				$('#curr-disease').html("Selected 0 diseases");
				self.define.disease.currentValue = "Selected";
				self._toggleButton($('#disease-all'), 'unselect');
				$(this).addClass('disabled');
				self.define.disease.selectedDiseaseCount = 0;
				self._toggleButton($('#disease-list .disease-item.selected:not(.control-btn)'), 'unselect');
			});

			$('#disease-list .disease-item:not(.control-btn)').on('click', function() {
				if($(this).hasClass('selected')) {
					self._toggleButton($(this), 'unselect');
					self._toggleButton($('#disease-all'), 'unselect');
					self.define.disease.currentValue = "Selected";
					self.define.disease.selectedDiseaseCount--;
					if(self.define.disease.selectedDiseaseCount === 1) $('#curr-disease').html("Selected 1 disease");
					else $('#curr-disease').html("Selected "+self.define.disease.selectedDiseaseCount+" disease");
				}
				else {
					self._toggleButton($(this), 'select');
					self.define.disease.selectedDiseaseCount++;
					$('#disease-clear').removeClass('disabled');
					if(self.define.disease.selectedDiseaseCount === self.define.disease.diseaseCount) {
						$('#curr-disease').html("All");
						self._toggleButton($('#disease-all'), 'select');
						self.define.disease.currentValue = "All";
					}
					else {
						$('#curr-disease').html("Selected "+self.define.disease.selectedDiseaseCount+" diseases");
					}
				}
			});
		};

		this.define.disease.currentValue = this.define.disease.defaultValue;
		this.define.disease.selectedDiseaseCount = 0;
		this.define.disease.diseaseCount = 0;

		$.ajax({
			url: this.define.url,
			type: 'POST',
			data: {
				func: 'get',
				type: 4
			},
			success: function(results) {
				var data = JSON.parse(results);
				if(data !== -1) {
					_populateElement(data);
				}
			}
		})
	},

	_initializeSeverity: function() {
		var self = this;
		var severity = this.define.severity;
		var defaultSeverity = severity.defaultValue;
		var levelCount = defaultSeverity.length;
		var $severityList = $('#severity-list');

		severity.selectedSeverityCount = 0;
		severity.severityCount = levelCount;

		for(var i=0; i<levelCount; i++) {
			var name = defaultSeverity[i].name;
			var color = defaultSeverity[i].color;
			var selected = defaultSeverity[i].selected;
			var cls;

			if(selected) {
				severity.selectedSeverityCount++;
				cls = 'severity-item card-panel z-index-1 selected'
			}
			else {
				cls = 'severity-item card-panel z-index-0'
			}

			var $item = $('<div></div>', {
				class: cls
			});
			$item.html(name);
			$item.data('value', i);
			if(color) $item.css('background', color);
			$severityList.append($item);
			$item.on('click', function() {
				if($(this).hasClass('selected')) {
					self._toggleButton($(this), 'unselect');
					self.define.severity.selectedSeverityCount--;
					$(this).css('background','');
					if(self.define.severity.selectedSeverityCount === 1) {
						$('#curr-severity').html("Selected 1 level");
					}
					else {
						$('#curr-severity').html("Selected "+self.define.severity.selectedSeverityCount+" levels");
					}
					self.define.severity.currentValue = "Selected";
				}
				else {
					self._toggleButton($(this), 'select');
					self.define.severity.selectedSeverityCount++;
					var color = self.define.severity.defaultValue[$(this).data('value')].color;
					if(color) $(this).css('background', color);
					if(self.define.severity.selectedSeverityCount === self.define.severity.severityCount) {
						$('#curr-severity').html("All");
						self.define.severity.currentValue = "All";
					}
				}
			});
		}

		if(defaultSeverity.selectedSeverityCount === defaultSeverity.severityCount) {
			defaultSeverity.currentValue = "All";
			$('#curr-severity').html("All");
		}
		else {
			defaultSeverity.currentValue = "Selected";
			$('#curr-severity').html("Selected "+defaultSeverity.selectedSeverityCount+" levels");
		}
	},

	_initializeDate: function() {
		var self = this;
		this.define.date.currentValue = this.define.date.defaultValue;

		var items = $('#date option');
		var itemsLength = items.length;
		for(var i=0; i<itemsLength; i++) {
			if($(items[i]).html() === this.define.date.defaultValue) {
				$(items[i]).attr('selected', 'selected');
				$('#curr-date').html(this.define.date.defaultValue);
				break;
			}
		};

		$('#date').material_select();
		$('#date-select .datepicker').pickadate({
			selectMonths: true,
			selectYear: 15
		});

		$('#date').on('change', function() {
			var currVal = $(this).val();
			self.define.date.currentValue = currVal;
			if(currVal === "Others...") {
				$('#date-select').removeClass('hidden');
				$('#curr-date').html("Selected date");
			}
			else {
				if(!$('#date-select').hasClass('hidden')) $('#date-select').addClass('hidden');
				$('#date-from').val("");
				$('#date-to').val("");
				$('#curr-date').html(currVal);
			}
		});
	},

	_toggleButton: function(elem, type) {
			if(type === "select") elem.addClass('z-depth-1 selected').removeClass('z-depth-0');
			else if(type === "unselect") elem.removeClass('z-depth-1 selected').addClass('z-depth-0');	
	},

	_reset: function() {
		var self = this;
		var resetLocation = function() {
			$('#location').val("");
			$('#curr-location').html(self.define.location.defaultValue);
			self.define.location.currentValue = self.define.location.defaultValue;
		};
		var resetAnimal = function() {
			self.define.animal.currentValue = self.define.animal.defaultValue;
			self.define.animal.selectedSpeciesCount = self.define.animal.speciesCount;
			self.define.animal.selectedGroupCount = self.define.animal.groupCount;

			$('#curr-animal').html(self.define.animal.defaultValue);

			$.each($('#animal-group .animal-item'), function(i, val) {
				$(val).data('speciesSelected', $(val).data('speciesCount'));
			});

			self._toggleButton($('#animal-group .animal-item'), 'select');
			self._toggleButton($('#animal-species .animal-item'), 'select');
			self._toggleButton($('#animal-all'), 'select');
			$('#animal-clear').removeClass('disabled');
		};
		var resetDisease = function() {
			self.define.disease.currentValue = self.define.disease.defaultValue;
			self.define.disease.selectedDiseaseCount = self.define.disease.diseaseCount;
			$('#curr-disease').html(self.define.animal.defaultValue);
			$('#disease-clear').removeClass('disabled');
			self._toggleButton($('#disease-all'), 'select');
			self._toggleButton($('#disease-list .disease-item:not(.control-btn)'), 'select');
		};
		var resetSeverity = function() {
			var severity = self.define.severity;
			var defaultSeverity = severity.defaultValue;
			var levelCount = defaultSeverity.length;
			var severityLevels = $('#severity-list .severity-item');

			severity.selectedSeverityCount = 0;
			severity.severityCount = levelCount;

			for(var i=0; i<levelCount; i++) {
				var color = defaultSeverity[i].color;
				var selected = defaultSeverity[i].selected;

				if(selected) {
					severity.selectedSeverityCount++;
					self._toggleButton($(severityLevels[i]), 'select');
					$(severityLevels[i]).css('background', color);
				}
				else {
					severity.selectedSeverityCount--;
					self._toggleButton($(severityLevels[i]), 'unselect');
					$(severityLevels[i]).css('background', '');
				}				
			}

			if(severity.selectedSeverityCount === severity.severityCount) {
				severity.currentValue = "All";
				$('#curr-severity').html("All");
			}
			else {
				severity.currentValue = "Selected";
				$('#curr-severity').html("Selected "+severity.selectedSeverityCount+" levels");
			}
		};
		var resetDate = function() {
			self.define.date.currentValue = self.define.date.defaultValue;
			$('#date-from').val("");
			$('#date-to').val("");

			var items = $('#date option');
			var itemsLength = items.length;
			for(var i=0; i<itemsLength; i++) {
				if($(items[i]).html() === self.define.date.defaultValue) {
					$(items[i]).attr('selected', 'selected');
					$('#curr-date').html(self.define.date.defaultValue);
					break;
				}
			};
			$('#date').material_select();
		};

		resetLocation();
		resetAnimal();
		resetDisease();
		resetSeverity();
		resetDate();
	},

	_filterResults: function() {
		var filter = {
				location: {
					name: "",
					full_address: []
				},
				animal: [],
				disease: [],
				severity: [],
				date: {
					from: "",
					to: ""
				}
			};
		var self = this;
		var getLocation = function() {
			var currentLocation = self.define.location.currentValue;
			if(currentLocation !== "All") {
				filter.location.name = currentLocation.name;
				filter.location.full_address = currentLocation.address_components;
			}
		};
		var getAnimal = function() {
			var currentAnimal = self.define.animal.currentValue;
			if(currentAnimal !== "All") {
				var selectedSpecies = $('#animal-species .animal-item.selected');
				var selectedSpeciesLength = selectedSpecies.length;
				for(var i=0; i<selectedSpeciesLength; i++) {
					var item = selectedSpecies[i];
					var insert = {
						id: $(item).data('id'),
						name: $(item).data('species')
					};

					filter.animal.push(JSON.parse(JSON.stringify(insert)));
				}
			}
		};
		var getDisease = function() {
			var currentDisease = self.define.disease.currentValue;
			if(currentDisease !== "All") {
				var selectedDiseases = $('#disease-list .disease-item.selected:not(.control-btn)');
				var selectedDiseasesLength = selectedDiseases.length;
				for(var i=0; i<selectedDiseasesLength; i++) {
					var insert = {
						id: $(selectedDiseases[i]).data('id'),
						name: $(selectedDiseases[i]).data('name')
					};

					filter.disease.push(JSON.parse(JSON.stringify(insert)));
				}
			}
		};
		var getSeverity = function() {
			var currentSeverity = self.define.severity.currentValue;
			if(currentValue !== "All") {
				var selectedSeverity = $('#severity-list .severity-item.selected');
				var selectedSeverityLength = selectedSeverity.length;
				for(var i=0; i<selectedSeverityLength; i++) {
					filter.severity.push($(selectedSeverity[i]).data('value'));
				}
			}
		};
		var getDate = function() {
			var currentDate = self.define.date.currentValue;
			if(currentDate === "Others...") {
				var dateFrom = $('#date-from').val();
				var dateTo = $('#date-to').val();

				if(dateFrom && dateTo) {
					var from = new Date(dateFrom);
					var to = new Date(dateTo);
					if(from - to <= 0) {
						filter.date.from = from.getFullYear() + "-" + (from.getMonth() + 1) + "-" + from.getDate();;
						filter.date.to = to.getFullYear() + "-" + (to.getMonth() + 1) + "-" + to.getDate();;
					}
					else {
						getDateSelected(self.define.date.defaultValue);
					}
				}
				else {
					getDateSelected(self.define.date.defaultValue);
				}
			}
			else {
				getDateSelected(currentDate);
			}
		};
		var getDateSelected = function(selected) {
			var fromDate, toDate;
			switch(selected) {
				case "Today":
					toDate = new Date();
					fromDate = new Date();
					break;
				case "Past 2 days":
				case "Past 3 days":
				case "Past 4 days":
				case "Past 5 days":
				case "Past 6 days":
					var days = Number.parseInt(selected.substr(5,1));
					toDate = new Date();
					fromDate = new Date();
					fromDate.setDate(fromDate.getDate() - days);
					break;
				case "Past week":
				case "Past 2 weeks":
					var weeks = Number.parseInt(selected.slice(4,6)) || 1;
					toDate = new Date();
					fromDate = new Date();
					fromDate.setDate(fromDate.getDate() - (7*weeks));
					break;
				case "Past month":
					toDate = new Date();
					fromDate = new Date();
					fromDate.setMonth(fromDate.getMonth() - 1);
					break;
			}
			filter.date.to = toDate.getFullYear() + "-" + (toDate.getMonth() + 1) + "-" + toDate.getDate();
			filter.date.from = fromDate.getFullYear() + "-" + (fromDate.getMonth() + 1) + "-" + fromDate.getDate();
		};

		getLocation();
		getAnimal();
		getDisease();
		getDate();

		return filter;
	},

	_initializeEvents: function() {
		var self = this;
		$('#data-filter-btn').on('click', function() {
			if(self.define.opened) {
				$($(this).find('i')).removeClass('mdi-navigation-close').addClass('mdi-action-search');
				$(this).parent().css('overflow','hidden').removeClass('open');
				self.define.opened = false;
			}
			else {
				$($(this).find('i')).removeClass('mdi-action-search').addClass('mdi-navigation-close');
				$(this).parent().addClass('open').one(transitionEndEventName(), function() {
					$(this).css('overflow', 'visible');
				});
				self.define.opened = true;
			}
		});

		$('#filter-reset').on('click', function() {
			self._reset();
		});

		$('#filter-submit').on('click', function() {
			$($('#data-filter-btn').find('i')).removeClass('mdi-navigation-close').addClass('mdi-action-search');
			$('#data-filter-btn').parent().css('overflow','hidden').removeClass('open');
			self.define.opened = false;
			var filter = self._filterResults();

			if(window.CustomEvent) {
				var filterSubmit = new CustomEvent('filter_submit', {
					detail: {
						filterValue: filter
					},
					bubbles: true,
					cancelable: true
				});
				self.define.elem.dispatchEvent(filterSubmit);
			};
		});
	},

	getElement: function() {
		return this.define.elem;
	}
}