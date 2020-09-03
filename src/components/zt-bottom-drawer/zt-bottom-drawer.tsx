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

    @State() _state: ZTDrawerState = ZTDrawerState.BOTTOM;

    @Event() changeState: EventEmitter<ZTDrawerState>;

    @Method()
    async addCallbackCanActivateState(callback: (state: ZTDrawerState) => Promise<boolean | undefined> | undefined) {
        this.callbackCanActivateState = callback;
    }

    @Method()
    async addCallbackCanDeactivateState(callback: (state: ZTDrawerState) => Promise<boolean | undefined> | undefined) {
        this.callbackCanDeactivateState = callback;
    }

    callbackCanActivateState: (state: ZTDrawerState) => Promise<boolean | undefined> | undefined;
    callbackCanDeactivateState: (state: ZTDrawerState) => Promise<boolean | undefined> | undefined;

    drawerContent: HTMLElement;
    async componentDidLoad() {

        this._state = this.state;
        let dimensionesWin = this.getWHWindow();

        this.drawerContent = this.el.querySelector(".drawer-content");

        if (this.drawerContent) {
            this.drawerContent.style.setProperty("height", this.distanceBottomOpen + "px");
        }

        this.animation = createAnimation()
            .addElement(this.el)
            .duration(850)
            .easing(this.easing)
            .fromTo('transform', `translateY(${dimensionesWin.height}px)`, `translateY(${dimensionesWin.height - this.distanceBottomClose}px)`);

        this.animation.play().then(() => { console.log("Termino la animacion inicial - Top: " + this.el.clientTop) });

        this.gesture = createGesture({
            el: this.el.querySelector(".drawer-gesture-target"),
            threshold: 0,
            gestureName: 'drawer-drag',
            disableScroll: true,
            passive: false,
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

    onMove(ev: GestureDetail) {
        if (this.disableMove)
            return;
        if (ev) {
            if (Math.abs(ev.deltaY) < 10) {
                return;
            } else {
                this.setTranslateY(ev.currentY, 250);
            }
        }
    }

    onEnd(ev: GestureDetail) {
        if (this.disableMove)
            return;
        if (ev) {
            if (Math.abs(ev.deltaY) == 0) {
                return;
            }
            let calculateState: ZTDrawerState = this._state;
            if (Math.abs(ev.deltaY) > 30) {
                let newStateNumber = this.getStateNumber(this._state) + ev.deltaY / Math.abs(ev.deltaY) * -1;
                calculateState = this.getStateByNumber(newStateNumber);

                let newPosY: number = this.getPositionByState(calculateState);

                if (ev.currentY > newPosY + 50 && ev.deltaY / Math.abs(ev.deltaY) > 0) {
                    calculateState = this.getStateByNumber(newStateNumber - 1);
                }
                if (ev.currentY < newPosY - 50 && ev.deltaY / Math.abs(ev.deltaY) < 0) {
                    calculateState = this.getStateByNumber(newStateNumber + 1);
                }

                if (calculateState != this._state) {
                    this.state = calculateState;
                    return;
                }
            }
            let newPosY: number = this.getPositionByState(this.state);
            this.setTranslateY(newPosY, 450);
        }
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
    async watchHandlerPosition(newValue) {
        if (newValue) {
            newValue = (newValue as string).toUpperCase();
            this.setZTDrawerState(newValue);
        }
    }

    async setZTDrawerState(state: ZTDrawerState) {

        if (this.callbackCanDeactivateState) {
            let resultCanDeactivate = await this.callbackCanDeactivateState(this._state);
            if (!resultCanDeactivate) {
                this.state = this._state;
                state = this._state;
            }
        }

        if (this.callbackCanActivateState) {
            let resultCanActivate = await this.callbackCanActivateState(state);
            if (!resultCanActivate) {
                this.state = this._state;
                state = this._state;
            }
        }

        if (state != this._state) {
            this._state = state;
            this.changeState.emit(state);
        }
        this.ultimoTranslateRechazado = null;
        this.setTranslateY(this.getPositionByState(state));
    }

    enMovimiento: boolean = false;
    ultimoTranslateRechazado: { value: number, duration: number } | undefined = undefined;
    ultimoValue: number = 0;

    setTranslateY(value, duration: number = 200) {
        if (this.enMovimiento) {
            this.ultimoTranslateRechazado = { value: value, duration: duration };
            return;
        }
        if (this.ultimoValue === value)
            return;

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

        this.animation.play().then(() => {
            this.enMovimiento = false;
            if (this.ultimoTranslateRechazado) {
                let ultimoTranslate = this.ultimoTranslateRechazado;
                this.ultimoTranslateRechazado = undefined;
                this.setTranslateY(ultimoTranslate.value, ultimoTranslate.duration);
            } else {
                if (this.drawerContent) {
                    this.drawerContent.style.setProperty("height", (this.getWHWindow().height - Number(this.drawerContent.getBoundingClientRect().top)).toString() + "px");
                    console.log("Termino animacion drawer Content - Limites: ", this.drawerContent.getBoundingClientRect());
                }
                console.log("Termino animacion drawer - Limites: ", this.el.getBoundingClientRect());
            }
        });
    }

    render() {
        return (<Host>
            <slot name="drawer-content" />
        </Host>);
    }

}
