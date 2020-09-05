import { h, Prop, Watch, Host, Element, Component, Event, EventEmitter, Method } from '@stencil/core';
import { createGesture, createAnimation, Gesture, Animation, GestureDetail } from '@ionic/core';

export type ZTPositionDrawer = { index: number, name: string, distanceTo: "BOTTOM" | "TOP", distance: number, distanceToTop: number, distanceMaginBottom: number, distanceMarginTop: number, previousPosition: ZTPositionDrawer, nextPosition: ZTPositionDrawer };
export type ZTHTMLElementsDrawer = { drawer: HTMLElement, slotBorder: HTMLElement, slotContent: HTMLElement };

type ResultgetPositionByPosY = { newPosition: ZTPositionDrawer, close: boolean };

@Component({
    tag: 'zt-bottom-drawer',
    styleUrl: 'zt-bottom-drawer.css',
    shadow: true
})
export class ZTBottomDrawer {
    @Element() el: HTMLElement;

    animation?: Animation;
    gesture?: Gesture;

    @Prop({ reflect: true }) disableGesture: boolean = false;

    @Prop() autoShowOnLoad: boolean = true;

    @Prop({ reflect: true }) easing: string = 'cubic-bezier(.56,.05,.91,.88)';

    @Prop({ reflect: true }) positionName: string;

    @Prop() hideOnPositionZero: boolean = true;

    @Prop({ mutable: true, reflect: true }) hidden: boolean = false;

    @Prop({ reflect: true }) positions: string = "close-b-10,bottom-b-200,middle-b-450,top-t-60";

    _positions: ZTPositionDrawer[];
    _position: ZTPositionDrawer;

    _htmlElements: ZTHTMLElementsDrawer;

    @Prop({ reflect: true }) autoHeightContent: boolean = true;

    @Event() changePositionEvent: EventEmitter<{ positionName: string, htmlElements: ZTHTMLElementsDrawer }>;

    @Event() hideEvent: EventEmitter<ZTHTMLElementsDrawer>;

    @Method()
    async addCallbackCanActivateState(callback: (positionName: string, oldState: string, htmlElements: ZTHTMLElementsDrawer) => Promise<boolean | void> | void) {
        this.callbackCanActivateState = callback;
    }

    @Method()
    async addCallbackCanDeactivateState(callback: (positionName: string, newState: string, htmlElements: ZTHTMLElementsDrawer) => Promise<boolean | void> | void) {
        this.callbackCanDeactivateState = callback;
    }

    callbackCanActivateState: (positionName: string, oldState: string, htmlElements: ZTHTMLElementsDrawer) => Promise<boolean | void> | void;
    callbackCanDeactivateState: (positionName: string, newState: string, htmlElements: ZTHTMLElementsDrawer) => Promise<boolean | void> | void;

    insertAfter(referenceNode, newNode) {
        referenceNode.parentNode.insertAfter(newNode, referenceNode.nextSibling);
    }

    insertBefore(referenceNode, newNode) {
        referenceNode.parentNode.insertBefore(newNode, referenceNode);
    }

    async componentDidLoad() {
        this._htmlElements = { drawer: null, slotBorder: null, slotContent: null };

        let dimensionesWin = this.getWHWindow();

        this._htmlElements.slotContent = this.el.querySelector('[slot="content"]');
        this._htmlElements.slotBorder = this.el.querySelector('[slot="border"]');

        if (this._htmlElements.slotContent && this.autoHeightContent) {
            this._htmlElements.slotContent.style.setProperty("height", dimensionesWin.height + "px");
        }

        this.setPositions(this.positions);

        if (this.autoShowOnLoad) {
            if (this.positions.length > 0) {
                if (this.positionName) {
                    return this.show(this.positionName);
                }
                else {
                    return this.show((await this.getPositionByIndex(1)).name);
                }
            }
        }
    }

    @Watch("disableGesture")
    setDisableGesture(value: boolean) {
        if (!value && !this.gesture) {
            this.gesture = createGesture({
                el: this._htmlElements.slotBorder,
                threshold: 0,
                gestureName: 'drawer-drag',
                disableScroll: true,
                passive: false,
                onMove: ev => this.onMove(ev),
                onEnd: ev => this.onEnd(ev)
            });
        }
        if (this.gesture)
            this.gesture.enable(!value);
    }

