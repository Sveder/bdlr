var ChunkManager = function(first_chunk, first_ordinal, total_chunk_count)
{
    this.chunks = new Array(total_chunk_count);
    this.cur_text_per_page = Array.apply(null, Array(page_count)).map(Number.prototype.valueOf, 0);
    this.chunks[first_ordinal] = first_chunk;
};


ChunkManager.prototype._page_to_chunk_index = function(cur_page)
{
    for (var i=0; i < this.chunks.length; ++i)
    {
        if (this.chunks[i] != undefined)
        {
            if ((this.chunks[i].chunk_stop >= cur_page) && (this.chunks[i].chunk_start <= cur_page))
            {
                console.log("Page " + cur_page + " to chunk: " + i);
                return i;
            }
        }
    }
    return -1;
};

ChunkManager.prototype.get_page_chunk = function(page){
    return this.chunks[this._page_to_chunk_index(page)];
};

ChunkManager.prototype.get_page_data = function(page){
    var chunk = this.chunks[this._page_to_chunk_index(page)];
    return chunk.pages[page - chunk.chunk_start];
};

ChunkManager.prototype.get_next_text = function(page){
    var page_data = this.get_page_data(page);
    var len_of_texts = page_data.English.length;

    this.cur_text_per_page[page] += 1;
    this.cur_text_per_page[page] %= (1 + len_of_texts); // Take into account the french version

    if (this.cur_text_per_page[page] == 0)
    {
        return page_data.original;
    }

    return page_data.English[this.cur_text_per_page[page] - 1];
};


ChunkManager.prototype.preload_what = function(cur_page)
{
    var current_chunk = this._page_to_chunk_index(cur_page);
    if (current_chunk == -1)
    {
        return [];
    }

    var preload_chunks = [];

    if ((this.chunks[current_chunk - 1] == undefined) && current_chunk > 1)
    {
        preload_chunks.push(current_chunk - 1);
    }

    if ((this.chunks[current_chunk + 1] == undefined) && (current_chunk < this.chunks.length - 1))
    {
        preload_chunks.push(current_chunk + 1);
    }

    return preload_chunks;
};

ChunkManager.prototype.new_one = function(chunk_ordinal, chunk_data)
{
    this.chunks[chunk_ordinal] = chunk_data;
};