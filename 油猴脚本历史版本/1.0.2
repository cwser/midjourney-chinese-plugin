// ==UserScript==
// @name         MidjourneyCN
// @namespace    http://tampermonkey.net/
// @version      1.0.2
// @description  Midjourney 中文翻译 + 现代浮动控制面板（自适应、拖动、自动收起）
// @author       G哥
// @match        https://www.midjourney.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @connect      cdn.jsdelivr.net
// @updateURL    https://cdn.jsdelivr.net/gh/cwser/midjourney-chinese-plugin@main/MidJourneyCN-tampermonkey.user.js
// @downloadURL  https://cdn.jsdelivr.net/gh/cwser/midjourney-chinese-plugin@main/MidJourneyCN-tampermonkey.user.js
// ==/UserScript==

(function () {
    'use strict';

    const LANG_URLS = {
        'zh-CN': 'https://cdn.jsdelivr.net/gh/cwser/midjourney-chinese-plugin@main/lang/zh-CN.json',
        'zh-TW': 'https://cdn.jsdelivr.net/gh/cwser/midjourney-chinese-plugin@main/lang/zh-TW.json'
    };
    const CACHE_EXPIRY = 6 * 60 * 60 * 1000;
    const TRANSLATED_SYMBOL = Symbol('translated');

    let currentLang = GM_getValue('language', 'zh-CN');
    let translationEnabled = GM_getValue('translationEnabled', true);
    let dictionaryTimestamp = null;
    let dictionaryStatus = '⏳ 加载中';

    function fetchTranslationDict(lang) {
        return new Promise((resolve, reject) => {
            if (!LANG_URLS[lang]) return reject(new Error('Language not supported'));
            GM_xmlhttpRequest({
                method: 'GET',
                url: LANG_URLS[lang],
                onload: (response) => {
                    if (response.status === 200) {
                        try {
                            const data = JSON.parse(response.responseText);
                            dictionaryTimestamp = new Date().toLocaleString();
                            dictionaryStatus = '✅ 已加载';
                            GM_setValue(`${lang}_cache`, {
                                timestamp: Date.now(),
                                data
                            });
                            resolve(data);
                        } catch (e) {
                            dictionaryStatus = '❌ 解析错误';
                            reject(e);
                        }
                    } else {
                        dictionaryStatus = '❌ 加载失败';
                        reject(new Error(`Failed: ${response.statusText}`));
                    }
                },
                onerror: (err) => {
                    dictionaryStatus = '❌ 网络错误';
                    reject(err);
                }
            });
        });
    }

    function loadTranslationDict(lang) {
        const cache = GM_getValue(`${lang}_cache`, null);
        if (cache && (Date.now() - cache.timestamp) < CACHE_EXPIRY) {
            dictionaryTimestamp = new Date(cache.timestamp).toLocaleString();
            dictionaryStatus = '✅ 来自缓存';
            return Promise.resolve(cache.data);
        }
        return fetchTranslationDict(lang);
    }

    function translateText(text, dict) {
        return dict[text.trim()] || text;
    }

    function translateNode(node, dict) {
        if (node[TRANSLATED_SYMBOL]) return;
        if (node.nodeType === Node.TEXT_NODE) {
            node.textContent = translateText(node.textContent, dict);
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            Array.from(node.attributes).forEach(attr => {
                attr.value = translateText(attr.value, dict);
            });
            Array.from(node.childNodes).forEach(child => translateNode(child, dict));
        }
        node[TRANSLATED_SYMBOL] = true;
    }

    function initializeTranslation(dict) {
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                Array.from(mutation.addedNodes).forEach(node => translateNode(node, dict));
            });
        });
        observer.observe(document.body, { childList: true, subtree: true });
        translateNode(document.body, dict);
    }

    function createControlPanel() {
        const panel = document.createElement('div');
        panel.id = 'translation-control-panel';
        // 小控制面板靠右下角
        panel.classList.add('fixed', 'bottom-2', 'right-2', 'z-50', 'transition-opacity', 'duration-500');
        panel.innerHTML = `
            <div id="mini-status-panel" class="bg-white rounded-lg shadow-md p-2 text-sm cursor-pointer w-16 h-16 flex flex-col justify-center items-center space-y-1 transform transition-transform duration-300">
                <div id="panel-title" class="text-xs font-bold">翻译工具</div>
                <div id="status-indicator" class="rounded-md px-1 py-0.5 text-xs"></div>
            </div>
            <div id="panel-body" class="overflow-hidden max-h-0 opacity-0 transition-all duration-300 absolute bottom-full right-full">
                <div class="mt-3 w-64 p-4 bg-white rounded-2xl shadow-lg space-y-4">
                    <h3 class="text-xl font-bold border-b border-gray-300 pb-2">翻译工具</h3>
                    <div id="panel-info" class="space-y-2">
                        <div id="panel-status" class="flex items-center space-x-2">
                            <span class="font-medium">翻译状态：</span>
                            <span id="panel-status-text"></span>
                        </div>
                        <div id="panel-update-time" class="flex items-center space-x-2">
                            <span class="font-medium">更新时间：</span>
                            <span id="panel-update-time-text"></span>
                        </div>
                    </div>
                    <button id="toggle-translation" class="w-full py-2 px-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors duration-300">${translationEnabled ? ' 关闭翻译' : ' 开启翻译'}</button>
                    <button id="reload-dictionary" class="w-full py-2 px-4 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors duration-300"> 重新加载词典</button>
                    <div>
                        <label for="language-selector" class="block font-bold"> 选择语言：</label>
                        <select id="language-selector" class="w-full p-2 border border-gray-300 rounded-md mt-1">
                            <option value="zh-CN" ${currentLang === 'zh-CN' ? 'selected' : ''}>简体中文</option>
                            <option value="zh-TW" ${currentLang === 'zh-TW' ? 'selected' : ''}>繁体中文</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(panel);

        const body = panel.querySelector('#panel-body');
        const mini = panel.querySelector('#mini-status-panel');

        // 更新状态显示函数
        function updateStatusDisplay() {
            const statusIndicator = document.getElementById('status-indicator');
            const panelStatusText = document.getElementById('panel-status-text');
            if (translationEnabled) {
                panelStatusText.textContent = '开启';
                statusIndicator.textContent = '正常';
                statusIndicator.style.backgroundColor = '#a5d6a7'; // 浅绿色
            } else {
                panelStatusText.textContent = '关闭';
                statusIndicator.textContent = '正常';
                statusIndicator.style.backgroundColor = '#cfd8dc'; // 浅灰色
            }
            // 模拟更新时间判断逻辑
            const now = new Date();
            const timeDiff = now - new Date(dictionaryTimestamp);
            const panelUpdateTimeText = document.getElementById('panel-update-time-text');
            if (timeDiff < 60 * 1000) {
                panelUpdateTimeText.textContent = '1分钟内';
            } else if (timeDiff < 60 * 60 * 1000) {
                const minutes = Math.floor(timeDiff / (60 * 1000));
                panelUpdateTimeText.textContent = `${minutes}分钟前`;
            } else if (timeDiff < 24 * 60 * 60 * 1000) {
                const hours = Math.floor(timeDiff / (60 * 60 * 1000));
                panelUpdateTimeText.textContent = `${hours}小时前`;
            } else if (timeDiff < 7 * 24 * 60 * 60 * 1000) {
                const days = Math.floor(timeDiff / (24 * 60 * 60 * 1000));
                panelUpdateTimeText.textContent = `${days}天前`;
            } else {
                panelUpdateTimeText.textContent = '超过一周';
            }
        }

        // 点击展开收起
        mini.addEventListener('click', (e) => {
            if (body.classList.contains('max-h-0')) {
                body.style.maxHeight = body.scrollHeight + 'px';
                body.classList.remove('max-h-0', 'opacity-0');
                body.classList.add('max-h-full', 'opacity-100');
                mini.classList.add('hidden');
            } else {
                body.style.maxHeight = '0';
                body.classList.remove('max-h-full', 'opacity-100');
                body.classList.add('max-h-0', 'opacity-0');
                mini.classList.remove('hidden');
            }
            panel.classList.add('opacity-100');
            resetAutoHideTimer();
        });

        panel.querySelector('#toggle-translation').addEventListener('click', () => {
            translationEnabled = !translationEnabled;
            GM_setValue('translationEnabled', translationEnabled);
            location.reload();
        });

        panel.querySelector('#reload-dictionary').addEventListener('click', () => {
            GM_setValue(`${currentLang}_cache`, null);
            location.reload();
        });

        panel.querySelector('#language-selector').addEventListener('change', (e) => {
            currentLang = e.target.value;
            GM_setValue('language', currentLang);
            location.reload();
        });

        // 自动隐藏逻辑
        let hideTimer = null;
        let transparencyTimer = null;
        function resetAutoHideTimer() {
            clearTimeout(hideTimer);
            clearTimeout(transparencyTimer);
            panel.classList.add('opacity-100');
            hideTimer = setTimeout(() => {
                if (!body.classList.contains('max-h-0')) {
                    body.style.maxHeight = '0';
                    body.classList.remove('max-h-full', 'opacity-100');
                    body.classList.add('max-h-0', 'opacity-0');
                    mini.classList.remove('hidden');
                }
            }, 6000);
            // 缩短半透明时间，从 15000ms 调整为 5000ms
            transparencyTimer = setTimeout(() => {
                if (mini.classList.contains('hidden') === false) {
                    panel.classList.remove('opacity-100');
                    panel.classList.add('opacity-20');
                }
            }, 5000);
        }

        panel.addEventListener('mouseenter', () => {
            clearTimeout(hideTimer);
            clearTimeout(transparencyTimer);
            panel.classList.add('opacity-100');
        });
        panel.addEventListener('mouseleave', () => resetAutoHideTimer());

        // 点击面板外收起面板
        document.addEventListener('click', (e) => {
            if (!panel.contains(e.target)) {
                if (!body.classList.contains('max-h-0')) {
                    body.style.maxHeight = '0';
                    body.classList.remove('max-h-full', 'opacity-100');
                    body.classList.add('max-h-0', 'opacity-0');
                    mini.classList.remove('hidden');
                }
            }
        });

        updateStatusDisplay();
        resetAutoHideTimer();
    }

    if (translationEnabled) {
        loadTranslationDict(currentLang).then(dict => {
            initializeTranslation(dict);
        }).catch(err => console.error('翻译加载失败:', err));
    }

    createControlPanel();
})();
