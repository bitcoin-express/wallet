function str_to_number(str) {
  let result = str.split("").map(function(s) {
    return s.charCodeAt(0);
  }).join("");

  return parseInt(result);
}

export function encrypt(str, pwd) {
  if (typeof str == "object") {
    str = JSON.stringify(str);
  }
  return sjcl.encrypt(pwd, str);
}

export function decrypt(str, pwd) {
  if (typeof str == "object") {
    str = JSON.stringify(str);
  }
  try {
    return sjcl.decrypt(pwd, str);
  } catch (e) {
    return false;
  }
}
