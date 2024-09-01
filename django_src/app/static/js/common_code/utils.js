function add_loading(body) {
	const div = document.createElement("div");
	div.className = "loading";
	const closeBtn = document.createElement("button");
	closeBtn.textContent = "X";
	closeBtn.onclick = () => { remove_loading(this); }
	closeBtn.className = "btn btn-danger cross_button_for_loading";
	const minimizeBtn = document.createElement("button");
	minimizeBtn.textContent = "-";
	minimizeBtn.onclick = () => { minimize_loading(div); }
	minimizeBtn.className = "btn btn-danger minimize_button_for_loading";
	div.appendChild(closeBtn);
	div.appendChild(minimizeBtn);
	body.appendChild(div);
}

function add_loading_inside_div(ddiv) {
	ddiv.className = "loading_inside_div";
}

function remove_loading_inside_div(ddiv) {
	ddiv.className = "";
}

function remove_loading() {
	if (document.getElementsByClassName("loading").length > 0) {
		document.getElementsByClassName("loading")[0].remove();
	} else if (document.getElementsByClassName("minimized_loading").length > 0) {
		document.getElementsByClassName("minimized_loading")[0].remove();
	}
}

function remove_loading_from_button(e) {
	e.remove();
}

function minimize_loading(e) {
	e.className = "minimized_loading";
}

/* JQUERY 
function create_modal(header_txt, body_text, validate, callback, modal_size){
	var modal = $("<div>", {class: "modal fade",tabindex:1});
	var div = $("<div>", {class: "modal-dialog"}).appendTo(modal);
	if (modal_size) div.addClass(modal_size);
	var content = $("<div>", {class: "modal-content"}).appendTo(div);
	var header = $("<div>", {class: "modal-header"}).appendTo(content);
	$("<button>", {class: "close", "data-dismiss": "modal"}).html("&times;").appendTo(header);
	$("<h4>", {class: "modal-title", html: header_txt}).appendTo(header);
	var body = $("<div>", {class: "modal-body"}).appendTo(content);
	body.append(body_text);
	var footer = $("<div>", {class: "modal-footer"}).appendTo(content);
	if (validate){
		$("<button>", {class: "btn btn-success",
					   "data-dismiss": "modal",
					   text: "Sí"}).appendTo(footer).click(function(){callback(modal); });
		$("<button>", {class: "btn btn-danger", "data-dismiss": "modal", text: "No"}).appendTo(footer);
	} else {
		$("<button>", {class: "btn btn-default", "data-dismiss": "modal", text: "Close"}).appendTo(footer);
	}
	$(modal).on("keyup", function(e){
		if (e.keyCode == 13){
			if (validate) callback(modal);
			$(modal).modal("hide");
		}
	})
	$(modal).on('hidden.bs.modal', function (e) {
		$(document).off('keyup')
		$(modal).remove();
	});
	$(modal).modal("show");
}
*/

function doIfEscapePressed(event, funcCall) {
	event = event || window.event;
	var key = event.which || event.key || event.keyCode;
	if (key === 27) { // escape
		funcCall();
	}
};

function utilDragStartFunction(ev, token) {
	ev.dataTransfer.setData("tokenId", token.tokenId);
	ev.dataTransfer.setData("tokenImage", token.image);
	ev.dataTransfer.setData("tokenName", token.name);
}

function utilDropFunction(ev, appendTokenFunction) {
	ev.preventDefault();
	appendTokenFunction(
		{
			'tokenId': ev.dataTransfer.getData("tokenId"),
			'image': ev.dataTransfer.getData("tokenImage"),
			'name': ev.dataTransfer.getData("tokenName"),
		}
	);
}

function utilOnDragOver(ev) {
	ev.preventDefault();
}

function scrollToLine(textarea, lineNumber) {
	var lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight);
	textarea.scrollTop = lineNumber * lineHeight;
}

function selectTextareaLine(tarea, lineNum) {
	lineNum--; // array starts at 0
	var lines = tarea.value.split("\n");
	if (lines.length <= lineNum) {
		return;
	}

	// calculate start/end
	var startPos = 0, endPos = tarea.value.length;
	for (var x = 0; x < lines.length; x++) {
		if (x == lineNum) {
			break;
		}
		startPos += (lines[x].length + 1);

	}

	var endPos = lines[lineNum].length + startPos;

	// do selection
	// Chrome / Firefox

	if (typeof (tarea.selectionStart) != "undefined") {
		tarea.focus();
		tarea.selectionStart = startPos;
		tarea.selectionEnd = endPos;
		return true;
	}

	// IE
	if (document.selection && document.selection.createRange) {
		tarea.focus();
		tarea.select();
		var range = document.selection.createRange();
		range.collapse(true);
		range.moveEnd("character", endPos);
		range.moveStart("character", startPos);
		range.select();
		return true;
	}

	return false;
}
