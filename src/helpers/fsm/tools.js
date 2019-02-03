
export function extractHostname(url) {
  var hostname;
  //find & remove protocol (http, ftp, etc.) and get hostname

  if (url.indexOf("://") > -1) {
    hostname = url.split('/')[2];
  }
  else {
    hostname = url.split('/')[0];
  }

  //find & remove port number
  hostname = hostname.split(':')[0];
  //find & remove "?"
  hostname = hostname.split('?')[0];

  if (!hostname || hostname == "") {
    return window.location.hostname;
  }

  return hostname;
}


export function getSecondsFromISODate(ISODate, def=null) {
  if (!ISODate) {
    const now = new Date().getTime();
    const day = 24 * 60 * 60 * 1000;
    return def || new Date(now + day).getTime() / 1000;
  }
  return new Date(ISODate).getTime() / 1000;
}


export function getSecondsToISODate(ISODate) {
  const seconds = getSecondsFromISODate(ISODate);
  const now = new Date().getTime() / 1000;
  return Math.ceil(seconds - now);
}

