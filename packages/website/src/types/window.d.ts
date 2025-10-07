export declare global {
  export const StackBlitzSDK: typeof import('@stackblitz/sdk').default

  /**
   * The `chassis` object is exposed to the global scope and also to the `window` object in the browser.
   * We rely on the DefinitelyTyped community types for this object to get proper type checking for part of the
   * documentation using the Chassis API and avoid any misuse of the API.
   * To temporarily or permanently disable this feature (e.g. when modifying the Chassis API used in the
   * documentation), the 2 lines containing `typeof import('chassis')` can be commented and replaced by the commented
   * lines containing `any`.
   *
   * The documentation is currently using the following APIs from Chassis:
   *
   *  - `chassis.Tooltip.getOrCreateInstance`
   *  - `chassis.Tooltip.getInstance`
   *
   */
  export const chassis: typeof import('chassis')
  // export const chassis: any

  interface Window {
    chassis: typeof import('chassis')
    // chassis: any
  }
}
