import { type VNode } from 'vue'

// recursive function to find VNodes with the class 'item'
export function findChildNodesWithClassName (nodes: any[], className: string): VNode[] {
  let result: VNode[] = []

  nodes.forEach((node) => {
    // check if the current node has the class 'item'
    // const hasItemClass = node.props?.class?.includes(className);
    const hasItemClass = node.type?.__name == className
    if (hasItemClass) {
      result.push(node)
    }

    // If the node has children and they are an array, recursively check them
    if (Array.isArray(node.children)) {
      result = result.concat(findChildNodesWithClassName(node.children, className))
    }
    // If the node's children are a render function, invoke the function and check the result
    /*
    else if (typeof node.children === 'object' && typeof node.children?.default === 'function') {
      const childNodes = node.children.default() as VNode[] // Call the render function to get VNodes
      result = result.concat(findChildNodesWithClassName(childNodes, className))
    }
      */
    // In some cases, children could be a single VNode or other structures
    else if (node.children && typeof node.children === 'object') {
      result = result.concat(findChildNodesWithClassName([node.children], className))
    }
  })

  return result
}
