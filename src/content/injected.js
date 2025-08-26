(function () {
  // --- Part 1: Clipboard API Hooking ---

  // Helper to safely post messages to the content script
  const send = (text) => {
    try {
      window.postMessage({ __NS4F__: 'COPY', text }, '*');
    } catch (e) {
      console.error("NS4F Injected: Error posting message", e);
    }
  };

  // 1a) Override the modern Clipboard API
  if (navigator.clipboard && navigator.clipboard.writeText) {
    const origWrite = navigator.clipboard.writeText.bind(navigator.clipboard);
    navigator.clipboard.writeText = async function (text) {
      send(String(text || ''));
      return origWrite(text);
    };
  }

  // 1b) Watch the legacy `document.execCommand('copy')`
  // We can't get the text directly, but this command triggers a 'copy' event
  // which we can capture.
  const origExec = Document.prototype.execCommand;
  Document.prototype.execCommand = function (cmd, showUI, value) {
    if (String(cmd).toLowerCase() === 'copy') {
      // The actual text is handled by the 'copy' event listener below
    }
    return origExec.apply(this, arguments);
  };

  // 1c) Capture the 'copy' event itself. This can sometimes get the data.
  window.addEventListener('copy', (e) => {
    try {
      // This is a best-effort attempt. The clipboardData might not be readable.
      const d = e.clipboardData;
      if (!d) return;
      // Try to get data as plain text or a URI list.
      const txt = d.getData('text/plain') || d.getData('text/uri-list');
      if (txt) send(txt);
    } catch (e) {
      // It's common for getData to fail here depending on context; suppress errors.
    }
  }, true); // Use capture phase to run early.


  // --- Part 2: "Copy Link" Click Interception (Enhancement) ---

  const labelMatchers = [
    /複製連結/i,        // zh-TW
    /复制链接/i,        // zh-CN
    /Copy link/i,       // en
    /リンクをコピー/i,  // ja
  ];

  const isCopyLinkItem = (el) => {
    if (!el) return false;
    const txt = (el.innerText || el.textContent || '').trim();
    // Check if any of the regex patterns match the element's text
    return labelMatchers.some(re => re.test(txt));
  };

  // Traverses up the DOM from the click target to find a relevant menu item.
  const findMenuItem = (start) => {
    let el = start;
    for (let i = 0; i < 5 && el; i++, el = el.parentElement) {
      // Check if the element itself or a child element matches our criteria.
      const menuItem = el.querySelector?.('[role="menuitem"], [role="button"]');
      if (menuItem && isCopyLinkItem(menuItem)) return menuItem;
      if (isCopyLinkItem(el)) return el;
    }
    return null;
  };

  // Listen for pointerup, which is a reliable click-like event.
  window.addEventListener('pointerup', async (ev) => {
    try {
      const item = findMenuItem(ev.target);
      if (!item) return; // The clicked element is not a "Copy Link" button.

      // If we detect a click on "Copy Link", we wait a moment and then
      // try to read the clipboard. This often works because the read
      // is happening very close to the user's action.
      if (navigator.clipboard?.readText) {
        setTimeout(async () => {
           const txt = await navigator.clipboard.readText();
           if (txt) {
             send(txt);
           }
        }, 50); // 50ms delay to allow the clipboard to be written.
      }
    } catch (e) {
        // Reading clipboard can fail if the document is not focused, etc.
        // We can ignore these errors.
    }
  }, true); // Use capture phase to intercept the event early.

})();
