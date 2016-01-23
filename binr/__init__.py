def struct(func):
    def closure(ctx, *args,  **kwargs):
        ctx.trace_open(func, *args, **kwargs)
        result = func(ctx, *args, **kwargs)
        ctx.trace_close(result)
        return result
    return closure

