import dayjs from 'dayjs';
import { times } from 'lodash';

export const parseFromJson: any = (str: string) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error('\n ==> ERROR [parseFromJson]:', e.message, '\n');
    return str;
  }
};

export function roundDecimalPrecision(
  number: number,
  fractionDigits: number,
): number {
  return Number.parseFloat(number.toFixed(fractionDigits));
}

export function formatNumber(
  number: number,
  isCurrency = true,
  locale = 'en-US',
  currency = 'SGD',
): string {
  const options: Intl.NumberFormatOptions = { currency, style: 'currency' };

  if (!isCurrency) {
    Object.assign(options, { style: 'decimal' });
  }

  return new Intl.NumberFormat(locale, options).format(number);
}

export const applyMixins = (baseClass: any, extendedClasses: any[]) => {
  extendedClasses.forEach((extendedClass) => {
    Object.getOwnPropertyNames(extendedClass.prototype).forEach((name) => {
      Object.defineProperty(
        baseClass.prototype,
        name,
        Object.getOwnPropertyDescriptor(extendedClass.prototype, name) ||
          Object.create(null),
      );
    });
  });
};

export const stringifyAnObject: any = (str: Record<string, any>) => {
  try {
    return JSON.stringify(str);
  } catch (e) {
    // console.log('🚀 ~ file: utils.ts:49 ~ e:', e);
    return 'stringify Unexpected Error';
  }
};

export const generateKeyByCount = (count: number) => {
  let id = '';

  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  times(count, () => {
    id += s4();
  });

  return id;
};

export function roundToTwo(num: number) {
  return +(Math.round((num + 'e+2') as unknown as number) + 'e-2');
}

export function generateCID(cid?: string) {
  if (cid) return cid;
  const now = dayjs();
  return `vh-${now.format('YYYYMMDDHH-mmssSSS')}-${Math.floor(
    Math.random() * 1000,
  )
    .toString()
    .padStart(3, '0')}`;
}

export function formatMilliseconds(ms: number) {
  return `${ms}ms`;
}
