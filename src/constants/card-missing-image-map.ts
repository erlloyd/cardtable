import GameManager from "../game-modules/GameModuleManager";

export const CARD_ALREADY_ROTATED_MAP: { [key: string]: boolean } = {
  "05026": true,
  "30025": true,
  "31026": true,
};

export const FORCE_ENCOUNTER_CARD_BACK_MAP: { [key: string]: boolean } = {
  "27175": true,
  "27181": true,
};

export const FORCE_CARD_BACK_MAP: { [key: string]: string } = {
  "305145": "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Mustering-of-the-Rohirrim/Osbera-SideB.png",
};

export const MISSING_BACK_IMAGE_MAP: { [key: string]: string } = {
  "11027": "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Grey-Havens/Lost-Island.jpg",
  "11030": "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Grey-Havens/Lost-Island.jpg",
  "11031": "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Grey-Havens/Lost-Island.jpg",
  "11072": "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Grey-Havens/Lost-Island.jpg",
  "11073": "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Grey-Havens/Lost-Island.jpg",
  "11074": "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Grey-Havens/Lost-Island.jpg",
  "00002": "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Fate-of-Numenor-Nightmare/Lost-Island.jpg",
  "00003": "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Fate-of-Numenor-Nightmare/Lost-Island.jpg",
  "00004": "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Fate-of-Numenor-Nightmare/Lost-Island.jpg",
  "00005": "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Fate-of-Numenor-Nightmare/Lost-Island.jpg",
  "00006": "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Fate-of-Numenor-Nightmare/Lost-Island.jpg",
  "00007": "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Fate-of-Numenor-Nightmare/Lost-Island.jpg",
  "00008": "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Fate-of-Numenor-Nightmare/Lost-Island.jpg",
  "12068": "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Temple-of-the-Deceived/Temple-of-the-Deceived.jpg",
  "12069": "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Temple-of-the-Deceived/Temple-of-the-Deceived.jpg",
  "12072": "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Temple-of-the-Deceived/Lost-Island.jpg",
  "12073": "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Temple-of-the-Deceived/Lost-Island.jpg",
  "12074": "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/Temple-of-the-Deceived/Lost-Island.jpg",
  "22161": "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Fortress-of-Nurn/Castle-Garrison.jpg",
  "22162": "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Fortress-of-Nurn/Castle-Garrison.jpg",
  "22163": "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Fortress-of-Nurn/Castle-Garrison.jpg",
  "22164": "https://s3.amazonaws.com/hallofbeorn-resources/Images/Cards/The-Fortress-of-Nurn/Castle-Garrison.jpg",
};

export const MISSING_CARD_IMAGE_MAP: { [key: string]: string } = GameManager.cardImageMap;
