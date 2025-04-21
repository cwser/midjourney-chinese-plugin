// ==UserScript==
// @name         MidJourneyCN
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  将 MidJourney 网站英文界面翻译为中文，稳定版
// @author       G哥
// @match        https://www.midjourney.com/*
// @grant        none
// @run-at       document-end
// @updateURL    https://raw.githubusercontent.com/cwser/midjourney-chinese-plugin/main/MidJourneyCN-tampermonkey.user.js
// @downloadURL  https://raw.githubusercontent.com/cwser/midjourney-chinese-plugin/main/MidJourneyCN-tampermonkey.user.js
// ==/UserScript==

(function () {
  'use strict';

  const config = JSON.parse(localStorage.getItem('mj-trans-config')) || {
    enabled: true,
    lang: 'zh-Hans'
  };

  let dictHans = {};
  let dictHant = {};

  async function loadDictionary() {
    const resHans = await fetch('https://raw.githubusercontent.com/cwser/midjourney-chinese-plugin/refs/heads/main/lang/zh-CN.json');
    dictHans = await resHans.json();
    const resHant = await fetch('https://raw.githubusercontent.com/cwser/midjourney-chinese-plugin/refs/heads/main/lang/zh-TW.json');
    dictHant = await resHant.json();
  }

  function getDict() {
    return config.lang === 'zh-Hant' ? dictHant : dictHans;
  }

  function translateText(text) {
    const dict = getDict();
    return dict[text.trim()] || text;
  }

  function processNode(node) {
    if (!config.enabled) return;
    if (node.nodeType === 3) {
      const translated = translateText(node.textContent);
      if (translated && translated !== node.textContent) {
        node.textContent = translated;
      }
    } else if (node.nodeType === 1 && !node.dataset.translated) {
      if (node.childNodes.length === 1 && node.firstChild.nodeType === 3) {
        const translated = translateText(node.textContent);
        if (translated && translated !== node.textContent) {
          node.textContent = translated;
          node.dataset.translated = 'true';
        }
      }
      Array.from(node.childNodes).forEach(processNode);
    }
  }

  function translateAll() {
    if (!config.enabled) return;
    processNode(document.body);
  }

  const observer = new MutationObserver(mutations => {
    mutations.forEach(m => {
      m.addedNodes.forEach(n => processNode(n));
    });
  });

  function initObserver() {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  function createControlPanel() {
    const btn = document.createElement('div');
    btn.id = 'mj-trans-btn';
    btn.innerText = '🌐';
    btn.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      width: 40px;
      height: 40px;
      background: #000000cc;
      color: #fff;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      opacity: 0.6;
    `;

    const panel = document.createElement('div');
    panel.id = 'mj-trans-panel';
    panel.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 70px;
      z-index: 9998;
      background: #ffffffee;
      padding: 10px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.15);
      display: none;
      flex-direction: column;
      font-size: 14px;
      gap: 6px;
    `;
    panel.innerHTML = `
      <label><input type="checkbox" id="mj-enable"> 启用翻译</label>
      <label><input type="radio" name="mj-lang" value="zh-Hans"> 简体</label>
      <label><input type="radio" name="mj-lang" value="zh-Hant"> 繁體</label>
    `;

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    let autoCloseTimer = null;

    function schedulePanelClose(delay = 3000) {
      clearTimeout(autoCloseTimer);
      autoCloseTimer = setTimeout(() => {
        panel.style.display = 'none';
      }, delay);
    }

    btn.addEventListener('click', () => {
      panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    });

    setTimeout(() => {
      document.addEventListener('click', (e) => {
        if (!panel.contains(e.target) && !btn.contains(e.target)) {
          panel.style.display = 'none';
        }
      });
    }, 0);

    panel.addEventListener('mouseenter', () => clearTimeout(autoCloseTimer));
    panel.addEventListener('mouseleave', () => schedulePanelClose());

    const enableCheckbox = document.getElementById('mj-enable');
    enableCheckbox.checked = config.enabled;
    enableCheckbox.addEventListener('change', (e) => {
      config.enabled = e.target.checked;
      localStorage.setItem('mj-trans-config', JSON.stringify(config));
      location.reload();
    });

    const langRadios = document.querySelectorAll('input[name="mj-lang"]');
    langRadios.forEach(radio => {
      if (radio.value === config.lang) radio.checked = true;
      radio.addEventListener('change', (e) => {
        config.lang = e.target.value;
        localStorage.setItem('mj-trans-config', JSON.stringify(config));
        location.reload();
      });
    });
  }

  window.addEventListener('load', async () => {
    await loadDictionary();
    createControlPanel();
    if (config.enabled) {
      translateAll();
      initObserver();
    }
  });
})();
