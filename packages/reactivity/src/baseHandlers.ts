import { isObject } from './../../shared/src/index'
import { track, trigger } from './effect'
import { reactive, ReactiveFlags, reactiveMap, readonly, readonlyMap, shallowReadonlyMap } from './reactive'

const get = createGetter()
const set = createSetter()
const readonlyGet=createGetter(true)
const shallowReadOnlyGet=createGetter(true,true)

function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key, receiver) {
    const isExistInReactiveMap = () => key === ReactiveFlags.RAW && reactiveMap.get(target)
    const isExistInReadonlyMap = () =>
    key === ReactiveFlags.RAW && receiver === readonlyMap.get(target);
    const isExistInShallowReadonlyMap = () => key === ReactiveFlags.RAW && receiver === shallowReadonlyMap.get(target)
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if(key===ReactiveFlags.IS_READONLY){
      return isReadonly
    } 
    else if (
      isExistInShallowReadonlyMap() ||
      isExistInReactiveMap() || 
      isExistInReadonlyMap()
    ) {
      return target
    }

    const res = Reflect.get(target, key, receiver)
    if (!isReadonly) {
       // 在触发 get 的时候进行依赖收集
       track(target,'get',key)
    }

    if(shallow){
      return res
    }

    if (isObject(res)) {
      return isReadonly?readonly(res): reactive(res)
    }

    return res
  }
}

function createSetter() {
  return function set(target, key, value, receiver) {
    const result = Reflect.set(target, key, value, receiver)
     // 在触发 set 的时候进行触发依赖
    trigger(target, "set", key);
    return result
  }
}

export const readonlyHandlers={
  get:readonlyGet,
  set(target,key){
     // readonly 的响应式对象不可以修改值
     console.warn(
      `Set operation on key "${String(key)}" failed: target is readonly.`,
      target
    );
    return true
  }
}

export const mutableHandlers = {
  get,
  set,
}

export const shallowReadonlyHandlers={
  get:shallowReadOnlyGet,
  set(target,key){
     // readonly 的响应式对象不可以修改值
     console.warn(
      `Set operation on key "${String(key)}" failed: target is readonly.`,
      target
    );
    return true;
  }
}
