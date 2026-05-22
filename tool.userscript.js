/* eslint-disable no-eval */

// ==========================================
// 1. CẤU HÌNH & KHỞI CHẠY HỆ THỐNG
// ==========================================
const VERSION = "0.0.1";
let $;
let lastUrl = location.href;

async function initTool() {
  await logging({ type: "success", title: "Core", text: `Kích hoạt hệ thống công cụ v${VERSION}...` });
  
  // Bước 1: Nạp JQuery (Hàm loadLIB của bạn có cơ chế check nếu nạp rồi sẽ rất nhanh)
  await loadLIB("https://code.jquery.com/jquery-4.0.0.min.js");
  $ = typeof unsafeWindow !== "undefined" ? unsafeWindow.$ || unsafeWindow.jQuery : window.$;

  // Bước 2: Chạy tính năng kiểm tra sàn Shopee
  PromotionShopee();
  ProductDetailShopee();
}

// 🌟 IIFE ẨN DANH: Chạy ngay lập tức khi trang web vừa tải xong
(async function main() {
  // 1. Chạy công cụ lần đầu tiên khi load trang
  await initTool();

  // 2. Kích hoạt bộ theo dõi URL thay đổi (SPA Router)
  const urlObserver = new MutationObserver(async () => {
    if (location.href !== lastUrl) {
      lastUrl = location.href; // Cập nhật lại URL hiện tại
      await logging({ type: "warn", title: "Router", text: `Phát hiện URL thay đổi sang: ${lastUrl}` });
      
      // TỰ ĐỘNG CHẠY LẠI TOÀN BỘ QUY TRÌNH (Giống hệt lúc F5 trang)
      await initTool();
    }
  });

  // Theo dõi toàn bộ sự thay đổi của DOM để bắt kịp tiến trình chuyển trang của Shopee
  urlObserver.observe(document, { subtree: true, childList: true });
})();

// Chờ
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Giả lập kéo thả tệp vào một phần tử (element)
function simulateFileDrop(targetElement, files = [], options = {}) {
  var el = targetElement[0] || targetElement; // Đảm bảo el là DOM element

  if (!el) {
    console.warn("simulateFileDrop: Target element not found.");
    return;
  }

  var dataTransfer = new DataTransfer();
  files.forEach(file => {
    // Thay vì kiểm tra instanceof File, kiểm tra instanceof Blob
    // vì File kế thừa từ Blob và Blob ít bị ảnh hưởng bởi ngữ cảnh hơn trong trường hợp này.
    // Hoặc chỉ cần kiểm tra sự tồn tại của các thuộc tính cần thiết của một File/Blob.
    if (file && (file instanceof Blob || (typeof file.name === 'string' && typeof file.size === 'number' && typeof file.type === 'string'))) {
      dataTransfer.items.add(file);
    } else {
      console.warn("simulateFileDrop: Invalid file object provided. Must be an instance of File.", file);
      // Log chi tiết hơn để debug
      console.log("Details of invalid file:", file);
      if (file) {
        console.log("File constructor name:", file.constructor ? file.constructor.name : "N/A");
        try {
          console.log("Is file instanceof window.File?", file instanceof window.File);
          // Có thể thêm kiểm tra instanceof Blob của cửa sổ chính
          console.log("Is file instanceof window.Blob?", file instanceof window.Blob);
        } catch (e) {
          console.log("Error checking instanceof in window context:", e);
        }
      }
    }
  });

  if (dataTransfer.items.length === 0) {
    console.warn("simulateFileDrop: No valid files were added to DataTransfer.", files);
    return; // Không có file nào hợp lệ để kéo thả
  }

  const dragEvents = ['dragenter', 'dragover', 'drop'];

  dragEvents.forEach(eventType => {
    var event;
    if (eventType === 'dragenter' || eventType === 'dragover') {
      event = new DragEvent(eventType, {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer,
        ...options
      });
      event.preventDefault();
    } else if (eventType === 'drop') {
      event = new DragEvent(eventType, {
        bubbles: true,
        cancelable: true,
        dataTransfer: dataTransfer,
        ...options
      });
      event.preventDefault();
    } else {
      event = new DragEvent(eventType, {
        bubbles: true,
        cancelable: true,
        ...options
      });
    }
    el.dispatchEvent(event);
    console.log(`Dispatched ${eventType} event on`, el);
  });
}

// Hàm giả lập thao tác người dùng (đã sửa đổi)
function simulateReactEvent(input, type, options = {}) {
  var el = input[0];

  if (!el) {
    console.warn(`simulateReactEvent: Element not found for eventType ${type}.`);
    return;
  }

  // Hàm con để xử lý sự kiện bàn phím
  function pressKey(keyName) {
    var keyMap = {
      enter: {
        key: 'Enter',
        code: 'Enter'
      },
      tab: {
        key: 'Tab',
        code: 'Tab'
      },
      escape: {
        key: 'Escape',
        code: 'Escape'
      },
      arrowup: {
        key: 'ArrowUp',
        code: 'ArrowUp'
      },
      arrowdown: {
        key: 'ArrowDown',
        code: 'ArrowDown'
      },
      arrowleft: {
        key: 'ArrowLeft',
        code: 'ArrowLeft'
      },
      arrowright: {
        key: 'ArrowRight',
        code: 'ArrowRight'
      }
    };

    var keyData = keyMap[keyName.toLowerCase()] || {
      key: keyName,
      code: keyName
    };

    ['keydown', 'keypress', 'keyup'].forEach(eventType => {
      var event = new KeyboardEvent(eventType, {
        key: keyData.key,
        code: keyData.code,
        bubbles: true,
        cancelable: true,
        ...options // Thêm các tùy chọn khác nếu có (Ctrl, Shift, v.v.)
      });
      el.dispatchEvent(event);
    });
  }

  // --- Xử lý loại sự kiện ---
  var event;
  var knownKeys = ['enter', 'tab', 'escape', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'];

  if (knownKeys.includes(type.toLowerCase())) {
    pressKey(type);
  }
  // Nếu là sự kiện bàn phím tự do
  else if (['keydown', 'keypress', 'keyup'].includes(type)) {
    event = new KeyboardEvent(type, {
      key: options.key || '',
      code: options.code || '',
      bubbles: true,
      cancelable: true,
      ...options // Các tùy chọn khác như altKey, ctrlKey, shiftKey, metaKey
    });
    el.dispatchEvent(event);
  }
  // Nếu là sự kiện chuột (MouseEvent)
  else if (['click', 'mousedown', 'mouseup', 'dblclick', 'contextmenu', 'mousemove', 'mouseover', 'mouseout'].includes(type.toLowerCase())) {
    event = new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      // view: window,
      button: options.button !== undefined ? options.button : 0, // 0 cho chuột trái (mặc định)
      buttons: options.buttons !== undefined ? options.buttons : (type === 'mousedown' ? 1 : 0), // 1 cho nút trái đang nhấn
      clientX: options.clientX || 0,
      clientY: options.clientY || 0,
      screenX: options.screenX || 0,
      screenY: options.screenY || 0,
      altKey: options.altKey || false,
      ctrlKey: options.ctrlKey || false,
      shiftKey: options.shiftKey || false,
      metaKey: options.metaKey || false,
      ...options // Các tùy chọn khác như relatedTarget
    });
    el.dispatchEvent(event);
  }
  // Các loại sự kiện khác (input, change, blur, focus, submit,...)
  else {
    event = new Event(type, {
      bubbles: true,
      cancelable: true,
      ...options
    });
    el.dispatchEvent(event);
  }

  console.log(`Dispatched ${type} event on`, el);
}

// Giả lập input file
function simulateReactInputFile(input) {
  var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'files')?.set;

  try {
    if (nativeInputValueSetter) {
      nativeInputValueSetter.call(input, input.files);
    }

    // Trigger lại các sự kiện input và change để React có thể nhận diện sự thay đổi
    var inputEvent = new Event('input', {
      bubbles: true
    });
    var changeEvent = new Event('change', {
      bubbles: true
    });

    input.dispatchEvent(inputEvent);
    input.dispatchEvent(changeEvent);
  } catch (e) {}
}

