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
      this.preventDefault();
    },
    "68": function() {
      // delete (d)
    },
    "69": function() {
      // edit (e)
    },
    "72": function() {
      // left (h), screen top (H)
    },
    "73": function() {
      // insert mode (i)
      b.switchMode("i");
    },
    "74": function() {
      // down (j), join lines (J)
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
    },
    "78": function() {
      // new (n)
      b.buffer = "";
    },
    "83": function() {
      // (s)
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
    mode: "insert",
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
        bottom: b.$ta.offset().top + b.$ta.outerHeight()
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
      b.mode = modes[m];
      b.$indicator.text(m);
    },
    keypress: function(e) {
      var $e = $(e.target);
      if (!$e.is("textarea") && b.$modal.is(":hidden")) { return; }
      if (b.mode === "insert" && b.$modal.is(":hidden") && e.keyCode !== 27) { return; }
      if (b.mode !== "insert") { e.preventDefault(); }
      kp_actions[e.keyCode in kp_actions ? e.keyCode : "default"].apply(e);
    },
    focus: function(e) {
      var $e = $(e.target);
      if (!$e.is("textarea")) { return; }
      b.$ta = $e;
      b.moveIndicator();
    },
    init: function() {
      for (var v in b) {
        if (/^prep/.test(v) && typeof b[v] === "function") {
          b[v]();
        }
      }
      $(document).bind("keydown.vim_bookmarklet", b.keypress)
        .bind("focus.vim_bookmarklet", b.focus);
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
