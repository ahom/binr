from binr.trace import Trace

class Context:
    def __init__(self, source, traces_enabled=False):
        self._source = source
        self._traces_enabled = traces_enabled
        self._current_trace = None
        self.trace = None 

    def size(self):
        return self._source.size()
    
    def pos(self):
        return self._source.pos()
    
    def read(self, size):
        self.trace_read(self.pos(), size)
        return self._source.read(size)
    
    def seek(self, offset):
        self.trace_open("seek", offset)
        self._source.seek(offset)
        self.trace_close()
        return self

    def clone(self):
        return Context(self._clone())

    def skip(self, size):
        self.trace_open("skip", size)
        self.seek(self.pos() + size)
        self.trace_close()
        return self

    def trace_open(self, name, *args, **kwargs):
        if self._traces_enabled:
            new_trace = Trace(self._current_trace, self.pos(), name, *args, **kwargs)
            if self._current_trace is None:
                self.trace = new_trace
            else:
                self._current_trace.children.append(new_trace)
            self._current_trace = new_trace

    def trace_read(self, offset, size):
        if self._traces_enabled:
            self._current_trace.read(offset, size)

    def trace_close(self, result):
        if self._traces_enabled:
            self._current_trace.close(self.pos(), result)
            self._current_trace = self._current_trace.parent
