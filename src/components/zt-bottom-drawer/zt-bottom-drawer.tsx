import { h, Prop, Watch, Host, Element, Component, Event, EventEmitter, Method } from '@stencil/core';
import { createGesture, createAnimation, Gesture, Animation, GestureDetail, ViewController, TransitionDoneFn, NavOptions } from '@ionic/core';

export type ZTPositionDrawer = { index: number, name: string, distanceTo: "BOTTOM" | "TOP", distance: number, distanceToTop: number, previousPosition: ZTPositionDrawer, nextPosition: ZTPositionDrawer };
export type ZTHTMLElementsDrawer = { drawer: HTMLElement, gestureTarget: HTMLElement, content: HTMLElement };

type ResultgetPositionByPosY = { newPosition: ZTPositionDrawer, close: boolean };

@Component({
    tag: 'zt-bottom-drawer',
    styleUrl: 'zt-bottom-drawer.css',
    shadow: false
})
export class ZTBottomDrawer {
    @Element() el: HTMLElement;

    animation: Animation;
    gesture?: Gesture;

    @Prop({ reflect: true }) disableGesture: boolean = false;

    @Prop({ reflect: true }) forceScrollY: boolean = false;

    @Prop({ reflect: true, mutable: true }) positionName: string;

    @Prop({ mutable: true, reflect: true }) hideOnPositionZero: boolean = false;

    @Prop({ mutable: true, reflect: true }) hidden: boolean = false;
    @Prop({ mutable: true, reflect: true }) coefDuration: number = 75;

    @Prop({ reflect: true }) positions: string = "close-b-10,bottom-b-200,middle-b-450,top-t-60";

    _positions: ZTPositionDrawer[];
    _position: ZTPositionDrawer;

    _htmlElements: ZTHTMLElementsDrawer;
    nav: HTMLIonNavElement;

    @Prop({ reflect: true }) autoHeightContent: boolean = true;

    @Event() ztChangePositionEvent: EventEmitter<{ positionName: string, lastPositionName: string, htmlElements: ZTHTMLElementsDrawer }>;

    @Event() ztHideEvent: EventEmitter<ZTHTMLElementsDrawer>;

    @Event() ztNavDidChange: EventEmitter<any>;
    @Event() ztNavWillChange: EventEmitter<any>;

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
    async goBack(opts?: NavOptions | null | undefined, done?: TransitionDoneFn | undefined): Promise<Boolean> {
        return this.nav.pop(opts, done);
    }

    @Method()
    async goBackToRoot(opts?: NavOptions | null | undefined, done?: TransitionDoneFn | undefined): Promise<Boolean> {
        return this.nav.popToRoot(opts, done);
    }

    @Method()
    async goBackToIndex(index: number, opts?: NavOptions | null | undefined, done?: TransitionDoneFn | undefined): Promise<Boolean> {
        return this.nav.popTo(index, opts, done);
    }

    @Method()
    async getNavActive(): Promise<ViewController> {
        return this.nav.getActive();
    }

    @Method()
    async getNavCurrentComponent(): Promise<any> {
        return this.currentComponent;
    }

    isElement(o) {
        return (
            typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
                o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
        );
    }
    currentComponent: any;

    navegando: boolean = false;
    @Method()
    async pushNav(component: any, propsComponent: any, selectorGesture?: string, selectorContent: string = "ion-content"): Promise<boolean> {
        if (this.navegando)
            return;

        this.navegando = true;

        await new Promise<boolean>(async (resolve, reject) => {
            if (typeof (component) == "string")
                component = document.createElement(component);

            if (this.isElement(component)) {
                component.__zt_navDrawer = {
                    resolve: resolve,
                    reject: reject,
                    selectorContent: selectorContent,
                    selectorGesture: selectorGesture
                };
                await this.nav.push(component, propsComponent);
            }
            return resolve(false);
        });

        this.navegando = false;

        this.setHeightContent("CONTENT");

    }

    _tagNameComponetActive: string;

    @Method()
    async getActiveComponentTagName(): Promise<string> {
        return this._tagNameComponetActive;
    }

    async navDidChange() {
        let contentActive: any = await this.nav.getActive();
        this._tagNameComponetActive = contentActive.component.tagName;

        contentActive.__zt_init = true;
        contentActive.__zt_selectorContent = contentActive.component.__zt_navDrawer.selectorContent;
        contentActive.__zt_selectorGesture = contentActive.component.__zt_navDrawer.selectorGesture;

        await this.initActiveContentNav(contentActive);

        contentActive.component.__zt_navDrawer.resolve(true);

        this.ztNavDidChange.emit(contentActive)
    }

