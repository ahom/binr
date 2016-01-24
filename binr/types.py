import struct

import binr

@binr.struct
def uint32(ctx):
    return struct.unpack('<I', ctx.read(4))[0]


