import { h, Prop, Watch, Host, Element, Component, Event, EventEmitter, Method } from '@stencil/core';
import { createGesture, createAnimation, Gesture, Animation, GestureDetail, ViewController, TransitionDoneFn, NavOptions } from '@ionic/core';
import { ActiveComponent, PushNavOptions } from './zt-bottom-dawer';

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
    _tagNameComponetActive: string;
    _positions: ZTPositionDrawer[];
    _position: ZTPositionDrawer;

    _htmlElements: ZTHTMLElementsDrawer;
    nav: HTMLIonNavElement;

    @Prop({ reflect: true }) positionName: string;
    @Prop({ mutable: true, reflect: true }) hideOnPositionZero: boolean = false;
    @Prop({ mutable: true, reflect: true }) fixCurrentPosition: boolean = false;
    @Prop({ reflect: true, mutable: true }) disableGesture: boolean = false;
    @Prop({ reflect: true, mutable: true }) allowScroll: boolean = true;
    @Prop({ reflect: true }) positions: string = "close-b-10,bottom-b-200,middle-b-450,top-t-60";

    @Prop({ mutable: true, reflect: true }) hidden: boolean = false;
    @Prop({ mutable: true, reflect: true }) coefAnimationTime: number = 40;

    @Event() ztChangePositionEvent: EventEmitter<{ positionName: string, lastPositionName: string, htmlElements: ZTHTMLElementsDrawer }>;

    @Event() ztHideEvent: EventEmitter<ZTHTMLElementsDrawer>;

    @Event() ztNavDidChange: EventEmitter<any>;
    @Event() ztNavWillChange: EventEmitter<any>;

    @Watch("disableGesture")
    setDisableGesture(value: boolean) {
        if (!value && !this.gesture && this._htmlElements.gestureTarget) {
            this.gesture = createGesture({
                el: this._htmlElements.gestureTarget,
                threshold: 0,
                gestureName: 'drawer-drag',
                disableScroll: true, //!this.allowScroll,
                passive: true,
                direction: "y",
                onStart: ev => this.onStart(ev),
                onMove: (ev: GestureDetail) => { this.onMove(ev) },
                onEnd: (ev: GestureDetail) => { this.onEnd(ev) }
            });
        }
        if (this.gesture)
            this.gesture.enable(!value);
    }

    @Watch("allowScroll")
    setAllowScroll(value: boolean) {
        if (this.ionContent) {
            this.ionContent.scrollY = value;
            this.ionContent.scrollEvents = value;
        }
    }

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

    @Method()
    async saveStateCurrentComponent() {
        let contentActive: ActiveComponent = await this.nav.getActive() as unknown as ActiveComponent;

        contentActive.component.__zt_navDrawer.options.allowScroll = this.allowScroll;
        contentActive.component.__zt_navDrawer.options.disableGesture = this.disableGesture;
        contentActive.component.__zt_navDrawer.options.positionName = this.positionName;
        contentActive.component.__zt_navDrawer.options.positions = this.positions;
        contentActive.component.__zt_navDrawer.options.fixCurrentPosition = this.fixCurrentPosition;
    }

    ionContent: HTMLIonContentElement;
    currentComponent: any;
    navegando: boolean = false;

    @Method()
    async pushNav(component: string | HTMLElement, propsComponent: any, options: PushNavOptions): Promise<boolean> {

        if (this.navegando)
            throw new Error("The Bottom Drawer is navigating, wait after call again. Please use the promise.");

        if (!options) {
            options = {};
        }
        if (!options.positions && !this.positions)
            throw new Error("The position by default or in the options are required.");

        this.navegando = true;

        await new Promise<boolean>(async (resolve, reject) => {
            if (options && !options.selectorContent) {
                options.selectorContent = "ion-content";
            }
            if (typeof (component) == "string")
                component = document.createElement(component);

            if (this.isElement(component)) {
                (component as any).__zt_navDrawer = {
                    resolve: resolve,
                    reject: reject,
                    options: options
                };
                console.log(options);
                this.nav.push(component, propsComponent);
            }
        });

        this.navegando = false;
        this.setHeightContainer("CONTENT");
        return true;
    }

    @Method()
    async getActiveComponentTagName(): Promise<string> {
        return this._tagNameComponetActive;
    }

    async navDidChange() {
        let contentActive: ActiveComponent = await this.nav.getActive() as unknown as ActiveComponent;
        this._tagNameComponetActive = contentActive.component.tagName;

        const opts = contentActive.component.__zt_navDrawer.options;

        if (opts.allowScroll != undefined)
            this.allowScroll = opts.allowScroll;

        if (opts.disableGesture != undefined)
            this.disableGesture = opts.disableGesture;

        await Promise.all([this.initActiveContentNav(contentActive), new Promise<void>(async (resolve) => {
            if (opts.positions) {
                this.setPositions(opts.positions);
            }
            if (opts.positionName) {
                await this.setPositionByName(opts.positionName, true);
            }

            if (opts.fixCurrentPosition != undefined)
                this.fixCurrentPosition = opts.fixCurrentPosition;
            resolve();
        })]);

        contentActive.component.__zt_navDrawer.resolve(true);

        this.ztNavDidChange.emit(contentActive)
    }

    async initActiveContentNav(contentActive: any) {
        if (contentActive) {
            const opts: PushNavOptions = contentActive.component.__zt_navDrawer.options;
            this.currentComponent = contentActive.element;
            this._htmlElements.content = this.currentComponent.querySelector(opts.selectorContent);

            if (!this._htmlElements.content)
                throw new Error(`Bottom Drawer - Error - The selector ${opts.selectorContent} not found any element`)

            let gestureTarget: any = contentActive.element;

            if (opts.selectorGesture)
                gestureTarget = contentActive.element.querySelector(opts.selectorGesture);

            this.addGesture(gestureTarget);

            if (this._htmlElements &&
                this._htmlElements.content &&
                this._htmlElements.content.nodeName == "ION-CONTENT") {

                this.ionContent = this._htmlElements.content as HTMLIonContentElement;
                this.ionContent.scrollY = this.allowScroll;
                this.ionContent.scrollEvents = this.allowScroll;

            } else {
                this.ionContent = this._htmlElements.content as HTMLIonContentElement;
            }
        }
    }

    async componentDidLoad() {
        this._htmlElements = { drawer: null, gestureTarget: null, content: null };
        this._htmlElements.drawer = this.el;
        this.el.style.setProperty("height", this.getWHWindow().height + "px");
        this.setPositions(this.positions);
        this.setAnimation();
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
            passive: false,
            direction: "y",
            onStart: ev => { this.onStart(ev) },
            onMove: (ev: GestureDetail) => { this.onMove(ev) },
            onEnd: (ev: GestureDetail) => { this.onEnd(ev) }
        });

        if (this.gesture)
            this.gesture.enable(!this.disableGesture);
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

    async setAnimation() {
        this.animation = createAnimation()
            .addElement(this.el);

        this.animation
            .duration(1000)
            .fromTo('transform', `translateY(${this.getWHWindow().height}px)`, `translateY(0px)`);
        this.animation.progressStart(true, .1);

        if (this._position) {
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
        let hidePos = this.getWHWindow().height + 10;
        await this.setTranslateY(hidePos, true);
        this.el.style.setProperty("display", "none");
    }

    @Method()
    async show(positionName: string) {
        if (!positionName) {
            return;
        }
        this.el.style.setProperty("display", "inline");

        let positionToShow: ZTPositionDrawer = await this.getPositionByName(positionName);

        if (!positionToShow) {
            return;
        }

        await this.setPosition(positionToShow);

        this.hidden = false;
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
    //  contadorGesture: number = 0;

    onStart(ev: GestureDetail) {
        //  this.contadorGesture = this.contadorGesture + 1;
        if (this.fixCurrentPosition) {
            this.cancelMove = true;
            return;
        }

        if ((ev.event as any).path) {
            let elementos: HTMLElement[] = (ev.event as any).path;
            let eleContent = elementos.find((el) => {
                return el === this._htmlElements.content;
            });
            if (eleContent) {
                this.cancelMove = true;
                return;
                /*let ionContentTopScroll = this.ionContent.shadowRoot.querySelector("main").scrollTop === 0;
                let ionContentBootomScroll = this.ionContent.shadowRoot.querySelector("main").scrollTop === (this.ionContent.shadowRoot.querySelector("main").scrollHeight - this.ionContent.shadowRoot.querySelector("main").offsetHeight);
                if (!ionContentTopScroll && !ionContentBootomScroll) {
                    this.cancelMove = true;
                    return;
                }*/
            }
        }

        this.cancelMove = false;

        if (this.ionContent) {
            this.ionContent.scrollToTop(0)
            if (this.allowScroll) {
                this.ionContent.scrollY = false;
                this.ionContent.scrollEvents = false;
            }
        }

        this.setHeightContainer("MAX");

        this.startPosTopMove = this._htmlElements.drawer.getBoundingClientRect().top;
        this.lastPositionY = this.startPosTopMove;
        //       console.log(`onStart contador: ${this.contadorGesture}`);
        //       console.log(ev);
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
        //     console.log(`onMove contador: ${this.contadorGesture} translate to Y ${this.lastCalc}`);
        this.setTranslateY(this.lastCalc);
    }

    async onEnd(ev: GestureDetail): Promise<boolean> {
        if (this.cancelMove)
            return;

        this.moveFast = false;
        this.gesture.enable(false);

        if (this.ionContent && this.allowScroll) {
            this.ionContent.scrollY = true;
            this.ionContent.scrollEvents = true;
        }
        // console.log(`onEnd contador: ${this.contadorGesture}`);
        //  console.log(ev);
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
            this.setHeightContainer("CONTENT");
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
        this.setHeightContainer("CONTENT");
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

    /* @Watch('positionName')
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
     }*/

    @Method()
    async setPositionByName(name: string, force: boolean = false): Promise<void> {
        if (this.fixCurrentPosition && !force)
            throw new Error("The CurentPosition of the bottom drawer is fixed")

        let newPosition = await this.getPositionByName(name);

        if (newPosition && (force || (!this._position ||
            (this._position && this._position.name !== newPosition.name)))) {
            return await this.setPosition(newPosition, force);
        }
    }

    @Method()
    async setPosition(value: ZTPositionDrawer, force: boolean = false): Promise<void> {
        if (!value)
            return;

        if (this.fixCurrentPosition && !force)
            throw new Error("The CurentPosition of the bottom drawer is fixed")

        if (this.gesture)
            this.gesture.enable(false);

        const lastPosition = this._position ? this._position.name : undefined;

        if (!this._position || force || (this._position && value.name !== this._position.name)) {
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

        this.setHeightContainer("MAX");
        await this.setTranslateY(value.distanceToTop, true);
        this.setHeightContainer("CONTENT");
        this.setDisableGesture(this.disableGesture);
    }

    getDuration(delta: number) {
        let duration = (delta / 1000) * this.coefAnimationTime;
        return duration;
    }

    ultimoValuePosY: number = 0;
    animateRoloPromise: Promise<void> | undefined;
    intervalAnimation: number
    posyAnimate: number;

    async animateRolo(initialY: number, finalY: number) {
        if (this.animateRoloPromise)
            return this.animateRoloPromise

        const delta = Math.abs(initialY - finalY);
        const paso = delta / this.getDuration(delta);
        const signo: number = initialY > finalY ? -1 : 1;
        this.posyAnimate = initialY;
        this.animateRoloPromise = new Promise((resolve) => {
            this.intervalAnimation = setInterval(() => {
                this.posyAnimate = this.posyAnimate + paso * signo;
                this.animation.progressStep(1 - this.posyAnimate / this.getWHWindow().height);
                if ((signo > 0 && this.posyAnimate > finalY) || (signo < 0 && this.posyAnimate < finalY)) {
                    this.animation.progressStep(1 - finalY / this.getWHWindow().height);
                    clearInterval(this.intervalAnimation);
                    resolve();
                }
            }, this.getDuration(delta));
        });
        await this.animateRoloPromise;
        this.animateRoloPromise = undefined;
    }

    @Method()
    async setTranslateY(posY: number, applyAnimation: boolean = false): Promise<void> {
        return new Promise(async (resolve) => {

            if (this.ultimoValuePosY === posY) {
                return resolve();
            }

            if (!this.ultimoValuePosY) {
                this.animation.progressStep(1 - posY / this.getWHWindow().height);
            } else {
                if (applyAnimation)
                    await this.animateRolo(this.ultimoValuePosY, posY);
                else {
                    this.animation.progressStep(1 - posY / this.getWHWindow().height);
                }
            }
            this.ultimoValuePosY = posY;
            resolve();
        });
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
