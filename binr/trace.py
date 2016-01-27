from itertools import chain

class Trace:
    def __init__(self, parent, offset, name, *args, **kwargs):
        self.parent = parent
        self.name = name
        self.args = args
        self.kwargs = kwargs
        self.start_offset = offset
        self.children = []
        self.reads = []
        self.end_offset = None
        self.result = None

    def close(self, offset, result):
        self.end_offset = offset
        self.result = result

    def read(self, offset, size):
        self.reads.append((offset, offset + size))

    def offsets(self):
        return chain(self.reads, *[child.offsets() for child in self.children])

    def __repr__(self):
        return ('[{self.start_offset}, {self.end_offset}]{self.name}(' 
            + ', '.join(
                chain(
                    ['{}'.format(arg) for arg in self.args],
                    ['{}={}'.format(key, val) for key, val in self.kwargs.items()]
                )
            ) + ')'
        ).format(self=self)

