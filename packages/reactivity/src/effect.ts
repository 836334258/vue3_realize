import { extend } from './../../shared/src/index';
import { createDep } from './dep';


let activeEffect= void 0;
let shouldTrack=false
const targetMap=new WeakMap()

export class ReactiveEffect{
  active = true;
  deps = [];
  constructor(public fn,public scheduler?){
    console.log("创建 ReactiveEffect 对象");
  }

  run(){
    console.log("run");

    // 开始收集依赖
    shouldTrack=true
    // 执行的时候给全局的 activeEffect 赋值
    // 利用全局属性来获取当前的 effect
    activeEffect=this as any

    // 执行用户传入的 fn
    console.log("执行用户传入的 fn");
    const result=this.fn()

     // 重置
     shouldTrack = false;
     activeEffect = undefined;
    return result
  }
}

export function isTracking(){
  return shouldTrack && activeEffect!==undefined 
 }


export function effect(fn,options={}){
  const _effect=new ReactiveEffect(fn)
  extend(_effect,options)
  _effect.run()
  const runner:any=_effect.run.bind(_effect)
  runner.effect=_effect
  return runner
}


export function triggerEffects(dep){
   // 执行收集到的所有的 effect 的 run 方法
   for(const effect of dep){
    effect.run()
   }
}

export function trackEffects(dep){
  // 用 dep 来存放所有的 effect

  // TODO
  // 这里是一个优化点
  // 先看看这个依赖是不是已经收集了，
  // 已经收集的话，那么就不需要在收集一次了
  // 可能会影响 code path change 的情况
  // 需要每次都 cleanupEffect
  // shouldTrack = !dep.has(activeEffect!);
  if(!dep.has(activeEffect)){
    dep.add(activeEffect);
    (activeEffect as any).deps.push(dep);
  }
}

export function triggerRefValue(ref){
  triggerEffects(ref.dep)
}


export function trigger(target,type,key){
    // 1. 先收集所有的 dep 放到 deps 里面，
  // 后面会统一处理
  let deps:Array<any>=[]

  const depsMap=targetMap.get(target)
  if(!depsMap) return

  // 暂时只实现了 GET 类型
  // get 类型只需要取出来就可以
  const dep=depsMap.get(key)
  // 最后收集到 deps 内
  deps.push(dep);
  const effects: Array<any> = [];
  deps.forEach((dep) => {
    // 这里解构 dep 得到的是 dep 内部存储的 effect
    effects.push(...dep);
  });
  // 这里的目的是只有一个 dep ，这个dep 里面包含所有的 effect
  // 这里的目前应该是为了 triggerEffects 这个函数的复用
  triggerEffects(createDep(effects));
}


export function track(target,type,key){
  if(!isTracking()){
    return
  }
  console.log(`触发 track -> target: ${target} type:${type} key:${key}`);
    // 1. 先基于 target 找到对应的 dep
  // 如果是第一次的话，那么就需要初始化
  let depsMap=targetMap.get(target)
  if(!depsMap){
     // 初始化 depsMap 的逻辑
    depsMap=new Map()
    targetMap.set(target,depsMap)
  }
  let dep=depsMap.get(key)
  if(!dep){
    dep=createDep()
    depsMap.set(key,dep)
  }
  trackEffects(dep)
}