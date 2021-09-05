class Dep {
  constructor() {
    this.subscribers = new Set()
  }

  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect)
    }
  }

  notify() {
    this.subscribers.forEach(item => {
      item()
    })
  }
}

let activeEffect = null
function watchEffect(effect) {
  activeEffect = effect
  effect()
  activeEffect = null
}

const targetMap = new WeakMap()
function getDep(target, key) {
  // 1.根据对象取出对应的Map对象
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  // 2.取出具体的dep对象
  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Dep()
    depsMap.set(key, dep)
  }
  return dep
}

// vue3的响应式原理
function reactive(raw) {
  return new Proxy(raw, {
    get(target, key) {
      const dep = getDep(target, key)
      dep.depend()
      return target[key]
    },
    set(target, key, newValue) {
      const dep = getDep(target, key)
      target[key] = newValue
      dep.notify()
    }
  })
}





const info = reactive({ counter: 100, name: 'dw' })
const foo = reactive({ height: 200 })
const dep = new Dep()
// const info = { counter: 100 }
// const dep = new Dep()
watchEffect(function () {
  console.log(info.counter * 2);
})
watchEffect(function () {
  console.log(info.counter * 10);
})
watchEffect(function () {
  console.log(info.counter * 10, info.name);
})
watchEffect(function () {
  console.log(foo.height);
})
// info.counter++
// info.name = 'dw'
// // dep.notify()

foo.height = 111