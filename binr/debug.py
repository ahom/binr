import importlib
import argparse
import traceback
import inspect
import io
import os

STATIC_FILES_PATH = os.path.join(
    os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe()))),
    '..',
    'editor'
)

from bottle import Bottle, static_file, redirect

import binr
from binr.source import FileSource

class Server:
    def __init__(self, trace, source):
        self.bottle = Bottle()
        self._trace = trace
        self._source = source
        
        self.bottle.route('/trace', ['GET'], self.trace)
        self.bottle.route('/trace/<path:path>', ['GET'], self.trace)
        self.bottle.route('/data/<offset:int>/<size:int>', ['GET'], self.data)
        self.bottle.route('/<path:path>', ['GET'], self.static)
        self.bottle.route('/', ['GET'], lambda : redirect('/index.html'))

    def static(self, path):
        return static_file(path, root=STATIC_FILES_PATH)

    def trace(self, path=None):
        tr = self._trace
        if not path is None:
            for child_id in (int(i) for i in path.strip('/').split('/')):
                tr = tr.children[child_id]
        return {
            'call': tr.call_str(),
            'caller': tr.caller_str(), 
            'offsets': tr.offsets(),
            'children_count': len(tr.children)
        }

    def data(self, offset, size):
        return io.BytesIO(self._source.read(offset, size).tobytes())

    def run(self, *args, **kwargs):
        return self.bottle.run(*args, **kwargs)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--filename', '-n', action='store', required=True,
                       help='data to parse')
    parser.add_argument('--mod', '-m', action='store', required=True,
                        help='module for the struct to parse')
    parser.add_argument('--func', '-f', action='store', required=True,
                        help='function for the struct to parse')
    args = parser.parse_args()

    with open(args.filename, 'rb') as f:
        source = FileSource(f)
        
        module = importlib.import_module(args.mod)
        func = getattr(module, args.func)

        tr = None
        try:
            tr = binr.trace(func, source)
        except Exception as e:
            traceback.print_exc()
            tr = e.trace
        
        Server(tr, source).run(host='localhost', port=8080)
