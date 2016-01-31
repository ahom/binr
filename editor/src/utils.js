export function debounce(func, timeout) {
    let postponed_call = null;
    return function (...args) {
        let ctx = this;
        window.clearTimeout(postponed_call);
        postponed_call = window.setTimeout(() => func.apply(ctx, args), timeout);
    }
}

export function throttle(func, threshold) {
    let last = null;
    let postponed_call = null;
    return function (...args) {
        let ctx = this;
        let now = +(new Date);
        window.clearTimeout(postponed_call);
        if (last && now < last + threshold) {
            postponed_call = window.setTimeout(() => {
                last = last + threshold;
                func.apply(ctx, args);
            }, last + threshold - now);
        } else {
            last = now;
            func.apply(ctx, args);
        }
    }
}
