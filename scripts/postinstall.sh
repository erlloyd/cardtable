yarn patch-package

mkdir -p src/external
mkdir -p public/images/cards
mkdir -p public/images/from_modules

for module in src/game-modules/*
do
  if [ -d "$module" ]; then
    echo "======= START MODULE $module ======"
    if [ -f "$module/scripts/postinstall.sh" ]; then
      echo "Running $module/scripts/postinstall.sh"
      $module/scripts/postinstall.sh
    else
      echo "No postinstall script found, continuing"
    fi
    echo "======= END MODULE $module ======"
    echo ""
  fi
done

# src/game-modules/lotr-lcg/scripts/postinstall.sh
