export const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
};

export const getBaseUrl = (): string => {
  return `${window.location.origin}${window.location.pathname}`;
};

export const generateRemoteGameUrl = (peerId: string) => {
  return `${window.location.origin}${window.location.pathname}?remote=${peerId}`;
};
