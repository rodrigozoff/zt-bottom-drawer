import { h, Prop, State, Watch, Host, Element, Component, Event, EventEmitter, Method } from '@stencil/core';
import { createGesture, createAnimation, Gesture, Animation, GestureDetail } from '@ionic/core';
import { ZTDrawerState } from './drawer-state';

@Component({
    tag: 'zt-bottom-drawer',
    styleUrl: 'zt-bottom-drawer.css',
    shadow: true
})
export class ZTBottomDrawer {
    @Element() el: HTMLElement;

    animation?: Animation;
    gesture?: Gesture;

    @Prop({ reflect: true }) distanceBottomClose: number = 60;

    @Prop({ reflect: true }) distanceBottomOpen: number = 350;

    @Prop({ reflect: true }) distanceTopFullOpen: number = 10;

    @Prop({ reflect: true }) disableMove: boolean = false;

    @Prop({ reflect: true }) easing: string = 'cubic-bezier(.56,.05,.91,.88)';

    @Prop({ reflect: true }) state: ZTDrawerState = ZTDrawerState.BOTTOM;

    @Prop({ reflect: true }) autoHeightContent: boolean = true;

    @State() _state: ZTDrawerState = ZTDrawerState.BOTTOM;

    @Event() changeState: EventEmitter<ZTDrawerState>;

    @Event() closeBottom: EventEmitter<void>;

    @Method()
    async addCallbackCanActivateState(callback: (state: ZTDrawerState, oldState: ZTDrawerState, drawerElement: HTMLElement, contentElement: HTMLElement) => Promise<boolean | void> | void) {
        this.callbackCanActivateState = callback;
    }

    @Method()
    async addCallbackCanDeactivateState(callback: (state: ZTDrawerState, newState: ZTDrawerState, drawerElement: HTMLElement, contentElement: HTMLElement) => Promise<boolean | void> | void) {
        this.callbackCanDeactivateState = callback;
    }

    callbackCanActivateState: (state: ZTDrawerState, oldState: ZTDrawerState, drawerElement: HTMLElement, contentElement: HTMLElement) => Promise<boolean | void> | void;
    callbackCanDeactivateState: (state: ZTDrawerState, newState: ZTDrawerState, drawerElement: HTMLElement, contentElement: HTMLElement) => Promise<boolean | void> | void;

    drawerContent: HTMLElement;
    gestureElement: HTMLDivElement;



