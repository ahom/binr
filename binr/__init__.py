from binr.context import Context

def struct(func):
    def closure(ctx, *args,  **kwargs):
        ctx.trace_open(func, *args, **kwargs)
        result = func(ctx, *args, **kwargs)
        ctx.trace_close(result)
        return result
    return closure

def read(struct, source, *args, **kwargs):
    ctx = Context(source) 
    return struct(ctx, *args, **kwargs)

def trace_read(struct, source, *args, **kwargs):
    ctx = Context(source) 
    result = struct(ctx, *args, **kwargs)
    return ctx.traces, result 
