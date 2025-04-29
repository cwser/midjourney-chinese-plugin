// ==UserScript==
// @name         MidJourneyCN
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  将 MidJourney 网站英文界面翻译为中文，稳定增强版（支持简繁切换、缓存、自动更新、动态监听增强）
// @author       G哥
// @match        https://www.midjourney.com/*
// @grant        none
// @run-at       document-end
// @updateURL    https://cdn.jsdelivr.net/gh/cwser/midjourney-chinese-plugin@main/MidJourneyCN-tampermonkey.user.js
// @downloadURL  https://cdn.jsdelivr.net/gh/cwser/midjourney-chinese-plugin@main/MidJourneyCN-tampermonkey.user.js
// ==/UserScript==

(function () {
  'use strict';

  const config = JSON.parse(localStorage.getItem('mj-trans-config')) || {
    enabled: true,
    lang: 'zh-Hans'
  };

  let dictHans = {};
  let dictHant = {};

  async function loadDictionary(forceReload = false) {
    const cacheKey = 'mj-trans-dict-cache';
    const cache = JSON.parse(localStorage.getItem(cacheKey) || '{}');
    const now = Date.now();

    if (!forceReload && cache.timestamp && now - cache.timestamp < 6 * 60 * 60 * 1000) {
      dictHans = cache.dictHans || {};
      dictHant = cache.dictHant || {};
      return;
    }

    try {
      const resHans = await fetch('https://cdn.jsdelivr.net/gh/cwser/midjourney-chinese-plugin@main/lang/zh-CN.json');
      if (!resHans.ok) throw new Error(`zh-CN.json 拉取失败: ${resHans.status}`);
      dictHans = await resHans.json();

      const resHant = await fetch('https://cdn.jsdelivr.net/gh/cwser/midjourney-chinese-plugin@main/lang/zh-TW.json');
      if (!resHant.ok) throw new Error(`zh-TW.json 拉取失败: ${resHant.status}`);
      dictHant = await resHant.json();

      localStorage.setItem(cacheKey, JSON.stringify({
        timestamp: now,
        dictHans,
        dictHant
      }));
    } catch (e) {
      console.warn('加载翻译词典出错，使用缓存或跳过翻译：', e);
    }
  }

  function getDict() {
    return config.lang === 'zh-Hant' ? dictHant : dictHans;
  }

  function translateText(text) {
    const dict = getDict();
    const key = text.trim();
    const val = dict[key];
    return val !== undefined ? val : text;
  }

  function processNode(node) {
    if (!config.enabled || !node || !document.body.contains(node)) return;

    // 翻译属性
    const dict = getDict();
    if (node.nodeType === 1) {
      ['title','aria-label','alt'].forEach(attr => {
        const v = node.getAttribute(attr);
        if (v && dict[v.trim()]) {
          node.setAttribute(attr, dict[v.trim()]);
          node.dataset.translated = 'true';
        }
      });
    }

    if (node.nodeType === 3) {
      const txt = node.textContent;
      const tr = translateText(txt);
      if (tr !== txt) node.textContent = tr;
    } else if (node.nodeType === 1 && !node.dataset.translated) {
      // 纯文本子节点
      if (node.childNodes.length === 1 && node.firstChild.nodeType === 3) {
        const txt = node.textContent;
        const tr = translateText(txt);
        if (tr !== txt) {
          node.textContent = tr;
          node.dataset.translated = 'true';
        }
      }
      Array.from(node.childNodes).forEach(processNode);
    }
  }

  function translateAll() {
    processNode(document.body);
  }

  const observer = new MutationObserver(muts => {
    muts.forEach(m => {
      m.addedNodes.forEach(n => processNode(n));
      if (m.type === 'characterData') processNode(m.target);
    });
  });

  function initObserver() {
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['title','aria-label','alt']
    });
  }

  function createControlPanel() {
    // 按钮
    const btn = document.createElement('div');
    btn.id = 'mj-trans-btn';
    btn.innerText = '🌐';
    Object.assign(btn.style, {
      position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999,
      width: '40px', height: '40px', background: '#000c', color: '#fff',
      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', opacity: 0.6, backdropFilter: 'blur(4px)'
    });

    // 面板
    const panel = document.createElement('div');
    panel.id = 'mj-trans-panel';
    Object.assign(panel.style, {
      position: 'fixed', bottom: '20px', right: '70px', zIndex: 9998,
      background: '#fffefeee', padding: '10px', borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.15)', display: 'none',
      flexDirection: 'column', fontSize: '14px', gap: '6px'
    });
    panel.innerHTML = `
      <label><input type="checkbox" id="mj-enable"> 启用翻译</label>
      <label><input type="radio" name="mj-lang" value="zh-Hans"> 简体</label>
      <label><input type="radio" name="mj-lang" value="zh-Hant"> 繁體</label>
      <button id="mj-clear-cache" style="margin-top:8px;">清除缓存</button>`;

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    let autoClose = null;
    const scheduleClose = (t=3000) => {
      clearTimeout(autoClose);
      autoClose = setTimeout(() => panel.style.display = 'none', t);
    };

    btn.addEventListener('click', e => {
      e.stopPropagation();
      panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    });

    document.addEventListener('click', e => {
      if (!panel.contains(e.target) && !btn.contains(e.target)) panel.style.display = 'none';
    });

    panel.addEventListener('mouseenter', () => clearTimeout(autoClose));
    panel.addEventListener('mouseleave', () => scheduleClose());

    document.getElementById('mj-clear-cache').addEventListener('click', () => {
      if (confirm('确定要清除词典缓存并重载页面？')) {
        localStorage.removeItem('mj-trans-dict-cache');
        location.reload();
      }
    });

    const chk = document.getElementById('mj-enable');
    chk.checked = config.enabled;
    chk.addEventListener('change', e => {
      config.enabled = e.target.checked;
      localStorage.setItem('mj-trans-config', JSON.stringify(config));
      location.reload();
    });

    document.querySelectorAll('input[name="mj-lang"]').forEach(radio => {
      if (radio.value === config.lang) radio.checked = true;
      radio.addEventListener('change', e => {
        config.lang = e.target.value;
        localStorage.setItem('mj-trans-config', JSON.stringify(config));
        location.reload();
      });
    });
  }

  window.addEventListener('load', async () => {
    // 先并行加载词典和面板，减少感知延迟
    await loadDictionary();
    createControlPanel();
    if (config.enabled) {
      translateAll();
      initObserver();
    }
  });
})();
