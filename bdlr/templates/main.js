var chunks = [first_chunk];
var current_chunk = first_chunk;
var chunk_index = 1;
var current_page_data = null;

var current_page = 0; // 0 is closed...
var preload_on = 1;


$( document ).ready(function() {
    ready();
});

function ready(){
    if (current_page > 14)
    {
        return;
    }

    $('#book').css('cursor', 'pointer').click(function() {
        //next_page();
    });


    $("#book").turn({
		width: 1010,
		height: 810
	}).bind("turning", next_page);

    if (page != 0)
    {
        scroll_to(page);
    }
    else
    {
        map_chunk_to_book(first_chunk);
    }
}

function scroll_to(page)
{
    for (var i = 0; i < page; ++i)
    {
        $("#book").turn("next");
    }
}

function next_page(x, y, z){
    current_page = Math.floor(y / 2);

    console.log("Current page: " + current_page);
    console.log("Preload: " + preload_on);

    if (preload_on == current_page)
    {
        if (current_page > 1)
        {
            console.log("Loading the next chunk!");
            chunk_index += 1;
            current_chunk = chunks[chunk_index - 1];
        }
        load_next_chunk();
    }

    //console.log("Math" + (current_page - current_chunk["chunk_start"]));

    //
    //console.log("Going to next page:" + current_page);
    //console.log("chunk:" + chunk_index);

    //current_page_data = current_chunk["pages"][current_page - current_chunk["chunk_start"]];
    //$('#painting-' + current_page).html('<i class="sprite-sheet-' + chunk_index + ' sprite-' + current_page + '"></i>');
    //
    //poems = $('#poems-' + current_page);
    //poems = poems.empty().append('<span class="poems" id="original"><pre>' + current_page_data["original"].text + '</pre></span>');
    //poems.append('<span class="poem" id="current"><p>' + current_page_data["English"][0].text + '</p></span>');
    
}


function load_next_chunk()
{
    next_chunk = (chunk_index + 1).toString();
    console.log("Loading next chunk: " + next_chunk);

    $.ajax({ url: "api/json_chunk/" + next_chunk,
             context: document.body})
        .done(function(data) {
            chunks[chunks.length] = data;
            preload_css(data["css"]);
            preload_on += current_chunk["page_count"];

            map_chunk_to_book(data);
        });
}

function map_chunk_to_book(data)
{
    counter = 0;
    for (page in data["pages"])
    {
        actual_page = data["pages"][page];

        console.log("Page:" + page);
        console.log(actual_page);
        iteration_page = data.chunk_start + counter;

        $('#painting-' + iteration_page).html('<i class="sprite-sheet-' + data.chunk_index + ' sprite-' + iteration_page + '"></i>');

        poems = $('#poems-' + iteration_page);
        console.log(poems);

        poems = poems.empty().append('<span class="poems" id="original"><pre>' + actual_page["original"].text + '</pre></span>');
        poems.append('<span class="poem" id="current"><p>' + actual_page["English"][0].text + '</p></span>');

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