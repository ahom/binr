from binr.context import Context
from binr.source import coerce_to_source

def struct(func):
    def closure(ctx, *args,  **kwargs):
        return call_struct(ctx, func, func.__name__, *args, **kwargs)
    return closure

def call_struct(ctx, func, name, *args, **kwargs):
    ctx.trace_open(func, name, *args, **kwargs)
    result = func(ctx, *args, **kwargs)
    ctx.trace_close(result)
    return result

def read(struct, source, *args, **kwargs):
    ctx = Context(coerce_to_source(source)) 
    return struct(ctx, *args, **kwargs)

def trace(struct, source, *args, **kwargs):
    ctx = Context(coerce_to_source(source), True) 
    struct(ctx, *args, **kwargs)
    return ctx.trace 
