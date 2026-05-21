// ==UserScript==
// @name         LOADER Công cụ hỗ trợ v4 (github)
// @description  Công cụ hỗ trợ công việc sàn TMĐT v4
// @namespace    http://tampermonkey.net/
// @version      3.0.0
// @match        https://banhang.shopee.vn/*
// @match        https://sellercenter.lazada.vn/*

// @connect      *

// @grant        GM.xmlHttpRequest
// @grant        GM.setValue
// @grant        GM.setValues
// @grant        GM.getValue
// @grant        GM.getValues
// @grant        GM.deleteValue
// @grant        GM.deleteValues
// @grant        GM.listValues
// @grant        GM.addValueChangeListener
// @grant        GM.removeValueChangeListener
// @grant        GM.registerMenuCommand
// @grant        GM.unregisterMenuCommand
// @grant        GM.notification
// @grant        GM.openInTab
// @grant        GM.setClipboard
// @grant        GM.download
// @grant        GM.getResourceText
// @grant        GM.getResourceUrl
// @grant        GM.addElement
// @grant        GM.addStyle
// @grant        GM.audio
// @grant        GM.cookie
// @grant        GM.getTab
// @grant        GM.getTabs
// @grant        GM.saveTab
// @grant        GM.info
// @grant        GM.log

// @grant        GM_webRequest
// @grant        unsafeWindow
// @grant        window.close
// @grant        window.focus
// @grant        window.onurlchange

// @run-at       document-start
// ==/UserScript==

(async function(){
  const link = "http://localhost:2105/tool.userscript.js";
  
  try {
    const response = await GM.xmlHttpRequest({
      method: "GET",
      url: link,
      nocache: true 
    });

    if (response.status === 200) {
       eval(response.responseText); 
       console.log("[Loader] Đã kích hoạt file tool cục bộ thành công!");
    } else {
       console.error("[Loader] Không thể đọc file local. Mã lỗi:", response.status);
    }
  } catch (error) {
    console.error("[Loader] Lỗi kết nối đến file hệ thống:", error);
  }
})()