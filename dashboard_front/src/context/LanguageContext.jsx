import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { translateAdminStringToEn } from '../i18n/dictionary';

export const ADMIN_LANG_STORAGE_KEY = 'saydalety_admin_lang';

const LanguageContext = createContext({
  lang: 'ar',
  isEn: false,
  isAr: true,
  dir: 'rtl',
  toggleLanguage: () => {},
  setLanguage: () => {},
  t: (ar, en) => ar,
});

const resolveInitialLang = () => {
  if (typeof window === 'undefined') return 'ar';
  try {
    const saved = localStorage.getItem(ADMIN_LANG_STORAGE_KEY);
    if (saved === 'en' || saved === 'ar') return saved;
  } catch {
    // Ignore storage errors
  }
  return 'ar';
};

const applyDocumentLang = (nextLang) => {
  if (typeof document === 'undefined') return;
  const isEn = nextLang === 'en';
  const root = document.documentElement;
  root.setAttribute('lang', isEn ? 'en' : 'ar');
  root.setAttribute('dir', isEn ? 'ltr' : 'rtl');
  document.title = isEn
    ? 'Admin Dashboard | Saydalety — MY Pharmacy'
    : 'لوحة التحكم الإدارية | صيدليتي - MY Pharmacy';
};

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE']);
const SKIP_TEXT_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'CODE']);
const TRANSLATABLE_ATTRS = ['placeholder', 'title', 'aria-label', 'data-tooltip'];

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(resolveInitialLang);
  const textCacheRef = useRef(new WeakMap());
  const attrCacheRef = useRef(new WeakMap());

  const setLanguage = useCallback((next) => {
    setLangState((prev) => {
      const resolved = typeof next === 'function' ? next(prev) : next;
      const valid = resolved === 'en' ? 'en' : 'ar';
      try {
        localStorage.setItem(ADMIN_LANG_STORAGE_KEY, valid);
      } catch {
        // Ignore storage errors
      }
      applyDocumentLang(valid);
      return valid;
    });
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'ar' ? 'en' : 'ar'));
  }, [setLanguage]);

  const t = useCallback(
    (arText, enText) => (lang === 'en' ? enText ?? translateAdminStringToEn(arText) : arText),
    [lang]
  );

  useEffect(() => {
    applyDocumentLang(lang);
  }, [lang]);

  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === ADMIN_LANG_STORAGE_KEY && (e.newValue === 'ar' || e.newValue === 'en')) {
        setLangState(e.newValue);
        applyDocumentLang(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;
    const textCache = textCacheRef.current;
    const attrCache = attrCacheRef.current;

    const shouldSkipElement = (el) => {
      if (!el || el.nodeType !== 1) return false;
      if (SKIP_TAGS.has(el.tagName)) return true;
      return Boolean(el.closest?.('[data-no-i18n="true"]'));
    };

    const processTextNode = (node) => {
      const parent = node.parentElement;
      if (!parent || SKIP_TEXT_TAGS.has(parent.tagName) || shouldSkipElement(parent)) return;

      const currentVal = node.nodeValue || '';
      if (!currentVal.trim()) return;

      let record = textCache.get(node);
      if (!record) {
        if (!/[\u0600-\u06FF]/.test(currentVal)) return;
        record = { ar: currentVal, en: translateAdminStringToEn(currentVal) };
        textCache.set(node, record);
      } else if (currentVal !== record.ar && currentVal !== record.en) {
        if (/[\u0600-\u06FF]/.test(currentVal)) {
          record = { ar: currentVal, en: translateAdminStringToEn(currentVal) };
          textCache.set(node, record);
        } else {
          return;
        }
      }

      const desired = lang === 'en' ? record.en : record.ar;
      if (node.nodeValue !== desired) {
        node.nodeValue = desired;
      }
    };

    const processElementAttrs = (el) => {
      if (shouldSkipElement(el)) return;
      let map = attrCache.get(el);

      for (const attr of TRANSLATABLE_ATTRS) {
        const val = el.getAttribute(attr);
        if (!val) continue;

        if (!map) {
          map = {};
          attrCache.set(el, map);
        }

        let record = map[attr];
        if (!record) {
          if (!/[\u0600-\u06FF]/.test(val)) continue;
          record = { ar: val, en: translateAdminStringToEn(val) };
          map[attr] = record;
        } else if (val !== record.ar && val !== record.en && /[\u0600-\u06FF]/.test(val)) {
          record = { ar: val, en: translateAdminStringToEn(val) };
          map[attr] = record;
        }

        const desired = lang === 'en' ? record.en : record.ar;
        if (val !== desired) {
          el.setAttribute(attr, desired);
        }
      }
    };

    const syncSubtree = (rootNode) => {
      if (!rootNode) return;
      if (rootNode.nodeType === 3) {
        processTextNode(rootNode);
        return;
      }
      if (rootNode.nodeType !== 1 || shouldSkipElement(rootNode)) return;

      processElementAttrs(rootNode);

      const walker = document.createTreeWalker(rootNode, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
      let cur = walker.nextNode();
      while (cur) {
        if (cur.nodeType === 3) processTextNode(cur);
        else if (cur.nodeType === 1) processElementAttrs(cur);
        cur = walker.nextNode();
      }
    };

    syncSubtree(document.body);

    let scheduled = false;
    const scheduleSync = () => {
      if (scheduled) return;
      scheduled = true;
      queueMicrotask(() => {
        scheduled = false;
        syncSubtree(document.body);
      });
    };

    const observer = new MutationObserver(scheduleSync);

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: TRANSLATABLE_ATTRS,
    });

    window.addEventListener('popstate', scheduleSync);
    document.addEventListener('visibilitychange', scheduleSync);

    return () => {
      observer.disconnect();
      window.removeEventListener('popstate', scheduleSync);
      document.removeEventListener('visibilitychange', scheduleSync);
    };
  }, [lang]);

  return (
    <LanguageContext.Provider
      value={{
        lang,
        isEn: lang === 'en',
        isAr: lang === 'ar',
        dir: lang === 'en' ? 'ltr' : 'rtl',
        toggleLanguage,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
