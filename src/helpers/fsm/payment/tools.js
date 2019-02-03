

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


export function getSwapPromisesList(swapList) {
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


export function getPaymentOptions(withEmail, wallet, policies)
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

