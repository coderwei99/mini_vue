function createApp(root) {
  return {
    mount(select) {
      const container = document.querySelector(select)
      console.log(container);
      let isMounted = false
      let oldVnode = null
      watchEffect(function () {
        if (!isMounted) {
          oldVnode = root.render()
          mount(oldVnode, container)
          isMounted = true
        } else {
          const newVnode = root.render()
          patch(oldVnode, newVnode)
          oldVnode = newVnode
        }
      })
    }
  }
}