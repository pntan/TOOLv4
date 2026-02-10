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

    openModal = () => {
      if ($("#tp-modal-root").length) return;

      const $modal = $(`
        <div id="tp-modal-root" class="TPV4-fixed TPV4-inset-0 TPV4-z-[999999] TPV4-flex TPV4-items-center TPV4-justify-center TPV4-p-4">          
          <div id="tp-modal-backdrop" class="TPV4-absolute TPV4-inset-0 TPV4-bg-slate-900/40 TPV4-backdrop-blur-sm TPV4-transition-opacity"></div>          
          <div class="TPV4-relative TPV4-bg-white TPV4-w-full TPV4-max-w-[550px] TPV4-rounded-[24px] TPV4-shadow-[0_20px_50px_rgba(0,0,0,0.15)] TPV4-overflow-hidden TPV4-animate-in TPV4-zoom-in TPV4-fade-in TPV4-duration-300">
            <div class="TPV4-h-1.5 TPV4-w-full TPV4-bg-gradient-to-r TPV4-from-orange-400 TPV4-via-orange-600 TPV4-to-red-600"></div>
            <div class="TPV4-p-8">
              <div class="TPV4-flex TPV4-justify-between TPV4-items-start TPV4-mb-6">
                <div>
                  <h3 class="TPV4-text-[22px] TPV4-font-extrabold TPV4-text-slate-800 TPV4-leading-tight TPV4-m-0">
                    ${this.functionName}
                  </h3>
                  <p class="TPV4-text-slate-400 TPV4-text-sm TPV4-mt-1 TPV4-font-medium">Quản lý và tối ưu phân loại sản phẩm nhanh chóng</p>
                </div>
                <button id="tp-modal-close" class="TPV4-group TPV4-bg-slate-50 TPV4-p-2 TPV4-rounded-full TPV4-transition-all hover:TPV4-bg-red-50 TPV4-border-none TPV4-cursor-pointer">
                  <svg class="TPV4-w-5 TPV4-h-5 TPV4-text-slate-400 group-hover:TPV4-text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <div class="TPV4-space-y-5">
                <div class="TPV4-relative">
                  <label class="TPV4-block TPV4-text-[13px] TPV4-font-bold TPV4-text-slate-700 TPV4-uppercase TPV4-tracking-wider TPV4-mb-2">Nhập dữ liệu phân loại</label>
                  <textarea 
                    id="tp-input-data"
                    class="TPV4-w-full TPV4-min-h-[140px] TPV4-p-4 TPV4-bg-slate-50 TPV4-border-2 TPV4-border-transparent TPV4-rounded-xl TPV4-text-slate-700 TPV4-text-sm TPV4-transition-all TPV4-outline-none focus:TPV4-bg-white focus:TPV4-border-orange-500/50 focus:TPV4-ring-4 focus:TPV4-ring-orange-500/10"
                    placeholder="Ví dụ: Đỏ, Vàng, Xanh (Tự động tách bằng dấu phẩy)"
                  ></textarea>
                </div>
                <div class="TPV4-flex TPV4-items-center TPV4-gap-3 TPV4-p-4 TPV4-bg-blue-50 TPV4-rounded-xl">
                  <span class="TPV4-text-blue-500">💡</span>
                  <p class="TPV4-text-[12px] TPV4-text-blue-700 TPV4-m-0 TPV4-leading-relaxed">
                    Mẹo: Bạn có thể copy một cột từ <b>Excel</b> hoặc <b>Google Sheets</b> và dán trực tiếp vào đây.
                  </p>
                </div>
              </div>
              <div class="TPV4-flex TPV4-items-center TPV4-justify-end TPV4-gap-4 TPV4-mt-8">
                <button id="tp-btn-cancel" class="TPV4-text-slate-500 TPV4-text-sm TPV4-font-semibold TPV4-bg-transparent TPV4-border-none TPV4-cursor-pointer hover:TPV4-text-slate-800 TPV4-transition-colors">
                  Để sau
                </button>
                <button id="tp-btn-confirm" class="TPV4-bg-slate-900 TPV4-text-white TPV4-px-8 TPV4-py-3 TPV4-rounded-xl TPV4-font-bold TPV4-text-sm TPV4-shadow-[0_10px_20px_rgba(0,0,0,0.1)] hover:TPV4-bg-orange-600 hover:TPV4-shadow-[0_10px_20px_rgba(238,77,45,0.3)] TPV4-transition-all TPV4-duration-300 TPV4-border-none TPV4-cursor-pointer">
                  Áp dụng ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      `);

      $("body").append($modal);
      $($modal).find("#tp-btn-cancel").on("click", $modal.hide());
      $($modal).find("#tp-btn-confirm").on("click", $modal.hide());
      $($modal).find("#tp-modal-backdrop").on("click", $modal.hide());
      
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