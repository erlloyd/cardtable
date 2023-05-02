echo "Downloading JSON Card Metadata"

if [ ! -d "src/external/marvelsdb-json-data" ]
then
  echo "Importing JSON card Data"
  git clone https://github.com/erlloyd/marvelsdb-json-data.git src/external/marvelsdb-json-data
else
  echo "Updating JSON card Data"
  git -C src/external/marvelsdb-json-data pull
fi

echo "Creating importable files"
node src/game-modules/marvel-champions/scripts/createGeneratedFiles_marvel.js