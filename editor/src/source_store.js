export default class Source {
    constructor(page_size = 4096, max_page_count = 10) {
        this.pages = {};
        this.lru_cache = [];
        this.page_size = page_size;
        this.max_page_count = max_page_count;
    }

    fetch_infos() {
        return new Promise((resolve, reject) => {
            window.fetch('/data/infos').then((res) => res.json()).then((res) => {
                resolve(res);
            });
        });
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
        return page.buffer;
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

    read(start) {
        let id = this.page_id(start);
        let page_buffer = this.read_page(id);
        if (page_buffer !== null) {
            return Promise.resolve(page_buffer); 
        }
        return new Promise((resolve, reject) => {
            let start = id * this.page_size / 2;
            let size = this.page_size;
            window.fetch(`data/${start}/${size}`).then((res) => res.arrayBuffer()).then((res) => {
                let new_page = {
                    id: id,
                    buffer: {
                        data: new Uint8Array(res),
                        start: start, 
                        size: size
                    }
                };
                this.register_page(new_page);
                resolve(this.read_page(id));
            });
        });
    }
}
