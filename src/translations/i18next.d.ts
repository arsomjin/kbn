import 'i18next';

declare module 'i18next' {
  interface TFunction {
    (key: string, options?: object): string;
  }
}
