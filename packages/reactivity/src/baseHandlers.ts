import { isObject } from './../../shared/src/index'
import { reactive, ReactiveFlags, reactiveMap, readonlyMap, shallowReadonlyMap } from './reactive'

const get = createGetter()
const set = createSetter()

function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key, receiver) {
    const isExistInReactiveMap = () => key === ReactiveFlags.RAW && reactiveMap.get(target)
    const isExistInReadonlyMap = () =>
    key === ReactiveFlags.RAW && receiver === readonlyMap.get(target);
    const isExistInShallowReadonlyMap = () => key === ReactiveFlags.RAW && receiver === shallowReadonlyMap.get(target)
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (
      isExistInShallowReadonlyMap() ||
      isExistInReactiveMap() || 
      isExistInReadonlyMap()
    ) {
      return target
    }

    const res = Reflect.get(target, key, receiver)
    if (!isReadonly) {
    }

    if (isObject(res)) {
      return reactive(res)
    }

    return res
  }
}

function createSetter() {
  return function set(target, key, value, receiver) {
    const result = Reflect.set(target, key, value, receiver)
    return result
  }
}

export const mutableHandlers = {
  get,
  set,
}
