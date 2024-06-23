
export function formatPrice(price: number, locale: string, currency: string) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency: currency }).format(price)
}
