import { h, Prop, Watch, Host, Element, Component, Event, EventEmitter, Method } from '@stencil/core';
import { createGesture, createAnimation, Gesture, Animation, GestureDetail, ViewController } from '@ionic/core';

export type ZTPositionDrawer = { index: number, name: string, distanceTo: "BOTTOM" | "TOP", distance: number, distanceToTop: number,  previousPosition: ZTPositionDrawer, nextPosition: ZTPositionDrawer };
export type ZTHTMLElementsDrawer = { drawer: HTMLElement, gestureTarget: HTMLElement, content: HTMLElement };

type ResultgetPositionByPosY = { newPosition: ZTPositionDrawer, close: boolean };

@Component({
    tag: 'zt-bottom-drawer',
    styleUrl: 'zt-bottom-drawer.css',
    shadow: false
})
export class ZTBottomDrawer {
    @Element() el: HTMLElement;

    animation?: Animation;
    gesture?: Gesture;

    @Prop({ reflect: true }) disableGesture: boolean = false;

    @Prop() autoShowOnLoad: boolean = true;

    @Prop({ reflect: true }) easing: string = 'cubic-bezier(.56,.05,.91,.88)';

    @Prop({ reflect: true }) positionName: string;

    @Prop({ mutable: true, reflect: true }) hideOnPositionZero: boolean = false;

    @Prop({ mutable: true, reflect: true }) hidden: boolean = false;
    @Prop({ mutable: true, reflect: true }) coefDuration: number = 150;

    @Prop({ reflect: true }) positions: string = "close-b-10,bottom-b-200,middle-b-450,top-t-60";

    _positions: ZTPositionDrawer[];
    _position: ZTPositionDrawer;

    _htmlElements: ZTHTMLElementsDrawer;
    nav: HTMLIonNavElement;

    @Prop({ reflect: true }) autoHeightContent: boolean = true;

    @Event() changePositionEvent: EventEmitter<{ positionName: string, htmlElements: ZTHTMLElementsDrawer }>;

    @Event() hideEvent: EventEmitter<ZTHTMLElementsDrawer>;

    @Method()
    async addCallbackCanActivateState(callback: (positionName: string, oldState: string, htmlElements: ZTHTMLElementsDrawer) => Promise<boolean | void> | void) {
        this.callbackCanActivateState = callback;
    }

    handlerIonScroll: any;

    @Method()
    async getNav(): Promise<HTMLIonNavElement> {
        return this.nav;
    }

    @Method()
    async getActive(): Promise<ViewController> {
        return this.nav.getActive();
    }

    @Method()
    async pushNav(component: any, propsComponent: any, selectorGesture: string = "ion-header", selectorContent: string = "ion-content") {
        await this.nav.push(component, propsComponent);
        let contentActive: any = await this.nav.getActive();
        contentActive.__zt_init = true;
        contentActive.__zt_selectorContent = selectorContent;
        contentActive.__zt_selectorGesture = selectorGesture;
        this.initActiveContentNav(contentActive);
    }

