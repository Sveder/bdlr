var chunk_manager = new ChunkManager(first_chunk, first_ordinal, chunk_count);
var current_page = 0; // 0 is closed...

$( document ).ready(function() {
    ready();
});

function ready(){
    $("#book").turn({
		width: 1010,
		height: 800,

		gradients: true
	}).bind("turning", next_page);


    Mousetrap.bind("left", function() {
        $("#book").turn("previous");
    }, "Previous page");

    Mousetrap.bind("right", function() {
        $("#book").turn("next");
    }, "Next page");

    //$('#book').css('cursor', 'pointer').click(function() {
    //    //UNCOMMENT WHEN I WANT PAGE CLICK TO TURN. BUT ONLY GOES FORWARD!
    //    //$("#book").turn("next");
    //});

    map_chunk_to_book(first_chunk);
    if (anchored_page != 0)
    {
        scroll_to(anchored_page);
    }
}

function next_text()
{
    var poem_data = chunk_manager.get_next_text(current_page);
    var ele = $('#poems-' + current_page + ' > .poem_text');

    ele.hide('slide', {direction: 'left'}, 300).delay(50).queue(function(n) {
        $(this).html(poem_data.text);
        n();
    }).show('slide', {direction: 'right'}, 300);
}

function scroll_to(page){
    $("#book").turn("page", page * 2);
}


function next_page(x, y, z) {
    current_page = Math.floor(y / 2);
    window.history.replaceState("", "", "/" + current_page);

    console.log("Current page: " + current_page);

    var preloads = chunk_manager.preload_what(current_page);
    console.log("Preload: " + preloads);

    for (var i = 0; i < preloads.length; ++i)
    {
        load_chunk(preloads[i]);
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

function map_chunk_to_book(data)
{
    var counter = 0;
    for (var page in data["pages"])
    {
        var actual_page = data["pages"][page];
        var iteration_page = data.chunk_start + counter;
        console.log("Adding actual page: " + iteration_page);

        $('#painting-' + iteration_page).html('<div class="sprite-sheet-' + data.chunk_index + ' sprite-' + iteration_page + '"></div>');

        var poems = $('#poems-' + iteration_page);
        poems = poems.empty().append('<h1 class="poem_title">' + actual_page["original"].name + ' <button onclick="next_text();" id="next_text">></button></h1>');
        poems.append('<span class="poem_text" id="original">' + actual_page["original"].text + '</span>');
        poems.append('<span class="page-number">' + (iteration_page * 2 + 1) + '/203</span>');

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