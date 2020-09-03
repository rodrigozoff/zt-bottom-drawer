# Stencil Bottom Drawer

Bottom drawer web component / Ionic 5. 

![alt text](./src/demo.gif "Demo")

# Installation

```
$ npm i zt-bottom-drawer --save
```

## Properties

| Property              | Attribute                | Description | Type                                                                   | Default                           |
| --------------------- | ------------------------ | ----------- | ---------------------------------------------------------------------- | --------------------------------- |
| `disableMove`         | `disable-move`           |             | `boolean`                                                              | `false`                           |
| `distanceBottomClose` | `distance-bottom-close`  |             | `number`                                                               | `60`                              |
| `distanceBottomOpen`  | `distance-bottom-open`   |             | `number`                                                               | `350`                             |
| `distanceTopFullOpen` | `distance-top-full-open` |             | `number`                                                               | `10`                              |
| `easing`              | `easing`                 |Specify custom cubic-bezier for animations| `string`                                                               | `'cubic-bezier(.56,.05,.91,.88)'` |
| `state`               | `state`                  |             | `ZTDrawerState.BOTTOM \| ZTDrawerState.FULLOPEN \| ZTDrawerState.OPEN` | `ZTDrawerState.BOTTOM`            |


## Events

| Event         | Description | Type                                                                                |
| ------------- | ----------- | ----------------------------------------------------------------------------------- |
| `changeState` |             | `CustomEvent<ZTDrawerState.BOTTOM \| ZTDrawerState.FULLOPEN \| ZTDrawerState.OPEN>` |


## Methods

### `addCallbackCanActivateState(callback: (state: ZTDrawerState) => Promise<boolean | undefined> | undefined) => Promise<void>`



#### Returns

Type: `Promise<void>`



### `addCallbackCanDeactivateState(callback: (state: ZTDrawerState) => Promise<boolean | undefined> | undefined) => Promise<void>`



#### Returns

Type: `Promise<void>`

## HTML Element target gesture / Container

The element has the class drawer-gesture-target receive the event (touch) for move the drawer.

```html
        <ion-card-header class="drawer-gesture-target">
          <ion-card-subtitle style="font-size: 17px;">Title Drawer</ion-card-title>
        </ion-card-header>
````

The element that has the class drawer-content will change the height between states, that is necessary for support scroll behaviour.

```html
    <ion-card-content class="drawer-content ion-no-padding">
          <ion-content class="drawer-content-card">
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
        </ion-card-content>
````

## Control over Activate and Deactivate states 

If the callbacks return a promise with result equal a false the change of state is canceled.

### Methods 

```javascript

    callbackCanActivateState: (state: DrawerState) => Promise<boolean | undefined> | undefined;
    callbackCanDeactivateState: (state: DrawerState) => Promise<boolean | undefined> | undefined;

```
### Example in StencilJS

```javascript

  componentDidLoad() {
    this.drawer.addCallbackCanActivateState(this.callbackCanActivateChangeState);
    this.drawer.addCallbackCanDeactivateState(this.callbackCanDeactivateChangeState);
  }
  
  async callbackCanDeactivateChangeState(state: DrawerState): Promise<boolean> {
    if(state===DrawerState.DOCKED){
      return false; 
    }
    return true;
   }

  async callbackCanActivateChangeState(state: DrawerState): Promise<boolean> {
    return true;
  }

```

# Examples

## PURE HTML

```html
<zt-bottom-drawer>
    <div slot="drawer-content" style="margin-top:5px">
      <ion-card>
        <ion-card-header class="drawer-gesture-target">
          <ion-card-subtitle style="font-size: 17px;">Title Drawer</ion-card-title>
        </ion-card-header>
        <ion-card-content class="drawer-content ion-no-padding">
          <ion-content class="drawer-content-card">
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
        </ion-card-content>
      </ion-card>
    </div>
  </zt-bottom-drawer>
```

![Built With Stencil](https://img.shields.io/badge/-Built%20With%20Stencil-16161d.svg?logo=data%3Aimage%2Fsvg%2Bxml%3Bbase64%2CPD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDE5LjIuMSwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBzdHlsZT0iZW5hYmxlLWJhY2tncm91bmQ6bmV3IDAgMCA1MTIgNTEyOyIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI%2BCjxzdHlsZSB0eXBlPSJ0ZXh0L2NzcyI%2BCgkuc3Qwe2ZpbGw6I0ZGRkZGRjt9Cjwvc3R5bGU%2BCjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik00MjQuNywzNzMuOWMwLDM3LjYtNTUuMSw2OC42LTkyLjcsNjguNkgxODAuNGMtMzcuOSwwLTkyLjctMzAuNy05Mi43LTY4LjZ2LTMuNmgzMzYuOVYzNzMuOXoiLz4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTQyNC43LDI5Mi4xSDE4MC40Yy0zNy42LDAtOTIuNy0zMS05Mi43LTY4LjZ2LTMuNkgzMzJjMzcuNiwwLDkyLjcsMzEsOTIuNyw2OC42VjI5Mi4xeiIvPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNNDI0LjcsMTQxLjdIODcuN3YtMy42YzAtMzcuNiw1NC44LTY4LjYsOTIuNy02OC42SDMzMmMzNy45LDAsOTIuNywzMC43LDkyLjcsNjguNlYxNDEuN3oiLz4KPC9zdmc%2BCg%3D%3D&colorA=16161d&style=flat-square)


# License

The MIT License (MIT)

Copyright (c) 2020 Rodrigo Zoff

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

