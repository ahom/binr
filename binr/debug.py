import importlib
import argparse
import traceback
import inspect
import io
import os
import json

STATIC_FILES_PATH = os.path.join(
    os.path.dirname(os.path.abspath(inspect.getfile(inspect.currentframe()))),
    '..',
    'editor'
)

from bottle import Bottle, static_file, redirect

import binr
from .source import FileSource, coerce_to_source

class Server:
    def __init__(self, struct, source):
        self.bottle = Bottle()
        self._struct = struct
        self._source = coerce_to_source(source)
        self._trace = None

        self.bottle.route('/trace', ['GET'], self.trace)

        self.bottle.route('/data/infos', ['GET'], self.data_infos)
        self.bottle.route('/data/<offset:int>/<size:int>', ['GET'], self.data)

        self.bottle.route('/<path:path>', ['GET'], self.static)
        self.bottle.route('/', ['GET'], lambda : redirect('/index.html'))

    def refresh(self):
        print('Refreshing trace...')
        try:
            self._trace = binr.trace(self._struct, self._source.clone())
        except Exception as e:
            traceback.print_exc()
            self._trace = e.trace

    def trace(self):
        return None if self._trace is None else self._trace.to_dict()

    def data_infos(self):
        return {
            'size': self._source.size(),
            'name': self._source.name()
        }

    def data(self, offset, size):
        return io.BytesIO(self._source.clone().read(offset, size).tobytes())

    def static(self, path):
        if path == 'index.html': # refresh the parsing when the browser refreshes the index
            self.refresh()
        return static_file(path, root=STATIC_FILES_PATH)

    def run(self, *args, **kwargs):
        self.refresh()
        return self.bottle.run(*args, **kwargs)

def parse_arg(args):
    if args:
        arg = args.pop(0)
        if arg == '--int':
            int_args = parse_arg(args)
            return None, int(int_args[1])
        if arg == '--bool':
            int_args = parse_arg(args)
            return None, bool(int_args[1])
        elif arg == '--key':
            return args.pop(0), parse_arg(args)[1]
        else:
            return None, arg
    else:
        return None, None

def launch_server(module_name, func_name, source, *struct_args, **struct_kwargs):
    source = coerce_to_source(source)
    module = importlib.import_module(module_name)
        
    def module_loader_wrapper():
        def struct_wrapper(*args):
            module_r = importlib.reload(module)
            func = getattr(module_r, func_name)
            return func(*args, *struct_args, **struct_kwargs)
        return struct_wrapper
    
    Server(module_loader_wrapper(), source).run(host='localhost', port=8080)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--filename', '-n', action='store', required=True,
                       help='data to parse')
    parser.add_argument('--mod', '-m', action='store', required=True,
                        help='module for the struct to parse')
    parser.add_argument('--func', '-f', action='store', required=True,
                        help='function for the struct to parse')
    parsed_args, unparsed_args = parser.parse_known_args()

    struct_args = []
    struct_kwargs = {}
    while unparsed_args:
        new_arg = parse_arg(unparsed_args)
        if new_arg[0] is None:
            struct_args.append(new_arg[1])
        else:
            struct_kwargs[new_arg[0]] = new_arg[1]

    with open(parsed_args.filename, 'rb') as f:
        source = FileSource(f, parsed_args.filename)
        launch_server(parsed_args.mod, parsed_args.func, source, *struct_args, **struct_kwargs)
