mkdir -p public/images/from_modules/star-wars-deckbuilding-game

#copy images
echo "Copying images"
cp -r src/game-modules/star-wars-deckbuilding-game/images/public/* public/images/from_modules/star-wars-deckbuilding-game/

node src/game-modules/star-wars-deckbuilding-game/scripts/createGeneratedFiles.js