import binr
import binr.source
import binr.types

def test_basic_types():
    source = binr.source.MemviewSource(b'\x01\x00\x00\x00')
    assert binr.read(binr.types.uint32, source) == 1
