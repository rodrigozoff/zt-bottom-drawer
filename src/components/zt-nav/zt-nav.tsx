import { h,   Element, Component, Method } from '@stencil/core';
import {  ViewController, NavComponent, ComponentProps, NavOptions, TransitionDoneFn } from '@ionic/core';

@Component({
    tag: 'zt-nav',
    shadow: false
})
export class ZTNav {
    @Element() el: HTMLElement;

    nav: HTMLIonNavElement;

    @Method()
    async getNav(): Promise<HTMLIonNavElement> {
        return this.nav;
    }

    @Method()
    async getActive(): Promise<ViewController> {
        return this.nav.getActive();
    }

    isElement(o) {
        return (
            typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
                o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName === "string"
        );
    }    

    currentComponent: any;
    @Method()
    async pushNav<T extends NavComponent>(component: any, componentProps?: ComponentProps<T> | null | undefined, opts?: NavOptions | null | undefined, done?: TransitionDoneFn | undefined): Promise<boolean> {
        if (typeof (component) == "string")
            component = document.createElement(component);

        if (this.isElement(component)) {
            if (this.currentComponent && this.currentComponent.canDeactivate) {
                let result: boolean = await this.currentComponent.canDeactivate(componentProps,component);
                if (!result) {
                    return false;
                }
            }

            if (component.canActivate) {
                let result: boolean = await component.canActivate(componentProps,this.currentComponent);
                if (!result) {
                    return false;
                }
            }
            this.currentComponent = component;
            await this.nav.push(component, componentProps,opts,done);
            return true;
        }
        return false;
    }

    render() {
        return (
            <ion-nav ref={elNsv => this.nav = elNsv} />
      );
    }

}
