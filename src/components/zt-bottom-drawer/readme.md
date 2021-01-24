# zt-bottom-drawer



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute               | Description | Type      | Default                                           |
| -------------------- | ----------------------- | ----------- | --------- | ------------------------------------------------- |
| `autoHeightContent`  | `auto-height-content`   |             | `boolean` | `true`                                            |
| `coefDuration`       | `coef-duration`         |             | `number`  | `75`                                              |
| `disableGesture`     | `disable-gesture`       |             | `boolean` | `false`                                           |
| `hidden`             | `hidden`                |             | `boolean` | `false`                                           |
| `hideOnPositionZero` | `hide-on-position-zero` |             | `boolean` | `false`                                           |
| `positionName`       | `position-name`         |             | `string`  | `undefined`                                       |
| `positions`          | `positions`             |             | `string`  | `"close-b-10,bottom-b-200,middle-b-450,top-t-60"` |


## Events

| Event                   | Description | Type                                                                                      |
| ----------------------- | ----------- | ----------------------------------------------------------------------------------------- |
| `ztChangePositionEvent` |             | `CustomEvent<{ positionName: string; htmlElements: ZTHTMLElementsDrawer; }>`              |
| `ztHideEvent`           |             | `CustomEvent<{ drawer: HTMLElement; gestureTarget: HTMLElement; content: HTMLElement; }>` |
| `ztNavDidChange`        |             | `CustomEvent<any>`                                                                        |


## Methods

### `addCallbackCanActivateState(callback: (positionName: string, oldState: string, htmlElements: ZTHTMLElementsDrawer) => Promise<boolean | void> | void) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `addCallbackCanDeactivateState(callback: (positionName: string, newState: string, htmlElements: ZTHTMLElementsDrawer) => Promise<boolean | void> | void) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `getNav() => Promise<HTMLIonNavElement>`



#### Returns

Type: `Promise<HTMLIonNavElement>`



### `getNavActive() => Promise<ViewController>`



#### Returns

Type: `Promise<ViewController>`



### `getNavCurrentComponent() => Promise<any>`



#### Returns

Type: `Promise<any>`



### `getPositionByIndex(index: number) => Promise<ZTPositionDrawer>`



#### Returns

Type: `Promise<ZTPositionDrawer>`



### `getPositionByName(name: string) => Promise<ZTPositionDrawer>`



#### Returns

Type: `Promise<ZTPositionDrawer>`



### `goBack(opts?: NavOptions | null | undefined, done?: TransitionDoneFn | undefined) => Promise<Boolean>`



#### Returns

Type: `Promise<Boolean>`



### `goBackToIndex(index: number, opts?: NavOptions | null | undefined, done?: TransitionDoneFn | undefined) => Promise<Boolean>`



#### Returns

Type: `Promise<Boolean>`



### `goBackToRoot(opts?: NavOptions | null | undefined, done?: TransitionDoneFn | undefined) => Promise<Boolean>`



#### Returns

Type: `Promise<Boolean>`



### `hide() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `pushNav(component: any, propsComponent: any, selectorGesture?: string, selectorContent?: string) => Promise<boolean>`



#### Returns

Type: `Promise<boolean>`



### `setAnimation() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `setPositionByName(name: string) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `show(positionName: string) => Promise<void>`



#### Returns

Type: `Promise<void>`




## Dependencies

### Depends on

- ion-nav

### Graph
```mermaid
graph TD;
  zt-bottom-drawer --> ion-nav
  style zt-bottom-drawer fill:#f9f,stroke:#333,stroke-width:4px
```

----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
