echo "Downloading JSON Card Metadata"

if [ ! -d "src/game-modules/earthborne-rangers/external" ]
then
  echo "Importing JSON card Data"
  git clone https://github.com/erlloyd/earthborne-rangers-json.git src/game-modules/earthborne-rangers/external
else
  echo "Updating JSON card Data"
  git -C src/game-modules/earthborne-rangers/external pull
fi

echo "Creating output location"
if [ ! -d "public/json_data/from_modules/earthborne-rangers/sets" ]
then
  mkdir -p "public/json_data/from_modules/earthborne-rangers/sets"
fi

echo "Copying sets"
cp -r src/game-modules/earthborne-rangers/external/sets/ public/json_data/from_modules/earthborne-rangers

echo "Creating importable files"
node src/game-modules/earthborne-rangers/scripts/createGeneratedFiles.js

echo "Copying images"
mkdir -p public/images/from_modules/earthborne-rangers/
cp -r src/game-modules/earthborne-rangers/images/public/* public/images/from_modules/earthborne-rangers/

