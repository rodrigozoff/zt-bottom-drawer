# Bottom Drawer

Bottom Drawer WebComponent / StencilJS / Ionic 5 

![alt text](./demo.gif "Demo") | ![alt text](./demo-app-mapa.gif "Demo")

# Installation

```
$ npm i @zoff-tech/zt-bottom-drawer
```


## Properties

| Property                | Attribute                 | Description | Type      | Default                                           |
| ----------------------- | ------------------------- | ----------- | --------- | ------------------------------------------------- |
| `autoHeightContent`     | `auto-height-content`     |             | `boolean` | `true`                                            |
| `autoShowOnLoad`        | `auto-show-on-load`       |             | `boolean` | `true`                                            |
| `coefDuration`          | `coef-duration`           |             | `number`  | `150`                                             |
| `disableGesture`        | `disable-gesture`         |             | `boolean` | `false`                                           |
| `easing`                | `easing`                  |             | `string`  | `'cubic-bezier(.56,.05,.91,.88)'`                 |
| `hidden`                | `hidden`                  |             | `boolean` | `false`                                           |
| `hideOnPositionZero`    | `hide-on-position-zero`   |             | `boolean` | `false`                                           |
| `positionName`          | `position-name`           |             | `string`  | `undefined`                                       |
| `positions`             | `positions`               |             | `string`  | `"close-b-10,bottom-b-200,middle-b-450,top-t-60"` |
| `targetGestureSelector` | `target-gesture-selector` |             | `string`  | `null`                                            |


## Events

| Event                 | Description | Type                                                                                          |
| --------------------- | ----------- | --------------------------------------------------------------------------------------------- |
| `changePositionEvent` |             | `CustomEvent<{ positionName: string; htmlElements: ZTHTMLElementsDrawer; }>`                  |
| `hideEvent`           |             | `CustomEvent<{ drawer: HTMLElement; gestureTarget: HTMLElement; slotContent: HTMLElement; }>` |


## Methods

### `addCallbackCanActivateState(callback: (positionName: string, oldState: string, htmlElements: ZTHTMLElementsDrawer) => Promise<boolean | void> | void) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `addCallbackCanDeactivateState(callback: (positionName: string, newState: string, htmlElements: ZTHTMLElementsDrawer) => Promise<boolean | void> | void) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `getPositionByIndex(index: number) => Promise<ZTPositionDrawer>`



#### Returns

Type: `Promise<ZTPositionDrawer>`



### `getPositionByName(name: string) => Promise<ZTPositionDrawer>`



#### Returns

Type: `Promise<ZTPositionDrawer>`



### `hide(notAnimate?: boolean | undefined) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `show(positionName: string, notAnimate?: boolean | undefined) => Promise<void>`



#### Returns

Type: `Promise<void>`


## Slots: border / container

The slot border receive the event (touch) for move the drawer.
The slot content will change the height between states, that is necessary for support scroll behaviour (autoHeightContent=true).

```html
<zt-bottom-drawer id="drawer" distance-bottom-close="210" distance-top-full-open="50">
    <div slot="border">
    </div>
    <div slot="content">
      <ion-content>
        <ion-card class="card-close">
          <ion-card-header>
            <ion-card-subtitle>Card Subtitle</ion-card-subtitle>
            <ion-card-title>Card Title</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            Keep close to Nature's heart... and break clear away, once in awhile,
            and climb a mountain or spend a week in the woods. Wash your spirit clean.
          </ion-card-content>
        </ion-card>      
      </ion-content>
    </div>
  </zt-bottom-drawer>
````

## Control over Activates and Deactivates states 

If the callbacks return a promise with result equal a false the change of state is canceled.

### Methods 

```javascript

    callbackCanActivateState: (state: ZTDrawerState, drawerElement: HTMLElement, contentElement: HTMLElement) => Promise<boolean | void> | void;
    callbackCanDeactivateState: (state: ZTDrawerState, drawerElement: HTMLElement,  contentElement: HTMLElement) => Promise<boolean | void> | void;


```
### Example in StencilJS

```javascript

  componentDidLoad() {
    this.drawer.addCallbackCanActivateState(this.callbackCanActivateChangeState);
    this.drawer.addCallbackCanDeactivateState(this.callbackCanDeactivateChangeState);
  }
  
  async callbackCanDeactivateChangeState(positionName: string, newPositionName: string, elemnts:any): Promise<boolean> {
    if(state==="TtopOP"){
      return false; 
    }
    return true;
   }

  async callbackCanActivateChangeState(positionName: string, newPositionName: string, elemnts:any): Promise<boolean> {
    return true;
  }

```

# Examples

## PURE HTML

```html
<!DOCTYPE html>
<html dir="ltr" lang="en">

