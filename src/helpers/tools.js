import React from 'react';


export function getImageComponent(url, width=40, height=40, path='history/', style={}) {
  let defaultStyle = {
    background: `url('css/img/${path}${url}')`,
    backgroundSize: `${width}px ${height}px`,
    backgroundRepeat: "no-repeat",
    display: 'inline-block',
    height: `${height}px`,
    width: `${width}px`,
  };

  return <div style={ Object.assign(defaultStyle, style) } />
};


export function isURLImage(str) {
  return str.match(/\.(jpeg|jpg|gif|png)$/);
};


export function getISODate(isoDate) {
  const date = new Date(isoDate);
  const year = date.getFullYear();
  let month = date.getMonth() + 1;
  let dt = date.getDate();
  dt = dt < 10 ? '0' + dt : dt;
  month = month < 10 ? '0' + month : month;
  return year + '-' + month + '-' + dt;
};


export function getDomainFromURL(str, local=false) {
  let domain = str.replace('http://', '')
    .replace('https://', '')
    .replace('www.', '')
    .split(/[/?#]/)[0];
  
  if ((!domain || domain == "") && local) {
    var url = (window.location != window.parent.location)
      ? document.referrer : document.location.href;

    domain =  url.replace('http://', '')
      .replace('https://', '')
      .replace('www.', '')
      .split(/[/?#]/)[0];
  }
  return domain;
}


export function getParameterByName(name, url) {
  if (!url) {
    url = window.location.href;
  }
  name = name.replace(/[\[\]]/g, "\\$&");
  let regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
  let results = regex.exec(url);

  if (!results) {
    return null;
  }
  if (!results[2]) {
    return '';
  }
  return decodeURIComponent(results[2].replace(/\+/g, " "));
}


export function getBrowserName() {
  let ua = navigator.userAgent,
      tem,
      M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];

  if (/trident/i.test(M[1])) {
    tem =  /\brv[ :]+(\d+)/g.exec(ua) || [];
    return 'IE '+(tem[1] || '');
  }

  if (M[1]=== 'Chrome') {
    tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
    if (tem!= null) {
      return tem.slice(1).join(' ').replace('OPR', 'Opera');
    }
  }

  M = M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
  if ((tem= ua.match(/version\/(\d+)/i))!= null) {
    M.splice(1, 1, tem[1]);
  }

  return M.join(' ');
};


export function countdown(counter, callback, endCallback) {

  const fn = () => {
    counter--;
    if (counter < 0) {
      clearInterval(id);
      endCallback();
      return;
    }
    callback(counter);
  };

  return setInterval(fn, 1000);
}

