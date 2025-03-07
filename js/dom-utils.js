/**
 * DOM utilities for creating and managing elements
 */
const DOMUtils = {
    /**
     * Create an element with attributes and children
     * 
     * @param {string} tag - The HTML tag name
     * @param {Object} attributes - Attributes to set on the element
     * @param {Array|string} children - Child elements or text content
     * @returns {HTMLElement} The created element
     */
    createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);

        // Set attributes
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'style' && typeof value === 'object') {
                Object.assign(element.style, value);
            } else if (key === 'className') {
                element.className = value;
            } else if (key.startsWith('on') && typeof value === 'function') {
                const eventName = key.substring(2).toLowerCase();
                element.addEventListener(eventName, value);
            } else {
                element.setAttribute(key, value);
            }
        });

        // Add children
        if (Array.isArray(children)) {
            children.forEach(child => {
                if (child instanceof HTMLElement) {
                    element.appendChild(child);
                } else if (child !== null && child !== undefined) {
                    element.appendChild(document.createTextNode(String(child)));
                }
            });
        } else if (children !== null && children !== undefined) {
            element.textContent = String(children);
        }

        return element;
    },

    /**
     * Append multiple children to a parent element
     * 
     * @param {HTMLElement} parent - The parent element
     * @param {Array} children - Child elements to append
     */
    appendChildren(parent, children) {
        children.forEach(child => {
            if (child) {
                parent.appendChild(child);
            }
        });
    },

    /**
     * Clear the contents of an element
     * 
     * @param {HTMLElement} element - The element to clear
     */
    clearElement(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    }
};
