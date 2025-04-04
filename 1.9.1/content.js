chrome.storage.local.get(["mjTranslateEnabled"], (res) => {
  const isEnabled = res.mjTranslateEnabled !== false;
  if (!isEnabled) return;

  const DICTIONARY = {
  "Explore": "探索",
  "Create": "创建",
  "Edit": "编辑",
  "Retexture": "纹理重绘",
  "Personalize": "个性化",
  "Organize": "整理",
  "Prompt": "提示词",
  "Prompt Craft": "提示词工坊",
  "Daily Theme": "每日主题",
  "Newbies": "新手区",
  "General Chaos": "混沌大厅",
  "Image Size": "图像尺寸",
  "Square": "方形",
  "Portrait": "竖版",
  "Landscape": "横版",
  "Relax": "放松",
  "Fast": "快速",
  "Turbo": "极速",
  "Speed": "速度",
  "Mode": "模式",
  "Standard": "标准",
  "Raw": "原始",
  "Draft": "草稿",
  "Model": "模型",
  "Version": "版本",
  "Stylization": "风格化",
  "Style": "风格",
  "Stylize": "风格化",
  "Style Strength": "风格强度",
  "Weirdness": "怪异程度",
  "Variety": "多样性",
  "Tile": "拼贴",
  "Seed": "种子",
  "Public": "公开",
  "Private": "私密",
  "More Options": "更多选项",
  "Aesthetics": "美学",
  "Move / Resize": "移动 / 缩放",
  "Erase": "擦除",
  "Restore": "恢复",
  "Select": "选择",
  "Undo": "撤销",
  "Redo": "重做",
  "Reset": "重置",
  "Suggest Prompt": "推荐提示词",
  "Edit from URL": "从链接编辑",
  "Edit Uploaded Image": "编辑上传图片",
  "Submit": "提交",
  "View All": "查看全部",
  "New": "新建",
  "What will you imagine?": "你想象什么？",
  "Rate more images": "评分更多图片",
  "Profiles": "配置档",
  "Global V7 Profile": "V7 全局配置档",
  "Default": "默认",
  "Moodboards": "情绪板",
  "Random": "随机",
  "Hot": "热门",
  "Top Day": "今日最佳",
  "Top Week": "本周最佳",
  "Top Month": "本月最佳",
  "Likes": "喜爱",
  "Brush Size": "笔刷大小",
  "Image Scale": "图像缩放",
  "Aspect Ratio": "纵横比",
  "Export": "导出",
  "Upscale to Gallery": "放大保存至图库",
  "Download Image": "下载图片",
  "Saved Searches": "已保存搜索",
  "Filters": "筛选器",
  "View Options": "视图选项",
  "Tasks": "任务",
  "Help": "帮助",
  "Updates": "更新",
  "Light Mode": "亮色模式"
};

function translateTextExact(text) {
  if (!text || typeof text !== 'string') return text.trim();
  return DICTIONARY[text.trim()] || text;
}

function translateDeep(el) {
  if (!el || el.nodeType !== 1) return;

  // 黑名单跳过无意义标签
  const blacklistTags = ["SCRIPT", "STYLE", "TEMPLATE", "NOSCRIPT"];
  if (blacklistTags.includes(el.tagName)) return;

  // 精确翻译当前节点
  if (el.childNodes.length === 1 && el.childNodes[0].nodeType === 3) {
    const original = el.textContent.trim();
    if (original && DICTIONARY[original]) {
      el.textContent = DICTIONARY[original];
      console.log("✅ 翻译成功:", original, "→", DICTIONARY[original]);
      return;
    }
  }

  // 属性翻译
  ["aria-label", "title", "placeholder"].forEach(attr => {
    if (el.hasAttribute && el.hasAttribute(attr)) {
      const original = el.getAttribute(attr);
      const translated = translateTextExact(original);
      if (original !== translated) {
        el.setAttribute(attr, translated);
        console.log('✅ 属性翻译:', attr, original, '→', translated);
      }
    }
  });

  // 遍历所有子节点
  el.childNodes.forEach(child => {
    if (child.nodeType === 3) {
      const original = child.textContent.trim();
      const translated = translateTextExact(original);
      if (original && translated !== original) {
        child.textContent = translated;
        console.log("✅ 子节点翻译:", original, "→", translated);
      } else if (original && !DICTIONARY[original] && !original.startsWith('function')) {
        console.log("⚠️ 未翻译词:", original);
      }
    } else {
      translateDeep(child);
    }
  });
}

function translateAll() {
  const allElements = document.querySelectorAll('*');
  allElements.forEach(el => translateDeep(el));
}

function startTranslationProPlus() {
  translateAll();

  const observer = new MutationObserver(() => {
    translateAll();
    clearTimeout(window.__midj_translate_timer);
    window.__midj_translate_timer = setTimeout(() => {
      translateAll();
    }, 100);
  });

  const root = document.querySelector(".app-content") || document.body;
  observer.observe(root, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true
  });

  console.log("🔁 MidJourney 汉化 Pro+ v1.9 运行中（精准匹配 + 黑名单过滤）");
}

window.addEventListener('load', () => {
  setTimeout(startTranslationProPlus, 1000);
});

  // 延迟执行翻译，确保页面加载完毕
  function startTranslation() {
    translateDeep(document.body);

    // 设置 DOM 监听器：自动翻译新增内容
    const observer = new MutationObserver(mutations => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            translateDeep(node);
          }
        }
      }
    });
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // 页面加载完再启动翻译（确保不抢在内容前）
  if (document.readyState === "complete") {
    startTranslation();
  } else {
    window.addEventListener("load", startTranslation);
  }
});