    insertAfter(referenceNode, newNode) {
        referenceNode.parentNode.insertAfter(newNode, referenceNode.nextSibling);
    }
    insertBefore(referenceNode, newNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode);
    }

    async componentDidLoad() {

        this._state = this.state;
        let dimensionesWin = this.getWHWindow();

        this.drawerContent = this.el.querySelector('[slot="content"]');
        this.gestureElement = this.el.querySelector('[slot="border"]');

        if (this.drawerContent && this.autoHeightContent) {
            this.drawerContent.style.setProperty("height", dimensionesWin.height + "px");
        }

        this.animation = createAnimation()
            .addElement(this.el)
            .duration(850)
            .easing(this.easing)
            .fromTo('transform', `translateY(${dimensionesWin.height}px)`, `translateY(${dimensionesWin.height - this.distanceBottomClose}px)`);

        this.animation.play().then(() => { console.log("Termino la animacion inicial - Top: " + this.el.clientTop) });

        this.gesture = createGesture({
            el: this.gestureElement,
            threshold: 0,
            gestureName: 'drawer-drag',
            disableScroll: true,
            passive: false,
            onStart: ev => this.onStart(ev),
            onMove: ev => this.onMove(ev),
            onEnd: ev => this.onEnd(ev)
        });
        this.gesture.enable(true);
    }

    getStateNumber(state: ZTDrawerState) {
        switch (state) {
            case ZTDrawerState.BOTTOM:
                return 0;
            case ZTDrawerState.OPEN:
                return 1;
            default:
                return 2;
        }
    }

    getStateByNumber(numbreState: number): ZTDrawerState {
        if (numbreState < 0) {
            numbreState = 0;
        }
        if (numbreState > 2) {
            numbreState = 2;
        }
        switch (numbreState) {
            case 0:
                return ZTDrawerState.BOTTOM;
            case 1:
                return ZTDrawerState.OPEN;
            default:
                return ZTDrawerState.FULLOPEN;
        }
    }

    getPositionByState(state: ZTDrawerState): number {
        switch (state) {
            case ZTDrawerState.BOTTOM:
                return this.getWHWindow().height - this.distanceBottomClose;
            case ZTDrawerState.OPEN:
                return this.getWHWindow().height - this.distanceBottomOpen;
            default:
                return this.distanceTopFullOpen;
        }
    }

    disableMoveGesture: boolean = true;
    changingState: boolean = false;
    disableMoveEnd: boolean = false;
    processingChangeStateByGesture: boolean = false;

    onStart(ev: GestureDetail) {
        this.disableMoveEnd = true;
        if (this.disableMove || this.changingState || this.processingChangeStateByGesture)
            return;
        this.log(ev);
        this.disableMoveGesture = false;
    }

    log(parametro) {
        if ((window.console as any).__ztbottomdrawer) {
            console.log(parametro);
        }
    }

    onMove(ev: GestureDetail) {
        if (this.disableMove || this.changingState || this.processingChangeStateByGesture || this.disableMoveGesture)
            return;
        //   console.log("onMove", ev)

        if (Math.abs(ev.deltaY) > 155) {
            this.disableMoveGesture = true;
            this.disableMoveEnd = true;
            this.ultimoTranslateRechazado = null;
            // console.log("onMove   this.changeStateByGesture(ev);", ev)
            this.changeStateByGesture(ev);
            return;
        }

        this.disableMoveEnd = false;
        this.setTranslateY(ev.currentY, 0).then(() => { this.disableMoveGesture = false; });
    }

    onEnd(ev: GestureDetail) {
        if (this.disableMove || this.changingState || this.processingChangeStateByGesture || this.disableMoveEnd)
            return;
        // console.log("onEnd", ev);
        this.ultimoTranslateRechazado = null;
        this.changeStateByGesture(ev);
    }

    async changeStateByGesture(ev: GestureDetail) {
        if (this.disableMove || this.changingState || this.processingChangeStateByGesture)
            return;

        if (Math.abs(ev.deltaY) == 0) {
            let posY: number = this.getPositionByState(this._state);
            await this.setTranslateY(posY, 0);
            return;
        }

        this.processingChangeStateByGesture = true;

        let calculateState: ZTDrawerState = this._state;
        if (Math.abs(ev.deltaY) > 50) {
            let newStateNumber = this.getStateNumber(this._state) + ev.deltaY / Math.abs(ev.deltaY) * -1;
            calculateState = this.getStateByNumber(newStateNumber);

            let newPosY: number = this.getPositionByState(calculateState);

            if (ev.currentY > newPosY + 50 && ev.deltaY / Math.abs(ev.deltaY) > 0) {

                if (newStateNumber === -1) {
                    this.closeBottom.emit();
                }
                calculateState = this.getStateByNumber(newStateNumber - 1);
            }
            if (ev.currentY < newPosY - 50 && ev.deltaY / Math.abs(ev.deltaY) < 0) {
                calculateState = this.getStateByNumber(newStateNumber + 1);
            }

            if (calculateState != this._state) {
                await this.setZTDrawerState(calculateState);
                this.processingChangeStateByGesture = false;
                return;
            }
        }

        let posY: number = this.getPositionByState(this._state);
        await this.setTranslateY(posY, 150);

        this.processingChangeStateByGesture = false;
    }

    getWHWindow() {
        return {
            height: window.innerHeight
                || document.documentElement.clientHeight
                || document.body.clientHeight,
            width: window.innerWidth
                || document.documentElement.clientWidth
                || document.body.clientWidth
        }
    }

    @Watch('state')
    async watchState(newValue) {
        if (newValue && (newValue == "OPEN" || newValue == "BOTTOM" || newValue == "FULLOPEN")) {
            newValue = (newValue as string).toUpperCase();
            if (this._state !== newValue)
                await this.setZTDrawerState(newValue);
        } else {
            setTimeout(() => this.state = this._state, 10);
        }
    }

    async setZTDrawerState(state: ZTDrawerState): Promise<void> {
        if (this.changingState)
            return;

        console.log(state)

        if (state != this._state) {
            this.changingState = true;
            if (this.callbackCanDeactivateState) {
                let resultCanDeactivate = await this.callbackCanDeactivateState(this._state, state, this.el, this.drawerContent);
                if (!resultCanDeactivate) {
                    this.state = this._state;
                    state = this._state;
                }
            }

            if (this.callbackCanActivateState) {
                let resultCanActivate = await this.callbackCanActivateState(state, this._state, this.el, this.drawerContent);
                if (!resultCanActivate) {
                    this.state = this._state;
                    state = this._state;
                }
            }

            this._state = state;
            this.state = state;
            this.changeState.emit(state);
        }
        this.ultimoTranslateRechazado = null;

        await this.setTranslateY(this.getPositionByState(state));

        this.changingState = false;
    }

    enMovimiento: boolean = false;
    ultimoTranslateRechazado: { value: number, duration: number } | undefined = undefined;
    ultimoValue: number = 0;

    async setTranslateY(value, duration: number = 200): Promise<void> {
        return new Promise(async (resolve) => {
            if (this.enMovimiento) {
                this.ultimoTranslateRechazado = { value: value, duration: duration };
                return resolve();
            }

            if (this.ultimoValue === value) {
                return resolve();
            }

            this.enMovimiento = true;

            if (this.drawerContent && this.ultimoValue > value) {
                this.drawerContent.style.setProperty("height", (this.getWHWindow().height).toString() + "px");
            }

            this.animation = createAnimation()
                .addElement(this.el)
                .duration(duration)
                .easing(this.easing)
                .to('transform', `translateY(${value}px)`);

            this.ultimoValue = value;

            this.animation.play().then(async () => {
                this.enMovimiento = false;
                if (this.ultimoTranslateRechazado) {
                    let ultimoTranslate = this.ultimoTranslateRechazado;
                    this.ultimoTranslateRechazado = undefined;
                    this.setTranslateY(ultimoTranslate.value, ultimoTranslate.duration).then(() => resolve());
                } else {
                    if (this.drawerContent && this.autoHeightContent) {
                        this.drawerContent.style.setProperty("height", (this.getWHWindow().height - Number(this.drawerContent.getBoundingClientRect().top)).toString() + "px");
                    }
                    resolve()
                }
            });
        });
    }

    render() {
        return (<Host>
            <slot name="border" />
            <slot name="content" />
        </Host>);
    }

}
