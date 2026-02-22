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

(function (){
	'use strict';

	const simulateFileDrop = (targetElement, files = [], options = {}) => {
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

	const simulateReactEvent = (input, type, options = {}) => {
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

	const simulateReactInputFile = (input) => {
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
		} catch (e) { }
	}

	const simulateClearing = (inputElement, delay = 50, callback) => {
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

	const simulateTyping = (inputElement, text, event = "input", delay = 100, callback = null) => {
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

	const simulatePaste = (inputElement, pastedText, event = "input", callback = null) => {
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

	const simulateReactInput = (input, text, delay) => {
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

	const simulateClearReactInput = (input) => {
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

	const waitForElement = (root, selector, callback, options = {}) => {
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

	const logging = (content, type = "log") => {
    switch (type) {
      case "log":
        console.log(`%cTanPhan: %c${content}`, "color: crimson; font-size: 2rem", "color: orange; font-size: 1.5rem");
        break;
      case "error":
        console.error(`%cTanPhan: %c${content}`, "color: crimson; font-size: 2rem", "color: orange; font-size: 1.5rem")
        break;
      case "warn":
        console.warn(`%cTanPhan: %c${content}`, "color: crimson; font-size: 2rem", "color: orange; font-size: 1.5rem");
        break;
      case "success":
        console.log(`%cTanPhan: %c${content}`, "color: green; font-size: 2rem", "color: lightgreen; font-size: 1.5rem");
        break;
      case "info":
        console.log(`%cTanPhan: %c${content}`, "color: blue; font-size: 2rem", "color: skyblue; font-size: 1.5rem");
        break;
    }
  }

	const getHost = () => { return window.location.host; }
	const getPathName = () => { return window.location.pathname; }

	const initTailwind = () => {
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

	const addTabTextarea = () => {
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

	const ThemPhanLoai = () => {

		var functionName = "Thêm Phân Loại", platform = null, $modal = null;

		const addShopee = (data) => {
			console.log(data);
			var indexVarianty = 0;
			function nextVarianty(){
				if(indexVarianty >= data.length){
					return;
				}


				let modelVarianty = $(".variation-model-table-body");
				let countVariantModel = modelVarianty.length;

				let lastInputName = $(".variation-edit-main .option-container .options-item.virtual-options-item input");
				simulateReactInput(lastInputName, data[indexVarianty][0]);

				let currentVariantModel = modelVarianty.length;
				

				indexVarianty++;
				nextVarianty();
			}

			nextVarianty();
		}

		const addVariant = (data) => {
			data = data.split("\n");

			const array_data = [];
			$.each(data, (i, v) => {
				array_data.push(v.split("\t"));
			})

			if(platform == "shopee") addShopee(array_data);
		}

		const openModal = () => {
			if($modal){
				$modal.show();
				$modal.find("textarea").val("");
				return;
			}

			$modal = $(`
				<div id="tpv4-modal-container" class="TPV4-fixed TPV4-inset-0 TPV4-z-[2147483647]">
					<div class="TPV4-absolute TPV4-inset-0 TPV4-bg-black/60 TPV4-backdrop-blur-sm"></div>
					
					<div class="TPV4-relative TPV4-flex TPV4-flex-col TPV4-gap-4 TPV4-justify-center TPV4-items-center TPV4-h-full TPV4-w-full">
						<div class="TPV4-bg-[#1a1a1a] TPV4-p-6 TPV4-rounded-2xl TPV4-shadow-2xl TPV4-border TPV4-border-white/10 TPV4-w-[500px]">
							<p class="TPV4-text-white TPV4-font-bold TPV4-text-lg TPV4-mb-3">${functionName}</p>
							<textarea
								placeholder="Mỗi phân loại là một dòng, các trường phân cách bằng 1 TAB\n\t- SKU\n\t- Tên Phân Loại\n\t- Giá Bán (Mặc định sẽ là giá tiền cao nhất có thể trong link để không bị 5 lần giá)\n\t- Số Lượng (Mặc định số lượng = 0)"
								id="TPV4-data"
								class="TPV4-w-full TPV4-h-64 TPV4-rounded-xl TPV4-p-4 TPV4-bg-white TPV4-text-black TPV4-outline-none TPV4-border-none"
							></textarea>
							
							<div class="TPV4-flex TPV4-justify-end TPV4-gap-3 TPV4-mt-4">
								<button id="TPV4-cancel" class="TPV4-px-6 TPV4-py-2 TPV4-rounded-lg TPV4-bg-gray-500 TPV4-text-white">Hủy</button>
								<button id="TPV4-confirm" class="TPV4-px-6 TPV4-py-2 TPV4-rounded-lg TPV4-bg-orange-600 TPV4-text-white TPV4-font-bold">Xác Nhận</button>
							</div>
						</div>
					</div>
				</div>
			`)

			$("body").append($modal);

			$($modal).find("#TPV4-confirm").on("click", (e) => {
				addVariant($($modal).find("#TPV4-data").val())
				$($modal).hide();
			})

			$($modal).find("#TPV4-cancel").on("click", (e) => {
				$($modal).hide();
			})
		}

		const initLayoutShopee = () => {
			const target = ".product-detail-panel.product-sales-info .panel-header";
			
			waitForElement(document, target, (e) => {
				if (!$(e).find(".tp-btn-add").length) {
					const $btn = $(`
						<button class="tp-btn-add TPV4-bg-gradient-to-r TPV4-from-[#ff5722] TPV4-to-[#f53d2d] TPV4-font-[600] TPV4-text-white TPV4-shadow-md TPV4-px-5 TPV4-py-2 TPV4-rounded-xl hover:TPV4-brightness-110 TPV4-transition-all TPV4-ml-4 TPV4-border-none TPV4-cursor-pointer">
							${functionName}
						</button>
					`);

					$btn.on("click", (event) => {
						event.preventDefault();
						openModal();
					});

					$(e).append($btn);
				}
			}, { waitForLastChange: true });
		}
		

		const host = getHost();
		if (host.includes("shopee")) {
			if (getPathName().includes("/portal/product")) {
				initLayoutShopee();
				platform = "shopee";
			}
		}
	}

	function TPTOOL(){
		logging("KHỞI TẠI TAILWIND");
		initTailwind();

		logging("THEO DÕI TAB CHO TEXTAREA");
		addTabTextarea;

		ThemPhanLoai();
	}

	TPTOOL();
})()