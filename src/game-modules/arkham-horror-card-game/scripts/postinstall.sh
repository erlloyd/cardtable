echo "Downloading JSON Card Metadata"

if [ ! -d "src/external/arkhamdb-json-data" ]
then
  echo "Importing JSON card Data"
  git clone https://github.com/Kamalisk/arkhamdb-json-data src/external/arkhamdb-json-data
else
  echo "Updating JSON card Data"
  git -C src/external/arkhamdb-json-data pull
fi

echo "Creating importable files"
node src/game-modules/arkham-horror-card-game/scripts/createGeneratedFiles_arkham.js