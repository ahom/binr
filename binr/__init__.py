import sys

from binr.context import Context
from binr.source import coerce_to_source

def struct(func):
    def closure(ctx, *args,  **kwargs):
        return call_struct(ctx, func, func.__name__, *args, **kwargs)
    return closure

def call_struct(ctx, func, name, *args, **kwargs):
    ctx.trace_open(name, 3, *args, **kwargs)
    result = func(ctx, *args, **kwargs)
    ctx.trace_close(result)
    return result

def read(struct, source, *args, **kwargs):
    ctx = Context(coerce_to_source(source)) 
    return struct(ctx, *args, **kwargs)

class TraceException(Exception):
    def __init__(self, exc, trace):
        self.exc = exc
        self.trace = trace

def trace(struct, source, *args, **kwargs):
    ctx = Context(coerce_to_source(source), True) 
    try:
        struct(ctx, *args, **kwargs)
    except Exception as e:
        raise TraceException(e, ctx.trace).with_traceback(sys.exc_info()[2])
    return ctx.trace 