<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0" />
  <title>Stencil Component Starter</title>
  <script type="module" src="https://cdn.jsdelivr.net/npm/@ionic/core/dist/ionic/ionic.esm.js"></script>
  <script nomodule src="https://cdn.jsdelivr.net/npm/@ionic/core/dist/ionic/ionic.js"></script>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@ionic/core/css/ionic.bundle.css" />
  <script type="module" src="/build/zt-bottom-drawer.esm.js"></script>
  <script nomodule src="/build/zt-bottom-drawer.js"></script>
  <style>
    /*
      * Dark Colors
      * ------------------
      */

    body.dark {
      --ion-color-primary: #428cff;
      --ion-color-primary-rgb: 66, 140, 255;
      --ion-color-primary-contrast: #ffffff;
      --ion-color-primary-contrast-rgb: 255, 255, 255;
      --ion-color-primary-shade: #3a7be0;
      --ion-color-primary-tint: #5598ff;

      --ion-color-secondary: #50c8ff;
      --ion-color-secondary-rgb: 80, 200, 255;
      --ion-color-secondary-contrast: #ffffff;
      --ion-color-secondary-contrast-rgb: 255, 255, 255;
      --ion-color-secondary-shade: #46b0e0;
      --ion-color-secondary-tint: #62ceff;

      --ion-color-tertiary: #6a64ff;
      --ion-color-tertiary-rgb: 106, 100, 255;
      --ion-color-tertiary-contrast: #ffffff;
      --ion-color-tertiary-contrast-rgb: 255, 255, 255;
      --ion-color-tertiary-shade: #5d58e0;
      --ion-color-tertiary-tint: #7974ff;

      --ion-color-success: #2fdf75;
      --ion-color-success-rgb: 47, 223, 117;
      --ion-color-success-contrast: #000000;
      --ion-color-success-contrast-rgb: 0, 0, 0;
      --ion-color-success-shade: #29c467;
      --ion-color-success-tint: #44e283;

      --ion-color-warning: #ffd534;
      --ion-color-warning-rgb: 255, 213, 52;
      --ion-color-warning-contrast: #000000;
      --ion-color-warning-contrast-rgb: 0, 0, 0;
      --ion-color-warning-shade: #e0bb2e;
      --ion-color-warning-tint: #ffd948;

      --ion-color-danger: #ff4961;
      --ion-color-danger-rgb: 255, 73, 97;
      --ion-color-danger-contrast: #ffffff;
      --ion-color-danger-contrast-rgb: 255, 255, 255;
      --ion-color-danger-shade: #e04055;
      --ion-color-danger-tint: #ff5b71;

      --ion-color-dark: #f4f5f8;
      --ion-color-dark-rgb: 244, 245, 248;
      --ion-color-dark-contrast: #000000;
      --ion-color-dark-contrast-rgb: 0, 0, 0;
      --ion-color-dark-shade: #d7d8da;
      --ion-color-dark-tint: #f5f6f9;

      --ion-color-medium: #989aa2;
      --ion-color-medium-rgb: 152, 154, 162;
      --ion-color-medium-contrast: #000000;
      --ion-color-medium-contrast-rgb: 0, 0, 0;
      --ion-color-medium-shade: #86888f;
      --ion-color-medium-tint: #a2a4ab;

      --ion-color-light: #222428;
      --ion-color-light-rgb: 34, 36, 40;
      --ion-color-light-contrast: #ffffff;
      --ion-color-light-contrast-rgb: 255, 255, 255;
      --ion-color-light-shade: #1e2023;
      --ion-color-light-tint: #383a3e;
    }

    /*
      * iOS Dark Theme
      * -------------------
      */

    .ios body.dark {
      --ion-background-color: #000000;
      --ion-background-color-rgb: 0, 0, 0;

      --ion-text-color: #ffffff;
      --ion-text-color-rgb: 255, 255, 255;

      --ion-color-step-50: #0d0d0d;
      --ion-color-step-100: #1a1a1a;
      --ion-color-step-150: #262626;
      --ion-color-step-200: #333333;
      --ion-color-step-250: #404040;
      --ion-color-step-300: #4d4d4d;
      --ion-color-step-350: #595959;
      --ion-color-step-400: #666666;
      --ion-color-step-450: #737373;
      --ion-color-step-500: #808080;
      --ion-color-step-550: #8c8c8c;
      --ion-color-step-600: #999999;
      --ion-color-step-650: #a6a6a6;
      --ion-color-step-700: #b3b3b3;
      --ion-color-step-750: #bfbfbf;
      --ion-color-step-800: #cccccc;
      --ion-color-step-850: #d9d9d9;
      --ion-color-step-900: #e6e6e6;
      --ion-color-step-950: #f2f2f2;

      --ion-toolbar-background: #0d0d0d;

      --ion-item-background: #1c1c1c;
      --ion-item-background-activated: #313131;
    }

    /*
      * Material Design Dark Theme
      * ------------------------------
      */

    .md body.dark {
      --ion-background-color: #121212;
      --ion-background-color-rgb: 18, 18, 18;

      --ion-text-color: #ffffff;
      --ion-text-color-rgb: 255, 255, 255;

      --ion-border-color: #222222;

      --ion-color-step-50: #1e1e1e;
      --ion-color-step-100: #2a2a2a;
      --ion-color-step-150: #363636;
      --ion-color-step-200: #414141;
      --ion-color-step-250: #4d4d4d;
      --ion-color-step-300: #595959;
      --ion-color-step-350: #656565;
      --ion-color-step-400: #717171;
      --ion-color-step-450: #7d7d7d;
      --ion-color-step-500: #898989;
      --ion-color-step-550: #949494;
      --ion-color-step-600: #a0a0a0;
      --ion-color-step-650: #acacac;
      --ion-color-step-700: #b8b8b8;
      --ion-color-step-750: #c4c4c4;
      --ion-color-step-800: #d0d0d0;
      --ion-color-step-850: #dbdbdb;
      --ion-color-step-900: #e7e7e7;
      --ion-color-step-950: #f3f3f3;

      --ion-item-background: #1a1b1e;
    }

    /* Optional CSS, this is added for the flashing that happens when toggling between themes */
    ion-item {
      --transition: none;
    }

    body {
      background: var(--ion-background-color);
    }

    .lds-ripple {
      display: inline-block;
      position: relative;
      width: 80px;
      height: 80px;
    }

    .lds-ripple div {
      position: absolute;
      border: 4px solid #fff;
      opacity: 1;
      border-radius: 50%;
      animation: lds-ripple 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
    }

    .lds-ripple div:nth-child(2) {
      animation-delay: -0.5s;
    }

    @keyframes lds-ripple {
      0% {
        top: 36px;
        left: 36px;
        width: 0;
        height: 0;
        opacity: 1;
      }

      100% {
        top: 0px;
        left: 0px;
        width: 72px;
        height: 72px;
        opacity: 0;
      }
    }

    #loader {
      position: absolute;
      display: block;
      left: calc(calc(100% / 2) - 40px);
    }

    zt-bottom-drawer {
      --ion-background-color: #383434cc;
      padding-left: 10px;
      padding-right: 10px;
    }

    zt-bottom-drawer [slot="border"] {
      width: 100%;
      height: 10px;
      border: none;
      border-top-color: #424040e7;
      border-top-right-radius: 8px;
      border-top-left-radius: 8px;
      background-color: #383434cc;
      border-top-style: solid;
      border-width: 1px;
      border-bottom-right-radius: 0px;
      border-bottom-left-radius: 0px;
      margin-left: 0px;
      -webkit-box-shadow: 0px -3px 7px 0px #383434e7;
      box-shadow: 0px -3px 7px 0px #383434e7;
    }
  </style>