    @Watch("positions")
    setPositions(newPositions: string) {
        let positions: ZTPositionDrawer[] = [];
        let index: number = 1;
        let splitPositions: string[] = newPositions.toLowerCase().split(",");
        let dimensionesWin = this.getWHWindow();
        let previous: ZTPositionDrawer;
        splitPositions.forEach(positionCadena => {
            let splitPosition: string[] = positionCadena.split("-");
            if (splitPosition.length === 3) {
                try {
                    let position: ZTPositionDrawer = {
                        index: index, name: splitPosition[0],
                        distanceTo: (splitPosition[1].toLowerCase() === "t" ? "TOP" : "BOTTOM"),
                        distance: Number.parseInt(splitPosition[2]),
                        distanceToTop: 0,
                        previousPosition: null,
                        nextPosition: null,
                        distanceMaginBottom: 0,
                        distanceMarginTop: 0
                    };
                    if (position.distanceTo === "TOP") {
                        position.distanceToTop = position.distance;
                    } else {
                        position.distanceToTop = dimensionesWin.height - position.distance;
                    }
                    if (previous) {
                        position.previousPosition = previous;
                        previous.nextPosition = position;
                    }
                    previous = position;
                    index = index + 1;
                    positions.push(position);

                } catch (err) {
                    throw Error("ZTBottomDrawer - Positions is invalid : " + positionCadena + " must be name:string-[t|b]:string-distance:number ");
                }
            }
        })
        positions.forEach((position) => {
            if (position.previousPosition) {
                let delta = (position.previousPosition.distanceToTop - position.distanceToTop);
                position.distanceMaginBottom = position.distanceToTop + delta / 2;
            }
            if (position.nextPosition) {
                let delta = (position.distanceToTop - position.nextPosition.distanceToTop);
                position.distanceMarginTop = position.distanceToTop - delta / 2;
            }
        });

        this._positions = positions;
    }

    @Method()
    async getPositionByName(name: string): Promise<ZTPositionDrawer> {
        return this._positions.find((value) => { return value.name == name; });
    }

    @Method()
    async getPositionByIndex(index: number): Promise<ZTPositionDrawer> {
        let positionFind = this._positions.find((value) => { return value.index == index; });
        return positionFind;
    }

    @Method()
    async hide(notAnimate: boolean | undefined = false) {
        this.gesture.enable(false);
        this.hidden = true;
        let dimensionesWin = this.getWHWindow();

        let animation = createAnimation()
            .addElement(this.el)
            .duration(notAnimate ? 0 : 350)
            .easing(this.easing)
            .to('transform', `translateY(${dimensionesWin.height + 10}px)`);

        return animation.play().then(() => {
            this.el.style.setProperty("display", "none");
        });
    }

    @Method()
    async show(positionName: string, notAnimate: boolean | undefined = false) {
        if (!positionName) {
            return;
        }

        let positionToShow: ZTPositionDrawer = await this.getPositionByName(positionName);

        if (!positionToShow) {
            return;
        }

        this.positionName = positionName;

        let dimensionesWin = this.getWHWindow();

        if (this._htmlElements.slotContent && this.autoHeightContent) {
            this._htmlElements.slotContent.style.setProperty("height", dimensionesWin.height + "px");
        }

        if (this.gesture) {
            this.gesture.enable(false);
        }

        this.el.style.setProperty("display", "inline");
        this.hidden = false;

        let animation = createAnimation()
            .addElement(this.el)
            .duration(notAnimate ? 0 : 350)
            .easing(this.easing)
            .fromTo('transform', `translateY(${dimensionesWin.height}px)`, `translateY(${positionToShow.distanceToTop}px)`);

        return animation.play().then(() => {
            this._position = positionToShow;
            this.positionName = positionToShow.name;
            this.setDisableGesture(this.disableGesture);
        });
    }

    margenPosition: number = 50;
    getPositionByPosY(posY: number, direccion: "UP" | "DOWN"): ResultgetPositionByPosY {
        let result: ResultgetPositionByPosY = { newPosition: null, close: false };

        if (!this._position.nextPosition && direccion == "UP") {
            return result;
        }

        if (!this._position.previousPosition && direccion == "DOWN") {
            result.close = true;
            return result;
        }

        result.newPosition = this._positions.find((position) => {
            if (position.previousPosition) {
                if (position.nextPosition) {
                    return position.distanceMaginBottom > posY && position.distanceMarginTop < posY;
                } else {
                    // Position Superior
                    return position.distanceMaginBottom > posY;
                }
            }
            else {
                return position.distanceMarginTop < posY;
            }
        });
        return result
    }

