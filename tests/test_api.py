import binr
import binr.types as t

def test_basic_type():
    assert binr.read(t.uint32, b'\x01\x00\x00\x00') == 1
    trace = binr.trace(t.uint32, b'\x01\x00\x00\x00')
    assert trace.parent == None
    assert trace.name == "uint32"
    assert trace.start_offset == 0
    assert trace.end_offset == 4
    assert list(trace.offsets()) == [(0, 4)]
    assert trace.result == 1

@binr.struct
def nested_type(ctx):
    return t.uint32(ctx), t.uint32(ctx)

@binr.struct
def complicated_type(ctx, i, j):
    val = nested_type(ctx)
    ctx.skip(5)
    ctx.skip(i)
    ctx.skip(j)
    val2 = nested_type(ctx)
    val3 = t.uint64(ctx)
    return {
        'val': val,
        'val2': val2,
        'val3': val3,
    }

def test_nested_type():
    assert binr.read(nested_type, b'\x01\x00\x00\x00\x02\x00\x00\x00') == (1, 2)
    trace = binr.trace(nested_type, b'\x01\x00\x00\x00\x02\x00\x00\x00')

    assert trace.parent == None
    assert trace.name == "nested_type"
    assert trace.start_offset == 0
    assert trace.end_offset == 8
    assert list(trace.offsets()) == [(0, 8)]
    assert trace.result == (1, 2)
    assert len(trace.children) == 2

    child_trace = trace.children[0]

    assert child_trace.parent == trace 
    assert child_trace.name == "uint32"
    assert child_trace.start_offset == 0
    assert child_trace.end_offset == 4
    assert list(child_trace.offsets()) == [(0, 4)]
    assert child_trace.result == 1

    child_trace = trace.children[1]

    assert child_trace.parent == trace 
    assert child_trace.name == "uint32"
    assert child_trace.start_offset == 4 
    assert child_trace.end_offset == 8
    assert list(child_trace.offsets()) == [(4, 8)]
    assert child_trace.result == 2
