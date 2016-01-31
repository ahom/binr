import inspect

from binr.trace import Trace

class Context:
    def __init__(self, source, traces_enabled=False, offset=0):
        self._source = source
        self._traces_enabled = traces_enabled
        self._offset = offset
        self._current_trace = None
        self.trace = None 

    def size(self):
        return self._source.size()
    
    def pos(self):
        return self._offset
    
    def read(self, size):
        self.trace_read(self.pos(), size)
        result = self._source.read(self.pos(), size)
        self._offset += size
        return result
    
    def seek(self, offset):
        self.trace_open("seek", offset)
        self._offset = offset
        self.trace_close()
        return self

    def clone(self):
        return Context(self._clone(), self._traces_enabled, self._offset)

    def skip(self, size):
        self.trace_open("skip", size)
        self._offset += size
        self.trace_close()
        return self

    def trace_open(self, name, *args, **kwargs):
        if self._traces_enabled:
            frameinfo = inspect.stack()[3]
            new_trace = Trace(
                self._current_trace, 
                self.pos(), 
                name, 
                frameinfo.filename, 
                frameinfo.function, 
                frameinfo.lineno, 
                *args, 
                **kwargs
            )
            if self._current_trace is None:
                self.trace = new_trace
            else:
                self._current_trace.children.append(new_trace)
            self._current_trace = new_trace

    def trace_read(self, offset, size):
        if self._traces_enabled:
            self._current_trace.read(offset, size)

    def trace_close(self, result=None):
        if self._traces_enabled:
            self._current_trace.close(self.pos(), result)
            self._current_trace = self._current_trace.parent
