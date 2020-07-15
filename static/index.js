"use strict"

const survey_key = "survey2020";

let codes = document.querySelectorAll("code");
let iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform); // https://stackoverflow.com/questions/9038625/detect-if-device-is-ios

let subtitle_index = 0;

const subtiles = [
    "_NOW_HUMAN_",
    "_GITHASH_",
    "Same low price, 20% more content.",
    "Recommended by 9 out of 10 dentists.",
    "The #1 cheat sheet according to its authors.",
    "This site was neither tested on nor approved by animals.",
];

/// Enables or disables the playground.
function show_playground(state) {
    let area_static = document.getElementById("hellostatic");
    let area_play = document.getElementById("helloplay");
    let area_ctrl = document.getElementById("helloctrl");
    let area_info = document.getElementById("helloinfo");

    if (state) {
        area_static.style.display = "none";
        area_info.style.display = "block";
        area_play.innerHTML = "<iframe src='https://play.rust-lang.org/' style='width:100%; height:500px;'></iframe>";
        area_ctrl.innerHTML = "<a href='javascript:show_playground(false);'>⏹️ Stop Editor</a>";
    } else {
        area_static.style.display = "block";
        area_info.style.display = "none";
        area_play.innerHTML = "";
        area_ctrl.innerHTML = "<a href='javascript:show_playground(true);'>▶️ Edit & Run</a>";
    }
}

// Called by toggle button, enable or disable night mode and persist setting in localStorage.
function toggle_legend_ext() {
    let ext = document.getElementById("legendext");
    let ctrl = document.getElementById("legendcontrols");

    if (!ext.style.display || ext.style.display == "none") {
        ext.style.display = "inline";
        ctrl.innerHTML = "x"
    } else {
        ext.style.display = "none";
        ctrl.innerHTML = "+"
    }
}


// Called by toggle button, enable or disable night mode and persist setting in localStorage.
function toggle_night_mode() {
    let body = document.getElementsByTagName("body")[0];
    if (body.classList.contains("night-mode")) {
        body.classList.remove("night-mode");
        !!localStorage && localStorage.setItem("night-mode", "day");
    } else {
        body.classList.add("night-mode");
        !!localStorage && localStorage.setItem("night-mode", "night");
    }
}

// Called by toggle button, enable or disable ligatures persist setting in localStorage.
function toggle_ligatures() {
    let body = document.getElementsByTagName("body")[0];
    let set = undefined;

    if (codes[0].style.fontVariantLigatures === "common-ligatures") {
        set = "none";
        !!localStorage && localStorage.setItem("ligatures", "no-ligatures");
    } else {
        set = "common-ligatures";
        !!localStorage && localStorage.setItem("ligatures", "ligatures");
    }

    codes.forEach((code) => {
        code.style.fontVariantLigatures = set;
    });
}

// Sets the survey state
function set_survey(state) {
    let elements = document.getElementsByClassName("survey");

    for (var e of elements) {
        e.style.display = state;
    }

    !!localStorage && localStorage.setItem(survey_key, state);
}

// Checks if an element is in the viewport, returns upper position or false if not.
function element_in_viewport(element) {
    let rect = element.getBoundingClientRect();

    let visible  = rect.top >= 0 &&
                   rect.left >= 0 &&
                   rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
                   rect.right <= (window.innerWidth || document.documentElement.clientWidth);

    if (visible) {
        return rect.top;
    } else {
        return undefined;
    }
}

// Out of a set of elements, returns (position, higest_visible).
function highest_visible(elements) {
    let best = [999999, undefined];

    for (var heading of elements) {
        let pos = element_in_viewport(heading);

        // Store if better and no old set
        if (pos !== undefined && (best[1] === undefined || pos < best[1])) {
            best = [pos, heading.id];
        }
    }

    if (best[1] === undefined) {
        return undefined
    } else {
        return best
    }
}

// Called when the user clicks the subtitle (usually the date)
function toggle_subtitle() {
    let subtitle = document.getElementById("subtitle");

    subtitle_index = (subtitle_index + 1) % subtiles.length;
    subtitle.innerHTML = subtiles[subtitle_index];
}


// Use proper syntax since we don't want to write ````rust ...``` all the time.
codes.forEach(code => {
    code.className = "language-rust";
});


// Executed on page load, this runs all toggles the user might have clicked
// the last time based on localStorage.
try {
    // iOS does not honor the ligature settings and always renders the font without them.
    // Hide the button not to confuse users.
    if (iOS) {
        let button = document.getElementById("toggle_ligatures");
        button.style.visibility = "hidden";
    }

    // All targets we might offer as bookmarks
    let h2s = document.getElementsByTagName("h2");
    let h3s = document.getElementsByTagName("h3");

    if (!!window.history && !!window.history.replaceState) {
        // Cache scroll position and only act if we changed
        let last_scroll_position = 0;

        // Make sure we update the #xxx part of our URL based on what's visible. We use setInterval
        // since onscroll had terrible performance if people actually scrolled.
        window.setInterval((e) => {
            // Make sure we actually moved ...
            let current_scrolled_position = window.pageYOffset || document.documentElement.scrollTop;
            if (current_scrolled_position == last_scroll_position) return;
            last_scroll_position = current_scrolled_position;

            let target = undefined;

            // Fast path if start of page
            if (current_scrolled_position < 100) {
                target = "";
            } else {
                // If now, compute new target.
                let best = (99999, undefined);

                let best_h2 = highest_visible(h2s);
                let best_h3 = highest_visible(h3s);

                // Find the actually higest one.
                if (best_h2 === undefined && best_h3 === undefined) return;
                if (best_h2 === undefined && best_h3 !== undefined) target = best_h3[1];
                if (best_h2 !== undefined && best_h3 === undefined) target = best_h2[1];
                if (best_h2 !== undefined && best_h3 !== undefined) target = best_h2[0] < best_h3[0] ? best_h2[1] : best_h3[1];

            }

            if (target !== undefined) {
                window.history.replaceState({}, "", "#" + target);
            }
        }, 500);
    }

    let night_mode = !!localStorage && localStorage.getItem("night-mode");
    let ligatures = !!localStorage && localStorage.getItem("ligatures");
    let survey = !!localStorage && localStorage.getItem(survey_key);

    if (night_mode === "night") {
        toggle_night_mode();
    }

    if (ligatures === "ligatures") {
        toggle_ligatures();
    }

    if (!survey || survey === "" || survey === "block") {
        set_survey("block");
    }

} catch (e) {
    console.log(e);
}