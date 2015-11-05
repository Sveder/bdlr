var ChunkManager = function(first_chunk, first_ordinal, total_chunk_count)
{
    this.chunks = new Array(total_chunk_count);
    this.chunks[first_ordinal] = first_chunk;
};


ChunkManager.prototype.page_to_chunk = function(cur_page)
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


ChunkManager.prototype.preload_what = function(cur_page)
{
    var current_chunk = this.page_to_chunk(cur_page);
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