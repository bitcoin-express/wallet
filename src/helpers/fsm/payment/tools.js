
/**
 * From the list of swaps to proceed for the actual payment, get the earliest expiry time.
 *
 * :param currency: [string] target currency.
 * :param expiryRates: [array] list of rates information when swapping coins by the issuer.
 * :param swapList: [array] the list of swap objects.
 *
 * :return: [string] ISOString of the earliest expiry date.
 */
export function getEarliestExpiryTime(currency, expiryRates, swapList) {
  if (typeof expiryRates == "string") {
    // It's already the expiry ISOString date
    return expiryRates;
  }

  // Get the earliest expiry time
  currency = currency.toUpperCase();
  const currencyKeys = Object.keys(swapList);

  let expiry;
  currencyKeys.forEach((currencyCode) => {
    const key = `${currencyCode.toUpperCase()}_${currency}`;
    const actualExpiry = expiryRates[key];
    if (!actualExpiry) {
      return;
    }

    const actualExpiryDate = new Date(actualExpiry).getTime();
    if (!expiry || actualExpiryDate < new Date(expiry).getTime()) {
      expiry = actualExpiry;
    }
  });
  return expiry;
};


/**
 * Returns the list of promises to resolve in other to proceed with all the swaps of coins required for the actual payment.
 *
 * :param currency: [string] target currency.
 * :param swapList: [array] the list of swap objects.
 * :param service: [obj] issuer service, the object response from 'info' request to the issuer.
 * :param emailRecovery: [bool] user allow recovery at the wallet settings.
 *
 * :return: [array] the promises of swaps to resolve.
 */
export function getSwapPromisesList(swapList, currency, service, emailRecovery) {
  return swapList.map((swap) => {
    const sourceCurrency = Object.keys(swap)[0];
    const {
      exchange,
      from,
      fee
    } = swap[sourceCurrency];

    const args = {
      source: {
        sourceValue: parseFloat(from.toFixed(8)),
        sourceCurrency,
      },
      target: {
        targetValue: parseFloat(exchange.toFixed(8)),
        targetCurrency: currency,
      },
      lastModified: null,
      emailRecovery,
      fee,
      maxSelected: false,
    };
    return wallet.atomicSwap(args, service, true);
  });
};


/**
 * Returns the 'options' object of the payment, with the settings regarding the email notifications.
 *
 * :param withEmail: [bool] if false, options is null.
 * :param wallet: [obj]
 * :param policies: [obj] PaymentDetails policies object.
 *
 * :return: [obj] The options object, i.e.
 *
 *   options : {
 *     "send_receipt_to": {
 *       "email": "david@geemail.com"
 *     },
 *     "language_preference": "en-GB"
 *   }
 */
export function getPaymentOptions(withEmail, wallet, policies) {
  const email = wallet.getSettingsVariable(wallet.config.EMAIL);

  if (!withEmail || !email) {
    return null;
  }

  let options = {
    language_preference: "en-GB",
  };

  if (policies.receipt_via_email) {
    options.send_receipt_to = { email };
  }
  if (policies.refund_via_email) {
    options.send_refund_to = { email };
  }
  if (policies.issuer_refund_via_email) {
    options.send_issuer_refund_to = { email };
  }

  return options;
};

