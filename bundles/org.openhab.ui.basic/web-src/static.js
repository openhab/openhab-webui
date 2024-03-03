/**
 * openHAB BasicUI javascript for the static page (page listing all sitemaps)
 *
 * @author Laurent Garnier — initial version
 */

/*eslint-env browser */
/*eslint no-undef:2*/
/*eslint no-new:0 */
/*eslint no-underscore-dangle:0*/

(function() {
	"use strict";

	var
		smarthome = {};

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
	}

	document.addEventListener("DOMContentLoaded", function() {
		smarthome.UI = new UI(document);
		smarthome.UI.updateLocalSetting(null);

		document.querySelector(".navigation__button-settings").addEventListener("click", function() {
			location.href = location.href.replace("\/basicui\/app", "/basicui/app/settings");
		});

		function updateTheme() {
			smarthome.UI.updateLocalSetting("openhab.ui:theme.dark");
		}

		function handleStorageEvent(event) {
			smarthome.UI.updateLocalSetting(event.key);
		}

		if (window.matchMedia) {
			var
				colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

			colorSchemeQuery.addEventListener("change", updateTheme);
		}

		window.addEventListener("storage", handleStorageEvent);

		window.addEventListener("beforeunload", function() {
			if (window.matchMedia) {
				var
					colorSchemeQuery = window.matchMedia("(prefers-color-scheme: dark)");

				colorSchemeQuery.removeEventListener("change", updateTheme);
			}

			window.removeEventListener("storage", handleStorageEvent);
		});
	});
})();