    log(parametro) {
        if ((window.console as any).__ztbottomdrawer) {
            console.log(parametro);
        }
    }

    onMove(ev: GestureDetail) {
        this.setTranslateY(ev.currentY, 0);
    }

    onEnd(ev: GestureDetail) {
        this.ultimoTranslateRechazado = null;
        this.changeStateByGesture(ev);
    }

    getDirectionGesture(ev: GestureDetail): "UP" | "DOWN" {
        if (ev.deltaY / Math.abs(ev.deltaY) * -1 > 0)
            return "UP"
        else
            return "DOWN"
    }

    async changeStateByGesture(ev: GestureDetail) {
        if (Math.abs(ev.deltaY) == 0) {
            let posY: number = this._position.distanceToTop;
            await this.setTranslateY(posY, 0);
            return;
        }

        if (this.gesture)
            this.gesture.enable(false);

        let calculatePosition: ZTPositionDrawer = this._position;

        let result: ResultgetPositionByPosY = this.getPositionByPosY(ev.currentY, this.getDirectionGesture(ev));

        if (result.close) {
            if (this.hideOnPositionZero) {
                this.setDisableGesture(this.disableGesture);
                this.hideEvent.emit();
                return this.hide();
            }
        }

        if (result.newPosition) {
            calculatePosition = result.newPosition;
        }

        if (calculatePosition != this._position) {
            await this.setPosition(calculatePosition);
            this.setDisableGesture(this.disableGesture);
            return;
        }

        await this.setTranslateY(this._position.distanceToTop);
        this.setDisableGesture(this.disableGesture);
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

    @Watch('positionName')
    async watchPositionName(newValue) {
        if (newValue && this._position && this._position.name !== newValue) {
            newValue = (newValue as string).toLowerCase();
            let newPosition = await this.getPositionByName(newValue);
            if (newPosition && this._position.name !== newPosition.name)
                return await this.setPosition(newPosition);
        }
        setTimeout(() => {
            this.positionName = this._position ? this._position.name : null;
        }, 10);
    }

    async setPosition(value: ZTPositionDrawer): Promise<void> {
        if (this.gesture)
            this.gesture.enable(false);

        if (value.name !== this._position.name) {
            if (this.callbackCanDeactivateState) {
                let resultCanDeactivate = await this.callbackCanDeactivateState(this._position.name, value.name, this._htmlElements);
                if (!resultCanDeactivate) {
                    value = this._position;
                }
            }

            if (this.callbackCanActivateState) {
                let resultCanActivate = await this.callbackCanActivateState(value.name, this._position.name, this._htmlElements);
                if (!resultCanActivate) {
                    value = this._position;
                }
            }

            this._position = value;
            this.positionName = this._position.name;
            this.changePositionEvent.emit({ positionName: this.positionName, htmlElements: this._htmlElements });
        }

        this.ultimoTranslateRechazado = null;
        await this.setTranslateY(value.distanceToTop);
        this.setDisableGesture(this.disableGesture);
    }

    enMovimiento: boolean = false;
    ultimoTranslateRechazado: { posY: number, duration: number } | undefined = undefined;
    ultimoValue: number = 0;

    async setTranslateY(posY: number, duration: number = 200): Promise<void> {
        return new Promise(async (resolve) => {
            if (this.enMovimiento) {
                this.ultimoTranslateRechazado = { posY: posY, duration: duration };
                return resolve();
            }

            if (this.ultimoValue === posY) {
                return resolve();
            }

            this.enMovimiento = true;

            if (this._htmlElements.slotContent && this.ultimoValue > posY) {
                this._htmlElements.slotContent.style.setProperty("height", (this.getWHWindow().height).toString() + "px");
            }

            let animation = createAnimation()
                .addElement(this.el)
                .duration(duration)
                .easing(this.easing)
                .to('transform', `translateY(${posY}px)`);

            this.ultimoValue = posY;

            animation.play().then(async () => {
                this.enMovimiento = false;
                if (this.ultimoTranslateRechazado) {
                    let ultimoTranslate = this.ultimoTranslateRechazado;
                    this.ultimoTranslateRechazado = undefined;
                    this.setTranslateY(ultimoTranslate.posY, ultimoTranslate.duration).then(() => resolve());
                } else {
                    if (this._htmlElements.slotContent && this.autoHeightContent) {
                        this._htmlElements.slotContent.style.setProperty("height", (this.getWHWindow().height - Number(this._htmlElements.slotContent.getBoundingClientRect().top)).toString() + "px");
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
