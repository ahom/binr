import json
from itertools import chain

class DebugJsonEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, tuple) and hasattr(o, '_asdict'): # for namedtuple
            return o._asdict()
        else:
            try:
                return super().default(o)
            except Exception as e:
                return str(o) # for all the rest, cast to str

class Trace:
    def __init__(self, parent, offset, name, filename, func, lineno, *args, **kwargs):
        self.parent = parent
        self.name = name
        self.filename = filename
        self.func = func
        self.lineno = lineno
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
        offsets = []
        for offset in chain(*[child.offsets() for child in self.children], self.reads):
            start = None
            end = None
            insertion_point = 0
            for i, agg_offset in enumerate(offsets):
                if agg_offset[0] < offset[0]:
                    insertion_point = i + 1
                if agg_offset[1] >= offset[0] or offset[1] <= agg_offset[0]: # Intervals overlap 
                    if start is None:
                        start = i 
                    end = i 
            if start is None:
                offsets.insert(insertion_point, offset)
            else:
                offsets = offsets[:start] \
                    + [(min(offset[0], offsets[start][0]), max(offset[1], offsets[end][1]))] \
                    + offsets[end+1:]
        return offsets

    def call_str(self):
        return ('{self.name}(' 
            + ', '.join(
                chain(
                    ['{}'.format(arg) for arg in self.args],
                    ['{}={}'.format(key, val) for key, val in self.kwargs.items()]
                )
            ) + ')'
        ).format(self=self)

    def to_dict(self):
        return {
            'call': self.call_str(),
            'filename': self.filename,
            'func': self.func,
            'lineno': self.lineno,
            'offsets': self.offsets(),
            'result': json.dumps(self.result, indent=4, cls=DebugJsonEncoder),
            'children': list(map(lambda t: t.to_dict(), self.children))
        }
