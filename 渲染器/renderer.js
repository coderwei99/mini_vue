const h = (tag, props, children) => {
  // vnode 就是一个javascript对象
  return {
    tag,
    props,
    children
  }
}

const mount = (vnode, container) => {
  // 1.创建出一份vnode，并且在vnode上保留一份el
  const el = vnode.el = document.createElement(vnode.tag)

  //2.处理props
  if (vnode.props) {
    for (const key in vnode.props) {
      const value = vnode.props[key]

      // 边界判断：处理props传入事件函数
      if (key.startsWith('on')) {
        el.addEventListener(key.slice(2).toLowerCase(), value)
        console.log(value);
      } else {
        el.setAttribute(key, value)
      }
    }
  }

  // 3.处理children
  if (vnode.children) {
    if (typeof vnode.children === 'string') {
      el.textContent = vnode.children
    } else {
      vnode.children.forEach(item => {
        // 这一步重点：递归调用mount，就能够处理children里面一个个item里面包含的children也包含数组的情况
        mount(item, el)
      });
    }
  }

  // 4. 将我们的el挂载到container
  container.appendChild(el)
}



const patch = (n1, n2) => {
  // 如果连tag都不相同 直接删除旧vnode
  if (n1.tag !== n2.tag) {
    const n1ElParent = n1.el.parentElement
    n1ElParent.removeChild(n1.el)
    mount(n2, n1ElParent)
  } else {
    // 处理tag相同的情况
    // 1.判断一种情况,如果新旧vnode的props存在相同的属性并且该属性的值也相同,那么选择保留
    //     1.1: n1.el是一个对象，所以n2和el保存的都是n1的引用，修改el的时候其他的也会发生变化
    const el = n2.el = n1.el

    // 2.处理props
    const oldProps = n1.props || {} //如果el.props为空，给newProps赋值一个空对象
    const newProps = n2.props || {} //如果el.props为空，给oldProps赋值一个空对象
    //     2.1 获取所有newProps添加到el
    for (const key in newProps) {
      const newValue = newProps[key]
      const oldValue = oldProps[key]
      if (newValue !== oldValue) {
        // 边界判断：处理props传入事件函数
        if (key.startsWith('on')) {
          el.addEventListener(key.slice(2).toLowerCase(), newValue)
        } else {
          el.setAttribute(key, newValue)
        }
      }
    }

    //    2.2  删除旧的props
    for (const key in oldProps) {
      if (key.startsWith('on')) {
        const value = oldProps[key]
        el.removeEventListener(key.slice(2).toLowerCase(), value)
      }
      if (!(key in newProps)) {
        el.removeAttribute(key)
      }
    }

    // 3.处理children
    const oldChildren = n1.children || []
    const newChildren = n2.children || []

    if (typeof newChildren === 'string') { //情况一：newChildren是一个字符串。直接旧节点即可，也可以做判断新旧节点的字符串是否相等
      el.innerHTML = newChildren
    } else {
      // 情况二： newChildren 是一个数组
      if (typeof oldChildren === 'string') { //如果旧节点是一个字符串，新节点是数组。则需要将纠结点移除，然后添加新节点
        el.innerHTML = '',
          newChildren.forEach(item => {
            mount(item, el)
          })
      } else {
        // 定义commonlength，将新旧节点中短的一方的长度赋值给他，然后后续添加卸载节点的时候就可以使用commonlength来获取多余的节点了
        const commonlength = Math.min(oldChildren.length, newChildren.length)
        // 不考虑存在key的情况，不移动任何节点，取最短的长度，直接进行patch操作
        for (let i = 0; i < commonlength; i++) {
          patch(oldChildren[i], newChildren[i])
        }

        // new[v1,v2,v3]
        // old[v1,v2,v4,v5,v6] 
        // 上述例子，如果旧children的长度比新的长，卸载多余的节点(v5,v6)\
        // debugger
        if (oldChildren.length > newChildren.length) {
          oldChildren.slice(commonlength).forEach(item => {
            // item.el就是当前的item的vnode，然后在父节点上直接移除item.el
            el.removeChild(item.el)
          })
        }

        // new[v1,v2,v4,v5,v6] 
        // old[v1,v2,v3]
        // 上述例子，如果新children的长度比旧的长，添加多余的节点(v5,v6)
        if (oldChildren.length > newChildren.length) {
          newChildren.slice(commonlength).forEach(item => {
            mount(item, el)
          })
        }

      }
    }


  }
}