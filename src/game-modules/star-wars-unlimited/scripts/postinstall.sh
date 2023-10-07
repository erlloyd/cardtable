echo "Downloading JSON Card Metadata"

if [ ! -d "src/game-modules/star-wars-unlimited/external" ]
then
  echo "Importing JSON card Data"
  git clone https://github.com/erlloyd/star-wars-unlimited-json.git src/game-modules/star-wars-unlimited/external
else
  echo "Updating JSON card Data"
  git -C src/game-modules/star-wars-unlimited/external pull
fi

# echo "Creating importable files"
node src/game-modules/star-wars-unlimited/scripts/createGeneratedFiles.js

#copy images
echo "Copying images"
mkdir -p public/images/from_modules/star-wars-unlimited/
cp -r src/game-modules/star-wars-unlimited/images/public/* public/images/from_modules/star-wars-unlimited/