    async initActiveContentNav(contentActive: any) {
        if (contentActive && contentActive.__zt_init) {

            this.currentComponent = contentActive.element;
            this._htmlElements.content = contentActive.element.querySelector(contentActive.__zt_selectorContent);

            let gestureTarget: any = contentActive.element;

            if (contentActive.__zt_selectorGesture)
                gestureTarget = contentActive.element.querySelector(contentActive.__zt_selectorGesture);

            this.addGesture(gestureTarget);

            if (this._htmlElements &&
                this._htmlElements.content &&
                this._htmlElements.content.nodeName == "ION-CONTENT" &&
                this.autoHeightContent) {

                if (this.ionContent && this.handlerIonScroll) {
                    this.ionContent.removeEventListener("ionScroll", this.handlerIonScroll)
                }

                this.ionContent = this._htmlElements.content as HTMLIonContentElement;
                this.ionContent.scrollEvents = true;
                this.handlerIonScroll = (ev: any) => {
                    this.ionContentNotTopScroll = ev && ev.detail && ev.detail.scrollTop !== 0;
                };
                this.ionContent.addEventListener("ionScroll", this.handlerIonScroll);
            } else {
                this.ionContent = this._htmlElements.content as HTMLIonContentElement;
            }

            if (!this._position || (this._position && this.positionName != this._position.name))
                await this.show(this.positionName);
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
            onMove: (ev: GestureDetail) => { this.onMove(ev) },
            onEnd: (ev: GestureDetail) => { this.onEnd(ev) }
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
                onMove: (ev: GestureDetail) => { this.onMove(ev) },
                onEnd: (ev: GestureDetail) => { this.onEnd(ev) }
            });
        }
        if (this.gesture)
            this.gesture.enable(!value);

        this.setForceScrollY(this.forceScrollY);
    }

    @Watch("forceScrollY")
    setForceScrollY(value: boolean) {
        if (!this.ionContent)
            return;

        if (this.disableGesture) {
            if (this.gesture)
                this.gesture.enable(false);
            this.ionContent.scrollY = value;
            if (!value) {
                this.ionContent.scrollToTop(200);
            }
        }
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
                        nextPosition: null
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
    async setAnimation() {
        this.animation = createAnimation()
            .addElement(this.el);

        this.animation
            .duration(1000)
            .fromTo('transform', `translateY(${this.getWHWindow().height}px)`, `translateY(${0}px)`);

        if (this._position) {
            this.startedAnimation = false;
            this.animation.progressStep(1 - this._position.distanceToTop / this.getWHWindow().height);
        }
    }

    @Method()
    async getCurrrentPositionDto(): Promise<ZTPositionDrawer> {
        return Object.assign({}, this._position);
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
    async hide() {
        this.gesture.enable(false);
        this.hidden = true;

        let animation = createAnimation()
            .addElement(this.el);

        let hidePos = this.getWHWindow().height + 10;
        animation
            .duration(this.getDuration(hidePos, this.el))
            .to('transform', `translateY(${hidePos}px)`).play().then(() => {
                this.el.style.setProperty("display", "none");
            });
    }

    @Method()
    async fixPosition(positionName: string) {
        await this.show(positionName);
        this.disableGesture = true;
        this.forceScrollY = true;
        this.setHeightContent("CONTENT");
    }

    @Method()
    async show(positionName: string) {
        if (!positionName) {
            return;
        }

        let positionToShow: ZTPositionDrawer = await this.getPositionByName(positionName);

        if (!positionToShow) {
            return;
        }

        this.positionName = positionName;

        if (this.gesture) {
            this.gesture.enable(false);
        }

        this.el.style.setProperty("display", "inline");
        this.setAnimation();
        this.hidden = false;

        let animation = createAnimation()
            .addElement(this.el);

        animation
            .duration(350)
            .fromTo('transform', `translateY(${this.getWHWindow().height}px)`, `translateY(${positionToShow.distanceToTop}px)`);

        //this.setHeightContent("MAX"); //--

        animation.play().then(() => {
            this._position = positionToShow;
            this.positionName = positionToShow.name;
            this.setDisableGesture(this.disableGesture);
            this.setHeightContent("CONTENT")
            this.setAnimation();
        });
    }


    deltaChangeSate: number = 5;
    getPositionByPosY(posY: number, direccion: "UP" | "DOWN"): ResultgetPositionByPosY {
        let result: ResultgetPositionByPosY = { newPosition: null, close: false };

        result.newPosition = this._positions.find((position) => {

            if (direccion === "UP") {
                if (position.previousPosition && posY < position.previousPosition.distanceToTop + this.deltaChangeSate && (!position.nextPosition || (position.nextPosition && posY > position.distanceToTop - this.deltaChangeSate)))
                    return position;
                if (!position.previousPosition && posY > position.distanceToTop - this.deltaChangeSate)
                    return position;
            }

            if (direccion === "DOWN") {
                if (position.nextPosition && posY > position.nextPosition.distanceToTop + this.deltaChangeSate && (!position.previousPosition || (position.previousPosition && posY < position.distanceToTop + this.deltaChangeSate)))
                    return position;
                if (!position.nextPosition && posY < position.distanceToTop + this.deltaChangeSate)
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

        if (this._position.nextPosition && this.ionContent)
            this.ionContent.scrollToTop(200);

        this.startPosTopMove = this._htmlElements.drawer.getBoundingClientRect().top;
        this.lastPositionY = this.startPosTopMove;
    }

    previusPositionY: number;
    lastPositionY: number;
    moveFast: boolean;
    moveFastAnimationProgress: Promise<void> | undefined;
    lastCalc: number;

    async onMove(ev: GestureDetail) {
        if (this.cancelMove)
            return;

        if (this.moveFastAnimationProgress)
            await this.moveFastAnimationProgress;

        this.lastCalc = this.startPosTopMove + ev.deltaY;

        if (this.lastCalc < this.maxTop)
            this.lastCalc = this.maxTop

        this.previusPositionY = this.lastPositionY;
        this.lastPositionY = ev.currentY;

    //    if (Math.abs(this.previusPositionY - this.lastPositionY) < 30)
     /*       if (this.moveFast) {
                setTimeout(() => this.animateMoveFast(), 300);
            } else {*/
                this.setTranslateY(this.lastCalc);
  /*          }
        else {
            this.moveFast = true;
            setTimeout(() => this.animateMoveFast(), 1000);
        }*/
    }

    async animateMoveFast(posY: number = -100) {
        if (this.moveFast) {

            if (posY == -100) {
                posY = this.lastCalc;
            }

            if (this.moveFastAnimationProgress) {
                await this.moveFastAnimationProgress;
            }

            this.moveFastAnimationProgress = new Promise((resolve) => {
                this.moveFast = false;
                let animation = createAnimation()
                    .addElement(this.el);

                animation
                    .duration(this.getDuration(posY, this.el))
                    .to('transform', `translateY(${posY}px)`);

                animation.play().then(() => {
                    this.setAnimation();
                    resolve();
                });
            })
        }
    }

    async onEnd(ev: GestureDetail): Promise<boolean> {
        if (this.cancelMove)
            return;

        this.moveFast = false;
        this.gesture.enable(false);

        if (this.moveFastAnimationProgress) {
            await this.moveFastAnimationProgress;
        }

        this.changeStateByGesture(ev);
        this.startPosTopMove = 0;
        this.setDisableGesture(this.disableGesture);
        return true;
    }

    getDirectionGesture(): "UP" | "DOWN" {
        let deltaY = this.lastPositionY - this.previusPositionY;
        if (deltaY / Math.abs(deltaY) * -1 > 0)
            return "UP"
        else
            return "DOWN"
    }

    async changeStateByGesture(ev: GestureDetail) {
        if (Math.abs(ev.deltaY) == 0) {
            let posY: number = this._position.distanceToTop;
            await this.setTranslateY(posY);
            //this.setHeightContent("MA");
            return;
        }

        if (this.gesture)
            this.gesture.enable(false);

        let calculatePosition: ZTPositionDrawer = this._position;

        let calc = this.startPosTopMove + ev.deltaY;
        let result: ResultgetPositionByPosY = this.getPositionByPosY(calc, this.getDirectionGesture());

        if (result.close) {
            if (this.hideOnPositionZero) {
                this.ztHideEvent.emit();
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
        this.setDisableGesture(this.disableGesture);
        this.setHeightContent("CONTENT");
    }

    windowh: number = -1;
    getWHWindow(ignoreCache: boolean = false) {
        let result = this.windowh;
        if (ignoreCache) {
            result = window.innerHeight
                || document.documentElement.clientHeight
                || document.body.clientHeight;
        }
        if (result === -1) {
            result = this.windowh = window.innerHeight
                || document.documentElement.clientHeight
                || document.body.clientHeight;
        }
        return {
            height: result,
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
                return await this.setPosition(newPosition);
            }
        }
        setTimeout(() => {
            this.positionName = this._position ? this._position.name : null;
        }, 10);
    }

    @Method()
    async setPositionByName(name: string): Promise<void> {
        let newPosition = await this.getPositionByName(name);
        if (newPosition && this._position.name !== newPosition.name) {
            return await this.setPosition(newPosition);
        }
    }

    @Method()
    async setPosition(value: ZTPositionDrawer): Promise<void> {
        if (this.gesture)
            this.gesture.enable(false);

        const lastPosition = this._position.name;

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

            let currentComponent = await this.getNavCurrentComponent();

            if (currentComponent && currentComponent.canDeactivatePositionDrawer) {
                let result = await currentComponent.canDeactivatePositionDrawer(this._position.name, value.name);
                if (!result) {
                    value = this._position;
                }
            }

            if (currentComponent && currentComponent.canActivatePositionDrawer) {
                let result = await currentComponent.canActivatePositionDrawer(value.name, this._position.name);
                if (!result) {
                    value = this._position;
                }
            }

            this._position = value;
            this.positionName = this._position.name;
            this.ztChangePositionEvent.emit({ positionName: this.positionName, lastPositionName: lastPosition, htmlElements: this._htmlElements });
        }

        if (!value.distanceToTop) {
            let dimensionesWin = this.getWHWindow();
            if (value.distanceTo === "TOP") {
                value.distanceToTop = value.distance;
            } else {
                value.distanceToTop = dimensionesWin.height - value.distance;
            }
        }

        this.setHeightContent("MAX");//--

        await this.setTranslateY(value.distanceToTop, true);

        this.setHeightContent("CONTENT");
        this.setDisableGesture(this.disableGesture);

    }

    ultimoValue: number = 0;

    getDuration(posY, el) {
        let offset = el.getBoundingClientRect();
        let delta = Math.abs(posY - offset.top)
        let duration = (delta / 100) * this.coefDuration;
        //console.log(`PosY:${posY} Delta:${delta} Duration:${duration}`);
        return duration;
    }

    startedAnimation: boolean = false;
    @Method()
    async setTranslateY(posY: number, applyAnimation: boolean = false): Promise<void> {
        return new Promise(async (resolve) => {

            if (this.ultimoValue === posY) {
                return resolve();
            }

            this.ultimoValue = posY;

            if (applyAnimation) {
                this.startedAnimation = false;

                let animation = createAnimation()
                    .addElement(this.el);
                animation
                    .duration(this.getDuration(posY, this.el))
                    .to('transform', `translateY(${posY}px)`);

                animation.play().then(async () => {
                    await this.setAnimation();
                    resolve();
                });
            } else {
                if (!this.startedAnimation) {
                    this.animation.progressStart(true, .1);
                    this.startedAnimation = true;
                }
                this.animation.progressStep(1 - posY / this.getWHWindow().height);
                resolve();
            }
        });
    }

    setHeightContent(heightOf: "CONTENT" | "MAX") {
        if (this.ionContent) {
            if (this.forceScrollY && this.disableGesture) {
                this.ionContent.scrollY = true;
                //  heightOf = "CONTENT";
            } else {
                if (heightOf === "CONTENT") {
                    this.ionContent.scrollY = true;
                }
                if (heightOf === "MAX") {
                    this.ionContent.scrollToTop(200);
                    this.ionContent.scrollY = false;
                }
            }
        }
        this.setHeightContainer(heightOf);
    }

    setHeightContainer(heightOf: "CONTENT" | "MAX", ignorarCacheWindowHeight: boolean = false) {
        const h = this.getWHWindow(ignorarCacheWindowHeight).height;
        let value = h;

        if (heightOf === "MAX") {
            value = value - this.maxTop;
        } else {
            if (!this.ionContent || this.navegando)
                return;
            const brContent = this.ionContent.getBoundingClientRect();
            const topcontent = brContent.top;
            const topParent = this.el.getBoundingClientRect().top;

            if (h > topcontent) {
                value = value - topParent;
            }
        }
        this.nav.style.setProperty("height", value + "px");
    }

    @Method()
    async refreshSizeContent() {
        return this.setHeightContainer("CONTENT", true);
    }

    @Method()
    async setScrollToTop(duration: number = 200) {
        if (this.ionContent) {
            return this.ionContent.scrollToTop(duration);
        }
    }

    render() {
        return (<Host>
            <ion-nav onIonNavWillChange={() => { this.navWillchange() }} onIonNavDidChange={() => { this.navDidChange(); }} ref={elNsv => this.nav = elNsv} ></ion-nav>
        </Host>);
    }

    navWillchange() {
        this.ztNavWillChange.emit();
    }
}
