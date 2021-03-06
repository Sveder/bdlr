var chunk_manager = new ChunkManager(first_chunk, first_ordinal, chunk_count);
var current_page = 0; // 0 is closed...

var peeling_switch = false; //Should peeling "tutorial" actually happen?
var peel_timeout = 3000; // 3 seconds
var peel_count = 3; // How many times to peel in a row.
var peel_page = current_page;
var should_peel_more_than_once = false;

var should_peel_on_hover = false;

function ga_event(category, _event, label, value){
    label = typeof label !== 'undefined' ? label : undefined;
    value = typeof value !== 'undefined' ? value : undefined;
    ga('send', 'event', category, _event, label, value);
}

$( document ).ready(function() {
    mobile_alert();
    ready();
});

function mobile_alert() {
    mobiles = ["Smartphone", "Feature Phone", "Other Mobile"];
    if (-1 != mobiles.indexOf(WURFL.form_factor))
    {
        console.log("Mobile!");
        alert("This site has been optimized for desktop computers. You'd get a much better experience on a bigger " +
            "form factor than a mobile phone, so we suggest you visit bdlr.sveder.com on a desktop computer.")
    }
}

function ready(){
    $("#book").turn({
		width: 524*2,
		height: 800,
        pages: page_count * 2 + 2
	}).
    bind("turning", next_page).
    bind("start", started_turning).
    bind("end", ended_turning);


    Mousetrap.bind("left", function() {
        $("#book").turn("previous");
    }, "Previous page");

    Mousetrap.bind("right", function() {
        $("#book").turn("next");
    }, "Next page");

    Mousetrap.bind("shift+right", function() {
        next_text();
    }, "Next poem text");

    $('#book').css('cursor', 'pointer');

    if (should_peel_on_hover)
    {
        $('.painting').mouseover(function() {
            $("#book").turn("peel", 'bl');
        });

        $('.painting').mouseout(function() {
            $("#book").turn("peel", false);
        });

        $('.poems').mouseover(function() {
            $("#book").turn("peel", 'br');
        });

        $('.poems').mouseout(function() {
            $("#book").turn("peel", false);
        });
    }

    if (peeling_switch == true){
        log.console("Tutorial peeling is on!");
        setInterval(to_peel_or_not_to_peel, peel_timeout);
    }

    map_chunk_to_book(first_chunk);
    if (anchored_page != 0)
    {
        ga_event("Visit", "Anchor Load", undefined, anchored_page);
        scroll_to(anchored_page);
    }
}

function peel() {
    $("#book").turn("peel", "r");
    $("#book").turn("peel", "br");
}

function unpeel() {
    $("#book").turn("peel", false);
}

function to_peel_or_not_to_peel()
{
    if (current_page != peel_page)
    {
        return;
    }

    for (var i = 0; i < peel_count; ++i)
    {
        $("#book").delay(700 * i).queue(function(n) {
            peel();
            n()
        }).delay(500).queue(function(n) {
            unpeel();
            n()
        });
    }
    peel_count = 0;
}

function next_text()
{
    var poem_data = chunk_manager.get_next_text(current_page);

    var ele = $('#poems-' + current_page + ' > .poem_text');
    ga_event("Poem", "Next Translation", poem_data.name, current_page);

    ele.hide('slide', {direction: 'left'}, 300).delay(50).queue(function(n) {
        $(this).html(poem_data.text);
        n();
    }).show('slide', {direction: 'right'}, 300);

    var header = $('#poems-' + current_page + ' > .poem_title');
    header.hide('slide', {direction: 'left'}, 300).delay(50).queue(function(n) {
        $(this).html(poem_data.name);
        n();
    }).show('slide', {direction: 'right'}, 300);
}

function scroll_to(page){
    $("#book").turn("page", page * 2);
    peel_page = anchored_page;
}


function next_page(x, y, z) {
    current_page = Math.floor(y / 2);
    window.history.replaceState("", "", "/" + current_page);

    ga_event("Book", "Turned Page", undefined, current_page);

    if (should_peel_more_than_once) {
        peel_count = 3;
    }
    peel_page = current_page;

    console.log("Current page: " + current_page);

    var preloads = chunk_manager.preload_what(current_page);
    console.log("Preload: " + preloads);

    for (var i = 0; i < preloads.length; ++i)
    {
        load_chunk(preloads[i]);
    }

    if (current_page == 0)
    {
        $("#pre-book").removeClass("open")
    }
    else
    {
        $("#pre-book").addClass("open")
    }
}

function started_turning()
{
    $("#pre-book").addClass("open");
}

function ended_turning()
{
    if (current_page == 0) {
        $("#pre-book").removeClass("open");
    }
}

function load_chunk(chunk_ordinal)
{
    console.log("Loading a chunk: " + chunk_ordinal);

    $.ajax({ url: "api/json_chunk/" + chunk_ordinal,
             context: document.body})
        .done(function(data) {
            chunk_manager.new_one(chunk_ordinal, data);
            preload_css(data["css"]);
            map_chunk_to_book(data);
        });
}


function map_chunk_to_book(data) {
    var counter = 0;
    for (var page in data["pages"])
    {
        var actual_page = data["pages"][page];
        var iteration_page = data.chunk_start + counter;
        console.log("Adding actual page: " + iteration_page);

        $('#painting-' + iteration_page).html('<div class="sprite-sheet-' + data.chunk_index + ' sprite-' + iteration_page + '"></div>');
        $("#book").data().pageObjs[iteration_page * 2].html('<div class="sprite-sheet-' + data.chunk_index + ' sprite-' + iteration_page + '"><div class="grad"></div></div>');

        var poems = $('#poems-' + iteration_page);
        poems = poems.empty().append('<h1 class="poem_title">' + actual_page["original"].name + '</h1><button onclick="next_text();" id="next_text">In English ></button>');
        poems.append('<span class="poem_text" id="original">' + actual_page["original"].text + '</span>');
        poems.append('<span class="page-number">' + (iteration_page * 2 + 1) + '/212</span>');

        var poems = $("#book").data().pageObjs[iteration_page * 2 + 1];
        poems = poems.empty().append('<h1 class="poem_title">' + actual_page["original"].name + '</h1><button onclick="next_text();" id="next_text">In English ></button>');
        poems.append('<span class="poem_text" id="original">' + actual_page["original"].text + '</span>');
        poems.append('<span class="page-number">Page ' + (iteration_page * 2 + 1) + '/212</span>');

        ++counter;
    }
}


function preload_css(css_path){
    console.log("Preloading next sheet: " + css_path);
    add_css(css_path);
}


//Add the css file given to the dom:
function add_css(css_name){
    console.log("Adding css: " + css_name);
    var fileref=document.createElement("link");
    fileref.setAttribute("rel", "stylesheet");
    fileref.setAttribute("type", "text/css");
    fileref.setAttribute("href", "/css/" + css_name);

    if (typeof fileref!="undefined"){
        document.getElementsByTagName("head")[0].appendChild(fileref);
    }
}