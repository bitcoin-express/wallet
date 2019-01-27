const translations = {
  en: {
    lng: 'en',
    resources: {
      "auto": "Auto",
      "closed": "Closed",
      "deposit_removed": "Deposit reference removed",
      "deposit_removed_error": "Unexpected error when removing deposit reference",

      "enable_info_p1": `Transaction recovery emails contain new coins that your Wallet
        has failed to confirm have been well received. This is most
        often the result of power or network failure.`,
      "enable_info_p2": `A transaction recovery email will be sent to the specified email
        address upon the rare occasion that a transaction expires before
        it is properly ended. For this situation to occur, a transaction
        that normally takes less than 10 seconds must have been abandoned
        before it completed, and then the Wallet did not start again
        until after the transaction had expired.`,
      "enable_info_p3": `On these very rare occasions, you will lose any new coins that an
        Issuer has created for you if email recovery is NOT enabled. When
        you provide an email address, the Issuer is able to send you the new
        coins even when your computer losses power or network connectivity
        for prolonged periods.`,
      "enable_info_p4": `The email address is only retained for as long as the transaction
        is open (normally less than 10 seconds). As soon as a transaction
        is ended by the Wallet or the transaction period expires, the email
        address is discarded by the server and is never used for any other
        purpose.`,

      "encrypt_info_p1": `If you use a secure email protocols (like authenticated SMPT),
        and you trust that your email supplier will never read the
        contents of your emails, there is no strong need to use encrypted
        recovery emails. However, if you have any doubts we suggest that
        you select this option as it will prevent ANY person or device
        from steeling your new coins.`,
      "encrypt_info_p2": `Encryption is not automatically set because there is always a
        change that the password could be lost or forgotten and your coins
        would then be impossible to recover even if you possess the coin
        recovery file.`,

      "enter_email": "Enter email address",
      "enter_pwd": "Enter password",
      "exp_tx_email": "Expired transaction email recovery",
      "how_long_retain": "How long does the server retain the email address?",
      "in_brief": "In brief",
      "in_full": "In full",
      "manual": "Manual",
      "min_tx_amount": "Min. transaction amount",
      "more_info": "More info",
      "must_six": "must have 6 chars or more",
      "must_letter": "must contain min 1 letter",
      "must_number": "must contain min 1 number",
      "network_unrealiable": "My network connection and/or device may be unrealiable at times",
      "pay_failed": "Payment failed",

      "password_info_p1": `When Password is set to Auto, the Wallet will invent and record
        a new random password each time the email recovery option is
        used. This is the most secure option available, but if the Wallet
        should lose the password (perhaps because you remove the Wallet
        from a browser without making a backup), it would be impossible to
        recover any coins from a recovery file.`,
      "password_info_p2": `However, if you set a manual password and remember it yourself,
        you will always be able to recover coins from a recovery file
        even if Wallet data is inadvertently lost.`,
      "password_info_p3": `Warning: If you set a manual password, be sure to make it hard to
        guess. An easy to guess password is the number one factor in cyber theft.`,

      "recovery_info": `When enabling recovery email, there is a fixed fee per
        transaction. When the transaction value is large relative to the
        fee, it make good sense to include it. However, when the
        transaction value is very small, the cost of including email
        recovery may not be justified. The Auto setting will only request
        email recovery if the value of the coins being processed is at
        least TWENTY TIMES the recovery email fee.`,

      "shoul_set": "Should I set a manual password or make it automatic?",
      "tx_expiry": "Transaction expiry period",
      "tx_recovery": "Transaction recovery",

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

      "user": "User",
      "wclosed": "Wallet closed",
      "why_encrypt": "Why encrypt recovery emails?",
      "why_enable": "Why enable expired transaction recovery emails?",
      "wremoved": "Wallet removed",
    },
  },
  es: {
    lng: 'es',
    resources: {
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

