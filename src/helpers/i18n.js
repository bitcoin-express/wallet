const translations = {
  en: {
    lng: 'en',
    resources: {
      "closed": "Closed",
      "pay_failed": "Payment failed",
      "wclosed": "Wallet closed",
      "wremoved": "Wallet removed",
    },
  },
  es: {
    lng: 'es',
    resources: {
      "closed": "Cerrado",
      "pay_failed": "Fallo en el pago",
      "wclosed": "Cartera cerrada",
      "wremoved": "Cartera eliminada",
    },
  },
};


export default class i18n {
  constructor(lang="en") {
    this.lang = lang;

    this.setLanguage = this.setLanguage.bind(this);
    this.getLanguage = this.getLanguage.bind(this);
    this.t = this.t.bind(this);
  }

  setLanguage(lang="en") {
    this.lang = lang;
  }

  getLanguage() {
    return this.lang;
  }

  t(key, components=null) {
    if (components) {
      return translations[this.lang].resources[key];
    }
    return translations[this.lang].resources[key];
  }
};

