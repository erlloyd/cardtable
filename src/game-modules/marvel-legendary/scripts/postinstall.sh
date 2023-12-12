echo "Downloading JSON Card Metadata"

if [ ! -d "src/game-modules/marvel-legendary/external" ]
then
  echo "Importing JSON card Data"
  git clone https://github.com/erlloyd/marvel-legendary-json.git src/game-modules/marvel-legendary/external
else
  echo "Updating JSON card Data"
  git -C src/game-modules/marvel-legendary/external pull
fi

echo "Creating importable files"
node src/game-modules/marvel-legendary/scripts/createGeneratedFiles.js

#copy images
echo "Copying images"
mkdir -p public/images/from_modules/marvel-legendary/
cp -r src/game-modules/marvel-legendary/images/public/* public/images/from_modules/marvel-legendary/