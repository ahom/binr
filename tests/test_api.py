import binr
import binr.types as t

def test_basic_type():
    assert binr.read(t.uint32, b'\x01\x00\x00\x00') == 1
    trace = binr.trace(t.uint32, b'\x01\x00\x00\x00')
    assert trace.parent == None
    assert trace.name == "uint32"
    assert trace.offset == 0
    assert trace.size == 4
    assert trace.result == 1

@binr.struct
def nested_type(ctx):
    return t.uint32(ctx), t.uint32(ctx)

def test_nested_type():
    assert binr.read(nested_type, b'\x01\x00\x00\x00\x02\x00\x00\x00') == (1, 2)
    trace = binr.trace(nested_type, b'\x01\x00\x00\x00\x02\x00\x00\x00')

    assert trace.parent == None
    assert trace.name == "nested_type"
    assert trace.offset == 0
    assert trace.size == 8
    assert trace.result == (1, 2)
    assert len(trace.children) == 2

    child_trace = trace.children[0]

    assert child_trace.parent == trace 
    assert child_trace.name == "uint32"
    assert child_trace.offset == 0
    assert child_trace.size == 4
    assert child_trace.result == 1

    child_trace = trace.children[1]

    assert child_trace.parent == trace 
    assert child_trace.name == "uint32"
    assert child_trace.offset == 4
    assert child_trace.size == 4
    assert child_trace.result == 2
