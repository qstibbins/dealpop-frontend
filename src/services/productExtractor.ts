export interface ProductInfo {
  price?: { selector: string | null; value: string };
  title?: { selector: string | null; value: string };
  image?: { selector: string | null; value: string };
  url: string;
  variants: Record<string, string>;
}

/**
 * Legacy DOM extraction functionality
 * This is kept for reference but the actual extraction should happen in the Chrome extension
 */
export function extractProductInfo(): ProductInfo {
  const getPrice = () => {
    const semantic = document.querySelector('[itemprop*="price"], [class*="price"], [id*="price"]');
    if (semantic && containsPrice(semantic.textContent || '')) return getSelectorAndValue(semantic);

    const allElements = Array.from(document.querySelectorAll('body *')).filter(el =>
      el.textContent && containsPrice(el.textContent)
    );
    for (let el of allElements) {
      return getSelectorAndValue(el);
    }

    return undefined;
  };

  const getTitle = () => {
    const candidates = [
      document.querySelector('h1'),
      document.querySelector('meta[property="og:title"]'),
      document.querySelector('title')
    ];
    for (let el of candidates) {
      if (el?.textContent) return getSelectorAndValue(el);
      if (el?.getAttribute('content')) return { selector: null, value: el.getAttribute('content') || '' };
    }
    return undefined;
  };

  const getImage = () => {
    const metaImg = document.querySelector('meta[property="og:image"]');
    if (metaImg?.getAttribute('content')) return { selector: null, value: metaImg.getAttribute('content') || '' };

    const img = document.querySelector('img[src*="product"], img');
    if (img?.getAttribute('src')) return getSelectorAndValue(img, 'src');

    return undefined;
  };

  const extractVariants = () => {
    const variants: Record<string, string> = {};

    document.querySelectorAll("label").forEach(label => {
      const htmlFor = label.getAttribute("for");
      if (htmlFor) {
        const select = document.getElementById(htmlFor) as HTMLSelectElement;
        if (select && select.tagName === "SELECT") {
          const selectedOption = select.options[select.selectedIndex];
          if (selectedOption) {
            variants[label.textContent?.trim() || ''] = selectedOption.text.trim();
          }
        }
      }
    });

    document.querySelectorAll("select").forEach(select => {
      const label = select.closest("label") || select.previousElementSibling;
      const selectedOption = (select as HTMLSelectElement).options[(select as HTMLSelectElement).selectedIndex];
      if (label && selectedOption && label.textContent) {
        variants[label.textContent.trim()] = selectedOption.text.trim();
      }
    });

    const radios = document.querySelectorAll('input[type="radio"]:checked');
    radios.forEach(radio => {
      const name = radio.getAttribute('name') || "Option";
      const label = document.querySelector(`label[for="${radio.id}"]`);
      if (label && label.textContent) {
        variants[name] = label.textContent.trim();
      }
    });

    document.querySelectorAll('[aria-pressed="true"], .selected, .active').forEach(el => {
      const label = el.closest('[data-variant-label]')?.getAttribute('data-variant-label') || 
                   el.closest('fieldset')?.getAttribute('aria-label') || "Option";
      const value = el.textContent?.trim() || '';
      if (value) {
        variants[label] = value;
      }
    });

    return variants;
  };

  const containsPrice = (text: string) => {
    return /\$\s?\d{1,3}(,\d{3})*(\.\d{2})?/.test(text);
  };

  const getSelectorAndValue = (el: Element, attr: string | null = null) => {
    return {
      selector: getCssSelector(el),
      value: attr ? el.getAttribute(attr) || '' : el.textContent?.trim() || ''
    };
  };

  const getCssSelector = (el: Element) => {
    const path: string[] = [];
    let currentEl: Element | null = el;
    while (currentEl && currentEl.nodeType === Node.ELEMENT_NODE) {
      let selector = currentEl.nodeName.toLowerCase();
      if (currentEl.id) {
        selector += `#${currentEl.id}`;
        path.unshift(selector);
        break;
      } else {
        let sibling: Element | null = currentEl;
        let nth = 1;
        while (sibling = sibling.previousElementSibling) {
          if (sibling && sibling.nodeName.toLowerCase() === selector) nth++;
        }
        selector += `:nth-of-type(${nth})`;
      }
      path.unshift(selector);
      currentEl = currentEl.parentElement;
    }
    return path.join(" > ");
  };

  return {
    price: getPrice(),
    title: getTitle(),
    image: getImage(),
    url: window.location.href,
    variants: extractVariants()
  };
}

/**
 * Note: This file contains legacy DOM extraction functionality for reference.
 * The actual product extraction should be implemented in the Chrome extension,
 * which will then save the extracted data to Chrome storage for the dashboard to display.
 * 
 * For the Chrome extension, you'll want to implement:
 * 1. Screenshot capture using html2canvas
 * 2. OpenAI API integration for AI-powered extraction
 * 3. Chrome storage integration to save extracted products
 */ 