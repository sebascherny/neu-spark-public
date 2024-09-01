function includeHTML() {
    let z, i, elmnt, file, xhttp, js_script_files, scriptEle;
    /* Loop through a collection of all HTML elements: */
    z = document.getElementsByClassName("append-html-code");
    for (i = 0; i < z.length; i++) {
        elmnt = z[i];
        /*search for elements with a certain atrribute:*/
        file = elmnt.getAttribute("html-file-att");
        js_script_files = elmnt.getAttribute("dependent-js");
        if (file.includes('.html')) {
            xhttp = new XMLHttpRequest();
            xhttp.onreadystatechange = function () {
                if (this.readyState == 4) {
                    if (this.status == 200) {
                        elmnt.innerHTML = this.responseText;
                        if (js_script_files) {
                            for (const js_script_file of js_script_files.split(';;')) {
                                scriptEle = document.createElement("script");
                                scriptEle.setAttribute("src", js_script_file);
                                scriptEle.setAttribute("type", "text/javascript");
                                scriptEle.setAttribute("async", true);
                                document.body.appendChild(scriptEle);
                                //scriptEle.addEventListener("load", () => {
                                //    console.log("File loaded")
                                //});
                                scriptEle.addEventListener("error", (ev) => {
                                    console.log("Error on loading file", ev);
                                });
                            }
                        }
                    }
                    if (this.status == 404) { elmnt.innerHTML = "Page not found."; }
                    /* Remove the attribute, and call this function once more: */
                    elmnt.classList.remove("append-html-code");
                    includeHTML();
                }
            }
            xhttp.open("GET", file, true);
            xhttp.send();
            /* Exit the function: */
            return;
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    includeHTML();
})
