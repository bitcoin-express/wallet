const translations = {
  en: {
    lng: 'en',
    resources: {
      "closed": "Closed",
      "in_brief": "In brief",
      "in_full": "In full",
      "pay_failed": "Payment failed",
      "recovery_info": `When enabling recovery email, there is a fixed fee per
        transaction. When the transaction value is large relative to the
        fee, it make good sense to include it. However, when the
        transaction value is very small, the cost of including email
        recovery may not be justified. The Auto setting will only request
        email recovery if the value of the coins being processed is at
        least TWENTY TIMES the recovery email fee.`,
      "tx_recovery_info_p1_b1": "AUTO settings should be sufficient for most people.",
      "tx_recovery_info_p1_b2": "Indicating if your device may be unreliable will help.",
      "tx_recovery_info_p1_b3": "Enable email recovery for the most reliable service.",
      "tx_recovery_info_p1_b4": "View fees instantly as you change the settings.",
      "tx_recovery_info_p2": `This Wallet needs to communicate with servers on the Internet
        and for increased reliability it uses a communications protocol
        that is capable of recovery from network or power failures that
        may last for hours or even days.`,
      "tx_recovery_info_p3": `The settings in this section determine the parameters that your
        Wallet will use when communicating with these servers, and hence
        the fees that will be applied. For most people the AUTO settings
        will be sufficient, alternatively you may customise the settings
        according to your personal needs.`,
      "tx_recovery_info_p4": `The length of the transaction recovery period should be affected
        by the type of device this Wallet is running on. Devices with
        unreliable power or network connections should have longer recovery
        periods and those that enable email recover may safely have reduced
        recovery periods.`,
      "wclosed": "Wallet closed",
      "wremoved": "Wallet removed",
    },
  },
  es: {
    lng: 'es',
    resources: {
      "closed": "Cerrado",
      "in_brief": "In brief",
      "in_full": "In full",
      "pay_failed": "Fallo en el pago",
      "recovery_info": `When enabling recovery email, there is a fixed fee per
        transaction. When the transaction value is large relative to the
        fee, it make good sense to include it. However, when the
        transaction value is very small, the cost of including email
        recovery may not be justified. The Auto setting will only request
        email recovery if the value of the coins being processed is at
        least TWENTY TIMES the recovery email fee.`,
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

