import struct

import binr
import binr.types as t

def test_string_types():
    assert binr.read(t.string, b'test', 4) == 'test'
    assert binr.read(t.cstring, b'test\x00') == 'test'

def test_int_types():
    for typ in [t.int8, t.sint8, t.int8le, t.sint8le, t.int8be, t.sint8be]:
        assert binr.read(typ, struct.pack('b', -0x7F)) == -0x7F
    for typ in [t.uint8, t.uint8le, t.uint8be]:
        assert binr.read(typ, struct.pack('B', 0xFF)) == 0xFF

    for typ in [t.int16, t.sint16, t.int16le, t.sint16le]:
        assert binr.read(typ, struct.pack('<h', -0x7FFF)) == -0x7FFF
    for typ in [t.uint16, t.uint16le]:
        assert binr.read(typ, struct.pack('<H', 0xFFFF)) == 0xFFFF
    for typ in [t.int16be, t.sint16be]:
        assert binr.read(typ, struct.pack('>h', -0x7FFF)) == -0x7FFF
    for typ in [t.uint16be]:
        assert binr.read(typ, struct.pack('>H', 0xFFFF)) == 0xFFFF

    for typ in [t.int32, t.sint32, t.int32le, t.sint32le]:
        assert binr.read(typ, struct.pack('<i', -0x7FFFFFFF)) == -0x7FFFFFFF
    for typ in [t.uint32, t.uint32le]:
        assert binr.read(typ, struct.pack('<I', 0xFFFFFFFF)) == 0xFFFFFFFF
    for typ in [t.int32be, t.sint32be]:
        assert binr.read(typ, struct.pack('>i', -0x7FFFFFFF)) == -0x7FFFFFFF
    for typ in [t.uint32be]:
        assert binr.read(typ, struct.pack('>I', 0xFFFFFFFF)) == 0xFFFFFFFF

    for typ in [t.int64, t.sint64, t.int64le, t.sint64le]:
        assert binr.read(typ, struct.pack('<q', -0x7FFFFFFFFFFFFFFF)) == -0x7FFFFFFFFFFFFFFF
    for typ in [t.uint64, t.uint64le]:
        assert binr.read(typ, struct.pack('<Q', 0xFFFFFFFFFFFFFFFF)) == 0xFFFFFFFFFFFFFFFF
    for typ in [t.int64be, t.sint64be]:
        assert binr.read(typ, struct.pack('>q', -0x7FFFFFFFFFFFFFFF)) == -0x7FFFFFFFFFFFFFFF
    for typ in [t.uint64be]:
        assert binr.read(typ, struct.pack('>Q', 0xFFFFFFFFFFFFFFFF)) == 0xFFFFFFFFFFFFFFFF

def test_float_types():
    float32values = [1, -2, 0, -0]
    for typ in [t.float32, t.float32le]:
        for val in float32values:
            assert binr.read(typ, struct.pack('<f', val)) == val
    for typ in [t.float32be]:
        for val in float32values:
            assert binr.read(typ, struct.pack('>f', val)) == val

    float64values = [1, -2, 2, 0, -0]
    for typ in [t.float64, t.float64le]:
        for val in float64values:
            assert binr.read(typ, struct.pack('<d', val)) == val
    for typ in [t.float64be]:
        for val in float64values:
            assert binr.read(typ, struct.pack('>d', val)) == val
