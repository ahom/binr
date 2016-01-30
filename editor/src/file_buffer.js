export default class FileBuffer {
    constructor(file, page_size = 4096, max_page_count = 10) {
        this.file = file;
        this.pages = {};
        this.lru_cache = [];
        this.page_size = page_size;
        this.max_page_count = max_page_count;
    }
    
    size() {
        return this.file !== null ? this.file.size : 0;
    }

    read_page(id) {
        let page = this.pages[id];
        if (page === undefined) {
            return null;
        }
        // refresh position in lru_cache
        let cache_idx = this.lru_cache.indexOf(page);
        if (cache_idx === -1) {
            throw new Error('page found in index but not in cache');
        }
        this.lru_cache.splice(cache_idx, 1);
        this.lru_cache.unshift(page);
        return page.data;
    }

    register_page(page) {
        let current_page = this.pages[page.id];
        if (current_page !== undefined) {
            // already exists
            let cache_idx = this.lru_cache.indexOf(current_page);
            if (cache_idx !== -1) {
                this.lru_cache.splice(cache_idx, 1);
            }
            page = current_page;
        } else {
            this.pages[page.id] = page;
        }
        this.lru_cache.unshift(page);
        for (let removed_page of this.lru_cache.slice(this.max_page_count)) {
            delete this.pages[removed_page.id];
        }
        this.lru_cache = this.lru_cache.slice(0, this.max_page_count);
    }
    
    page_id(start) {
        return Math.floor(2 * start / this.page_size);
    }

    read(start, size) {
        if (size > this.page_size / 2) {
            throw new Error('pages too small');
        }
        let id = this.page_id(start);
        let page_data = this.read_page(id);
        if (page_data === null) {
            return null;
        }
        let rel_start = start - ((id * this.page_size) / 2);
        return page_data.subarray(rel_start, rel_start + size); 
    }

    read_async(start, size, callback) {
        let data = this.read(start, size);
        if (data !== null) {
            callback(data);
        } else if (this.file === null) {
            callback(new Uint8Array());
        } else {
            let reader = new FileReader();
            let page_id = this.page_id(start);
            reader.onloadend = (e) => {
                if (reader.error) {
                    throw new Error(reader.error);
                } else {
                    let new_page = {
                        id: page_id,
                        data: new Uint8Array(reader.result)
                    };
                    this.register_page(new_page);
                    callback(this.read_page(page_id));
                }
            };
            reader.readAsArrayBuffer(
                this.file.slice(
                    page_id * this.page_size / 2,         
                    page_id * this.page_size / 2 + this.page_size
                )
            );
        }
    }

    warmup_neighbors(start) {
        if (start > this.page_size / 2) {
            this.read_async(start - this.page_size / 2, 1, () => {});
        }
        this.read_async(start + this.page_size / 2, 1, () => {});
    }
}
