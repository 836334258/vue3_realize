import { mutableHandlers } from './baseHandlers';


export const reactiveMap=new WeakMap()
export const readonlyMap=new WeakMap()
export const shallowReadonlyMap=new WeakMap()

export const enum ReactiveFlags{
  IS_REACTIVE="__v_isReactive",
  RAW = "__v_raw",
}

export function reactive(target){
  return createReactiveObject(target,reactiveMap,mutableHandlers)
}

export function isReactive(value){
  return !!value[ReactiveFlags.IS_REACTIVE]
}

export function toRaw(value){
  if(!value[ReactiveFlags.RAW]){
    return value
  }
  return value[ReactiveFlags.RAW]
}


function createReactiveObject(target,proxyMap,baseHandlers){
  const existingProxy=proxyMap.get(target)
  if(existingProxy){
    return existingProxy;
  }

  const proxy=new Proxy(target,baseHandlers)

  proxyMap.set(target,proxy)
  return proxy
}