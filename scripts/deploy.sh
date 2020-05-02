#!/bin/bash
target=${1:-$PWD/server}
path_to_react_project=../react

echo "Building React node project and copying output files to $target"

mkdir -p $target

pushd $path_to_react_project > /dev/null
npm install
npm run build
popd > /dev/null

for item in index.html static res; do
    cp -r $path_to_react_project/build/$item $target
done

echo "Done."
