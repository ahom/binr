import os
import mmap

def coerce_to_source(data):
    if isinstance(data, memoryview):
        return MemviewSource(data)
    if isinstance(data, bytes):
        return MemviewSource(memoryview(data))
    if isinstance(data, mmap.mmap):
        return MmapSource(data)
    return data

class MemviewSource:
    def __init__(self, mem, name=None):
        self._mem = mem
        self._size = len(self._mem)
        self._name = name

    def size(self):
        return self._size

    def name(self):
        return self._name

    def read(self, offset, size):
        result = self._mem[offset:offset + size]
        return result
     
    def clone(self):
        return MemviewSource(self._mem)

class FileSource:
    def __init__(self, filelike, name=None):
        self._f = filelike
        self._size = os.fstat(self._f.fileno()).st_size
        self._name = name

    def size(self):
        return self._size
    
    def name(self):
        return self._name

    def read(self, offset, size):
        self._f.seek(offset)
        result = memoryview(self._f.read(size))
        return result
     
    def clone(self):
        return FileSource(self._f)

class MmapSource:
    def __init__(self, mmap, name=None):
        self._mmap = mmap
        self._size = self._mmap.size()
        self._name = name

    def size(self):
        return self._size

    def name(self):
        return self._name

    def read(self, offset, size):
        result = memoryview(self._mmap[offset:offset + size])
        return result
     
    def clone(self):
        return MmapSource(self._f)

