#!/bin/bash
target=${1:-$PWD/server}

SCRIPTDIR=$(cd `dirname $0` && pwd)
path_to_react_project=$SCRIPTDIR/../react
path_to_database_scripts=$SCRIPTDIR/../database

mkdir -p $target
if [ ! -d "$target" ]; then
    echo "Could not create directory $target"
    exit 1
fi;

echo "Building React frontend project"

pushd $path_to_react_project > /dev/null
# Provide an arbitary extra command line argument to skip npm install
if [[ $# -le 1 ]]; then
    npm install
fi
npm run build
popd > /dev/null

echo "Copying frontend and database script files to $target"

for item in index.html static res; do
    /bin/cp -r $path_to_react_project/build/$item $target
done
/bin/cp $path_to_database_scripts/*.php $target

echo "Done."
