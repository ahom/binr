import binr.source

def test_memviewsource():
    data = memoryview(b'\x00\x01\x02\x04')
    source = binr.source.MemviewSource(data)

    assert source.read(0, 2) == b'\x00\x01'

