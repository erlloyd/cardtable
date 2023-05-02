mkdir -p public/images/from_modules/war-of-the-ring-card-game

#copy images
echo "Copying images"
cp -r src/game-modules/war-of-the-ring-card-game/images/public/* public/images/from_modules/war-of-the-ring-card-game/

node src/game-modules/war-of-the-ring-card-game/scripts/createGeneratedFiles.js