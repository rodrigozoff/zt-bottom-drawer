export type PushNavOptions = {
    selectorContent?: string,
    selectorGesture?: string,
    positions?: string,
    positionName?: string,
    disableGesture?: boolean,
    fixCurrentPosition?: boolean,
    allowScroll?: boolean
}

export type ActiveComponent = {
    __zt_options: PushNavOptions,
    component: {
        __zt_navDrawer: {
            options: PushNavOptions,
            resolve:(arg:boolean)=>void
        }, tagName: string
    }
}


