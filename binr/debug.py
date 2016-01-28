import importlib
import argparse
import traceback

from bottle import Bottle, static_file

import binr
from binr.source import FileSource

class Server:
    def __init__(self, trace, source):
        self.bottle = Bottle()
        self._trace = trace
        self._source = source
        
        self.bottle.route('/trace', ['GET'], self.trace)
        self.bottle.route('/data/<offset:int>/<size:int>', ['GET'], self.data)
        self.bottle.route('/static/<path:path>', ['GET'], self.static)

    def static(self, path):
        return static_file(path)

    def trace(self):
        return self._trace

    def data(self, offset, size):
        return self._source.read(offset, size)

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