// Giả lập xóa nội dung
function simulateClearing(inputElement, delay = 50, callback) {
  let text = inputElement.val();
  let index = text.length;

  function deleteNext() {
    if (index > 0) {
      inputElement.val(text.slice(0, --index)); // Xóa ký tự cuối cùng
      inputElement.trigger($.Event("keydown", {
        key: "Backspace",
        keyCode: 8
      }));
      setTimeout(deleteNext, delay);
    } else if (callback) {
      callback(); // Gọi callback sau khi xóa xong
    }
  }

  deleteNext();
}

// Giả lập gõ nội dung
function simulateTyping(inputElement, text, event = "input", delay = 100, callback = null) {
  let index = 0;

  function typeNext() {
    if (index < text.length) {
      let char = text[index];
      inputElement.val(inputElement.val() + char);
      inputElement.trigger($.Event(event, {
        key: char,
        keyCode: char.charCodeAt(0),
        bubbles: true
      }));
      inputElement.trigger($.Event(event, {
        key: char,
        keyCode: char.charCodeAt(0),
        bubbles: true
      }));
      index++;
      setTimeout(typeNext, delay);
    } else {
      // Giả lập xóa khoảng trắng cuối cùng
      inputElement.trigger($.Event(event, {
        key: "Backspace",
        keyCode: 8,
        bubbles: true
      }));
      inputElement.trigger(event);
      inputElement.select();

      if (window.getSelection) {
        window.getSelection().removeAllRanges();
      } else if (document.selection) {
        document.selection.empty();
      }

      if ("createEvent" in document) {
        var evt = document.createEvent("HTMLEvents");
        evt.initEvent(event, false, true);
        $(inputElement).get(0).dispatchEvent(evt);
      } else {
        $(inputElement).get(0).fireEvent(`on${event}`);
      }

      if (typeof callback === "function") {
        callback();
      }
    }
  }

  typeNext();
}

// Giả lập dán nội dung
function simulatePaste(inputElement, pastedText, event = "input", callback = null) {
  // Đặt giá trị như người dùng dán
  var el = inputElement[0];

  // Gán trực tiếp thông qua setter gốc (để React nhận biết)
  var nativeSetter = Object.getOwnPropertyDescriptor(el.__proto__, 'value')?.set;
  nativeSetter ? nativeSetter.call(el, pastedText) : inputElement.val(pastedText);

  // Tạo clipboardData giả để gửi sự kiện paste
  var pasteEvent = new ClipboardEvent('paste', {
    bubbles: true,
    cancelable: true,
    clipboardData: new DataTransfer()
  });

  pasteEvent.clipboardData.setData('text/plain', pastedText);

  // Gửi sự kiện paste
  el.dispatchEvent(pasteEvent);

  // Gửi sự kiện input để đảm bảo state được cập nhật
  el.dispatchEvent(new InputEvent(event, {
    bubbles: true
  }));

  // Gửi sự kiện change nếu cần (để framework bắt được)
  el.dispatchEvent(new Event('change', {
    bubbles: true
  }));

  // Gọi callback nếu có
  if (typeof callback === "function") {
    callback();
  }
}

// Giả lập input file
function simulateReactInput(input, text, delay) {
  delay = delay || 100;
  var el = input[0];
  input.focus();

  var i = 0;

  function setNativeValue(element, value) {
    var lastValue = element.value;
    element.value = value;

    // Gọi setter gốc nếu bị React override
    var event = new Event('input', {
      bubbles: true
    });
    var tracker = element._valueTracker;
    if (tracker) tracker.setValue(lastValue);
    element.dispatchEvent(event);
  }

  function typeChar() {
    if (i < text.length) {
      var newVal = input.val() + text[i];
      setNativeValue(el, newVal);
      i++;
      typeChar();
    }
  }

  typeChar();
}

// Giả lập làm trống input
function simulateClearReactInput(input) {
  var el = input[0];

  function setNativeValue(element, value) {
    var lastValue = element.value;
    element.value = value;

    var event = new Event('input', {
      bubbles: true
    });
    var tracker = element._valueTracker;
    if (tracker) tracker.setValue(lastValue);
    element.dispatchEvent(event);
  }

  input.focus();
  setNativeValue(el, '');
}

/**
 * Component Text chuẩn (p hoặc span)
 */
function createText({ tag = "p", text = "", color = "#1e293b", size = "14px", weight = "normal", id = "", className = "", style = "" } = {}) {
  const idAttr = id ? `id="${id}"` : "";
  const classAttr = className ? `class="${className}"` : "";
  return `<${tag} ${idAttr} ${classAttr} style="color: ${color}; font-size: ${size}; font-weight: ${weight}; margin: 4px 0; font-family: sans-serif; ${style}">${text}</${tag}>`;
}

/**
 * Component Input Text cao cấp
 */
function createInput({ placeholder = "Nhập dữ liệu...", value = "", id = "", className = "", name = "", width = "100%", style = "" } = {}) {
  const idAttr = id ? `id="${id}"` : "";
  const classAttr = className ? `class="${className}"` : "";
  const nameAttr = name ? `name="${name}"` : "";
  return `
    <input 
      type="text" 
      ${idAttr} ${classAttr} ${nameAttr}
      placeholder="${placeholder}" 
      value="${value}"
      style="width: ${width}; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; color: #334155; outline: none; box-sizing: border-box; transition: border 0.2s; ${style}"
      onfocus="this.style.borderColor='#3b82f6'"
      onblur="this.style.borderColor='#cbd5e1'"
    />`;
}

/**
 * Component Textarea rộng rãi để chứa danh sách ID
 */
function createTextarea({ placeholder = "Nhập dữ liệu, mỗi dòng một giá trị...", rows = 4, id = "", className = "", name = "", width = "100%", style = "" } = {}) {
  const idAttr = id ? `id="${id}"` : "";
  const classAttr = className ? `class="${className}"` : "";
  const nameAttr = name ? `name="${name}"` : "";

  const tabLogic = `
    if (event.key === 'Tab' || event.keyCode === 9) {
      event.preventDefault();
      var start = this.selectionStart;
      var end = this.selectionEnd;
      this.value = this.value.substring(0, start) + '\\t' + this.value.substring(end);
      this.selectionStart = this.selectionEnd = start + 1;
      this.dispatchEvent(new Event('input', { bubbles: true }));
    }
  `.replace(/\s+/g, ' ').trim();

  return `
    <textarea 
      ${idAttr} ${classAttr} ${nameAttr}
      rows="${rows}" 
      placeholder="${placeholder}"
      style="width: ${width}; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; color: #334155; outline: none; box-sizing: border-box; font-family: monospace; resize: vertical; transition: border 0.2s; ${style}"
      onfocus="this.style.borderColor='#3b82f6'"
      onblur="this.style.borderColor='#cbd5e1'"
      onkeydown="${tabLogic}"
    ></textarea>`;
}

/**
 * Component Button xịn sò (Hỗ trợ 3 trạng thái: primary, success, danger)
 */
function createButton({ text = "Click Me", variant = "primary", id = "", className = "", name = "", style = "" } = {}) {
  const colors = {
    primary: { bg: "#3b82f6", hover: "#2563eb" },
    success: { bg: "#10b981", hover: "#059669" },
    danger:  { bg: "#ef4444", hover: "#dc2626" }
  };
  const theme = colors[variant] || colors.primary;
  const idAttr = id ? `id="${id}"` : "";
  const classAttr = className ? `class="${className}"` : "";
  const nameAttr = name ? `name="${name}"` : "";

  return `
    <button 
      ${idAttr} ${classAttr} ${nameAttr}
      style="background: ${theme.bg}; color: white; padding: 8px 16px; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; font-family: sans-serif; ${style}"
      onmouseover="this.style.background='${theme.hover}'"
      onmouseout="this.style.background='${theme.bg}'"
    >${text}</button>`;
}

