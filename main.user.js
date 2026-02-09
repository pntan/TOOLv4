// ==UserScript==
// @name         CÔNG CỤ HỖ TRỢ v4
// @namespace    tanphan/chuanmua/userscript-tool-v4
// @version      0.0.1
// @author       TânPhan
// @description  Tổng hợp các chức năng và thao tác xử lý hàng loạt trong các nền tảng sàn thương mại điện tử
// @icon         https://www.google.com/s2/favicons?sz=64&domain=http://anonymouse.org/
// @match        https://*/*
// @match        http://*/*
// @connect      *
// @grant        GM.addElement
// @grant        GM.addStyle
// @grant        GM.addValueChangeListener
// @grant        GM.audio
// @grant        GM.cookie
// @grant        GM.deleteValue
// @grant        GM.deleteValues
// @grant        GM.download
// @grant        GM.getResourceText
// @grant        GM.getResourceUrl
// @grant        GM.getTab
// @grant        GM.getTabs
// @grant        GM.getValue
// @grant        GM.getValues
// @grant        GM.info
// @grant        GM.listValues
// @grant        GM.log
// @grant        GM.notification
// @grant        GM.openInTab
// @grant        GM.registerMenuCommand
// @grant        GM.removeValueChangeListener
// @grant        GM.saveTab
// @grant        GM.setClipboard
// @grant        GM.setValue
// @grant        GM.setValues
// @grant        GM.unregisterMenuCommand
// @grant        GM.webRequest
// @grant        GM.xmlHttpRequest
// @grant        GM_addElement
// @grant        GM_addStyle
// @grant        GM_addValueChangeListener
// @grant        GM_audio
// @grant        GM_cookie
// @grant        GM_deleteValue
// @grant        GM_deleteValues
// @grant        GM_download
// @grant        GM_getResourceText
// @grant        GM_getResourceURL
// @grant        GM_getTab
// @grant        GM_getTabs
// @grant        GM_getValue
// @grant        GM_getValues
// @grant        GM_info
// @grant        GM_listValues
// @grant        GM_log
// @grant        GM_notification
// @grant        GM_openInTab
// @grant        GM_registerMenuCommand
// @grant        GM_removeValueChangeListener
// @grant        GM_saveTab
// @grant        GM_setClipboard
// @grant        GM_setValue
// @grant        GM_setValues
// @grant        GM_unregisterMenuCommand
// @grant        GM_webRequest
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @grant        window.close
// @grant        window.focus
// @grant        window.onurlchange

// @require      https://code.jquery.com/jquery-3.7.1.min.js
// @require      https://cdn.tailwindcss.com
// @run-at       document-end
// ==/UserScript==

/* globals       jQuery, $ */

(function() {
  'use strict';

  class UTILS {
    getHost() { return window.location.host; }
    getPathName() { return window.location.pathname; }

    waitForElement(root, selector, callback, options = {}) {
      const { once = true, timeout = null, waitForLastChange = false, delay = 300 } = options;
      // Sửa lỗi rootNode: đảm bảo rootNode là DOM element
      const rootNode = (window.jQuery && root instanceof window.jQuery) ? root[0] : root;

      let foundAndTriggered = false;
      let observer = null;
      let delayTimer = null;

      const runCallback = (el) => {
        if (foundAndTriggered && once) return;
        foundAndTriggered = true;
        callback(el);
        if (once && observer) observer.disconnect();
      };

      // Kiểm tra ngay lập tức
      const initial = rootNode.querySelector(selector);
      if (initial && !waitForLastChange && once) return runCallback(initial);

      observer = new MutationObserver(() => {
        const found = rootNode.querySelector(selector);
        if (found) {
          if (waitForLastChange) {
            clearTimeout(delayTimer);
            delayTimer = setTimeout(() => runCallback(found), delay);
          } else {
            runCallback(found);
          }
        }
      });

      observer.observe(rootNode, { childList: true, subtree: true });
      return observer;
    }
  }

  class ThemPhanLoai {
    constructor(utils) {
      this.UTILS = utils;
      this.functionName = "Thêm Phân Loại";
      this.init();
      this.modalInit = false;
    }

    init() {
      const host = this.UTILS.getHost();
      if (host.includes("shopee")) {
        // Kiểm tra xem có đang ở trang sửa/thêm sản phẩm không
        if (this.UTILS.getPathName().includes("/portal/product")) {
          this.initLayoutShopee();
        }
      }
    }

    initLayoutShopee() {
      // Dùng selector bạn đã tìm thấy
      const target = ".product-detail-panel.product-sales-info .panel-header";
      
      this.UTILS.waitForElement(document, target, (e) => {
        if (!$(e).find(".tp-btn-add").length) {
          // Sử dụng Tailwind class với prefix TPV4-
          const $btn = $(`
            <button
              class="TPV4-bg-gradient-to-r TPV4-from-[#ff5722] TPV4-to-[#f53d2d] TPV4-font-[600] TPV4-text-white TPV4-shadow TPV4-text-black TPV4-p-3 TPV4-rounded-xl hover:TPV4-bg-gray-400/50"
            >
              ${this.functionName}
            </button>
          `);
          $btn.on("click", this.openModal)
          $(e).append($btn);
        }
      }, { waitForLastChange: true });
    }

    openModal(){
      $bg = $(`
        <div class="TPV4-w-full TPV4-h-full TPV4-absolute TPV4-z-1 TPV4-bg-black-400/30 TPV4-backdrop-blur-xl"></div>  
      `)
      $modal = $(`
        <div class="TPV4-w-full TPV4-h-full fixed TPV4-z-999999 TPV4-bg-black-300/30 TPV4-backdrop-blur-xl">
        </div>
      `)
      if (!this.modalInit){
        $("body").append($modal)
        this.modalInit = true;
      }

      $modal.show();
    }
  }

  class TPTOOL {
    constructor() {
      this.utils = new UTILS();
      this.initTailwind();
      this.ThemPhanLoai = new ThemPhanLoai(this.utils);
    }

    async initTailwind() {
      // Hàm đợi cho đến khi biến tailwind xuất hiện
      const checkTailwind = setInterval(() => {
        if (typeof tailwind !== 'undefined') {
          clearInterval(checkTailwind);
          
          console.log("🎨 Tailwind v4 đã sẵn sàng!");
          
          // Cấu hình
          tailwind.config = {
            prefix: 'TPV4-',
            important: true,
          };
          
          // Với bản v4, sau khi config bạn nên gọi render để nó quét lại DOM
          if (tailwind.render) tailwind.render(); 
        }
      }, 100); // Kiểm tra mỗi 100ms

      // Sau 10s không thấy thì dừng để tránh tốn tài nguyên
      setTimeout(() => clearInterval(checkTailwind), 10000);
    }
  }

  // Khởi chạy
  new TPTOOL();
})();