from itertools import chain

class Trace:
    def __init__(self, parent, offset, name, *args, **kwargs):
        self.parent = parent
        self.name = name
        self.args = args
        self.kwargs = kwargs
        self.offset = offset
        self.children = []
        self.result = None
        self.size = None

    def close(self, offset, result):
        self.result = result
        self.size = offset - self.offset

    def __repr__(self):
        return ('{self.name}[{self.offset}, {self.size}](' 
            + ', '.join(
                chain(
                    ['{}'.format(arg) for arg in self.args],
                    ['{}={}'.format(key, val) for key, val in self.kwargs.items()]
                )
            ) + ')'
        ).format(self=self)

