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

export default class Tools {

  constructor () {
  }

  isURLImage(str) {
    return str.match(/\.(jpeg|jpg|gif|png)$/);
  }

  getDomainFromURL(str, local=false) {
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

  getImageComponent(url, w=40, h=40, path='history/', style={}) {
    return <div
      style={ Object.assign({
        background: `url('css/img/${path}${url}')`,
        backgroundSize: `${w}px ${h}px`,
        backgroundRepeat: "no-repeat",
        display: 'inline-block',
        height: `${h}px`,
        width: `${w}px`,
      }, style) }
    />
  }

  getBrowserName() {
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
  }

  countdown(counter, callback, endCallback) {
    let id  = setInterval(() => {
      counter--;
      if (counter < 0) {
        clearInterval(id);
        endCallback();
      } else {
        callback(counter);
      }
    }, 1000);

    return id;
  }
}