/**
 * Container bọc khối tính năng cho gọn gàng và đẹp đẽ
 */
function createCardContainer({ title = "", contentHTML = "", id = "", className = "", style = "" } = {}) {
  const idAttr = id ? `id="${id}"` : "";
  const classAttr = className ? `class="${className}"` : "";
  return `
    <div ${idAttr} ${classAttr} style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); margin-bottom: 12px; font-family: sans-serif; ${style}">
      ${title ? `<div style="font-weight: bold; font-size: 15px; color: #0f172a; margin-bottom: 12px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">${title}</div>` : ""}
      <div>${contentHTML}</div>
    </div>`;
}

/**
 * Component Link (Thẻ a) cao cấp
 */
function createLink({ text = "Xem chi tiết", href = "#", target = "_blank", color = "#3b82f6", hoverColor = "#1d4ed8", size = "14px", weight = "normal", id = "", className = "", style = "" } = {}) {
  const randomId = id || "lnk-" + Math.random().toString(36).substr(2, 9);
  const classAttr = className ? `class="${className}"` : "";
  
  return `
    <style>
      #${randomId}:hover { color: ${hoverColor} !important; text-decoration: underline !important; }
    </style>
    <a 
      id="${randomId}"
      ${classAttr}
      href="${href}" 
      target="${target}" 
      style="color: ${color}; font-size: ${size}; font-weight: ${weight}; text-decoration: none; font-family: sans-serif; transition: color 0.2s; cursor: pointer; ${style}"
    >
      ${text}
    </a>`;
}

/**
 * Component Image (Thẻ img) an toàn, bo góc đẹp mắt
 */
function createImage({ src = "", alt = "Image", width = "50px", height = "50px", radius = "6px", id = "", className = "", style = "" } = {}) {
  const idAttr = id ? `id="${id}"` : "";
  const classAttr = className ? `class="${className}"` : "";
  return `
    <img 
      ${idAttr} ${classAttr}
      src="${src}" 
      alt="${alt}" 
      style="width: ${width}; height: ${height}; border-radius: ${radius}; object-fit: cover; border: 1px solid #e2e8f0; display: inline-block; vertical-align: middle; box-sizing: border-box; ${style}"
      onerror="this.style.display='none';" 
    />`;
}

/**
 * Component Icon (SVG) - Cung cấp sẵn một số mẫu icon quản trị phổ biến
 */
function createIcon({ name = "info", color = "#64748b", size = "16px", style = "" } = {}) {
  const icons = {
    info: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.852l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" /></svg>`,
    success: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
    warn: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`,
    danger: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`,
    settings: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.767c-.31.236-.454.615-.411.999.005.051.008.103.008.156 0 .052-.003.104-.008.155-.043.384.102.763.411.999l1.003.767a1.125 1.125 0 01.26 1.43l-1.297 2.247a1.125 1.125 0 01-1.37.491l-1.216-.456c-.356-.133-.751-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.767c.31-.236.453-.615.41-.999A6.17 6.17 0 016 12c0-.053.004-.104.008-.155.043-.384-.102-.763-.41-.999L4.593 8.08a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>`,
    trash: `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" /></svg>`
  };

  const svgContent = icons[name] || icons.info;
  return `
    <span style="display: inline-block; width: ${size}; height: ${size}; color: ${color}; vertical-align: middle; line-height: 1; box-sizing: border-box; ${style}">
      ${svgContent}
    </span>`;
}

/**
 * Component Checkbox (Nhãn kèm ô tích) cao cấp, dễ bấm
 */
function createCheckbox({ label = "Tùy chọn", checked = false, id = "", className = "", name = "", style = "" } = {}) {
  const idAttr = id ? `id="${id}"` : "";
  const classAttr = className ? `class="${className}"` : "";
  const nameAttr = name ? `name="${name}"` : "";
  return `
    <label style="display: inline-flex; align-items: center; cursor: pointer; font-family: sans-serif; font-size: 14px; color: #334155; user-select: none; ${style}">
      <input 
        type="checkbox" 
        ${idAttr} ${classAttr} ${nameAttr}
        ${checked ? "checked" : ""} 
        style="width: 16px; height: 16px; margin-right: 8px; border: 1px solid #cbd5e1; border-radius: 4px; cursor: pointer; accent-color: #3b82f6;"
      />
      <span>${label}</span>
    </label>`;
}

/**
 * Component Badge hiển thị trạng thái (4 màu lựa chọn)
 */
