import binr
import binr.types as t

def test_basic_type():
    assert binr.read(t.uint32, b'\x01\x00\x00\x00') == 1
    assert binr.trace(t.uint32, b'\x01\x00\x00\x00')[1] == 1

@binr.struct
def nested_type(ctx):
    return t.uint32(ctx), t.uint32(ctx)

def test_nested_type():
    trace = binr.trace(nested_type, b'\x01\x00\x00\x00\x02\x00\x00\x00')[0]

    val = str(trace)
    for child in trace.children:
        val += '\n    ' + str(child)
    assert val == 1
