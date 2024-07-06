declare global {
  interface Window {
    IMP: {
      init: (userCode: string) => void;
      request_pay: (info: object, callback: (res) => void) => void;
    };
  }
}

export {};