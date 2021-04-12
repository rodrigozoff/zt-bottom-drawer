# Bottom Drawer

Bottom Drawer WebComponent / StencilJS / Ionic 5 

![alt text](./demo.gif "Demo") | ![alt text](./demo-app-mapa.gif "Demo")

# Installation

```
$ npm i @zoff-tech/zt-bottom-drawer
```
# zt-bottom-drawer



# zt-bottom-drawer



<!-- Auto Generated Below -->


## Properties

| Property             | Attribute               | Description | Type      | Default                                           |
| -------------------- | ----------------------- | ----------- | --------- | ------------------------------------------------- |
| `allowScroll`        | `allow-scroll`          |             | `boolean` | `true`                                            |
| `coefAnimationTime`  | `coef-animation-time`   |             | `number`  | `40`                                              |
| `disableGesture`     | `disable-gesture`       |             | `boolean` | `false`                                           |
| `fixCurrentPosition` | `fix-current-position`  |             | `boolean` | `false`                                           |
| `hidden`             | `hidden`                |             | `boolean` | `false`                                           |
| `hideOnPositionZero` | `hide-on-position-zero` |             | `boolean` | `false`                                           |
| `positionName`       | `position-name`         |             | `string`  | `undefined`                                       |
| `positions`          | `positions`             |             | `string`  | `"close-b-10,bottom-b-200,middle-b-450,top-t-60"` |


## Events

| Event                   | Description | Type                                                                                                   |
| ----------------------- | ----------- | ------------------------------------------------------------------------------------------------------ |
| `ztChangePositionEvent` |             | `CustomEvent<{ positionName: string; lastPositionName: string; htmlElements: ZTHTMLElementsDrawer; }>` |
| `ztHideEvent`           |             | `CustomEvent<{ drawer: HTMLElement; gestureTarget: HTMLElement; content: HTMLElement; }>`              |
| `ztNavDidChange`        |             | `CustomEvent<any>`                                                                                     |
| `ztNavWillChange`       |             | `CustomEvent<any>`                                                                                     |


## Methods

### `getActiveComponentTagName() => Promise<string>`



#### Returns

Type: `Promise<string>`



### `getCurrentIndex() => Promise<number>`



#### Returns

Type: `Promise<number>`



### `getCurrrentPositionDto() => Promise<ZTPositionDrawer>`



#### Returns

Type: `Promise<ZTPositionDrawer>`



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



### `goBack(amountBack?: number, opts?: NavOptions | null | undefined, done?: TransitionDoneFn | undefined) => Promise<Boolean>`



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



### `pushNav(component: string | HTMLElement, propsComponent: any, options: PushNavOptions) => Promise<boolean>`



#### Returns

Type: `Promise<boolean>`



### `refreshSizeContent() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `saveStateInActiveComponent() => Promise<void>`



#### Returns

Type: `Promise<void>`



### `setPosition(value: ZTPositionDrawer, force?: boolean) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `setPositionByName(name: string, force?: boolean) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `setScrollToTop(duration?: number) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `setTranslateY(posY: number, applyAnimation?: boolean) => Promise<void>`



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

# Examples

See in repository.

![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)


# License

The MIT License (MIT)

Copyright (c) 2021 Rodrigo Zoff

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

