(function () {
  "use strict";

  var storageKey = "ng-theme";
  var root = document.documentElement;
  var systemTheme = window.matchMedia("(prefers-color-scheme: dark)");
  var preference = null;
  var toggle = null;

  function validTheme(value) {
    return value === "light" || value === "dark";
  }

  try {
    var savedTheme = window.localStorage.getItem(storageKey);
    if (validTheme(savedTheme)) preference = savedTheme;
  } catch (error) {
    // The toggle still works when browser storage is unavailable.
  }

  function applyTheme() {
    var theme = preference || (systemTheme.matches ? "dark" : "light");
    root.dataset.theme = theme;

    if (toggle) {
      var label = "Switch to " + (theme === "dark" ? "light" : "dark") + " theme";
      toggle.setAttribute("aria-label", label);
      toggle.title = label;
    }
  }

  // Run before the page is drawn so its first frame has the right colors.
  applyTheme();

  function addToggle() {
    var header = document.querySelector(".header-inner");
    if (!header || header.querySelector(".theme-toggle")) return;

    toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "theme-toggle";

    var svgNamespace = "http://www.w3.org/2000/svg";
    var icon = document.createElementNS(svgNamespace, "svg");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("width", "14");
    icon.setAttribute("height", "14");
    icon.setAttribute("aria-hidden", "true");
    icon.setAttribute("focusable", "false");

    var half = document.createElementNS(svgNamespace, "path");
    half.setAttribute("d", "M12 3a9 9 0 0 0 0 18Z");
    half.setAttribute("fill", "currentColor");

    var outline = document.createElementNS(svgNamespace, "circle");
    outline.setAttribute("cx", "12");
    outline.setAttribute("cy", "12");
    outline.setAttribute("r", "9");
    outline.setAttribute("fill", "none");
    outline.setAttribute("stroke", "currentColor");
    outline.setAttribute("stroke-width", "1.5");

    icon.appendChild(half);
    icon.appendChild(outline);
    toggle.appendChild(icon);

    toggle.addEventListener("click", function () {
      preference = root.dataset.theme === "dark" ? "light" : "dark";
      applyTheme();
      try {
        window.localStorage.setItem(storageKey, preference);
      } catch (error) {
        // Keep the current page's choice even when it cannot be saved.
      }
    });

    applyTheme();
    header.classList.add("has-theme-toggle");
    header.appendChild(toggle);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", addToggle, { once: true });
  } else {
    addToggle();
  }

  function followSystemTheme() {
    if (preference === null) applyTheme();
  }

  if (systemTheme.addEventListener) {
    systemTheme.addEventListener("change", followSystemTheme);
  } else if (systemTheme.addListener) {
    systemTheme.addListener(followSystemTheme);
  }

  window.addEventListener("storage", function (event) {
    if (event.key !== storageKey && event.key !== null) return;
    preference = validTheme(event.newValue) ? event.newValue : null;
    applyTheme();
  });
})();
