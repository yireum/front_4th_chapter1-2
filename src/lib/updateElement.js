import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";

function updateAttributes(target, originNewProps, originOldProps) {
  const newProps = originNewProps || {};
  const oldProps = originOldProps || {};

  for (const attr in oldProps) {
    if (!(attr in newProps)) {
      if (attr.startsWith("on") && typeof newProps[attr] !== "function") {
        removeEvent(target, attr.slice(2).toLowerCase(), oldProps[attr]);
      } else {
        target.removeAttribute(attr);
      }
    }
  }

  for (const attr in newProps) {
    if (oldProps[attr] !== newProps[attr]) {
      if (attr === "className") {
        target.className = newProps[attr];
      } else if (
        attr.startsWith("on") &&
        typeof newProps[attr] === "function"
      ) {
        const eventName = attr.slice(2).toLowerCase();
        if (typeof oldProps[attr] === "function") {
          removeEvent(target, eventName, oldProps[attr]);
        }
        addEvent(target, eventName, newProps[attr]);
      } else if (attr === "style" && typeof newProps[attr] === "object") {
        Object.entries(newProps[attr]).forEach(([key, value]) => {
          target.style[key] = value;
        });
      } else {
        target.setAttribute(attr, newProps[attr]);
      }
    }
  }
}

export function updateElement(parentElement, newNode, oldNode, index = 0) {
  if (!newNode && oldNode) {
    parentElement.removeChild(parentElement.childNodes[index]);
    return;
  }

  if (!parentElement.childNodes[index]) {
    parentElement.appendChild(createElement(newNode));
    return;
  }

  if (!oldNode && newNode) {
    parentElement.appendChild(createElement(newNode));
    return;
  }

  if (typeof newNode === "string" || typeof newNode === "number") {
    if (newNode !== oldNode) {
      const newTextNode = document.createTextNode(String(newNode));
      parentElement.replaceChild(newTextNode, parentElement.childNodes[index]);
    }
    return;
  }

  if (newNode.type !== oldNode.type) {
    parentElement.replaceChild(
      createElement(newNode),
      parentElement.childNodes[index],
    );
    return;
  }

  updateAttributes(
    parentElement.childNodes[index],
    newNode.props,
    oldNode.props,
  );

  const newChildren = newNode.children || [];
  const oldChildren = oldNode.children || [];
  const maxLength = Math.max(newChildren.length, oldChildren.length);

  for (let i = 0; i < maxLength; i++) {
    updateElement(
      parentElement.childNodes[index],
      newChildren[i],
      oldChildren[i],
      i,
    );
  }
}
