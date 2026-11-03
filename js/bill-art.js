/* MediClear — renders a realistic sample-bill image on canvas from billData.
   Used for "Try a sample bill" and mock-mode previews. No real PII. */
(function () {
  "use strict";

  function money(n) {
    return "$" + Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function drawBill(canvas, bill) {
    var W = 1080, H = 1500;
    canvas.width = W; canvas.height = H;
    var c = canvas.getContext("2d");

    // Paper
    c.fillStyle = "#ffffff"; c.fillRect(0, 0, W, H);
    c.strokeStyle = "#cccccc"; c.lineWidth = 3; c.strokeRect(8, 8, W - 16, H - 16);
    c.fillStyle = "#1a1a1a"; c.textBaseline = "top";

    var x = 70, y = 60;
    // Header
    c.font = "700 52px Arial";
    c.fillText(bill.provider || "Sample Medical Center", x, y); y += 66;
    c.font = "400 30px Arial"; c.fillStyle = "#444";
    c.fillText(bill.providerAddress || "", x, y); y += 44;
    c.fillText("Billing questions: (555) 010-2030", x, y); y += 70;

    c.fillStyle = "#0b6e5f"; c.fillRect(x, y, W - 2 * x, 6); y += 30;

    // Statement meta
    c.fillStyle = "#1a1a1a"; c.font = "700 40px Arial";
    c.fillText("PATIENT STATEMENT", x, y); y += 60;
    c.font = "400 30px Arial"; c.fillStyle = "#333";
    var meta = [
      ["Statement date:", bill.billDate || ""],
      ["Due date:", bill.dueDate || ""],
      ["Account:", "XXXX-" + (bill.accountLast4 || "XXXX")],
      ["Insurance:", (bill.insurance && bill.insurance.payer) || "Self-pay"]
    ];
    meta.forEach(function (m) {
      c.fillStyle = "#666"; c.fillText(m[0], x, y);
      c.fillStyle = "#1a1a1a"; c.fillText(m[1], x + 300, y);
      y += 44;
    });
    y += 20;

    // Line items table header
    c.font = "700 28px Arial"; c.fillStyle = "#0b6e5f";
    c.fillText("DATE", x, y); c.fillText("DESCRIPTION", x + 170, y);
    c.fillText("CODE", x + 620, y); c.fillText("CHARGE", x + 800, y);
    y += 14;
    c.fillStyle = "#0b6e5f"; c.fillRect(x, y, W - 2 * x, 4); y += 18;

    c.font = "400 28px Arial";
    (bill.lineItems || []).forEach(function (it) {
      if (y > H - 420) return;
      c.fillStyle = "#1a1a1a";
      c.fillText(it.date || "", x, y);
      var desc = it.description || "";
      if (desc.length > 34) desc = desc.slice(0, 33) + "…";
      c.fillText(desc, x + 170, y);
      c.fillStyle = "#555"; c.fillText(it.cpt || "", x + 620, y);
      c.fillStyle = "#1a1a1a"; c.textAlign = "right";
      c.fillText(money(it.charge), W - x, y); c.textAlign = "left";
      y += 44;
      if (it.adjustment) {
        c.fillStyle = "#0b6e5f"; c.font = "400 24px Arial";
        c.textAlign = "right";
        c.fillText("adj. -" + money(it.adjustment).slice(1), W - x, y);
        c.textAlign = "left"; c.font = "400 28px Arial";
        y += 38;
      }
    });
    y += 16;

    // Totals
    var totY = H - 380;
    c.fillStyle = "#eee"; c.fillRect(x, totY - 16, W - 2 * x, 300);
    c.fillStyle = "#1a1a1a"; c.font = "400 30px Arial";
    var ty = totY + 10;
    function trow(label, val, bold) {
      c.fillStyle = "#333"; c.fillText(label, x + 30, ty);
      c.fillStyle = bold ? "#b3261e" : "#1a1a1a";
      c.font = (bold ? "700" : "400") + " 32px Arial";
      c.textAlign = "right"; c.fillText(money(val), W - x - 30, ty); c.textAlign = "left";
      c.font = "400 30px Arial"; ty += 52;
    }
    var totCharges = (bill.lineItems || []).reduce(function (s, it) { return s + Number(it.charge || 0); }, 0);
    trow("Total charges", totCharges, false);
    trow("Insurance paid", -Number((bill.insurance && bill.insurance.paid) || 0), false);
    trow("AMOUNT YOU OWE", bill.patientOwes, true);

    // Watermark
    c.save();
    c.translate(W / 2, H / 2); c.rotate(-Math.PI / 7);
    c.font = "900 84px Arial"; c.fillStyle = "rgba(178,34,34,0.14)";
    c.textAlign = "center";
    c.fillText("PRACTICE — NOT REAL", 0, -20);
    c.font = "700 40px Arial";
    c.fillText("SAMPLE BILL FOR TESTING", 0, 50);
    c.restore();

    c.fillStyle = "#888"; c.font = "400 24px Arial"; c.textAlign = "center";
    c.fillText("Questions? Call the number above. Do not ignore this statement.", W / 2, H - 50);
    c.textAlign = "left";
    return canvas;
  }

  function billDataUrl(bill) {
    var cv = document.createElement("canvas");
    drawBill(cv, bill);
    return cv.toDataURL("image/png");
  }

  window.MC_drawBill = drawBill;
  window.MC_billDataUrl = billDataUrl;
})();
