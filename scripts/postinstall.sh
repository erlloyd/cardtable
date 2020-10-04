mkdir -p src/external
mkdir -p public/images/cards
if [ ! -d "src/external/ringsteki-json-data" ]
then
  echo "Importing JSON card Data"
  git clone https://github.com/ringsteki/ringsteki-json-data.git src/external/ringsteki-json-data
else
  echo "Updating JSON card Data"
  git -C src/external/ringsteki-json-data pull
fi

if [ ! -d "src/external/marvelsdb-json-data" ]
then
  echo "Importing JSON card Data"
  git clone https://github.com/zzorba/marvelsdb-json-data.git src/external/marvelsdb-json-data
else
  echo "Updating JSON card Data"
  git -C src/external/marvelsdb-json-data pull
fi
