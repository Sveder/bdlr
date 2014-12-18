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
    $('#book').css('cursor', 'pointer').click(function() {
        next_page();
    });
}

function next_page(){
    current_page += 1;
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

    current_page_data = current_chunk["pages"][current_page - current_chunk["chunk_start"]];

    console.log("Going to next page:" + current_page);
    console.log("chunk:" + chunk_index);
    $('#painting').html('<i class="sprite-sheet-' + chunk_index + ' sprite-' + current_page + '"></i>');

    $('#original').html('<p>' + current_page_data["original"].text + '</p>');
    $('#current').html('<p>' + current_page_data["English"][0].text + '</p>');
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
        });
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