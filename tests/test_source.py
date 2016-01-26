import binr.source

def do_test_source(source):
    cloned_source = source.clone()

    assert source.pos() == 0
    data = source.read(2)
    assert source.pos() == 2
    source.seek(3)
    assert source.pos() == 3

    assert cloned_source.pos() == 0
    assert data == cloned_source.read(2)
    return data

def test_memviewsource():
    data = memoryview(b'\x00\x01\x02\x04')
    source = binr.source.MemviewSource(data)

    assert source.size() == 4
    assert do_test_source(source) == data[0:2]

