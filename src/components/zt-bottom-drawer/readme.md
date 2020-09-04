# zt-bottom-drawer



<!-- Auto Generated Below -->


## Properties

| Property              | Attribute                | Description | Type                                                                   | Default                           |
| --------------------- | ------------------------ | ----------- | ---------------------------------------------------------------------- | --------------------------------- |
| `autoHeightContent`   | `auto-height-content`    |             | `boolean`                                                              | `true`                            |
| `disableMove`         | `disable-move`           |             | `boolean`                                                              | `false`                           |
| `distanceBottomClose` | `distance-bottom-close`  |             | `number`                                                               | `60`                              |
| `distanceBottomOpen`  | `distance-bottom-open`   |             | `number`                                                               | `350`                             |
| `distanceTopFullOpen` | `distance-top-full-open` |             | `number`                                                               | `10`                              |
| `easing`              | `easing`                 |             | `string`                                                               | `'cubic-bezier(.56,.05,.91,.88)'` |
| `state`               | `state`                  |             | `ZTDrawerState.BOTTOM \| ZTDrawerState.FULLOPEN \| ZTDrawerState.OPEN` | `ZTDrawerState.BOTTOM`            |


## Events

| Event         | Description | Type                                                                                |
| ------------- | ----------- | ----------------------------------------------------------------------------------- |
| `changeState` |             | `CustomEvent<ZTDrawerState.BOTTOM \| ZTDrawerState.FULLOPEN \| ZTDrawerState.OPEN>` |
| `closeBottom` |             | `CustomEvent<void>`                                                                 |


## Methods

### `addCallbackCanActivateState(callback: (state: ZTDrawerState, oldState: ZTDrawerState, drawerElement: HTMLElement, contentElement: HTMLElement) => Promise<boolean | void> | void) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `addCallbackCanDeactivateState(callback: (state: ZTDrawerState, newState: ZTDrawerState, drawerElement: HTMLElement, contentElement: HTMLElement) => Promise<boolean | void> | void) => Promise<void>`



#### Returns

Type: `Promise<void>`




----------------------------------------------

*Built with [StencilJS](https://stenciljs.com/)*
