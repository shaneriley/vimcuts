function Bookmarklet() {
  var $ = j$;
  var controls = {
    "<mark>X</mark>d": "Deletes line number <mark>X</mark>",
    "<mark>X</mark>e": "Edits line number <mark>X</mark>",
    h: "Toggles this help window",
    n: "Create new entry",
    "<mark>X</mark>s": "Stops/starts timer for line number <mark>X</mark>",
    "esc": "Cancels current action",
    "<span class='cmd'>Cmd</span>-enter": "Saves currently active entry"
  };
  Array.prototype.excise = function(s, e) {
    return $.merge(this.slice(0, s), this.slice(s + (e || 1)));
  };
  var kp_actions = {
    "13": function() {
    },
    "27": function() {
      // esc
      if (b.$modal.is(":visible")) {
        b.closeModal();
        return;
      }
      b.switchMode("n");
      b.setCursor();
      this.preventDefault();
    },
    "37": function() { kp_actions["72"].apply(this); },
    "38": function() { kp_actions["75"].apply(this); },
    "39": function() { kp_actions["76"].apply(this); },
    "40": function() { kp_actions["74"].apply(this); },
    "46": function() {
      // delete character (del)
      var chars = b.$ta.val().split(""),
          cursor_pos = b.getCursor();
      b.$ta.val(chars.excise(cursor_pos).join(""));
      b.setCursor(cursor_pos);
    },
    "68": function() {
      // delete (d)
    },
    "69": function() {
      // edit (e)
    },
    "72": function() {
      // left (h), screen top (H)
      if (b.getCursor()) {
        b.setCursor(this.shiftKey ? 0 : b.getCursor() - 1);
      }
    },
    "73": function() {
      // insert mode (i)
      b.switchMode("i");
      b.resetCursor();
    },
    "74": function() {
      // down (j), join lines (J)
      if (this.shiftKey) {
      }
      else {
        var l = b.getLine(),
            cursor_pos = b.getCursor(),
            lines = b.$ta.val().split("\n");
        if (b.getLineCount() > l) {
          if (lines[l].length <= b.getTextBeforeCursor().length) {
            b.setCursor(cursor_pos + b.getTextAfterCursor().length + lines[l].length);
          }
          else {
            b.setCursor(cursor_pos + lines[l - 1].length + 1);
          }
        }
      }
    },
    "75": function() {
      // up (k), help (K)
      if (this.shiftKey) {
        b[(b.$modal.is(":visible") ? "close" : "open") + "Modal"]();
        return;
      }
    },
    "76": function() {
      // right (l), screen bottom (L)
      if (b.getCursor() === b.$ta.val().length - 1) { return; }
      b.setCursor(this.shiftKey ? b.$ta.val().length - 1 : b.getCursor() + 1);
    },
    "78": function() {
      // new (n)
      b.buffer = "";
    },
    "83": function() {
      // (s)
      kp_actions[46].apply(this);
      kp_actions[73].apply(this);
    },
    "88": function() { b.$modal.is(":visible") && b.closeModal(); },
    default: function() {
      var s = String.fromCharCode(this.keyCode);
      if (!isNaN(+s)) { b.buffer += s; }
    }
  };

  var b = {
    p: "vim_bookmarklet_",
    $el: $(),
    $help: $(),
    $modal: $(),
    $modal_layer: $(),
    $indicator: $(),
    buffer: "",
    mode: "i",
    prepBookmarkletContainer: function() {
      b.$el = $("<div />", { id: b.p.replace(/_$/, "") }).appendTo(document.body);
    },
    prepHelpIcon: function() {
      b.$help = $("<a />", {
        id: b.p + "help",
        href: "#",
        text: "Help",
        click: b.openModal
      }).appendTo(b.$el);
    },
    prepModal: function() {
      var $dl = $("<dl />");
      b.$modal = $("<div />", { id: b.p + "modal" }).appendTo(document.body);
      b.$modal_layer = $("<div />", {
        id: b.p + "modal_layer",
        click: b.closeModal
      }).appendTo(document.body);
      $("<h1 />", { text: "Shortcut Keys" }).appendTo(b.$modal);
      $("<a />", {
        "class": "close",
        href: "#",
        text: "Close",
        click: b.closeModal
      }).appendTo(b.$modal);
      $("<p />", { text: "All line numbers are 1-based" }).appendTo(b.$modal);
      $dl.appendTo(b.$modal);
      for (var v in controls) {
        $("<dt />", { html: v }).appendTo($dl);
        $("<dd />", { html: controls[v] }).appendTo($dl);
      }
      b.openModal();
    },
    prepIndicator: function() {
      b.$indicator = $("<div />", {
        id: b.p + "indicator",
        text: "i"
      }).appendTo(document.body);
    },
    moveIndicator: function() {
      b.$indicator.css({
        left: b.$ta.offset().left,
        bottom: $(window).height() - b.$ta.offset().top - b.$ta.outerHeight()
      });
    },
    openModal: function() {
      b.$modal.add(b.$modal_layer).fadeIn(500);
      return false;
    },
    closeModal: function() {
      b.$modal.add(b.$modal_layer).fadeOut(500);
      return false;
    },
    switchMode: function(m) {
      var modes = {
        i: "insert",
        n: "normal",
        v: "visual"
      };
      b.mode = m;
      b.$indicator.text(modes[m]).show();
    },
    setCursor: function(pos) {
      var cursor_pos = isNaN(pos) ? b.getCursor() : pos;
      b.$ta[0].setSelectionRange(cursor_pos, cursor_pos + 1);
    },
    getCursor: function() {
      return b.$ta[0].selectionStart;
    },
    getLine: function() {
      var v = b.$ta.val();
      return v.split("").slice(0, b.getCursor()).join("").split("\n").length;
    },
    getLineCount: function() {
      return b.$ta.val().split("\n").length;
    },
    getTextBeforeCursor: function() {
      var s = b.$ta.val().split("").slice(0, b.getCursor()).join("");
      return /\n/.test(s) ? /\n(.*)$/.exec(s)[1] : s;
    },
    getTextAfterCursor: function() {
      var s = b.$ta.val().split("").slice(b.getCursor()).join("");
      return /\n/.test(s) ? /^(.*)\n/.exec(s)[1] : s;
    },
    resetCursor: function() {
      b.$ta[0].selectionEnd = b.getCursor();
    },
    keypress: function(e) {
      var $e = $(e.target);
      if (!$e.is("textarea") && b.$modal.is(":hidden")) { return; }
      if (b.mode === "i" && b.$modal.is(":hidden") && e.keyCode !== 27) { return; }
      if (b.mode !== "i") { e.preventDefault(); }
      kp_actions[e.keyCode in kp_actions ? e.keyCode : "default"].apply(e);
    },
    focus: function() {
      b.switchMode(b.mode);
      b.$ta = $(this);
      b.moveIndicator();
    },
    blur: function() {
      b.$indicator.hide();
    },
    init: function() {
      for (var v in b) {
        if (/^prep/.test(v) && typeof b[v] === "function") {
          b[v]();
        }
      }
      $(document).bind("keydown.vim_bookmarklet", b.keypress)
        .find("textarea").bind("focus.vim_bookmarklet", b.focus)
        .bind("blur.vim_bookmarklet", b.blur);
    }
  };

  var initAll = function() {
    if (!$) {
      setTimeout(initAll, 20);
      return false;
    }
    $(b.init);
  };
  initAll();
}
