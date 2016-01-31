export default class Trace {
    constructor() {
        this.root = null;
    }

    fetch_root() {
        return this.fetch();
    }

    _fetch(path) {
        return new Promise((resolve, reject) => {
            window.fetch(`/trace/${path.join('/')}`).then((res) => res.json()).then((res) => {
                if (path.length === 0) {
                    this.root = res;
                } else {
                    let current = this.root;
                    for (let idx of path.slice(0, -1)) {
                        current = current.children[idx]
                    }
                    if (!current.children) {
                        current.children = [];
                    }
                    current.children[path[path.length - 1]] = res;
                }
                resolve(res);
            });
        });
    }

    fetch(path=[]) {
        if (path.length === 0) {
            if (this.root) {
                return Promise.resolve(this.root);
            } else {
                return this._fetch(path);
            }
        } else {
            return new Promise((resolve, reject) => {
                this.fetch(path.slice(0, -1)).then((res) => {
                    let last_idx = path[path.length - 1];
                    if (res.children && res.children[last_idx]) {
                        resolve(res.children[last_idx]);
                    } else {
                        this._fetch(path).then((child_res) => resolve(child_res));
                    }
                });
            });
        }
    }
}
