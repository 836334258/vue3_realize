import { isProxy, isReactive, isReadonly, readonly } from "../src/reactive";

describe("readonly",()=>{
  it("should make nested values readonly",()=>{
    const original = { foo: 1, bar: { baz: 2 } };
    const wrapped=readonly(original)
    expect(wrapped).not.toBe(original)
    expect(isProxy(wrapped)).toBeTruthy()
    expect(isReactive(wrapped)).toBeFalsy()
    expect(isReadonly(wrapped)).toBeTruthy()
    expect(isReactive(original)).toBeFalsy()
    expect(isReadonly(original)).toBeFalsy()
    expect(isReactive(wrapped.bar)).toBe(false);
    expect(isReadonly(wrapped.bar)).toBe(true);
    expect(isReactive(original.bar)).toBe(false);
    expect(isReadonly(original.bar)).toBe(false);
    // get
    expect(wrapped.foo).toBe(1);
  })
})