    async initActiveContentNav(contentActive: any) {
        if (contentActive && contentActive.__zt_init) {
            this._htmlElements.content = contentActive.element.querySelector(contentActive.__zt_selectorContent);
            let gestureTarget: any = contentActive.element.querySelector(contentActive.__zt_selectorGesture);

            this.addGesture(gestureTarget);

            if (this._htmlElements.content.nodeName == "ION-CONTENT" && this.autoHeightContent) {

                if (this.ionContent && this.handlerIonScroll) {
                    this.ionContent.removeEventListener("ionScroll", this.handlerIonScroll)
                }

                this.ionContent = this._htmlElements.content as HTMLIonContentElement;
                this.ionContent.scrollEvents = true;
                this.handlerIonScroll = (ev: any) => {
                    this.ionContentNotTopScroll = ev && ev.detail && ev.detail.scrollTop !== 0;
                    // console.log("  this.ionContentNotTopScroll : " +   this.ionContentNotTopScroll)
                };
                this.ionContent.addEventListener("ionScroll", this.handlerIonScroll);
            }

            this.setHeightContent("MAX");

            if (!this._position || (this._position && this.positionName != this._position.name))
                this.show(this.positionName);
        }
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

    ionContent: HTMLIonContentElement;
    ionContentNotTopScroll: Boolean = false;

    async componentDidLoad() {
        this._htmlElements = { drawer: null, gestureTarget: null, content: null };
        this._htmlElements.drawer = this.el;

        this.el.style.setProperty("height", this.getWHWindow().height + "px");

        this.nav.addEventListener("ionNavDidChange", async () => {
            let activeContent: any = await this.nav.getActive();
            this.initActiveContentNav(activeContent);
        });

        this.setPositions(this.positions);
    }

    addGesture(target: HTMLElement) {
        if (this.gesture) {
            this.gesture.destroy();
        }

        this.gesture = createGesture({
            el: target,
            threshold: 0,
            gestureName: 'drawer-drag',
            disableScroll: true,
            passive: true,
            direction: "y",
            onStart: ev => this.onStart(ev),
            onMove: ev => this.onMove(ev),
            onEnd: ev => this.onEnd(ev)
        });

        if (this.gesture)
            this.gesture.enable(!this.disableGesture);
    }

    @Watch("disableGesture")
    setDisableGesture(value: boolean) {
        if (!value && !this.gesture && this._htmlElements.gestureTarget) {
            this.gesture = createGesture({
                el: this._htmlElements.gestureTarget,
                threshold: 0,
                gestureName: 'drawer-drag',
                disableScroll: true,
                passive: true,
                direction: "y",
                onStart: ev => this.onStart(ev),
                onMove: ev => this.onMove(ev),
                onEnd: ev => this.onEnd(ev)
            });
        }
        if (this.gesture)
            this.gesture.enable(!value);
    }

    maxTop: number;
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
//distanceMaginBottom: 0,
                    //    distanceMarginTop: 0
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
                if (!position.nextPosition) {
                   this.maxTop = position.distanceToTop;
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

        if (this.gesture) {
            this.gesture.enable(false);
        }

        this.el.style.setProperty("transform", `translateY(${dimensionesWin.height}px)`);
        this.el.style.setProperty("display", "inline");

        this.hidden = false;

        let animation = createAnimation()
            .addElement(this.el)
            .duration(notAnimate ? 0 : 250)
            .easing(this.easing)
            .to('transform', `translateY(${positionToShow.distanceToTop}px)`);

        return animation.play().then(() => {
            this._position = positionToShow;
            this.positionName = positionToShow.name;
            this.setDisableGesture(this.disableGesture);

            this.setHeightContentCurrentPosition();
        });
    }

    setHeightContentCurrentPosition() {
        if (this._position.nextPosition)
            this.setHeightContent("MAX");
        else
            this.setHeightContent("CONTENT");
    }

    margenPosition: number = 50;
    getPositionByPosY(posY: number, direccion: "UP" | "DOWN"): ResultgetPositionByPosY {
        let result: ResultgetPositionByPosY = { newPosition: null, close: false };

        result.newPosition = this._positions.find((position) => {
            if (direccion === "UP") {
                if (position.previousPosition && posY < position.previousPosition.distanceToTop + 5 && (!position.nextPosition || (position.nextPosition && posY > position.distanceToTop - 5)))
                    return position;
                if (!position.previousPosition && posY > position.distanceToTop - 5)
                    return position;
            }
            if (direccion === "DOWN") {
                if (position.nextPosition && posY > position.nextPosition.distanceToTop + 5 && (!position.previousPosition || (position.previousPosition && posY < position.distanceToTop + 5)))
                    return position;
                if (!position.nextPosition && posY < position.distanceToTop + 5)
                    return position;
            }
        });

        if (posY > this.getWHWindow().height) {
            result.close = true;
            return result;
        }

        return result;
    }

    startPosTopMove: number;
    enTouchMove: Boolean = false;

    cancelMove: Boolean = false;

    onStart(ev: GestureDetail) {
        if ((window as any).stopOnTouch) {
            debugger;
        }


        if ((ev.event as any).path) {
            let elementos: HTMLElement[] = (ev.event as any).path;
            let eleContent = elementos.find((el) => {
                return el === this._htmlElements.content;
            });
            if (eleContent && this.ionContentNotTopScroll) {
                this.cancelMove = true;
                return;
            }
        }

        this.cancelMove = false;
        this.ultimoTranslateRechazado = undefined;
        if (this._position.nextPosition)
            this.setHeightContent("MAX");

        this.startPosTopMove = this._htmlElements.drawer.getBoundingClientRect().top;
        // console.log("Start", ev);
    }

    onMove(ev: GestureDetail) {
        if (this.cancelMove)
            return;
        let calc = this.startPosTopMove + ev.deltaY;
        //console.log("Move", ev);
        //console.log(`${this.startPosTopMove} + ${ev.deltaY} = ${calc}`);
        if (calc >= this.maxTop)
            this.setTranslateY(calc);
    }

    onEnd(ev: GestureDetail) {
        if (this.cancelMove)
            return;
        //console.log("MovEnd", ev);
        this.gesture.enable(false);
        this.changeStateByGesture(ev);
        this.startPosTopMove = 0;
        this.setDisableGesture(this.disableGesture);
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
            await this.setTranslateY(posY);
            this.setHeightContentCurrentPosition();
            return;
        }

        if (this.gesture)
            this.gesture.enable(false);

        let calculatePosition: ZTPositionDrawer = this._position;

        let calc = this.startPosTopMove + ev.deltaY;
        let result: ResultgetPositionByPosY = this.getPositionByPosY(calc, this.getDirectionGesture(ev));

        if (result.close) {
            if (this.hideOnPositionZero) {
                this.hideEvent.emit();
                return this.hide();
            }
        }

        if (result.newPosition) {
            calculatePosition = result.newPosition;
        }

        if (calculatePosition != this._position) {
            await this.setPosition(calculatePosition);
            return;
        }

        await this.setTranslateY(this._position.distanceToTop, true);
        this.setHeightContentCurrentPosition();
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
            if (newPosition && this._position.name !== newPosition.name) {
                this.ultimoTranslateRechazado = null;
                return await this.setPosition(newPosition);
            }
        }
        setTimeout(() => {
            this.positionName = this._position ? this._position.name : null;
        }, 10);
    }

    async setPosition(value: ZTPositionDrawer): Promise<void> {
        this.ultimoTranslateRechazado = null;
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

        this.ultimoTranslateRechazado = undefined;
        this.setHeightContent("MAX");
        await this.setTranslateY(value.distanceToTop, true);

        this.setHeightContentCurrentPosition();
        this.setDisableGesture(this.disableGesture);
    }

    disableSetContentHeight: boolean = false;

    isChangingPosition: Boolean = false;

    enMovimiento: boolean = false;
    ultimoTranslateRechazado: { posY: number } | undefined = undefined;
    ultimoValue: number = 0;

    getDuration(posY, el) {
        let offset = el.getBoundingClientRect();
        let delta = Math.abs(posY - offset.top)
        let duration = (delta / 100) * this.coefDuration;
        //console.log(`PosY:${posY} Delta:${delta} Duration:${duration}`);
        return duration;
    }

    async setTranslateY(posY: number, applyAnimation: boolean = false): Promise<void> {
        return new Promise(async (resolve) => {

            if (this.enMovimiento && !applyAnimation) {
                if (this.ultimoValue === posY)
                    this.ultimoTranslateRechazado = { posY: posY };
                return resolve();
            }

            if (applyAnimation) {
                this.ultimoTranslateRechazado = undefined;
            }

            if (this.ultimoValue === posY) {
                return resolve();
            }

            this.enMovimiento = true;

            let duration = this.getDuration(posY, this.el);

            let animation = createAnimation()
                .addElement(this.el);

            if (applyAnimation) {
                animation.duration(this.getDuration(posY, this.el))
                    .easing(duration < 700 ? "cubic-bezier(.58,.61,.79,.8)" : this.easing)
            }

            animation.to('transform', `translateY(${posY}px)`);

            this.ultimoValue = posY;

            animation.play().then(async () => {
                if (this.ultimoTranslateRechazado) {
                    let ultimoTranslate = this.ultimoTranslateRechazado;
                    this.ultimoTranslateRechazado = undefined;
                    // console.log("ultimoTranslateRechazado ", ultimoTranslate);
                    this.setTranslateY(ultimoTranslate.posY, true).then(() => {
                        this.enMovimiento = false;
                        resolve();
                    });
                } else {
                    this.enMovimiento = false;
                    resolve()
                }
            }).catch(err => console.error(err));
        });
    }

    lastHeightContent: number = 0;
    setHeightContent(heightOf: "CONTENT" | "MAX") {
        let value: number = 0;
        //console.log(`setHeightContent ${heightOf}`);
        if (heightOf == "CONTENT") {
            //console.log(heightOf);
            let topcontent = this._htmlElements.content.getBoundingClientRect().top;
            //console.log(topcontent);
            if (this.getWHWindow().height > topcontent) {
                value = this.getWHWindow().height - topcontent;
            } else {
                value = this.getWHWindow().height;
            }
            value = Math.abs(value);
        }

        if (heightOf == "MAX") {
            //console.log(heightOf);
            //  value = this.getWHWindow().height;
            // value = Math.abs(value);
            value = 10000;
            this._htmlElements.content.style.setProperty("height", value + "px");
            this.lastHeightContent = value;
            return;
        }

        if (this.lastHeightContent < value || (heightOf === "CONTENT" && this.lastHeightContent !== value)) {
            //console.log(`setProperty("height", ${value} + "px")`);
            this._htmlElements.content.style.setProperty("height", value + "px");
            this.lastHeightContent = value;
        }
    }

    render() {
        return (<Host>
            <ion-nav ref={elNsv => this.nav = elNsv} ></ion-nav>
        </Host>);
    }

}
