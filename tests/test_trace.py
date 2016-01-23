from binr.trace import Trace

def test_trace():
    tr = Trace(None, 10,  None)
    tr.close(12, None)

    assert tr.size == 2
