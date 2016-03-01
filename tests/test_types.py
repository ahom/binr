import struct

import binr
import binr.types as t

def test_string_types():
    assert binr.read(t.string, b'test', 4) == 'test'
    assert binr.read(t.cstring, b'test\x00') == 'test'

def test_int_types():
    for typ in [t.int8, t.sint8, t.leint8, t.lesint8, t.beint8, t.besint8]:
        assert binr.read(typ, struct.pack('b', -0x7F)) == -0x7F
    for typ in [t.uint8, t.leuint8, t.beuint8]:
        assert binr.read(typ, struct.pack('B', 0xFF)) == 0xFF

    for typ in [t.int16, t.sint16, t.leint16, t.lesint16]:
        assert binr.read(typ, struct.pack('<h', -0x7FFF)) == -0x7FFF
    for typ in [t.uint16, t.leuint16]:
        assert binr.read(typ, struct.pack('<H', 0xFFFF)) == 0xFFFF
    for typ in [t.beint16, t.besint16]:
        assert binr.read(typ, struct.pack('>h', -0x7FFF)) == -0x7FFF
    for typ in [t.beuint16]:
        assert binr.read(typ, struct.pack('>H', 0xFFFF)) == 0xFFFF

    for typ in [t.int32, t.sint32, t.leint32, t.lesint32]:
        assert binr.read(typ, struct.pack('<i', -0x7FFFFFFF)) == -0x7FFFFFFF
    for typ in [t.uint32, t.leuint32]:
        assert binr.read(typ, struct.pack('<I', 0xFFFFFFFF)) == 0xFFFFFFFF
    for typ in [t.beint32, t.besint32]:
        assert binr.read(typ, struct.pack('>i', -0x7FFFFFFF)) == -0x7FFFFFFF
    for typ in [t.beuint32]:
        assert binr.read(typ, struct.pack('>I', 0xFFFFFFFF)) == 0xFFFFFFFF

    for typ in [t.int64, t.sint64, t.leint64le, t.lesint64]:
        assert binr.read(typ, struct.pack('<q', -0x7FFFFFFFFFFFFFFF)) == -0x7FFFFFFFFFFFFFFF
    for typ in [t.uint64, t.leuint64]:
        assert binr.read(typ, struct.pack('<Q', 0xFFFFFFFFFFFFFFFF)) == 0xFFFFFFFFFFFFFFFF
    for typ in [t.beint64, t.besint64]:
        assert binr.read(typ, struct.pack('>q', -0x7FFFFFFFFFFFFFFF)) == -0x7FFFFFFFFFFFFFFF
    for typ in [t.beuint64]:
        assert binr.read(typ, struct.pack('>Q', 0xFFFFFFFFFFFFFFFF)) == 0xFFFFFFFFFFFFFFFF

def test_float_types():
    float32values = [1, -2, 0, -0]
    for typ in [t.float32, t.lefloat32]:
        for val in float32values:
            assert binr.read(typ, struct.pack('<f', val)) == val
    for typ in [t.befloat32]:
        for val in float32values:
            assert binr.read(typ, struct.pack('>f', val)) == val

    float64values = [1, -2, 2, 0, -0]
    for typ in [t.float64, t.lefloat64]:
        for val in float64values:
            assert binr.read(typ, struct.pack('<d', val)) == val
    for typ in [t.befloat64]:
        for val in float64values:
            assert binr.read(typ, struct.pack('>d', val)) == val
