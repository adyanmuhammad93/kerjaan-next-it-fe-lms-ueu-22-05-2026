
import { useCallback } from 'react';
import { useStore, SUPPORTED_CURRENCIES } from '../store/useStore';

export const useCurrency = () => {
  const { currency, setCurrency } = useStore();

  const currentCurrency = SUPPORTED_CURRENCIES.find(c => c.code === currency) || SUPPORTED_CURRENCIES[0];

  const convertPrice = useCallback((priceInUsd: number) => {
    return priceInUsd * currentCurrency.rate;
  }, [currentCurrency.rate]);

  const formatPrice = useCallback((priceInUsd: number) => {
    const converted = convertPrice(priceInUsd);
    
    // Handle specific cases like IDR/JPY usually not having decimals
    const maximumFractionDigits = ['IDR', 'JPY'].includes(currentCurrency.code) ? 0 : 2;

    return new Intl.NumberFormat(currentCurrency.locale, {
      style: 'currency',
      currency: currentCurrency.code,
      maximumFractionDigits: maximumFractionDigits
    }).format(converted);
  }, [convertPrice, currentCurrency.code, currentCurrency.locale]);

  return {
    currency: currentCurrency,
    setCurrency,
    formatPrice,
    convertPrice,
    allCurrencies: SUPPORTED_CURRENCIES
  };
};
