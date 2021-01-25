mkdir -p /tmp/images; 
unzip .imagepacks/mc/core.zip -d /tmp/images;
unzip .imagepacks/mc/Captain_America_Image_Pack.zip -d /tmp/images;
unzip .imagepacks/mc/Ronan_Image_Pack.zip -d /tmp/images;
unzip .imagepacks/mc/Black_Widow_Image_Pack.zip -d /tmp/images;
unzip .imagepacks/mc/Hulk_Image_Pack.zip -d /tmp/images;
unzip .imagepacks/mc/Ms_Marvel_Image_Pack.zip -d /tmp/images;
unzip .imagepacks/mc/Thor_Image_Pack.zip -d /tmp/images;
unzip .imagepacks/mc/Ant_Man_Image_Pack.zip -d /tmp/images;
unzip .imagepacks/mc/Doctor_Strange_Image_Pack.zip -d /tmp/images;
unzip .imagepacks/mc/Green_Goblin_Image_Pack.zip -d /tmp/images;
unzip .imagepacks/mc/Wrecking Crew Image Pack.zip -d /tmp/images;
unzip .imagepacks/mc/Red_Skull_Image_Pack.zip -d /tmp/images;
unzip .imagepacks/mc/Baron_Zemo_Firestarter_Image_Pack.zip -d /tmp/images;

find /tmp/images -name '*.jpg' -exec mv {} public/images/cards \;