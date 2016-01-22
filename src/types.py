import struct

import binr

@binr.struct
def uint64(ctx):
    return struct.read('<L', ctx.read(8))


