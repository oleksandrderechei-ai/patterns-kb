/* sketch.js — syntax-highlight code sketches with the locally-vendored highlight.js, and
   give a block full of them one control instead of one click per sketch.
   Load AFTER vendor/highlight.min.js. Highlights lazily, on first open of each sketch.

   SKETCHES ARE COLLAPSED BY DEFAULT. That is authored in the markup, not decided here — a
   design's entities block runs to sixteen schemas and its interface block to eleven
   contracts, and opening all of them pushes the argument off the page. So every section
   holding two or more sketches gets an injected Expand all / Collapse all toggle, and
   printing opens the lot regardless, because a printed page has nothing to click.

   The toggle is INJECTED rather than authored: the alternative is a markup sweep across
   every pattern and design page for a control that is pure presentation. */
(function () {
  "use strict";
  if (typeof hljs === "undefined") return;

  /* One bad sketch used to take the rest of the page with it. hljs.highlightElement THROWS
     on a language it has no grammar for — it does not fall back to plain text — and this
     ran inside a bare forEach, so the first `sql` sketch aborted the loop and every sketch
     after it never even got its listener. `make check` now gates the vendored grammar set
     against SKETCH_LANGS (scripts/audit-highlight.mjs), which should make this unreachable;
     it stays because it was reachable for the whole life of the corpus. */
  function paint(code) {
    if (!code) return;
    try { hljs.highlightElement(code); }
    catch (e) {
      if (window.console) console.warn("sketch.js: no grammar for", code.getAttribute("data-kb-lang"), e);
    }
  }

  // Code visible on load (e.g. a schema outside a sketch) is highlighted eagerly.
  var visible = document.querySelectorAll("pre code[data-kb-lang]");
  Array.prototype.forEach.call(visible, function (code) {
    if (!code.closest("details.sketch")) paint(code);
  });

  var sketches = document.querySelectorAll("details.sketch");
  Array.prototype.forEach.call(sketches, function (details) {
    var done = false;
    var lazy = function () {
      if (done || !details.open) return;
      done = true;
      paint(details.querySelector("pre code[data-kb-lang]"));
    };
    details.addEventListener("toggle", lazy);
    if (details.open) lazy();
  });

  /* ---- the floating Expand all / Collapse all ---- */

  /* The control drives every FOLDABLE, not only every sketch. A design's entities and
     interface blocks fold each group as a whole (details.entity-group,
     details.endpoint-group) over the schemas and contracts inside it, so a control that
     knew only about sketches would open eleven contracts inside five closed groups and look
     broken. A large design's architecture block folds the same way one level deeper
     (details.module-wrap over details.module-group), so the wrapper is listed too: expanding
     the modules and leaving the wrapper shut opens seven panels nobody can see.
     Highlighting above still keys on details.sketch alone — a group wrapper holds no code. */
  var folds = document.querySelectorAll(
    "details.sketch, details.entity-group, details.endpoint-group, details.module-wrap, details.module-group"
  );
  /* Name what is actually there: "code sketches" is precise where every fold is one, and a
     lie on a design page whose folds include five endpoint groups. "Panels" rather than
     "sections" or "blocks" — both of those already name something else here (a
     .doc-section, a data-kb-block), and the control spans several of each. The word has to
     read in BOTH directions, which is why it is not "collapsed panels": the label says
     "Collapse all 33 …" exactly when nothing is collapsed. */
  var noun = folds.length === sketches.length ? "code sketches" : "panels";

  /* ONE page-level control in the fixed cluster, on the LEFT edge — the same box as the
     theme, practiced and favourite toggles, mirrored across the page. It was a chip inside
     the block first, right-aligned under the heading, which put it directly beneath the
     lens group at the same edge: present in the DOM and invisible to the reader, twice
     over. The left edge carries nothing else, so there is nothing for it to hide behind.

     Injected rather than authored, like every other floating control — the alternative is
     a markup sweep across every pattern and design page for pure presentation. */
  if (folds.length > 1) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "sketch-toggle";

    /* TWO stacked triangles, not one chevron. A single ▾ is the glyph `.section-nav-btn`
       already wears for "next section", and two controls with the same glyph are one
       control as far as the reader is concerned. Stacked, the pair says which way the
       page is about to move:

         expand   ▲ over ▼  — apexes point APART, a diamond opening
         collapse ▼ over ▲  — apexes point TOGETHER, an hourglass closing

       Both spans exist from the start; only their text changes, so the box never reflows. */
    var top = document.createElement("span");
    var bottom = document.createElement("span");
    top.className = "sketch-tri";
    bottom.className = "sketch-tri";
    btn.appendChild(top);
    btn.appendChild(bottom);

    /* Glyph and tooltip both name the ACTION, not the state: anything still closed means
       there is something left to expand. */
    var anyClosed = function () {
      return Array.prototype.some.call(folds, function (d) { return !d.open; });
    };
    var label = function () {
      var expand = anyClosed();
      var what = (expand ? "Expand" : "Collapse") + " all " + folds.length + " " + noun;
      top.textContent = expand ? "▲" : "▼";
      bottom.textContent = expand ? "▼" : "▲";
      btn.title = what;
      btn.setAttribute("aria-label", what);
      /* aria-expanded is the state, not the action — it is what paints the control. */
      btn.setAttribute("aria-expanded", expand ? "false" : "true");
    };
    btn.addEventListener("click", function () {
      var open = anyClosed();
      Array.prototype.forEach.call(folds, function (d) { d.open = open; });
      label();
    });
    /* A sketch opened on its own keeps the button honest. `toggle` fires asynchronously,
       so this cannot be folded into the click handler above. */
    Array.prototype.forEach.call(folds, function (d) { d.addEventListener("toggle", label); });
    label();
    document.body.appendChild(btn);
  }

  /* Print opens everything and puts it back. A reader printing a design page wants the
     schemas, and there is no click on paper. Restoring from a snapshot rather than closing
     everything keeps whatever the reader had already opened. */
  var before = null;
  window.addEventListener("beforeprint", function () {
    before = [];
    Array.prototype.forEach.call(folds, function (d) {
      before.push(d.open);
      d.open = true;
    });
  });
  window.addEventListener("afterprint", function () {
    if (!before) return;
    Array.prototype.forEach.call(folds, function (d, i) { d.open = before[i]; });
    before = null;
  });
})();
