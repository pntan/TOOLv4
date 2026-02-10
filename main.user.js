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
      this.$modal = null;
      this.platform = null;
      this.init();
    }

    init() {
      const host = this.UTILS.getHost();
      if (host.includes("shopee")) {
        if (this.UTILS.getPathName().includes("/portal/product")) {
          this.initLayoutShopee();
          this.platform = "shopee";
        }
      }
    }

    initLayoutShopee() {
      const target = ".product-detail-panel.product-sales-info .panel-header";
      
      this.UTILS.waitForElement(document, target, (e) => {
        if (!$(e).find(".tp-btn-add").length) {
          const $btn = $(`
            <button class="tp-btn-add TPV4-bg-gradient-to-r TPV4-from-[#ff5722] TPV4-to-[#f53d2d] TPV4-font-[600] TPV4-text-white TPV4-shadow-md TPV4-px-5 TPV4-py-2 TPV4-rounded-xl hover:TPV4-brightness-110 TPV4-transition-all TPV4-ml-4 TPV4-border-none TPV4-cursor-pointer">
              ${this.functionName}
            </button>
          `);

          // Sử dụng arrow function để giữ đúng ngữ cảnh 'this'
          $btn.on("click", (event) => {
            event.preventDefault();
            this.openModal();
          });

          $(e).append($btn);
        }
      }, { waitForLastChange: true });
    }

    openModal() {
      if(this.$modal){
        this.$modal.show();
        return;
      }

      this.$modal = $(`
        <div class="TPV4-w-full TPV4-h-full TPV4-fixed TPV4-top-0 TPV4-left-0 TPV4-z-9999999999999999999999">
          <div class="TPV4-w-full TPV4-h-full TPV4-absolute TPV4-bg-black/40 TPV4-backdrop-blur-xl TPV4-z-9999999999999999999999"></div>
          <div class="TPV4-w-full TPV4-h-full TPV4-absolute TPV4-top-0 TPV4-left-0 TPV4-flex TPV4-flex-col TPV4-gap-3 TPV4-justify-center TPV4-items-center TPV4-z-9999999999999999999999">
            <div class"TPV4-w-auto TPV4-h-auto">
              <p class="TPV4-text-white TPV4-font-[700]">${this.functionName}</p>
              <textarea
                placeholder="Mỗi phân loại là một dòng, các trường phân cách bằng 1 TAB\n\t- SKU\n\t- Tên Phân Loại\n\t- Giá Bán (Mặc định sẽ là giá tiền cao nhất có thể trong link để không bị 5 lần giá)\n\t- Số Lượng (Mặc định số lượng = 0)"
                id="TPV4-data"
                class="TPV4-rounded-xl TPV4-p-3 TPV4-resize TPV4-bg-white/70 TPV4-shadow"
              ></textarea>
            </div>
            <div class="TPV4-w-fit TPV4-h-fit">
              <button id="TPV4-confirm" class="TPV4-w-fit TPV4-h-fit TPV4-p-3 TPV4-rounded-xl TPV4-bg-[oklch(0.9029_0.1675_166.11)]">Xác Nhận</button>
            </div>
          </div>
        </div>  
      `)

      $("body").append(this.$modal);

      $(this.$modal).find("#TPV4-confirm").on("click", (e) => {
        this.addVariant($(this.$modal).find("#TPV4-data").val())
        $(this.$modal).hide();
      })

      $(this.$modal).on("click", (e) => {
        $(this.$modal).hide();
      })
    }

    addVariant(data){
      data = data.split("\n");

      const array_data = [];
      $.each(data, (i, v) => {
        array_data.push(v.split("\t"));
      })

      if(this.platform == "shopee") this.addShopee(array_data);
    }

    addShopee(data){
      console.log(data);
    }
  }

  class TPTOOL {
    constructor() {
      this.utils = new UTILS();
      this.initTailwind();
      this.addTabTextarea();
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

    async addTabTextarea(){
      $(document).on("keydown", "textarea", function(event) {
        if (event.keyCode == 9) { // keyCode 9 là mã ASCII của phím Tab
          event.preventDefault();

          var start = this.selectionStart;
          var end = this.selectionEnd;

          $(this).val($(this).val().substring(0, start) + '\t' + $(this).val().substring(end));

          this.selectionStart = this.selectionEnd = start + 1;
        }
      })
    }
  }

  // Khởi chạy
  new TPTOOL();
})();