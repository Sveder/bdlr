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
    if (current_page == 14)
    {
        return;
    }
    $('#book').css('cursor', 'pointer').click(function() {
        //next_page();
    });

    $("#book").turn({
		width: 1010,
		height: 810,
	}).bind("turning", next_page);
}

function next_page(x, y, z){
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

//    $('#book').append('<div class="painting"><i class="sprite-sheet-' + chunk_index + ' sprite-' + current_page + '"></i></div>');
//
//    poems = $("<div id='poems'></div>");
//    poems.append('<span class="poem" id="original"><p>' + current_page_data["original"].text + '</p></span>');
//    poems.append('<span class="poem" id="current"><p>' + current_page_data["English"][0].text + '</p></span>');
//    $('#book').append(poems);

    $('#painting-' + current_page).html('<i class="sprite-sheet-' + chunk_index + ' sprite-' + current_page + '"></i>');

    poems = $('#poems-' + current_page);
    poems = poems.empty().append('<span class="poems" id="original"><p>' + current_page_data["original"].text + '</p></span>');
    poems.append('<span class="poem" id="current"><p>' + current_page_data["English"][0].text + '</p></span>');

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