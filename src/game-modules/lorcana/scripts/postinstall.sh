echo "Downloading JSON Card Metadata"

if [ ! -d "src/game-modules/lorcana/external" ]
then
  echo "Importing JSON card Data"
  git clone https://github.com/erlloyd/lorcana-json-data.git src/game-modules/lorcana/external
else
  echo "Updating JSON card Data"
  git -C src/game-modules/lorcana/external pull
fi

echo "Creating importable files"
node src/game-modules/lorcana/scripts/createGeneratedFiles.js

#copy images
echo "Copying images"
mkdir -p public/images/from_modules/lorcana/
cp -r src/game-modules/lorcana/images/public/* public/images/from_modules/lorcana/