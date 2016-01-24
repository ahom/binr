from binr.context import Context
from binr.source import coerce_to_source

def struct(func):
    def closure(ctx, *args,  **kwargs):
        ctx.trace_open(func, *args, **kwargs)
        result = func(ctx, *args, **kwargs)
        ctx.trace_close(result)
        return result
    return closure

def read(struct, source, *args, **kwargs):
    ctx = Context(coerce_to_source(source)) 
    return struct(ctx, *args, **kwargs)

def trace(struct, source, *args, **kwargs):
    ctx = Context(coerce_to_source(source), True) 
    result = struct(ctx, *args, **kwargs)
    return ctx.trace, result 