</head>
</head>

<body style="overflow: hidden; height: 100vh;" class="dark md">
  <div id="loader">
    <div></div>
    <div></div>
  </div>
  <zt-bottom-drawer id="drawer" positions="close-b-10,bottom-b-200,middle-b-450,top-t-60">
    <div slot="border">
    </div>
    <div slot="content">
      <ion-content>
        <ion-card class="card-close">
          <ion-card-header>
            <ion-card-subtitle>Card Subtitle</ion-card-subtitle>
            <ion-card-title>Card Title</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            Keep close to Nature's heart... and break clear away, once in awhile,
            and climb a mountain or spend a week in the woods. Wash your spirit clean.
          </ion-card-content>
        </ion-card>
        <ion-card>
          <ion-card-header>
            <ion-card-subtitle>Card Subtitle</ion-card-subtitle>
            <ion-card-title>Card Title</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            Keep close to Nature's heart... and break clear away, once in awhile,
            and climb a mountain or spend a week in the woods. Wash your spirit clean.
          </ion-card-content>
        </ion-card>
        <ion-card>
          <ion-card-header>
            <ion-card-subtitle>Card Subtitle</ion-card-subtitle>
            <ion-card-title>Card Title</ion-card-title>
          </ion-card-header>
          <ion-card-content>
            Keep close to Nature's heart... and break clear away, once in awhile,
            and climb a mountain or spend a week in the woods. Wash your spirit clean.
          </ion-card-content>
        </ion-card>
      </ion-content>
    </div>
  </zt-bottom-drawer>
  <script>
    window.onload = () => {
      let drawer = document.getElementById("drawer");

      drawer.addEventListener("hideEvent", () => {
        setTimeout(() => {
          drawer.show("middle");
        }, 5000);
      });

      drawer.addEventListener("changePositionEvent", () => { console.log("change position") });

      drawer.addCallbackCanDeactivateState((postionName, newPositionName, htmlElements) => {
        console.log("DeactivateState", postionName, htmlElements);
        return true;
      });

      drawer.addCallbackCanActivateState((postionName, oldPostionName, htmlElements) => {
        console.log("ActivateState", postionName, htmlElements);
        if (postionName === "top") {
          return new Promise((resolve) => {
            document.getElementById("loader").classList.add("lds-ripple");
            setTimeout(() => {
              document.getElementById("loader").classList.remove("lds-ripple");
              let resultRandom= Math.random() ;
              console.log(resultRandom > 0.5 ? "Can Activate" : "Can't Activate");
              resolve(resultRandom > 0.5 ? true : false);
            }, 1000 * (Math.random() * (8 - 4) + 4));
          });
        }
        return true;
      });
    }
  </script>
</body>

</html>
```

![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)


# License

The MIT License (MIT)

Copyright (c) 2020 Rodrigo Zoff

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