function createBadge({ text = "Tag", variant = "primary", id = "", className = "", style = "" } = {}) {
  const themes = {
    primary: { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
    success: { bg: "#ecfdf5", color: "#047857", border: "#a7f3d0" },
    warn:    { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
    danger:  { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" }
  };
  const theme = themes[variant] || themes.primary;
  const idAttr = id ? `id="${id}"` : "";
  const classAttr = className ? `class="${className}"` : "";

  return `
    <span ${idAttr} ${classAttr} style="display: inline-block; background: ${theme.bg}; color: ${theme.color}; border: 1px solid ${theme.border}; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 600; font-family: sans-serif; line-height: 1.2; ${style}">
      ${text}
    </span>`;
}

/**
 * Container Flexbox dàn hàng ngang các phần tử con
 */
function createFlexRow({ contentHTML = "", gap = "8px", align = "center", justify = "flex-start", id = "", className = "", style = "" } = {}) {
  const idAttr = id ? `id="${id}"` : "";
  const classAttr = className ? `class="${className}"` : "";
  return `
    <div ${idAttr} ${classAttr} style="display: flex; flex-direction: row; gap: ${gap}; align-items: ${align}; justify-content: ${justify}; box-sizing: border-box; ${style}">
      ${contentHTML}
    </div>`;
}

/**
 * Component Select/Option cao cấp
 * @param {Array} options Danh sách lựa chọn, ví dụ: ['A', 'B'] hoặc [{ value: 'v1', label: 'Label 1' }]
 * @param {string|number} selectedValue Giá trị được chọn mặc định
 */
function createSelect({ 
  options = [], 
  selectedValue = "", 
  id = "", 
  className = "", 
  name = "", 
  width = "100%", 
  style = "" 
} = {}) {
  const idAttr = id ? `id="${id}"` : "";
  const classAttr = className ? `class="${className}"` : "";
  const nameAttr = name ? `name="${name}"` : "";

  let optionsHTML = "";
  options.forEach(opt => {
    let val = opt;
    let label = opt;
    
    // Nếu option truyền vào là một Object dạng { value, label }
    if (opt && typeof opt === "object") {
      val = opt.value !== undefined ? opt.value : "";
      label = opt.label !== undefined ? opt.label : val;
    }
    
    const isSelected = val.toString() === selectedValue.toString() ? "selected" : "";
    optionsHTML += `<option value="${val}" ${isSelected}>${label}</option>`;
  });

  return `
    <select 
      ${idAttr} ${classAttr} ${nameAttr}
      style="width: ${width}; padding: 8px 12px; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 14px; color: #334155; backgroundColor: #ffffff; outline: none; box-sizing: border-box; transition: border 0.2s; cursor: pointer; ${style}"
      onfocus="this.style.borderColor='#3b82f6'"
      onblur="this.style.borderColor='#cbd5e1'"
    >
      ${optionsHTML}
    </select>`;
}

/**
 * Khởi tạo khung chứa Toast cố định ở góc trên bên phải màn hình
 */
function createToastContainer() {
  if (document.getElementById("tp-toast")) return;
  const container = document.createElement("div");
  container.id = "tp-toast";
  container.style = "position: fixed; top: 20px; right: 20px; z-index: 99999; display: flex; flex-direction: column; gap: 10px; max-width: 350px; font-family: sans-serif;";
  document.body.appendChild(container);
}

/**
 * Hàm gọi hiển thị Toast thông báo nhanh (Hỗ trợ: success, error, info, warn)
 */
function showToast({ title = "", text = "", type = "info", duration = 3000 } = {}) {
  // Đảm bảo container luôn tồn tại trước khi bắn toast
  createToastContainer();
  const container = document.getElementById("tp-toast");

  const themes = {
    success: { bg: "#ffffff", border: "#10b981", icon: "success", iconColor: "#10b981" },
    error:   { bg: "#ffffff", border: "#ef4444", icon: "danger", iconColor: "#ef4444" },
    warn:    { bg: "#ffffff", border: "#f59e0b", icon: "warn", iconColor: "#f59e0b" },
    info:    { bg: "#ffffff", border: "#3b82f6", icon: "info", iconColor: "#3b82f6" }
  };
  const theme = themes[type] || themes.info;

  // Tạo node phần tử toast
  const toast = document.createElement("div");
  toast.style = `background: ${theme.bg}; border-left: 4px solid ${theme.border}; box-shadow: 0 4px 12px rgba(0,0,0,0.1); padding: 12px 16px; border-radius: 6px; display: flex; align-items: flex-start; gap: 12px; min-width: 280px; opacity: 0; transform: translateX(50px); transition: all 0.3s ease;`;

  // Tận dụng hàm createIcon sẵn có của bạn
  const iconHTML = createIcon({ name: theme.icon, color: theme.iconColor, size: "18px" });

  toast.innerHTML = `
    <div style="flex-shrink: 0; margin-top: 2px;">${iconHTML}</div>
    <div style="flex-grow: 1;">
      <div style="font-weight: bold; font-size: 14px; color: #1e293b; margin-bottom: 2px;">${title}</div>
      <div style="font-size: 13px; color: #64748b; line-height: 1.4;">${text}</div>
    </div>
  `;

  container.appendChild(toast);

  // Kích hoạt hiệu ứng bay vào (Animation)
  setTimeout(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(0)";
  }, 10);

  // Tự động biến mất sau thời gian định sẵn
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(50px)";
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ==========================================
// 2. NHÓM HÀM TIỆN ÍCH (UTILS)
// ==========================================

/**
 * Hàm nạp thư viện động bọc Promise (Đồng bộ hóa luồng chạy)
 */
async function loadLIB(url) {
  try {
    await logging({ type: "log", title: "Lib", text: `Đang tải thư viện: ${url}` });
    
    const scriptContent = await new Promise((resolve, reject) => {
      GM.xmlHttpRequest({
        method: "GET",
        url: url,
        nocache: true,
        onload: (res) => resolve(res.responseText),
        onerror: (err) => reject(err)
      });
    });

    // Ép nạp vào context trang web (unsafeWindow) để toàn trang sử dụng được biến $
    if (typeof unsafeWindow !== "undefined") {
      unsafeWindow.eval(scriptContent);
    } else {
      window.eval(scriptContent);
    }
    
    await logging({ type: "success", title: "Lib", text: `Đã nạp thành công thư viện từ nguồn!` });
  } catch (error) {
    await logging({ type: "error", title: "Lib Error", text: `Không thể nạp thư viện: ${error}` });
  }
}

/**
 * Hệ thống In Log Console định dạng CSS xịn sò
 */
async function logging({ type = "log", title = "", text = "", customColor = "" } = {}) {
  const themes = {
    log:     { bg: "#4b5563", text: "#ffffff" }, 
    success: { bg: "#10b981", text: "#ffffff" }, 
    warn:    { bg: "#f59e0b", text: "#000000" }, 
    error:   { bg: "#ef4444", text: "#ffffff" }  
  };

  let theme = themes[type] || themes.log;
  if (type === "custom" && customColor) {
    theme = { bg: customColor, text: "#ffffff" };
  }

  const styleTag = `background:${theme.bg};color:${theme.text};padding:3px 6px;border-radius:4px;font-weight:bold;font-size:11px;`;
  const styleText = `color:${type === 'error' ? '#ef4444' : type === 'warn' ? '#d97706' : '#e5e7eb'};font-size:12px;margin-left:5px;`;

  const logTitle = title ? `[${title.toUpperCase()}]` : "[TOOL]";
  console.log(`%c${logTitle}%c${text}`, styleTag, styleText);
}

/**
 * Lấy giá trị Cookie chi tiết qua API Tampermonkey
 */
async function getCookie(cookieName) {
  try {
    if (!cookieName) return null;
    const cookies = await GM.cookie.list({ name: cookieName });
    if (cookies && cookies.length > 0) {
      return cookies[0].value;
    }
    return null;
  } catch (error) {
    await logging({ type: "error", title: "Cookie Error", text: error.message || error });
    return null;
  }
}

/**
 * Hàm đợi một phần tử render ra DOM (Không sợ dính lỗi bất đồng bộ của SPA)
 */
function waitForElement(selector, callback, options = { once: false }) {
  // Nếu thấy phần tử có sẵn thì xử lý luôn
  const target = document.querySelector(selector);
  if (target) {
    callback(target);
    if (options.once) return;
  }

  // Theo dõi sự thay đổi giao diện để bắt khoảnh khắc xuất hiện
  const observer = new MutationObserver(() => {
    const el = document.querySelector(selector);
    if (el) {
      callback(el);
      if (options.once) {
        observer.disconnect();
      }
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });
}

/**
 * Hàm bóc tách dữ liệu thô siêu linh hoạt
 * @param {string} rawText Dữ liệu thô từ Textarea
 * @param {Array<string>} columnSchema Mảng định nghĩa thứ tự cột, ví dụ: ['sku', 'quantity', 'price']
 * @param {string} groupByKey (Tùy chọn) Key dùng để gom nhóm. Nếu để trống, hàm trả về mảng phẳng sạch.
 * @param {Array<string>} requiredFields (Tùy chọn) Danh sách các cột bắt buộc phải có chữ, nếu trống sẽ bỏ qua cả dòng. Ví dụ: ['sku']
 * @param {Object} defaultValues (Tùy chọn) Giá trị mặc định cho cột optional nếu trống, ví dụ: { quantity: "0" }
 * @param {boolean} ignoreEmptyGroup Nếu true và có groupByKey, dòng nào trống key gom nhóm sẽ bị bỏ qua. Nếu false, gom vào "CHUA_PHAN_LOAI".
 */
function parseDataInput({ 
  rawText = "", 
  columnSchema = [], 
  requiredFields = [],
  defaultValues = {},
  groupByKey = "",         
  ignoreEmptyGroup = true  
} = {}) {
  if (!rawText.trim() || columnSchema.length === 0) return [];

  // 1. Tách văn bản thành các dòng độc lập, loại bỏ dòng trống hoàn toàn
  const lines = rawText.split(/\r?\n/).filter(line => line.trim() !== "");
  const cleanFlatData = [];

  // 2. Bước 1: Trích xuất và thẩm định dữ liệu cơ bản từng dòng
  for (const line of lines) {
    const columns = line.split("\t");
    const itemObject = {};
    let isRowValid = true;

    columnSchema.forEach((keyName, index) => {
      let value = columns[index] !== undefined ? columns[index].trim() : "";
      
      if (value === "" && defaultValues[keyName] !== undefined) {
        value = defaultValues[keyName].toString();
      }

      itemObject[keyName] = value;

      if (requiredFields.includes(keyName) && value === "") {
        isRowValid = false;
      }
    });

    if (isRowValid) {
      cleanFlatData.push(itemObject);
    }
  }

  // 3. Bước 2: Nếu KHÔNG yêu cầu Group -> Trả về mảng phẳng cơ bản ngay lập tức
  if (!groupByKey || groupByKey.trim() === "") {
    return cleanFlatData;
  }

  // 4. Bước 3: Nếu CÓ yêu cầu Group -> Tiến hành gom nhóm ngầm bằng Object
  const groupedObject = cleanFlatData.reduce((result, currentItem) => {
    let groupValue = currentItem[groupByKey]?.trim();

    // XỬ LÝ IGNORE: Nếu key để nhóm bị trống
    if (!groupValue || groupValue === "") {
      if (ignoreEmptyGroup) {
        return result; // 🌟 IGNORE: Bỏ qua hoàn toàn dòng này, không đưa vào kết quả
      } else {
        groupValue = "CHUA_PHAN_LOAI"; // Gom vào nhóm đặc biệt nếu không muốn ẩn đi
      }
    }

    if (!result[groupValue]) {
      result[groupValue] = [];
    }
    result[groupValue].push(currentItem);
    
    return result;
  }, {});

  // 5. Bước 4: 🌟 CHUẨN HÓA ĐẦU RA -> Chuyển Object nhóm ngược lại thành MẢNG PHẲNG tuần tự
  // Các dòng cùng nhóm bây giờ sẽ được xếp liền kề nhau trong mảng
  const finalGroupedArray = [];
  for (const key in groupedObject) {
    finalGroupedArray.push(...groupedObject[key]);
  }

  return finalGroupedArray;
}

/**
 * Hàm gọi API tập trung vượt CORS
 */
async function ShopeeAPI({ path = "/", method = "GET", payload = null } = {}) {
  try {
    const spcCds = await getCookie("SPC_CDS");
    const spcCdsVer = await getCookie("SPC_CDS_VER") || 2;
    
    // Đưa method về dạng viết hoa để so sánh chuẩn xác
    const upperMethod = method.toUpperCase(); 

    // 1. XỬ LÝ ĐƯỜNG DẪN CƠ BẢN
    let finalUrl = path.startsWith("http") ? path : `${window.location.origin}${path}`;
    
    // 2. 🌟 TỰ ĐỘNG CHUYỂN PAYLOAD THÀNH QUERY PARAMS NẾU LÀ PHƯƠNG THỨC GET
    if (upperMethod === "GET" && payload && typeof payload === "object") {
      const queryString = new URLSearchParams(payload).toString();
      if (queryString) {
        // Kiểm tra xem URL gốc đã có dấu hỏi chấm "?" chưa để nối chuỗi cho đúng
        finalUrl += finalUrl.includes("?") ? `&${queryString}` : `?${queryString}`;
      }
    }

    // 3. Nạp các tham số cookie bắt buộc của Shopee vào cuối URL
    finalUrl += finalUrl.includes("?") 
      ? `&SPC_CDS=${spcCds}&SPC_CDS_VER=${spcCdsVer}` 
      : `?SPC_CDS=${spcCds}&SPC_CDS_VER=${spcCdsVer}`;

    await logging({ type: "custom", title: "Fetch", text: `Kết nối API: ${finalUrl}`, customColor: "#3b82f6" });

    return new Promise((resolve, reject) => {
      GM.xmlHttpRequest({
        method: upperMethod,
        url: finalUrl,
        headers: { "Content-Type": "application/json" },
        // 🌟 CHỈ CHO PHÉP TRUYỀN DATA/BODY NẾU KHÔNG PHẢI LÀ LỆNH GET HOẶC HEAD
        data: (upperMethod !== "GET" && upperMethod !== "HEAD" && payload) ? JSON.stringify(payload) : null,
        onload: function(response) {
          if (response.status === 200) {
            try {
              resolve(JSON.parse(response.responseText));
            } catch (e) {
              resolve(response.responseText);
            }
          } else {
            console.log(response);
            reject(`Lỗi Status: ${response.status}`);
          }
        },
        onerror: (error) => reject(error)
      });
    });
  } catch (error) {
    await logging({ type: "error", title: "API Core Error", text: error.message || error });
    return null;
  }
}

async function tachGia( giaGoc = 0 ){
  if (!giaGoc) return { giaDau: 0, giaDuoi: 0 };
  
  // Chuyển về chuỗi, xóa khoảng trắng và lọc chỉ giữ lại ký tự số
  let strGoc = giaGoc.toString().trim().replace(/\D/g, "");
  const lenGoc = strGoc.length;

  // Nếu chuỗi quá ngắn (dưới 4 chữ số, ví dụ giá chỉ có vài trăm đồng) thì không cần tách
  if (lenGoc < 4) {
    const giaSingle = parseInt(strGoc, 10) || 0;
    return { giaDau: giaSingle, giaDuoi: giaSingle };
  }

  // Khởi tạo mặc định: Đuôi lấy 3 số cuối, Đầu lấy phần còn lại
  let chuoiDau = strGoc.slice(0, -3);
  let chuoiDuoi = strGoc.slice(-3);

  let trangThaiTotNhat = { chuoiDau, chuoiDuoi };

  // Vòng lặp dịch chuyển từng chữ số từ Đầu sang Đuôi
  while (chuoiDau.length > 0) {
    const numDau = parseInt(chuoiDau, 10);
    const numDuoi = parseInt(chuoiDuoi, 10);

    // Điều kiện dừng: Khi giá trị số của chuỗi đuôi đã vượt qua chuỗi đầu
    if (numDuoi > numDau) {
      break;
    }

    // Lưu lại trạng thái hợp lệ gần nhất
    trangThaiTotNhat = { chuoiDau, chuoiDuoi };

    // Thực hiện bóc chữ số cuối vế đầu quăng sang vế đuôi
    const soBiBoc = chuoiDau.slice(-1);
    chuoiDau = chuoiDau.slice(0, -1);
    chuoiDuoi = soBiBoc + chuoiDuoi;
  }

  // 1. Chuẩn hóa giá đầu trước bằng cách bù đủ chiều dài gốc lenGoc
  const giaDauFinalStr = trangThaiTotNhat.chuoiDau.padEnd(lenGoc, "0");
  const giaDau = parseInt(giaDauFinalStr, 10);

  // Tính xem giá đầu thực tế đã được bù bao nhiêu chữ số 0
  const soLuongSo0DaBu = lenGoc - trangThaiTotNhat.chuoiDau.length;

  // 2. Xử lý giá đuôi: Bù số "0" một cách an toàn dựa trên số lượng số 0 của giá đầu
  // Thay vì bù full lenGoc, ta chỉ bù tối đa bằng số lượng số 0 mà giá đầu có
  let giaDuoiFinalStr = trangThaiTotNhat.chuoiDuoi;
  
  // Thử bù dần số 0 vào giá đuôi và kiểm tra điều kiện
  let giaDuoiThuNghiem = parseInt(giaDuoiFinalStr.padEnd(giaDuoiFinalStr.length + soLuongSo0DaBu, "0"), 10);
  
  // Nếu sau khi bù tối đa mà giá đuôi vẫn lớn hơn giá đầu (Vô lý), ta hạ bớt 1 số 0
  if (giaDuoiThuNghiem > giaDau) {
    giaDuoiFinalStr = giaDuoiFinalStr.padEnd(giaDuoiFinalStr.length + (soLuongSo0DaBu - 1), "0");
  } else {
    giaDuoiFinalStr = giaDuoiFinalStr.padEnd(giaDuoiFinalStr.length + soLuongSo0DaBu, "0");
  }

  let giaDuoi = parseInt(giaDuoiFinalStr, 10);

  // --- LAYER 4: HẬU KIỂM TRA LOGIC TOÁN HỌC (POST-CHECKING VALIDATION) ---
  // Trường hợp khẩn cấp: Nếu bằng một cách nào đó giá đuôi vẫn lớn hơn giá đầu hoặc bằng 0
  if (giaDuoi > giaDau || giaDuoi === 0) {
    giaDuoi = giaDau; // Cơ chế an toàn (Fallback): Coi như sản phẩm không giảm giá
  }

  return { giaDau, giaDuoi };
}

// ==========================================
// 3. LOGIC TÍNH NĂNG CHI TIẾT (FEATURES)
// ==========================================

// Trang thao tác với khuyến mãi shopee
async function PromotionShopee() {
  if(!document.location.href.startsWith("https://banhang.shopee.vn/portal/marketing/discount")) return;
  
  // Lấy thực thể jQuery từ context chính của trang Web
  const $ = typeof unsafeWindow !== "undefined" ? unsafeWindow.$ || unsafeWindow.jQuery : window.$;

  // 🚀 Hành động 1: Chờ phần tử DOM xuất hiện để append nội dung text hiển thị
  waitForElement(".list-filter", async (element) => {
    const idTextarea = createTextarea({ placeholder: "Nhập danh sách ID sản phẩm (Mỗi dòng một ID)...", rows: 3, style: "margin-bottom: 10px;" });
    const scanBtn = createButton({ text: "Quét Sản Phẩm", variant: "primary", style: "margin-right: 6px;" });
    const delBtn = createButton({ text: "Xóa Khuyến Mãi", variant: "danger" });

    const formHTML = createCardContainer({
      title: "Điều chỉnh khuyến mãi",
      contentHTML: idTextarea + scanBtn + delBtn,
      style: "margin: 10px 0; width: 100%;"
    });

    const $form = $(formHTML);

    if (element && $) {
      $(element).append($form);
      await logging({ type: "success", title: "UI", text: "Đã chèn đoạn test HTML thành công vào trang Shopee!" });
    }

    const promotion_id = document.location.pathname.split("/")[document.location.pathname.split("/").length - 1];

    $form.find("button:contains('Quét Sản Phẩm')").on("click", async (e) => {
      const exist_id = [];
      const id_list = ($form.find("textarea")[0].value.trim()).split("\n");

      for (const id of id_list){
        // 🚀 Hành động 2: Gọi API lấy dữ liệu song song
        const dataResult = await ShopeeAPI({
          method: "POST",
          path: "/api/marketing/v4/discount/standard_search_seller_discount_items/",
          payload: {
            keyword: id.trim(),
            promotion_id: parseInt(promotion_id),
            search_type: 2
          }
        });

        if(dataResult.error == 0)
          exist_id.push(id);
      }

      GM.setClipboard(exist_id.join("\n"));
      showToast({ text: "Đã lưu ID vào bộ nhớ đệm" })
    })

    $form.find("button:contains('Xóa Khuyến Mãi')").on("click", async (e) => {
      const exist_id = [];
      const id_list = ($form.find("textarea")[0].value.trim()).split("\n");

      console.log(id_list);

      const dataResult = await ShopeeAPI({
        method: "POST",
        path: "/api/marketing/v4/discount/delete_abnormal_seller_discount_items/",
        payload: {
          item_id_list: id_list.map(Number), // "4049938414, 23986523876",
          promotion_id: parseInt(promotion_id),
        }
      });

      showToast({ text: "Đã xóa các sản phẩm khỏi chương trình" })
    })
  }, { once: true });

  waitForElement(".list-filter-container .top-right-btn-container", async (element) => {
    const giaDuoiBtn = createButton({ text: "Chỉnh Giá Đuôi" })
    $(element).prepend(giaDuoiBtn);

    $(element).find("button:contains('Chỉnh Giá Đuôi')").on("click", async (e) => {
      const list = $(".discount-items-wrapper .discount-items .discount-item-component");
      for(const item of list){
        if($(item).find(".discount-item-header .eds-checkbox.discount-item-selector input:checked").length > 0){
          const rows = $(item).find(".discount-edit-item-model-list > div");

          for(const item of rows){
            const box = $(item).find("> div:nth-child(1)");
            const origin_price = (box.find(".item-content.item-price div")[0].innerText).replace("₫", "").replace(".", "");
            const discount_price = (box.find(".price-discount-form .price-discount-input input"));
            const currency_price = discount_price[0];
            const percent_price = discount_price[1];
            const switcher = (box.find(".item-content.item-enable-disable .eds-switch"))
            if(!switcher.hasClass("eds-switch--disabled")){
              if(switcher.hasClass("eds-switch--close")){
                console.log("A");
                $(switcher).focus().trigger("click").click();
                await delay(200);
              }
              const { giaDuoi } = await tachGia(origin_price);
              await simulateClearReactInput($(currency_price));
              await simulateReactInput($(currency_price), giaDuoi.toString());
            }
          }
        }
      }

      showToast({ text: "Cập nhật giá hoàn tất" })
    })
  }, { once: true })
}

// Trang chi tiết sản phẩm shopee
/// https://banhang.shopee.vn/portal/product/
async function ProductDetailShopee() {
  if(!document.location.href.startsWith("https://banhang.shopee.vn/portal/product")) return;

  // Lấy thông tin chi tiết sản phẩm
  // /api/v3/product/
  var fetch_product_data = null;
  
  await (async () => {
    const product_id = document.location.pathname.split("/")[document.location.pathname.split("/").length - 1];
    const response = await ShopeeAPI({
      method: "GET",
      path: "/api/v3/product/get_product_info",
      payload: {
        product_id: product_id,
        is_draft: false,
      }
    })

    if(response.code != 0){
      showToast({ title: "Lỗi", text: "Không lấy được mã phân loại", type: "error" });
      return;
    }

    fetch_product_data = response.data.product_info;
  })()

  // Danh sách các chức năng hàng loạt
  waitForElement(".edit-row.batch-edit-row", async (element) => {
    const replacePriceBtn = createButton({ text: "Cập Nhật Giá" });
    const featureCard = createCardContainer({ contentHTML: replacePriceBtn });
    const bulkCard = createCardContainer({ title: "Xử Lý Hàng Loạt", contentHTML: featureCard, style: "margin: 1vw 0; width: 100%;", className: "tp-bulkCard" });

    $(element).append(bulkCard);

    // Sự kiện khi nhấn nút "Cập Nhật Giá" lần đầu để mở Form cấu hình
    $(element).find(".tp-bulkCard button:contains('Cập Nhật Giá')").on("click", function() {
      // Nếu Form chỉnh giá đã mở rồi thì không tạo trùng lặp nữa
      if ($(element).find(".tp-editPriceCard").length > 0) return;

      // Cấu hình Select với value chuẩn hóa tiếng Anh để hàm xử lý phân loại (switch-case) đọc được
      const typeSlc = createSelect({ 
        id: "tp-select-price-type",
        options: [
          { value: "all", label: "Toàn Bộ" },
          { value: "dau", label: "Giá Đầu" },
          { value: "duoi", label: "Giá Đuôi" }
        ], 
        style: "margin: 1vw 0; display: block;" 
      });

      const dataTextarea = createTextarea({ 
        id: "tp-textarea-price-data",
        placeholder: "Mỗi SKU là một dòng theo cấu trúc (phân tách bằng 1 tab):\nSKU | Giá cần đổi" 
      });

      const confirmBtn = createButton({ text: "Xác Nhận", style: "margin: 1vw 0; margin-right: 8px;" });
      const cancelBtn = createButton({ text: "Hủy", variant: "danger", style: "margin: 1vw 0" });
      
      const editPriceCard = createCardContainer({ 
        title: "Cấu hình thay đổi giá", 
        contentHTML: typeSlc + dataTextarea + `<div style="display: flex;">${confirmBtn}${cancelBtn}</div>`, 
        className: "tp-editPriceCard",
        style: "margin-top: 15px; border-left: 3px solid #3b82f6;"
      });

      $(element).find(".tp-bulkCard").append(editPriceCard);

      // 🔴 1. XỬ LÝ SỰ KIỆN NÚT "XÁC NHẬN" ĐỂ CHẠY LOGIC SỬA GIÁ
      $(element).find(".tp-bulkCard .tp-editPriceCard button:contains('Xác Nhận')").on("click", async function() {
        const btn = $(this);
        
        // Khóa nút để tránh người dùng click spam khi tiến trình đang chạy
        btn.prop("disabled", true).text("Đang xử lý...").css("background", "#94a3b8");

        try {
          // Gọi hàm xử lý cốt lõi đã được tối ưu hiệu năng
          await suaGiaSKUShopee(); 
        } catch (error) {
          console.error("Lỗi sửa giá:", error);
        } finally {
          // Mở khóa nút bấm sau khi xử lý xong
          btn.prop("disabled", false).text("Xác Nhận").css("background", "#3b82f6");
        }
      });

      // 🟢 2. XỬ LÝ SỰ KIỆN NÚT "HỦY" ĐỂ ĐÓNG VÀ DỌN FORM
      $(element).find(".tp-bulkCard .tp-editPriceCard button:contains('Hủy')").on("click", function() {
        $(element).find(".tp-editPriceCard").remove();
      });
    });
  }, { once: true });

  // Mở rộng và load mã phân loại
  waitForElement(".edit-row-right-full .variation-model-table-container.has-footer.variation-model-table .variation-model-table-footer .show-more-button", async (element) => {
    simulateReactEvent($(element).find("button"), "click");

    await delay(500);

    waitForElement(".variation-model-table-container.variation-model-table .eds-scrollbar.middle-scroll-container .variation-model-table-middle-scroll .variation-model-table-body", async (element) => {
      const product_id = document.location.pathname.split("/")[document.location.pathname.split("/").length - 1];
      const data = fetch_product_data.model_list;

      var obj_list = [];
      for(const item of data){
        obj_list[item.sku] = item.id;
      }

      const row = $(element).find(".table-cell-wrapper")
      for(const item of row){
        const sku = $(item).find(".table-cell .textarea.sku-textarea textarea")
        if(sku.val() == "x0" || sku.val() == "") continue;
        const skuText = createText({ text: `ID phân loại: ${obj_list[sku.val()]}` });
        sku.parent().parent().parent().parent().parent().parent().parent().append(skuText);
      }
    }, { once: true });
  }, { once: true });

  // Thời gian đăng link
  waitForElement(".panel-header .panel-title .basic-info-title", async (element) => {
    const data = fetch_product_data;    

    const create_time = new Date(data.create_time * 1000);
    const date_create = create_time.getDate();
    const month_create = create_time.getMonth() + 1;
    const year_create = create_time.getFullYear();
    const hour_create = create_time.getHours();
    const minute_create = create_time.getMinutes();
    const second_create = create_time.getSeconds();
    const time = `${date_create < 10 ? "0" + date_create : date_create}/${month_create < 10 ? "0" + month_create : month_create}/${year_create < 10 ? "0" + year_create : year_create} ${hour_create < 10 ? "0" + hour_create : hour_create}:${minute_create < 10 ? "0" + minute_create : minute_create}:${second_create < 10 ? "0" + second_create : second_create}`;
    const timeText = createText({ text: `Đăng ngày: ${time}` });
    $(element).parent().append(timeText);
  }, { once: true });

  // Nút xem trước
  waitForElement(".preview-card .preview-card-title .preview-card-title-text", async (element) => {
    const response = await ShopeeAPI({
      path: "/api/selleraccount/shop_info/",
    })

    const { shop_id } = response.data;
    const product_id = document.location.pathname.split("/")[document.location.pathname.split("/").length - 1];

    const linkTag = await createLink({ text: "Xem Trước", href: `https://shopee.vn/product/${shop_id}/${product_id}/`, style: "font-weight: 700; font-size: large"})

    $(".preview-card .preview-card-title .preview-card-title-text").get(0).innerHTML = linkTag;
  }, { once: true });

  // Nút thêm phân loại
  waitForElement(".product-tier-variation .variation-container .edit-row-left.edit-label", async (element) => {
    const addVariantBtn = createButton({ text: "Thêm phân loại", style: "margin: 0 2vw" });
    var hasEl = false;

    $(element).append(addVariantBtn);

    $(element).find("> button:contains('Thêm phân loại')").on("click", async (e) => {
      if(hasEl) return;
      hasEl = true;
      const count_tier = $(".edit-row-right-full .variation-edit-item").length;

      const placeholderTextarea = count_tier == 1 ? "Tên Phân Loại | SKU | Giá | Số Lượng (mặc định là 0)" : count_tier == 2 ? "Tên Phân Loại Cấp 1 | Tên Phân Loại Cấp 2 | SKU | Giá | Số Lượng (mặc định là 0)" : "Không xác định cấu trúc";

      const variantData = createTextarea({ placeholder: `Mỗi phân loại là một dòng theo cấu trúc (phân tách bằng tab)\n${placeholderTextarea}` });
      const addVariantBtn = createButton({ text: "Xác Nhận", style: "margin: 1vw 0" });
      const cancelBtn = createButton({ text: "Hủy", style: "margin: 1vw 0", variant: "danger" })
      const addVariantCard = createCardContainer({ title: "Thêm Phân Loại", contentHTML: variantData + addVariantBtn + cancelBtn, style: "width: 100%; display: block" });

      $(element).parent().find(".edit-row-left.edit-label").after($(addVariantCard).addClass("tp-addvariant"));
      
      $(element).parent().find(".tp-addvariant button:contains('Xác Nhận')").on("click", async (element) => {
        const data = parseDataInput({ rawText: ($($(element).prop("currentTarget")).parent().find("textarea").val()), columnSchema: count_tier == 2 ? ["name1", "name2", "sku", "price", "quantity"] : ["name", "sku", "price", "quantity"], groupByKey: count_tier == 2 ? "name1" : null, defaultValues: {"quantity": 0}, requiredFields: ["sku", "name"]});

        if(data.length == 0){
          showToast({ title: "Lỗi định dạng", text: "Không xác định được dữ liệu", type: "error" });
          return;
        }

        const variantBox = $(".edit-row-right-full .variation-edit-panel.variation-option-panel .variation-edit-main");

        const boxVariant = $(".variation-model-table-main");
        var leftBox = boxVariant.find(".variation-model-table-fixed-left .variation-model-table-body .table-cell-wrapper");
        var rightBox = boxVariant.find(".middle-scroll-container .variation-model-table-middle-scroll .variation-model-table-body .table-cell-wrapper");
        const count_tier2 = count_tier == 1 ? 1 : leftBox.eq(0).find(".second-variation-wrapper > div").length;

        const namesToFill = count_tier == 2 
          ? [...new Set(data.map(item => item.name1))] 
          : data.map(item => item.name);

        for(const name of namesToFill){
          const itemInput = variantBox.find(".options-item.virtual-options-item");
          if(itemInput){
            simulateReactInput($(itemInput).find("input"), name, 500);
            await delay(500);
          }
        }

        await delay(1000);
        
        leftBox = boxVariant.find(".variation-model-table-fixed-left .variation-model-table-body .table-cell-wrapper");
        rightBox = boxVariant.find(".middle-scroll-container .variation-model-table-middle-scroll .variation-model-table-body .table-cell-wrapper");
        const start_pos = (leftBox.length - (data.length / count_tier2)) * count_tier2;

        console.log(leftBox.length, data.length, count_tier2, start_pos);
        console.log(rightBox);

        console.log(rightBox.eq(start_pos));

        var current_pos = start_pos;

        for(const item of data){
          const row = rightBox.eq(current_pos).find(".table-cell");
          const price_cel = row.find(".product-edit-input.price-input input");
          const sku_cel = row.find(".textarea.sku-textarea textarea");

          simulateReactInput($(price_cel), item.price);
          simulateReactInput($(sku_cel), item.sku);

          current_pos++;
        }
      })

      $(element).parent().find(".tp-addvariant button:contains('Hủy')").on("click", async (element) => {
        hasEl = false;
        $($(element).prop("currentTarget")).parent().parent().remove();
      })
    })
  }, { once: true });

  // Vùng thả - cập nhật ảnh phân loại
  waitForElement(".variation-model-table-container.variation-model-table .eds-scrollbar.middle-scroll-container", async (element) => {
    // Đảm bảo thẻ cha có position để overlay absolute căn chuẩn theo nó
    if ($(element).css("position") === "static") {
      $(element).css("position", "relative");
    }

    const uploadOverlay = `
      <div id="tp-upload-overlay" style="
        width: 100%; 
        height: 100%; 
        background-color: rgba(0, 0, 0, 0.5); 
        position: absolute; 
        top: 0;
        left: 0;
        z-index: 999999999; 
        color: #fff; 
        backdrop-filter: blur(2px); 
        display: none; 
        align-items: center; 
        justify-content: center; 
        font-weight: 700;
        pointer-events: none; 
        box-sizing: border-box;
        border: 3px dashed #ee4d2d; 
      ">
        <p style="font-size: 16px; margin: 0;">📸 Thả Ảnh Vào Đây Để Cập Nhật Hàng Loạt Theo Tên File</p>
      </div>
    `;

    $(element).prepend(uploadOverlay);

    let localDragCounter = 0;
    const $overlay = $("#tp-upload-overlay");

    // 1. Khi người dùng rê file từ máy tính bước VÀO vùng bảng ma trận
    $(element).on("dragenter", function(e) {
      e.preventDefault();
      e.stopPropagation();
      localDragCounter++;

      if (localDragCounter === 1) {
        $overlay.css("display", "flex");
      }
    });

    // 2. Khi file đang di chuyển liên tục trong vùng bảng ma trận
    $(element).on("dragover", function(e) {
      e.preventDefault();
      e.stopPropagation();
    });

    // 3. Khi người dùng hủy bỏ, rê file RA NGOÀI vùng bảng ma trận
    $(element).on("dragleave", function(e) {
      e.preventDefault();
      e.stopPropagation();
      localDragCounter--;

      if (localDragCounter === 0) {
        $overlay.css("display", "none");
      }
    });

    // 4. KHI NGƯỜI DÙNG THẢ CHUỘT (DROP FILE) 🌟
    $(element).on("drop", async function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      localDragCounter = 0; 
      $overlay.css("display", "none"); 

      const files = e.originalEvent.dataTransfer.files;

      if (files && files.length > 0) {
        const imageFiles = Array.from(files).filter(file => file.type.startsWith("image/"));

        if (imageFiles.length === 0) {
          showToast({ title: "Lỗi định dạng", text: "Vui lòng chỉ thả các file ảnh hợp lệ!", type: "error" });
          return;
        }

        showToast({ title: "Đang xử lý", text: `Đang phân tích ${imageFiles.length} ảnh...`, type: "info" });

        // Thu thập các thành phần bảng tương tự hàm suaHinhSKUShopee cũ của bạn
        const boxVariant = $(".variation-model-table-main");
        const box = boxVariant.find(".eds-scrollbar.middle-scroll-container .eds-scrollbar__content .variation-model-table-body .table-cell-wrapper");
        const boxLeft = boxVariant.find(".variation-model-table-fixed-left .variation-model-table-body .table-cell-wrapper");

        if (boxLeft.length === 0) {
          showToast({ title: "Thất bại", text: "Không tìm thấy ô upload ảnh phân loại nào trên giao diện.", type: "error" });
          return;
        }

        // Tính toán tỷ lệ dòng phụ (SKU) trên mỗi nhóm ảnh phân loại cấp 1
        const SKU_PER_GROUP = Math.floor(box.length / boxLeft.length);
        if (SKU_PER_GROUP === 0) {
          showToast({ title: "Thất bại", text: "Dữ liệu cấu trúc phân loại Shopee không hợp lệ.", type: "error" });
          return;
        }

        // Chuyển mảng file thành một Object Map để tra cứu nhanh theo Tên File (Bỏ đuôi định dạng, viết hoa)
        // Ví dụ file "Dinosaur_Delow.png" -> Key tra cứu là "DINOSAUR_DELOW" hoặc "DELOW"
        const fileMap = {};
        imageFiles.forEach(file => {
          const pureName = file.name.substring(0, file.name.lastIndexOf('.')).trim().toUpperCase();
          fileMap[pureName] = file;
        });

        let successCount = 0;
        const promises = [];

        // Duyệt qua từng nhóm ô ảnh phân loại cấp 1 (Cột cố định bên trái)
        for (let index = 0; index < boxLeft.length; index++) {
          
          promises.push((async (groupIndex) => {
            const skuRepresentativeIndex = groupIndex * SKU_PER_GROUP;
            let matchedFile = null;
            let matchedSkuText = "";

            // Quét qua các dòng SKU thuộc nhóm này để tìm xem tên file nào trùng khớp với SKU text
            for (let i = 0; i < SKU_PER_GROUP; i++) {
              const currentSkuIndex = skuRepresentativeIndex + i;
              if (currentSkuIndex >= box.length) continue;

              const currentSkuBox = box.eq(currentSkuIndex);
              const skuValue = currentSkuBox.find(".table-cell").eq(2).find("textarea").val().trim().toUpperCase();

              // Kiểm tra đối sánh: Nếu tên file nằm gọn trong SKU hoặc ngược lại SKU nằm trong tên file
              // Ví dụ: SKU là "DINOSAUR_DELOW" - Tên file là "DINOSAUR_DELOW"
              if (fileMap[skuValue]) {
                matchedFile = fileMap[skuValue];
                matchedSkuText = skuValue;
                break;
              }
              
              // Hỗ trợ tìm kiếm theo từ khóa chứa trong tên file (Dự phòng nâng cao)
              const partialMatch = Object.keys(fileMap).find(fileName => fileName.includes(skuValue) || skuValue.includes(fileName));
              if (partialMatch) {
                matchedFile = fileMap[partialMatch];
                matchedSkuText = skuValue;
                break;
              }
            }

            // Thẻ input file vật lý ẩn của Shopee ứng với nhóm này
            const imgInputShopee = boxLeft.eq(groupIndex).find(".table-cell").eq(0).find("input[type=file]")[0];

            if (matchedFile && imgInputShopee) {
              // 1. Kiểm tra và Tiến hành xóa ảnh cũ nếu đang tồn tại trên nhóm phân loại này
              if (boxLeft.eq(groupIndex).find(".table-cell img.shopee-image-manager__image").length > 0) {
                const delButton = boxLeft.eq(groupIndex).find("span.shopee-image-manager__icon.shopee-image-manager__icon--delete");
                if (delButton.length > 0) {
                  simulateReactEvent($(delButton), 'click');
                  boxLeft.eq(groupIndex).css({ "background": "rgba(249, 115, 22, 0.2)" }); // Đổi màu cam nhẹ báo đang xử lý
                  await delay(350); // Chờ React cập nhật xóa trạng thái ảnh cũ
                }
              }

              // 2. Giả lập cơ chế kéo thả nhồi dữ liệu bằng DataTransfer y hệt code cũ của bạn
              const dt = new DataTransfer();
              dt.items.add(matchedFile);

              await new Promise(resolve => {
                setTimeout(() => {
                  imgInputShopee.files = dt.files;

                  // Phát đi sự kiện Change sủi bọt báo React nạp và upload file lên server Shopee
                  const evt = new Event("change", { bubbles: true });
                  imgInputShopee.dispatchEvent(evt);

                  boxLeft.eq(groupIndex).css({ "background": "rgba(34, 197, 94, 0.2)", "color": "#000" }); // Đổi màu xanh lá thành công
                  successCount++;
                  resolve();
                }, 100);
              });

              // 3. Đánh dấu tất cả các dòng SKU con nằm trong nhóm này để người dùng dễ quan sát trực quan
              for (let i = 0; i < SKU_PER_GROUP; i++) {
                const currentSkuIndex = skuRepresentativeIndex + i;
                if (currentSkuIndex < box.length) {
                  box.eq(currentSkuIndex).css({ "background": "rgba(34, 197, 94, 0.1)", "color": "#000" });
                }
              }

            } else {
              // Đánh dấu đỏ nhẹ các nhóm không tìm thấy ảnh khớp tên file để người dùng biết mà bổ sung
              boxLeft.eq(groupIndex).css({ "background": "rgba(239, 68, 68, 0.1)" });
            }
          })(index));
        }

        // Chờ toàn bộ các tiến trình xử lý ma trận ảnh chạy xong đồng thời
        await Promise.all(promises);

        if (successCount > 0) {
          showToast({ title: "Thành công", text: `Đã tự động cập nhật hình ảnh cho ${successCount} nhóm phân loại!`, type: "success" });
        } else {
          showToast({ title: "Nhắc nhở", text: "Không tìm thấy ảnh nào có tên file trùng khớp với mã SKU trong bảng.", type: "warn" });
        }
      }
    });

  }, { once: true });
}