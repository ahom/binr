class MemviewSource:
    def __init__(self, mem):
        self._mem = mem
        self._size = len(self._mem)
        self._pos = 0

    def size(self):
        return self._size

    def pos(self):
        return self._pos
    
    def read(self, size):
        result = self._mem[self._pos:self._pos + size]
        self._pos += size
        return result
     
    def seek(self, offset):
        self._pos = offset

    def clone(self):
        return MemviewSource(mem)

