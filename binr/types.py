import struct

import binr

def define_base_type(name, letter, little_endian = True):
    struct_def = struct.Struct("{}{}".format("<" if little_endian else ">", letter))
    def closure(ctx, *args, **kwargs):
        return binr.call_struct(
            ctx, 
            lambda c: struct_def.unpack(c.read(struct_def.size))[0], 
            name, 
            *args, 
            **kwargs
        )
    closure.__name__ = name
    globals()[name] = closure

for int_type, letter in zip(range(4), ["b", "h", "i", "q"]):
    byte_count = pow(2, int_type) 
    bits = byte_count * 8
    base_name = "int{}".format(bits)
    for little_endian in [True, False]:
        endian_prefix = "le" if little_endian else "be"
        define_base_type("{}s{}".format(endian_prefix, base_name), letter, little_endian)
        define_base_type("{}u{}".format(endian_prefix, base_name), letter.upper(), little_endian)
        define_base_type("{}{}".format(endian_prefix, base_name), letter, little_endian)
    define_base_type("s{}".format(base_name), letter)
    define_base_type("u{}".format(base_name), letter.upper())
    define_base_type(base_name, letter)

for float_type, letter in zip(range(2), ["f", "d"]):
    byte_count = pow(2, float_type + 2) 
    bits = byte_count * 8
    base_name = "float{}".format(bits)
    for little_endian in [True, False]:
        endian_prefix = "le" if little_endian else "be"
        define_base_type("{}{}".format(endian_prefix, base_name), letter, little_endian)
    define_base_type(base_name, letter)

@binr.struct
def raw(ctx, length):
    return ctx.read(length)

@binr.struct
def bytes(ctx, length):
    return ctx.read(length).tobytes()

@binr.struct
def string(ctx, length, encoding="utf-8"):
    return ctx.read(length).tobytes().decode(encoding)

@binr.struct
def cstring(ctx, encoding="utf-8"):
    result = bytearray()
    char = 0xFF 
    while char != 0x00:
        char = ctx.read(1)[0]
        result.append(char)
    return result[:-1].decode(encoding)

@binr.struct
def cstringraw(ctx):
    result = bytearray()
    char = 0xFF 
    while char != 0x00:
        char = ctx.read(1)[0]
        result.append(char)
    return result[:-1]

def array(ctx, child_struct, count, *args, **kwargs):
    def unroll(c, item_count):
        return [child_struct(c, *args, **kwargs) for i in range(item_count)]
    return binr.call_struct(ctx, unroll, 'array<{}>'.format(child_struct.__name__), count, *args, **kwargs)
