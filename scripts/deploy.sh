#!/bin/bash
target=${1:-$PWD/server}
path_to_react_project=../react
path_to_database_scripts=../database

echo "Building React node project and copying output files to $target"

mkdir -p $target
if [ ! -d "$target" ]; then
    echo "Could not create target directory."
    exit 1
fi;

pushd $path_to_react_project > /dev/null
npm install
npm run build
popd > /dev/null

for item in index.html static res; do
    /bin/cp -r $path_to_react_project/build/$item $target
done
/bin/cp $path_to_database_scripts/*.php $target

echo "Done."
