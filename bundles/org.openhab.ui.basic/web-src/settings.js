/**
 * openHAB BasicUI javascript for the settings page
 *
 * @author Laurent Garnier — initial version
 */

/*eslint-env browser */
/*eslint no-undef:2*/
/*eslint no-new:0 */
/*eslint no-underscore-dangle:0*/

/*global componentHandler */

(function(o) {
	"use strict";

	var
		smarthome = {
			dataModel: {}
		};

	function createDOM(text) {
		var
			e = document.createElement("div");

		e.innerHTML = text;
		return e.childNodes;
	}

	function append(node, child) {
		if (child instanceof NodeList) {
			[].slice.call(child).forEach(function(e) {
				node.appendChild(e);
			});
		} else {
			node.appendChild(child);
		}
	}

	function renderTemplate(id, contents) {
		var
			text = document.getElementById(id).innerHTML;

		return text.replace(/\{([\w]+)\}/, function(match, capture) {
			//jshint unused:false
			if (typeof contents[capture] !== "undefined") {
				return contents[capture];
			} else {
				return "";
			}
		});
	}

	function Modal(text) {
		var
			_t = this;

		_t.templateId = "template-modal";
		_t.text = renderTemplate(_t.templateId, {
			content: text
		});

		function onkeydown(event) {
			event = event || window.event;
			if (event.keyCode === 27) {
				_t.hide();
			}
		}

		function init() {
			document.addEventListener("keydown", onkeydown);
		}

		function destroy() {
			if (_t.onHide !== undefined) {
				_t.onHide();
			}

			document.removeEventListener("keydown", onkeydown);
		}

		_t.show = function() {
			append(document.body, createDOM(_t.text));

			_t.bg = document.querySelector(o.modal);
			_t.container = _t.bg.querySelector(o.modalContainer);

			smarthome.UI.currentModal = _t;
			_t.bg.addEventListener("click", function() {
				_t.hide();
			});

			_t.container.addEventListener("click", function(event) {
				event.stopPropagation();
			});

			init();
		};

		_t.hide = function() {
			document.body.querySelector(o.modal).remove();
			delete smarthome.UI.currentModal;
			destroy();
		};
	}

	function Control(parentNode) {
		var
			_t = this;

		_t.parentNode = parentNode;
		_t.key = _t.parentNode.getAttribute(o.storageKey);
		_t.defaultValue = _t.parentNode.getAttribute(o.defaultValue);

		_t.setStorageValue = function(value) {
			if (value === "") {
				window.localStorage.removeItem(_t.key);
			} else {
				window.localStorage.setItem(_t.key, value);
			}
			smarthome.UI.updateLocalSetting(_t.key);
		};
	}

	function ControlSwitch(parentNode) {
		Control.call(this, parentNode);

		var
			_t = this;

		_t.input = _t.parentNode.querySelector("input[type=checkbox]");
		_t.valueOn = _t.parentNode.getAttribute(o.valueOn);
		_t.valueOff = _t.parentNode.getAttribute(o.valueOff);

		function onChange() {
			_t.setStorageValue(_t.input.checked ? _t.valueOn : _t.valueOff);
		}

		_t.setValue = function() {
			var
				storageValue = window.localStorage.getItem(_t.key),
				value = (storageValue === null) ? _t.defaultValue === _t.valueOn : storageValue === _t.valueOn;

			if (_t.input.checked !== value) {
				_t.input.checked = value;
				if (value) {
					_t.parentNode.MaterialSwitch.on();
				} else {
					_t.parentNode.MaterialSwitch.off();
				}
			}
		};

		_t.input.addEventListener("change", onChange);

		_t.destroy = function() {
			_t.input.removeEventListener("change", onChange);
			componentHandler.downgradeElements([ _t.parentNode ]);
		};
	}

	function ControlButtonsSelection(parentNode) {
		Control.call(this, parentNode);

		var
			_t = this;

		_t.reset = function() {
			_t.buttons.forEach(function(button) {
				button.classList.remove(o.buttonActiveClass);
			});
		};

		_t.onclick = function() {
			/* HTMLButtonElement this */
			_t.setStorageValue(this.getAttribute("data-value") + "");

			_t.reset();
			this.classList.add(o.buttonActiveClass);
		};

		_t.setValue = function() {
			var
				storageValue = window.localStorage.getItem(_t.key),
				value = (storageValue === null) ? _t.defaultValue : storageValue;

			_t.buttons.forEach.call(_t.buttons, function(button) {
				var
					val = button.getAttribute("data-value") + "";

				if (value === val) {
					button.classList.add(o.buttonActiveClass);
				} else {
					button.classList.remove(o.buttonActiveClass);
				}
			});
		};

		_t.buttons = [].slice.call(_t.parentNode.querySelectorAll(o.controlButton));

		_t.buttons.forEach.call(_t.buttons, function(button) {
			button.addEventListener("click", _t.onclick);
		});

		_t.destroy = function() {
			_t.buttons.forEach(function(button) {
				button.removeEventListener("click", _t.onclick);
			});
			componentHandler.downgradeElements(_t.buttons);
		};
	}

	function ControlRadioSelection(parentNode) {
		Control.call(this, parentNode);

		var
			_t = this,
			valueMapString = parentNode.getAttribute("data-value-map");

		_t.value = null;
		_t.valueNode = parentNode.parentNode.querySelector(o.formValue);

		if (valueMapString !== null) {
			_t.valueMap = JSON.parse(valueMapString);
		} else {
			_t.valueMap = {};
		}

		function setValueNode(value) {
			if (value !== "" && _t.valueMap[value] !== undefined) {
				_t.valueNode.innerHTML = _t.valueMap[value];
			} else if (value === "" && _t.valueMap["_empty_"] !== undefined) {
				_t.valueNode.innerHTML = _t.valueMap["_empty_"];
			} else {
				_t.valueNode.innerHTML = value;
			}
		}

		function onRadioChange(event) {
			event.stopPropagation();

			if (event.target.tagName.toLowerCase() !== "input") {
				return;
			}

			_t.value = event.target.getAttribute("value");
			_t.setStorageValue(_t.value);
			setValueNode(_t.value);

			setTimeout(function() {
				_t.modal.hide();
			}, 300);
		}

		_t.showModal = function() {
			var
				content = _t.parentNode.querySelector(o.selectionRows).innerHTML;

			_t.modal = new Modal(content);
			_t.modal.show();
			_t.modal.onHide = function() {
				var
					items = [].slice.call(_t.modal.container.querySelectorAll(o.formRadio));

				componentHandler.downgradeElements(items);
				items.forEach(function(control) {
					control.removeEventListener("click", onRadioChange);
				});

				_t.modal = null;
			};

			var
				controls = [].slice.call(_t.modal.container.querySelectorAll(o.formRadio));

			if (_t.value !== null) {
				var
					items = [].slice.call(_t.modal.container.querySelectorAll("input[type=radio]"));

				items.forEach(function(radioItem) {
					if (radioItem.value === _t.value) {
						radioItem.checked = true;
					} else {
						radioItem.checked = false;
					}
				});
			}

			controls.forEach(function(control) {
				componentHandler.upgradeElement(control, "MaterialRadio");
				control.addEventListener("click", onRadioChange);
			});
		};

		_t.setValue = function() {
			var
				storageValue = window.localStorage.getItem(_t.key);

			_t.value = (storageValue === null) ? _t.defaultValue : storageValue;
			setValueNode(_t.value);
		};

		_t.destroy = function() {
			_t.parentNode.parentNode.removeEventListener("click", _t.showModal);
		};

		_t.parentNode.parentNode.addEventListener("click", _t.showModal);
	}

	function UI(root) {
		var
			_t = this;

		_t.root = root;

		_t.updateLocalSetting = function(param) {
			var
				oldValue,
				newValue;

			if (param === null || param === "openhab.ui:theme.dark") {
				oldValue = _t.theme;
				newValue = window.localStorage.getItem("openhab.ui:theme.dark");
				if (newValue !== "light" && newValue !== "dark") {
					newValue = (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
				}
				_t.theme = newValue;
				if (oldValue !== newValue) {
					_t.root.body.setAttribute("data-theme", newValue);
				}
			}

			if (param === null || param === "openhab.ui.basic:biggerFontSize") {
				_t.root.documentElement.classList.remove("ui-bigger-font");
				if (window.localStorage.getItem("openhab.ui.basic:biggerFontSize") === "enabled") {
					_t.root.documentElement.classList.add("ui-bigger-font");
				}
			}
		};

		_t.updateControlLocalSetting = function(param) {
			if (param in smarthome.dataModel) {
				smarthome.dataModel[param].setValue();
			}
		};

		_t.upgradeComponents = function() {
			var
				upgrade = componentHandler.upgradeElement;

			[].slice.call(document.querySelectorAll(o.formControls)).forEach(function(e) {
				switch (e.getAttribute("data-control-type")) {
				case "checkbox":
					upgrade(e, "MaterialSwitch");
					break;
				case "buttons":
					[].slice.call(e.querySelectorAll("button")).forEach(function(button) {
						upgrade(button, "MaterialButton");
						upgrade(button, "MaterialRipple");
					});
					break;
				default:
					break;
				}
			});
		};

		_t.initControls = function() {
			smarthome.dataModel = {};

			function appendControl(control) {
				smarthome.dataModel[control.key] = control;
			}

			[].forEach.call(document.querySelectorAll(o.formControls), function(e) {
				/*eslint no-fallthrough:0*/
				switch (e.getAttribute("data-control-type")) {
				case "checkbox":
					appendControl(new ControlSwitch(e));
					break;
				case "buttons":
					appendControl(new ControlButtonsSelection(e));
					break;
				case "selection":
					appendControl(new ControlRadioSelection(e));
					break;
				default:
					break;
				}
			});

			for (var key in smarthome.dataModel) {
				smarthome.dataModel[key].setValue();
			}
		};
	}

	document.addEventListener("DOMContentLoaded", function() {
		smarthome.UI = new UI(document);
		smarthome.UI.updateLocalSetting(null);
		smarthome.UI.upgradeComponents();
		smarthome.UI.initControls();

		document.querySelector(o.backButton).addEventListener("click", function() {
			location.href = location.href.replace("\/basicui\/app\/settings", "/basicui/app");
		});

		function updateTheme() {
			smarthome.UI.updateLocalSetting("openhab.ui:theme.dark");
		}

		function handleStorageEvent(event) {
			smarthome.UI.updateLocalSetting(event.key);
			smarthome.UI.updateControlLocalSetting(event.key);
		}

		if (window.matchMedia) {
			var
				colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

			colorSchemeQuery.addEventListener("change", updateTheme);
		}

		window.addEventListener("storage", handleStorageEvent);

		window.addEventListener("beforeunload", function() {
			for (var key in smarthome.dataModel) {
				smarthome.dataModel[key].destroy();
			}

			if (window.matchMedia) {
				var
					colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

				colorSchemeQuery.removeEventListener("change", updateTheme);
			}

			window.removeEventListener("storage", handleStorageEvent);
		});
	});
})({
	formControls: ".mdl-form__control",
	storageKey: "data-storage-key",
	valueOn: "data-value-on",
	valueOff: "data-value-off",
	defaultValue: "data-default-value",
	controlButton: "button",
	buttonActiveClass: "mdl-button--accent",
	modal: ".mdl-modal",
	modalContainer: ".mdl-modal__content",
	selectionRows: ".mdl-form__selection-rows",
	formValue: ".mdl-form__value",
	formRadio: ".mdl-radio",
	backButton: ".navigation__button-back"
});
