/* ============================================================
 * MediClear — Mock fixtures (Mock Mode)
 * Realistic practice bills + canned analyses for QA / design /
 * demo WITHOUT a real Meta API key. No real PII anywhere:
 * fake patient placeholders, fake addresses, account "XXXX".
 * All bills are marked PRACTICE - NOT REAL in the UI.
 * ============================================================ */
(function () {
  'use strict';

  /* ---------------- Sample bill data ---------------- */

  var BILLS = [
    {
      id: "sample-er",
      title: "ER Visit — Sample",
      provider: "Riverside General Hospital",
      providerAddress: "1200 Main St, Richmond, VA 23219",
      billDate: "2026-10-12",
      dueDate: "2026-11-12",
      accountLast4: "XXXX",
      currency: "USD",
      lineItems: [
        { description: "Emergency Department Visit, Level 4", cpt: "99284", date: "2026-10-12", charge: 1850.00, adjustment: 1100.00 },
        { description: "Emergency Department Visit, Level 4", cpt: "99284", date: "2026-10-12", charge: 1850.00, adjustment: 1100.00 },
        { description: "CT Scan Head w/o contrast", cpt: "70450", date: "2026-10-12", charge: 1450.00, adjustment: 900.00 },
        { description: "Basic Metabolic Panel", cpt: "80048", date: "2026-10-12", charge: 180.00, adjustment: 120.00 },
        { description: "Facility Fee — Emergency", cpt: "—", date: "2026-10-12", charge: 2200.00, adjustment: 1400.00 }
      ],
      insurance: { payer: "BlueCross PPO", paid: 2422.50, note: "After $500 deductible and $150 ER copay" },
      patientOwes: 487.50
    },
    {
      id: "sample-uc",
      title: "Urgent Care — Sample",
      provider: "Lakeside Urgent Care",
      providerAddress: "45 Lakeview Dr, Henrico, VA 23229",
      billDate: "2026-10-18",
      dueDate: "2026-11-18",
      accountLast4: "XXXX",
      currency: "USD",
      lineItems: [
        { description: "Urgent Care Visit", cpt: "99213", date: "2026-10-18", charge: 220.00, adjustment: 80.00 },
        { description: "Rapid Strep Test", cpt: "87880", date: "2026-10-18", charge: 65.00, adjustment: 40.00 },
        { description: "X-Ray Chest", cpt: "71046", date: "2026-10-18", charge: 180.00, adjustment: 95.00 },
        { description: "Balance Bill — Provider Out of Network", cpt: "—", date: "2026-10-18", charge: 350.00, adjustment: 0.00 }
      ],
      insurance: { payer: "BlueCross PPO", paid: 250.00, note: "X-Ray Chest denied — pending appeal" },
      patientOwes: 350.00
    }
  ];

  /* ---------------- Canned analyses (en / vi / es) ---------------- */

  var ANALYSES = {
    "sample-er": {
      en: {
        provider: "Riverside General Hospital",
        billDate: "2026-10-12",
        currency: "USD",
        patientOwes: 487.50,
        summary: "This is an emergency room bill from Riverside General Hospital, dated October 12, 2026. The hospital charged $7,530.00 in total. Your insurance (BlueCross PPO) paid $2,422.50 after your $500 deductible and $150 ER copay, and contract discounts removed $4,620.00. The amount you are asked to pay is $487.50, due November 12, 2026. IMPORTANT: one charge appears twice — 'Emergency Department Visit, Level 4' was billed two times for the same visit on the same day. This is very likely a billing error. Do not pay until you ask the hospital about it.",
        lineItems: [
          { description: "Emergency Department Visit, Level 4", cpt: "99284", date: "2026-10-12", charge: 1850.00, adjustment: 1100.00, explanation: "The doctor's fee for treating you in the emergency room. 'Level 4' means a moderately serious visit.", suspicious: true, suspicionReason: "Billed TWICE for the same visit on the same date — this is very likely a duplicate billing error." },
          { description: "Emergency Department Visit, Level 4", cpt: "99284", date: "2026-10-12", charge: 1850.00, adjustment: 1100.00, explanation: "Same as above — the doctor's fee for the emergency room visit.", suspicious: true, suspicionReason: "Duplicate of the charge above. If you had only one ER visit that day, you should not have to pay this second charge." },
          { description: "CT Scan Head w/o contrast", cpt: "70450", date: "2026-10-12", charge: 1450.00, adjustment: 900.00, explanation: "A CT scan takes detailed pictures of the inside of your head using X-rays. 'w/o contrast' means no special dye was used.", suspicious: false, suspicionReason: "" },
          { description: "Basic Metabolic Panel", cpt: "80048", date: "2026-10-12", charge: 180.00, adjustment: 120.00, explanation: "A blood test that checks your kidneys, blood sugar, and salt and mineral levels.", suspicious: false, suspicionReason: "" },
          { description: "Facility Fee — Emergency", cpt: "—", date: "2026-10-12", charge: 2200.00, adjustment: 1400.00, explanation: "Hospitals charge a 'facility fee' just for using the emergency room — this is separate from the doctor's fee. It covers the building, equipment, and nurses. It is legal but often very high, and you can ask for it to be lowered.", suspicious: false, suspicionReason: "" }
        ],
        flags: [
          { severity: "high", title: "Possible duplicate charge", detail: "The 'Emergency Department Visit, Level 4' ($1,850) appears twice for the same date. If this was one visit, the second charge should be removed — that could save you about $750 after insurance. Call the billing office and ask them to fix it." },
          { severity: "medium", title: "High facility fee", detail: "The $2,200 facility fee is the largest charge on this bill. Hospital facility fees are often negotiable — ask for a 20–40% prompt-pay discount if you pay the balance in full." },
          { severity: "low", title: "Check your EOB", detail: "Make sure every amount here matches your Explanation of Benefits (EOB) from BlueCross PPO before you pay anything." }
        ],
        nextSteps: [
          "Wait for your Explanation of Benefits (EOB) from BlueCross PPO. Do not pay until the EOB arrives and the numbers match this bill.",
          "Ask the hospital for an itemized bill and compare every line with what you remember from your visit.",
          "Call the hospital billing office about the duplicate 'Emergency Department Visit' charge and ask them to remove it.",
          "Ask for a prompt-pay discount — hospitals often reduce the bill by 20–40% if you pay the full balance at once.",
          "Ask about financial assistance or charity care — nonprofit hospitals are required to have a program that can lower or erase your bill.",
          "If the hospital will not remove the duplicate charge, file an appeal with BlueCross PPO and consider contacting your state's insurance department."
        ],
        letter: {
          subject: "Request to correct duplicate charge — Account XXXX",
          body: "Dear Billing Department,\n\nMy name is [Your Name]. I am writing about my emergency room bill dated October 12, 2026 (Account XXXX).\n\nI see that 'Emergency Department Visit, Level 4' (CPT 99284, $1,850.00) was charged TWO times for the same visit on the same date. I had only one emergency room visit that day. I believe the second charge is a billing error.\n\nPlease review my account, remove the duplicate charge, and send me a corrected bill. Please also confirm in writing that the correction was made.\n\nThank you for your help.\n\nSincerely,\n[Your Name]\n[Date]\n[Phone number]"
        },
        language: "en"
      },
      vi: {
        provider: "Riverside General Hospital",
        billDate: "2026-10-12",
        currency: "USD",
        patientOwes: 487.50,
        summary: "Đây là hóa đơn phòng cấp cứu của bệnh viện Riverside General Hospital, ngày 12/10/2026. Bệnh viện tính tổng cộng $7,530.00. Bảo hiểm BlueCross PPO đã trả $2,422.50 (sau khoản khấu trừ $500 và đồng chi trả cấp cứu $150), và các khoản giảm giá theo hợp đồng là $4,620.00. Số tiền quý vị được yêu cầu trả là $487.50, hạn chót 12/11/2026. QUAN TRỌNG: có một khoản bị tính 2 lần — 'Khám cấp cứu, Mức 4' bị tính phí hai lần cho cùng một lần khám trong cùng một ngày. Đây rất có thể là lỗi tính tiền. Xin đừng trả tiền cho đến khi hỏi rõ bệnh viện về khoản này.",
        lineItems: [
          { description: "Khám cấp cứu, Mức 4", cpt: "99284", date: "2026-10-12", charge: 1850.00, adjustment: 1100.00, explanation: "Tiền công bác sĩ khám cho quý vị tại phòng cấp cứu. 'Mức 4' nghĩa là ca khám ở mức khá nghiêm trọng.", suspicious: true, suspicionReason: "Bị tính 2 LẦN cho cùng một lần khám trong cùng một ngày — rất có thể là lỗi tính trùng." },
          { description: "Khám cấp cứu, Mức 4", cpt: "99284", date: "2026-10-12", charge: 1850.00, adjustment: 1100.00, explanation: "Giống khoản trên — tiền công bác sĩ khám tại phòng cấp cứu.", suspicious: true, suspicionReason: "Trùng với khoản phí ở trên. Nếu quý vị chỉ khám cấp cứu một lần trong ngày hôm đó, quý vị không phải trả khoản thứ hai này." },
          { description: "Chụp CT đầu, không thuốc cản quang", cpt: "70450", date: "2026-10-12", charge: 1450.00, adjustment: 900.00, explanation: "Chụp CT cho hình ảnh chi tiết bên trong đầu bằng tia X. 'Không thuốc cản quang' nghĩa là không dùng thuốc nhuộm đặc biệt.", suspicious: false, suspicionReason: "" },
          { description: "Xét nghiệm máu cơ bản (Basic Metabolic Panel)", cpt: "80048", date: "2026-10-12", charge: 180.00, adjustment: 120.00, explanation: "Xét nghiệm máu kiểm tra thận, đường huyết và các chất muối/khoáng trong máu.", suspicious: false, suspicionReason: "" },
          { description: "Phí cơ sở vật chất — Cấp cứu", cpt: "—", date: "2026-10-12", charge: 2200.00, adjustment: 1400.00, explanation: "Bệnh viện tính 'phí cơ sở vật chất' chỉ vì quý vị dùng phòng cấp cứu — tách riêng với tiền công bác sĩ. Khoản này trả cho tòa nhà, thiết bị và y tá. Việc tính phí này là hợp pháp nhưng thường rất cao, và quý vị có thể yêu cầu giảm.", suspicious: false, suspicionReason: "" }
        ],
        flags: [
          { severity: "high", title: "Có thể bị tính trùng", detail: "Khoản 'Khám cấp cứu, Mức 4' ($1,850) xuất hiện 2 lần cho cùng một ngày. Nếu quý vị chỉ khám một lần, khoản thứ hai nên được xóa — quý vị có thể tiết kiệm khoảng $750 sau bảo hiểm. Hãy gọi phòng tính tiền của bệnh viện và yêu cầu họ sửa lại." },
          { severity: "medium", title: "Phí cơ sở vật chất cao", detail: "Phí cơ sở vật chất $2,200 là khoản lớn nhất trong hóa đơn này. Khoản phí này thường có thể thương lượng — hãy hỏi giảm 20–40% nếu quý vị trả hết một lần (prompt-pay discount)." },
          { severity: "low", title: "Đối chiếu với EOB", detail: "Hãy chắc chắn mọi con số ở đây khớp với giấy Giải thích Quyền lợi (EOB) của BlueCross PPO trước khi trả bất kỳ khoản nào." }
        ],
        nextSteps: [
          "Chờ giấy Giải thích Quyền lợi (EOB) của BlueCross PPO. Đừng trả tiền cho đến khi nhận được EOB và các con số khớp với hóa đơn này.",
          "Xin bệnh viện hóa đơn chi tiết từng khoản (itemized bill) và đối chiếu từng dòng với những gì quý vị nhớ về lần khám.",
          "Gọi phòng tính tiền của bệnh viện về khoản 'Khám cấp cứu' bị tính 2 lần và yêu cầu xóa khoản trùng.",
          "Hỏi giảm giá khi trả hết một lần (prompt-pay discount) — bệnh viện thường giảm 20–40% nếu quý vị trả toàn bộ một lần.",
          "Hỏi về chương trình hỗ trợ tài chính (financial assistance / charity care) — bệnh viện phi lợi nhuận bắt buộc phải có chương trình có thể giảm hoặc xóa hóa đơn của quý vị.",
          "Nếu bệnh viện không xóa khoản tính trùng, hãy khiếu nại (appeal) với BlueCross PPO và cân nhắc liên hệ sở bảo hiểm của tiểu bang."
        ],
        letter: {
          subject: "Yêu cầu sửa khoản tính trùng — Tài khoản XXXX",
          body: "Kính gửi Phòng Tính tiền,\n\nTôi tên là [Tên của quý vị]. Tôi viết thư này về hóa đơn phòng cấp cứu ngày 12/10/2026 (Tài khoản XXXX).\n\nTôi thấy khoản 'Emergency Department Visit, Level 4' (CPT 99284, $1,850.00) bị tính HAI lần cho cùng một lần khám trong cùng một ngày. Hôm đó tôi chỉ khám cấp cứu một lần. Tôi tin rằng khoản thứ hai là lỗi tính tiền.\n\nXin vui lòng kiểm tra lại tài khoản của tôi, xóa khoản tính trùng và gửi cho tôi hóa đơn mới. Xin vui lòng xác nhận bằng văn bản rằng đã sửa.\n\nXin cảm ơn sự giúp đỡ của quý vị.\n\nTrân trọng,\n[Tên của quý vị]\n[Ngày]\n[Số điện thoại]"
        },
        language: "vi"
      },
      es: {
        provider: "Riverside General Hospital",
        billDate: "2026-10-12",
        currency: "USD",
        patientOwes: 487.50,
        summary: "Esta es una factura de la sala de emergencias del Riverside General Hospital, con fecha 12/10/2026. El hospital cobró $7,530.00 en total. Su seguro (BlueCross PPO) pagó $2,422.50 (después de un deducible de $500 y un copago de emergencias de $150), y los descuentos por contrato fueron $4,620.00. El monto que se le pide pagar es $487.50, con vencimiento el 12/11/2026. IMPORTANTE: un cargo aparece dos veces: la 'Visita a emergencias, Nivel 4' se facturó dos veces por la misma visita el mismo día. Es muy probable que sea un error de facturación. No pague hasta preguntar al hospital sobre este cargo.",
        lineItems: [
          { description: "Visita a emergencias, Nivel 4", cpt: "99284", date: "2026-10-12", charge: 1850.00, adjustment: 1100.00, explanation: "El honorario del médico por atenderle en la sala de emergencias. 'Nivel 4' significa una visita moderadamente grave.", suspicious: true, suspicionReason: "Facturado DOS VECES por la misma visita el mismo día; es muy probable que sea un error de facturación duplicada." },
          { description: "Visita a emergencias, Nivel 4", cpt: "99284", date: "2026-10-12", charge: 1850.00, adjustment: 1100.00, explanation: "Igual que el anterior: el honorario del médico por la visita a emergencias.", suspicious: true, suspicionReason: "Duplicado del cargo anterior. Si usted tuvo una sola visita a emergencias ese día, no debería pagar este segundo cargo." },
          { description: "Tomografía de cabeza sin contraste", cpt: "70450", date: "2026-10-12", charge: 1450.00, adjustment: 900.00, explanation: "Una tomografía computarizada toma imágenes detalladas del interior de la cabeza con rayos X. 'Sin contraste' significa que no se usó tinte especial.", suspicious: false, suspicionReason: "" },
          { description: "Panel metabólico básico", cpt: "80048", date: "2026-10-12", charge: 180.00, adjustment: 120.00, explanation: "Un análisis de sangre que revisa los riñones, el azúcar en sangre y los niveles de sales y minerales.", suspicious: false, suspicionReason: "" },
          { description: "Tarifa de instalación — Emergencias", cpt: "—", date: "2026-10-12", charge: 2200.00, adjustment: 1400.00, explanation: "Los hospitales cobran una 'tarifa de instalación' solo por usar la sala de emergencias, separada del honorario del médico. Cubre el edificio, el equipo y las enfermeras. Es legal pero suele ser muy alta, y usted puede pedir que la reduzcan.", suspicious: false, suspicionReason: "" }
        ],
        flags: [
          { severity: "high", title: "Posible cargo duplicado", detail: "La 'Visita a emergencias, Nivel 4' ($1,850) aparece dos veces para la misma fecha. Si fue una sola visita, el segundo cargo debería eliminarse; eso podría ahorrarle unos $750 después del seguro. Llame a la oficina de facturación y pida que lo corrijan." },
          { severity: "medium", title: "Tarifa de instalación alta", detail: "La tarifa de instalación de $2,200 es el cargo más alto de esta factura. Estas tarifas suelen ser negociables: pida un descuento por pago total del 20–40% si paga el saldo completo." },
          { severity: "low", title: "Revise su EOB", detail: "Asegúrese de que cada monto coincida con su Explicación de Beneficios (EOB) de BlueCross PPO antes de pagar." }
        ],
        nextSteps: [
          "Espere su Explicación de Beneficios (EOB) de BlueCross PPO. No pague hasta que llegue la EOB y los números coincidan con esta factura.",
          "Pida al hospital una factura detallada y compare cada línea con lo que recuerde de su visita.",
          "Llame a la oficina de facturación del hospital sobre el cargo duplicado de 'Visita a emergencias' y pida que lo eliminen.",
          "Pida un descuento por pago total: los hospitales suelen reducir la factura entre un 20 y un 40% si paga el saldo completo de una vez.",
          "Pregunte por asistencia financiera o atención de caridad: los hospitales sin fines de lucro están obligados a tener un programa que puede reducir o eliminar su factura.",
          "Si el hospital no elimina el cargo duplicado, presente una apelación ante BlueCross PPO y considere contactar al departamento de seguros de su estado."
        ],
        letter: {
          subject: "Solicitud de corrección de cargo duplicado — Cuenta XXXX",
          body: "Estimado Departamento de Facturación:\n\nMi nombre es [Su nombre]. Le escribo sobre mi factura de la sala de emergencias con fecha 12/10/2026 (Cuenta XXXX).\n\nVeo que la 'Visita a emergencias, Nivel 4' (CPT 99284, $1,850.00) se cobró DOS veces por la misma visita el mismo día. Ese día tuve una sola visita a emergencias. Creo que el segundo cargo es un error de facturación.\n\nPor favor revise mi cuenta, elimine el cargo duplicado y envíeme una factura corregida. Por favor confirme por escrito que se hizo la corrección.\n\nGracias por su ayuda.\n\nAtentamente,\n[Su nombre]\n[Fecha]\n[Teléfono]"
        },
        language: "es"
      }
    },
    "sample-uc": {
      en: {
        provider: "Lakeside Urgent Care",
        billDate: "2026-10-18",
        currency: "USD",
        patientOwes: 350.00,
        summary: "This is a bill from Lakeside Urgent Care, dated October 18, 2026. Total charges are $815.00. Contract discounts removed $215.00, and your insurance (BlueCross PPO) paid $250.00. The amount you are asked to pay is $350.00. IMPORTANT: the entire $350 is a 'balance bill' from an out-of-network provider. Under the federal No Surprises Act, you may NOT have to pay this. Do not pay it yet — dispute it first.",
        lineItems: [
          { description: "Urgent Care Visit", cpt: "99213", date: "2026-10-18", charge: 220.00, adjustment: 80.00, explanation: "A visit to an urgent care clinic for a problem that needs quick care but is not an emergency.", suspicious: false, suspicionReason: "" },
          { description: "Rapid Strep Test", cpt: "87880", date: "2026-10-18", charge: 65.00, adjustment: 40.00, explanation: "A quick throat swab test to check for strep throat infection.", suspicious: false, suspicionReason: "" },
          { description: "X-Ray Chest", cpt: "71046", date: "2026-10-18", charge: 180.00, adjustment: 95.00, explanation: "An X-ray picture of your chest to check your lungs.", suspicious: true, suspicionReason: "Your insurance denied this charge. Ask for the denial reason in writing — denials are often reversed on appeal." },
          { description: "Balance Bill — Provider Out of Network", cpt: "—", date: "2026-10-18", charge: 350.00, adjustment: 0.00, explanation: "A 'balance bill' is the extra amount an out-of-network provider bills you beyond what insurance paid. Federal law limits when providers can do this.", suspicious: true, suspicionReason: "This balance bill may not be allowed under the federal No Surprises Act. Do not pay it before disputing it." }
        ],
        flags: [
          { severity: "high", title: "Surprise balance bill — you may not owe this", detail: "The $350 'Balance Bill — Provider Out of Network' may be illegal under the federal No Surprises Act. For emergency care and most out-of-network care at in-network facilities, providers cannot bill you more than your normal in-network cost. Do NOT pay this yet — dispute it in writing." },
          { severity: "medium", title: "Denied X-ray charge", detail: "BlueCross PPO denied the $180 chest X-ray. Ask the clinic for the denial reason in writing — many denials are reversed on appeal or after the clinic corrects a coding error." },
          { severity: "low", title: "Confirm the clinic's network status", detail: "Ask whether Lakeside Urgent Care is in your plan's network. If it is, this balance bill is almost certainly not allowed." }
        ],
        nextSteps: [
          "Do not pay the $350 balance bill yet.",
          "Call BlueCross PPO and ask whether the No Surprises Act protects you in this case.",
          "Ask the clinic for the X-ray denial reason in writing.",
          "File an appeal with your insurance for the denied X-ray charge.",
          "If the clinic insists on the balance bill, file a complaint with the federal No Surprises helpdesk: 1-800-985-3059.",
          "Ask the clinic for an itemized bill and a prompt-pay discount on anything you truly owe."
        ],
        letter: {
          subject: "Dispute of balance bill — Account XXXX",
          body: "Dear Billing Department,\n\nMy name is [Your Name]. I am writing about the bill from Lakeside Urgent Care dated October 18, 2026 (Account XXXX), which includes a 'Balance Bill — Provider Out of Network' of $350.00.\n\nUnder the federal No Surprises Act, health care providers may not send balance bills to patients in most emergency situations and for out-of-network care at in-network facilities. I believe this $350.00 charge is not allowed.\n\nPlease review this matter, withdraw the balance bill, and charge me only my normal in-network cost share. Please respond in writing.\n\nThank you.\n\nSincerely,\n[Your Name]\n[Date]\n[Phone number]"
        },
        language: "en"
      },
      vi: {
        provider: "Lakeside Urgent Care",
        billDate: "2026-10-18",
        currency: "USD",
        patientOwes: 350.00,
        summary: "Đây là hóa đơn của phòng khám Lakeside Urgent Care, ngày 18/10/2026. Tổng tiền tính là $815.00, giảm giá theo hợp đồng $215.00, bảo hiểm BlueCross PPO trả $250.00. Số tiền quý vị được yêu cầu trả là $350.00. QUAN TRỌNG: toàn bộ $350 này là 'hóa đơn chênh lệch' (balance bill) từ nhà cung cấp NGOÀI mạng lưới. Theo luật liên bang No Surprises Act, quý vị có thể KHÔNG phải trả khoản này. Xin đừng trả vội — hãy khiếu nại trước.",
        lineItems: [
          { description: "Khám tại phòng khám cấp cứu ngoại trú", cpt: "99213", date: "2026-10-18", charge: 220.00, adjustment: 80.00, explanation: "Lần khám tại phòng khám dành cho vấn đề cần khám nhanh nhưng không phải cấp cứu.", suspicious: false, suspicionReason: "" },
          { description: "Xét nghiệm liên cầu khuẩn nhanh", cpt: "87880", date: "2026-10-18", charge: 65.00, adjustment: 40.00, explanation: "Xét nghiệm phết họng nhanh để kiểm tra nhiễm liên cầu khuẩn.", suspicious: false, suspicionReason: "" },
          { description: "Chụp X-quang ngực", cpt: "71046", date: "2026-10-18", charge: 180.00, adjustment: 95.00, explanation: "Chụp X-quang ngực để kiểm tra phổi.", suspicious: true, suspicionReason: "Bảo hiểm đã từ chối khoản này. Hãy xin lý do từ chối bằng văn bản — nhiều trường hợp từ chối được đảo ngược khi khiếu nại." },
          { description: "Hóa đơn chênh lệch — Ngoài mạng lưới", cpt: "—", date: "2026-10-18", charge: 350.00, adjustment: 0.00, explanation: "'Hóa đơn chênh lệch' là khoản phụ trội mà nhà cung cấp ngoài mạng lưới tính thêm ngoài số tiền bảo hiểm đã trả. Luật liên bang giới hạn khi nào họ được làm vậy.", suspicious: true, suspicionReason: "Hóa đơn chênh lệch này có thể không được phép theo luật liên bang No Surprises Act. Đừng trả trước khi khiếu nại." }
        ],
        flags: [
          { severity: "high", title: "Hóa đơn chênh lệch bất ngờ — quý vị có thể không phải trả", detail: "Khoản $350 'Hóa đơn chênh lệch — Ngoài mạng lưới' có thể là bất hợp pháp theo luật liên bang No Surprises Act. Với dịch vụ cấp cứu và hầu hết dịch vụ ngoài mạng lưới tại cơ sở trong mạng lưới, nhà cung cấp không được tính quý vị cao hơn mức chi trả trong mạng lưới thông thường. ĐỪNG trả khoản này vội — hãy khiếu nại bằng văn bản." },
          { severity: "medium", title: "Khoản chụp X-quang bị bảo hiểm từ chối", detail: "BlueCross PPO đã từ chối khoản $180 chụp X-quang ngực. Hãy xin phòng khám lý do từ chối bằng văn bản — nhiều trường hợp từ chối được đảo ngược khi khiếu nại hoặc sau khi phòng khám sửa lỗi mã." },
          { severity: "low", title: "Xác nhận tình trạng mạng lưới của phòng khám", detail: "Hãy hỏi xem Lakeside Urgent Care có trong mạng lưới của gói bảo hiểm không. Nếu có, hóa đơn chênh lệch này gần như chắc chắn là không được phép." }
        ],
        nextSteps: [
          "Đừng trả khoản hóa đơn chênh lệch $350 vội.",
          "Gọi BlueCross PPO và hỏi luật No Surprises Act có bảo vệ quý vị trong trường hợp này không.",
          "Xin phòng khám lý do từ chối khoản X-quang bằng văn bản.",
          "Nộp đơn khiếu nại (appeal) khoản X-quang bị từ chối với bảo hiểm.",
          "Nếu phòng khám vẫn đòi khoản hóa đơn chênh lệch, hãy khiếu nại lên đường dây trợ giúp liên bang No Surprises: 1-800-985-3059.",
          "Xin phòng khám hóa đơn chi tiết và hỏi giảm giá trả một lần cho những khoản quý vị thực sự phải trả."
        ],
        letter: {
          subject: "Khiếu nại hóa đơn chênh lệch — Tài khoản XXXX",
          body: "Kính gửi Phòng Tính tiền,\n\nTôi tên là [Tên của quý vị]. Tôi viết thư này về hóa đơn của Lakeside Urgent Care ngày 18/10/2026 (Tài khoản XXXX), trong đó có khoản 'Balance Bill — Provider Out of Network' trị giá $350.00.\n\nTheo luật liên bang No Surprises Act, nhà cung cấp dịch vụ y tế không được gửi hóa đơn chênh lệch cho bệnh nhân trong hầu hết các trường hợp cấp cứu và dịch vụ ngoài mạng lưới tại cơ sở trong mạng lưới. Tôi tin rằng khoản $350.00 này không đúng quy định.\n\nXin vui lòng xem xét lại, rút lại hóa đơn chênh lệch này và chỉ tính cho tôi đúng mức chi trả trong mạng lưới (in-network cost share). Xin vui lòng trả lời bằng văn bản.\n\nXin cảm ơn.\n\nTrân trọng,\n[Tên của quý vị]\n[Ngày]\n[Số điện thoại]"
        },
        language: "vi"
      },
      es: {
        provider: "Lakeside Urgent Care",
        billDate: "2026-10-18",
        currency: "USD",
        patientOwes: 350.00,
        summary: "Esta es una factura de Lakeside Urgent Care, con fecha 18/10/2026. Los cargos totales son $815.00, los descuentos por contrato fueron $215.00 y su seguro (BlueCross PPO) pagó $250.00. El monto que se le pide pagar es $350.00. IMPORTANTE: los $350 completos son una 'factura de saldo' (balance bill) de un proveedor FUERA de la red. Según la ley federal No Surprises Act, es posible que usted NO tenga que pagar esto. No lo pague todavía: dispútelo primero.",
        lineItems: [
          { description: "Visita a clínica de urgencias", cpt: "99213", date: "2026-10-18", charge: 220.00, adjustment: 80.00, explanation: "Una visita a una clínica para un problema que necesita atención rápida pero no es una emergencia.", suspicious: false, suspicionReason: "" },
          { description: "Prueba rápida de estreptococo", cpt: "87880", date: "2026-10-18", charge: 65.00, adjustment: 40.00, explanation: "Una prueba rápida con hisopo de garganta para detectar la infección por estreptococo.", suspicious: false, suspicionReason: "" },
          { description: "Radiografía de tórax", cpt: "71046", date: "2026-10-18", charge: 180.00, adjustment: 95.00, explanation: "Una radiografía del pecho para revisar los pulmones.", suspicious: true, suspicionReason: "Su seguro rechazó este cargo. Pida el motivo del rechazo por escrito: muchos rechazos se revierten en apelación." },
          { description: "Factura de saldo — Fuera de la red", cpt: "—", date: "2026-10-18", charge: 350.00, adjustment: 0.00, explanation: "Una 'factura de saldo' es el monto extra que un proveedor fuera de la red le cobra además de lo que pagó el seguro. La ley federal limita cuándo pueden hacerlo.", suspicious: true, suspicionReason: "Esta factura de saldo podría no estar permitida según la ley federal No Surprises Act. No la pague antes de disputarla." }
        ],
        flags: [
          { severity: "high", title: "Factura de saldo sorpresa: es posible que no la deba", detail: "La 'Factura de saldo — Fuera de la red' de $350 podría ser ilegal según la ley federal No Surprises Act. Para atención de emergencia y la mayoría de la atención fuera de la red en instalaciones dentro de la red, los proveedores no pueden cobrarle más que su costo normal dentro de la red. NO pague esto todavía: dispútelo por escrito." },
          { severity: "medium", title: "Cargo de radiografía rechazado", detail: "BlueCross PPO rechazó la radiografía de tórax de $180. Pida a la clínica el motivo del rechazo por escrito: muchos rechazos se revierten en apelación o después de que la clínica corrija un error de codificación." },
          { severity: "low", title: "Confirme si la clínica está en su red", detail: "Pregunte si Lakeside Urgent Care está en la red de su plan. Si lo está, esta factura de saldo casi con seguridad no está permitida." }
        ],
        nextSteps: [
          "No pague todavía la factura de saldo de $350.",
          "Llame a BlueCross PPO y pregunte si la ley No Surprises Act le protege en este caso.",
          "Pida a la clínica el motivo del rechazo de la radiografía por escrito.",
          "Presente una apelación ante su seguro por el cargo de radiografía rechazado.",
          "Si la clínica insiste en la factura de saldo, presente una queja en la línea federal de ayuda No Surprises: 1-800-985-3059.",
          "Pida a la clínica una factura detallada y un descuento por pago total en lo que realmente deba."
        ],
        letter: {
          subject: "Disputa de factura de saldo — Cuenta XXXX",
          body: "Estimado Departamento de Facturación:\n\nMi nombre es [Su nombre]. Le escribo sobre la factura de Lakeside Urgent Care con fecha 18/10/2026 (Cuenta XXXX), que incluye una 'Factura de saldo — Fuera de la red' de $350.00.\n\nSegún la ley federal No Surprises Act, los proveedores de salud no pueden enviar facturas de saldo a los pacientes en la mayoría de los casos de emergencia y de atención fuera de la red en instalaciones dentro de la red. Creo que estos $350.00 no corresponden.\n\nPor favor revise el caso, retire esta factura de saldo y cóbreme solo mi costo normal dentro de la red. Por favor responda por escrito.\n\nGracias.\n\nAtentamente,\n[Su nombre]\n[Fecha]\n[Teléfono]"
        },
        language: "es"
      }
    }
  };

  /* ---------------- Mock Q&A fallback replies ----------------
     Tokens: {{provider}}, {{patientOwes}} — replaced by MC_qaFallbackReply. */

  var QA_FALLBACK = {
    en: [
      "I'm in mock mode right now, so I can't look up real insurance rules — but here's what I can tell you about this bill from {{provider}}: the amount listed as what you owe is {{patientOwes}}. My general advice: don't pay until your Explanation of Benefits (EOB) arrives and the numbers match. If anything looks wrong, call the billing office and ask for an itemized bill.",
      "Mock mode here — I don't have live data. A useful next step for the {{patientOwes}} balance: ask the provider for a prompt-pay discount (often 20–40% off if you pay in full) and ask about financial assistance programs. Nonprofit hospitals are required to have one.",
      "I'm running in mock mode, so this is general guidance, not advice about your real situation: if a charge looks duplicated or wrong, dispute it in writing and keep copies of everything. For deeper questions about your specific bill, add your Meta API key in Settings and ask me again — I'll analyze the real details then."
    ],
    vi: [
      "Tôi đang ở chế độ thử nghiệm (mock mode) nên không tra được quy định bảo hiểm thật — nhưng về hóa đơn của {{provider}} này, tôi có thể nói: số tiền ghi là quý vị phải trả là {{patientOwes}}. Lời khuyên chung: đừng trả tiền cho đến khi nhận được giấy EOB và các con số khớp nhau. Nếu thấy gì bất thường, hãy gọi phòng tính tiền và xin hóa đơn chi tiết.",
      "Đây là chế độ thử nghiệm — tôi không có dữ liệu trực tiếp. Bước tiếp theo hữu ích cho khoản {{patientOwes}}: hỏi nhà cung cấp về giảm giá trả một lần (thường giảm 20–40%) và hỏi chương trình hỗ trợ tài chính. Bệnh viện phi lợi nhuận bắt buộc phải có chương trình này.",
      "Tôi đang chạy ở chế độ thử nghiệm nên đây chỉ là hướng dẫn chung, không phải lời khuyên cho trường hợp thật của quý vị: nếu thấy khoản nào bị tính trùng hoặc sai, hãy khiếu nại bằng văn bản và giữ lại bản sao mọi giấy tờ. Muốn hỏi sâu về hóa đơn thật của mình, hãy nhập API key của Meta trong Cài đặt rồi hỏi lại — tôi sẽ phân tích chi tiết thật."
    ],
    es: [
      "Estoy en modo de prueba (mock mode), así que no puedo consultar las reglas reales del seguro — pero sobre esta factura de {{provider}}: el monto que se indica que usted debe es {{patientOwes}}. Mi consejo general: no pague hasta que llegue su Explicación de Beneficios (EOB) y los números coincidan. Si algo parece incorrecto, llame a la oficina de facturación y pida una factura detallada.",
      "Modo de prueba aquí — no tengo datos en vivo. Un próximo paso útil para el saldo de {{patientOwes}}: pregunte al proveedor por un descuento por pago total (a menudo 20–40% de descuento) y por programas de asistencia financiera. Los hospitales sin fines de lucro están obligados a tener uno.",
      "Estoy en modo de prueba, así que esto es orientación general, no un consejo sobre su situación real: si un cargo parece duplicado o incorrecto, dispútelo por escrito y guarde copias de todo. Para preguntas más profundas sobre su factura real, agregue su clave API de Meta en Ajustes y pregúnteme de nuevo."
    ]
  };

  /* ---------------- Templates for generated (non-fixture) bills ---------------- */

  var TPL = {
    en: {
      summary: "This is a bill from {{provider}} dated {{billDate}}. Total charges are {{charges}}. Your insurance ({{payer}}) paid {{paid}}, and contract discounts removed {{adjs}}. The amount you are asked to pay is {{owes}}, due {{dueDate}}. {{dupNote}}",
      dupNote: "IMPORTANT: at least one charge appears more than once for the same service. This may be a billing error — ask the billing office about it before you pay.",
      noDupNote: "No duplicate charges were detected in this mock analysis.",
      providerFallback: "your provider",
      payerFallback: "your insurance",
      genericExplanation: "This charge is for: {{description}}.",
      dupReason: "This exact charge appears more than once on the bill. It may be a duplicate billing error.",
      flagDupTitle: "Possible duplicate charge",
      flagDupDetail: "The same service was billed more than once. Call the billing office, ask them to review it, and request that any duplicate be removed.",
      flagBigTitle: "Large balance — ask about a payment plan",
      flagBigDetail: "You are asked to pay {{owes}}, which is a large amount. Ask the provider about an interest-free payment plan and about financial assistance programs.",
      flagEobTitle: "Check your EOB",
      flagEobDetail: "Wait for your Explanation of Benefits (EOB) from {{payer}} and make sure the numbers match before you pay anything.",
      nextSteps: [
        "Wait for your Explanation of Benefits (EOB) from {{payer}}. Do not pay until the EOB arrives and the numbers match this bill.",
        "Ask for an itemized bill and compare every line.",
        "If any charge looks wrong or duplicated, call the billing office and ask them to review it.",
        "Ask for a prompt-pay discount — providers often reduce the bill by 20–40% if you pay in full.",
        "Ask about financial assistance — nonprofit hospitals are required to have a program.",
        "If you disagree with the bill, file a written appeal with your insurance and keep copies of everything."
      ],
      letterSubject: "Request to review my bill — Account {{account}}",
      letterBody: "Dear Billing Department,\n\nMy name is [Your Name]. I am writing about my bill from {{provider}} dated {{billDate}} (Account {{account}}).\n\nI would like to request a review of the charges on this bill. The amount I am asked to pay is {{owes}}. Please send me an itemized statement and confirm that all charges are correct.\n\nIf any charge is wrong or duplicated, please correct it and send me an updated bill in writing.\n\nThank you for your help.\n\nSincerely,\n[Your Name]\n[Date]\n[Phone number]"
    },
    vi: {
      summary: "Đây là hóa đơn của {{provider}}, ngày {{billDate}}. Tổng tiền tính là {{charges}}. Bảo hiểm ({{payer}}) đã trả {{paid}}, và các khoản giảm giá theo hợp đồng là {{adjs}}. Số tiền quý vị được yêu cầu trả là {{owes}}, hạn chót {{dueDate}}. {{dupNote}}",
      dupNote: "QUAN TRỌNG: có ít nhất một khoản bị tính hơn một lần cho cùng một dịch vụ. Đây có thể là lỗi tính tiền — hãy hỏi phòng tính tiền trước khi trả.",
      noDupNote: "Phân tích thử nghiệm này không phát hiện khoản tính trùng nào.",
      providerFallback: "nơi khám của bạn",
      payerFallback: "bảo hiểm của bạn",
      genericExplanation: "Khoản phí này là: {{description}}.",
      dupReason: "Khoản phí này xuất hiện hơn một lần trong hóa đơn. Đây có thể là lỗi tính trùng.",
      flagDupTitle: "Có thể bị tính trùng",
      flagDupDetail: "Cùng một dịch vụ bị tính tiền hơn một lần. Hãy gọi phòng tính tiền, yêu cầu họ kiểm tra lại và xóa khoản trùng.",
      flagBigTitle: "Số tiền lớn — hãy hỏi về trả góp",
      flagBigDetail: "Quý vị được yêu cầu trả {{owes}}, đây là số tiền lớn. Hãy hỏi nhà cung cấp về chương trình trả góp không lãi và các chương trình hỗ trợ tài chính.",
      flagEobTitle: "Đối chiếu với EOB",
      flagEobDetail: "Hãy chờ giấy Giải thích Quyền lợi (EOB) của {{payer}} và chắc chắn các con số khớp nhau trước khi trả tiền.",
      nextSteps: [
        "Chờ giấy Giải thích Quyền lợi (EOB) của {{payer}}. Đừng trả tiền cho đến khi nhận được EOB và các con số khớp với hóa đơn này.",
        "Xin hóa đơn chi tiết từng khoản (itemized bill) và đối chiếu từng dòng.",
        "Nếu thấy khoản nào lạ hoặc bị tính trùng, hãy gọi phòng tính tiền và yêu cầu xem xét lại.",
        "Hỏi giảm giá khi trả hết một lần — thường giảm 20–40%.",
        "Hỏi về chương trình hỗ trợ tài chính (financial assistance) — bệnh viện phi lợi nhuận bắt buộc phải có.",
        "Nếu không đồng ý với hóa đơn, hãy khiếu nại (appeal) với bảo hiểm bằng văn bản và giữ lại bản sao mọi giấy tờ."
      ],
      letterSubject: "Yêu cầu xem xét lại hóa đơn — Tài khoản {{account}}",
      letterBody: "Kính gửi Phòng Tính tiền,\n\nTôi tên là [Tên của quý vị]. Tôi viết thư này về hóa đơn của {{provider}} ngày {{billDate}} (Tài khoản {{account}}).\n\nTôi muốn yêu cầu xem xét lại các khoản phí trong hóa đơn này. Số tiền tôi được yêu cầu trả là {{owes}}. Xin vui lòng gửi cho tôi bảng kê chi tiết và xác nhận mọi khoản phí đều đúng.\n\nNếu có khoản nào sai hoặc bị tính trùng, xin vui lòng sửa lại và gửi cho tôi hóa đơn mới bằng văn bản.\n\nXin cảm ơn.\n\nTrân trọng,\n[Tên của quý vị]\n[Ngày]\n[Số điện thoại]"
    },
    es: {
      summary: "Esta es una factura de {{provider}} con fecha {{billDate}}. Los cargos totales son {{charges}}. Su seguro ({{payer}}) pagó {{paid}} y los descuentos por contrato fueron {{adjs}}. El monto que se le pide pagar es {{owes}}, con vencimiento el {{dueDate}}. {{dupNote}}",
      dupNote: "IMPORTANTE: al menos un cargo aparece más de una vez por el mismo servicio. Podría ser un error de facturación; pregunte en la oficina de facturación antes de pagar.",
      noDupNote: "Este análisis de prueba no detectó cargos duplicados.",
      providerFallback: "su proveedor",
      payerFallback: "su seguro",
      genericExplanation: "Este cargo es por: {{description}}.",
      dupReason: "Este cargo exacto aparece más de una vez en la factura. Podría ser un error de facturación duplicada.",
      flagDupTitle: "Posible cargo duplicado",
      flagDupDetail: "El mismo servicio se facturó más de una vez. Llame a la oficina de facturación, pida que lo revisen y solicite que eliminen cualquier duplicado.",
      flagBigTitle: "Saldo alto: pregunte por un plan de pagos",
      flagBigDetail: "Se le pide pagar {{owes}}, que es una cantidad alta. Pregunte al proveedor por un plan de pagos sin intereses y por programas de asistencia financiera.",
      flagEobTitle: "Revise su EOB",
      flagEobDetail: "Espere su Explicación de Beneficios (EOB) de {{payer}} y asegúrese de que los números coincidan antes de pagar.",
      nextSteps: [
        "Espere su Explicación de Beneficios (EOB) de {{payer}}. No pague hasta que llegue la EOB y los números coincidan con esta factura.",
        "Pida una factura detallada y compare cada línea.",
        "Si algún cargo parece incorrecto o duplicado, llame a la oficina de facturación y pida que lo revisen.",
        "Pregunte por un descuento por pago total: los proveedores suelen reducir la factura entre un 20 y un 40% si paga todo de una vez.",
        "Pregunte por asistencia financiera: los hospitales sin fines de lucro están obligados a tener un programa.",
        "Si no está de acuerdo con la factura, presente una apelación por escrito ante su seguro y guarde copias de todo."
      ],
      letterSubject: "Solicitud de revisión de mi factura — Cuenta {{account}}",
      letterBody: "Estimado Departamento de Facturación:\n\nMi nombre es [Su nombre]. Le escribo sobre mi factura de {{provider}} con fecha {{billDate}} (Cuenta {{account}}).\n\nQuisiera solicitar una revisión de los cargos de esta factura. El monto que se me pide pagar es {{owes}}. Por favor envíeme un estado de cuenta detallado y confirme que todos los cargos son correctos.\n\nSi algún cargo es incorrecto o está duplicado, por favor corríjalo y envíeme una factura actualizada por escrito.\n\nGracias por su ayuda.\n\nAtentamente,\n[Su nombre]\n[Fecha]\n[Teléfono]"
    }
  };

  /* ---------------- Helpers ---------------- */

  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function money(n) { return "$" + Number(n || 0).toFixed(2); }

  function fill(tpl, map) {
    var out = tpl;
    for (var k in map) {
      if (Object.prototype.hasOwnProperty.call(map, k)) {
        out = out.split("{{" + k + "}}").join(map[k]);
      }
    }
    return out;
  }

  function pickLang(map, lang) { return (lang && map[lang]) ? lang : "en"; }

  /* ---------------- Public exports ---------------- */

  window.MC_FIXTURES = { bills: BILLS, analyses: ANALYSES, qaFallback: QA_FALLBACK };

  /**
   * Mock analyze: returns the canned analysis for fixture ids,
   * or synthesizes one from billData for generated/random bills.
   */
  window.MC_mockAnalyze = function (billData, langCode) {
    var bill = billData || {};
    var lang = pickLang(TPL, langCode);

    if (ANALYSES[bill.id] && ANALYSES[bill.id][lang]) {
      return clone(ANALYSES[bill.id][lang]);
    }

    var t = TPL[lang];
    var items = bill.lineItems || [];
    var seen = {};
    var dupKeys = {};
    items.forEach(function (it) {
      var k = (it.description || "") + "|" + (it.cpt || "");
      if (seen[k]) { dupKeys[k] = true; }
      seen[k] = true;
    });
    var hasDup = Object.keys(dupKeys).length > 0;

    var lineItems = items.map(function (it) {
      var k = (it.description || "") + "|" + (it.cpt || "");
      var isDup = !!dupKeys[k];
      var ex = (it.explain && (it.explain[lang] || it.explain.en)) ||
               fill(t.genericExplanation, { description: it.description });
      return {
        description: it.description,
        cpt: it.cpt,
        date: it.date,
        charge: it.charge,
        adjustment: it.adjustment,
        explanation: ex,
        suspicious: isDup,
        suspicionReason: isDup ? t.dupReason : ""
      };
    });

    var charges = items.reduce(function (s, it) { return s + (Number(it.charge) || 0); }, 0);
    var adjs = items.reduce(function (s, it) { return s + (Number(it.adjustment) || 0); }, 0);
    var paid = (bill.insurance && Number(bill.insurance.paid)) || 0;
    var payer = (bill.insurance && bill.insurance.payer) || t.payerFallback;
    var owes = (bill.patientOwes != null) ? bill.patientOwes : Math.max(0, charges - adjs - paid);
    var map = {
      provider: bill.provider || t.providerFallback,
      billDate: bill.billDate || "",
      charges: money(charges),
      paid: money(paid),
      adjs: money(adjs),
      owes: money(owes),
      dueDate: bill.dueDate || "",
      payer: payer,
      account: bill.accountLast4 || "XXXX",
      dupNote: hasDup ? t.dupNote : t.noDupNote
    };

    var flags = [];
    if (hasDup) {
      flags.push({ severity: "high", title: t.flagDupTitle, detail: t.flagDupDetail });
    }
    if (owes > 500) {
      flags.push({ severity: "medium", title: t.flagBigTitle, detail: fill(t.flagBigDetail, map) });
    }
    flags.push({ severity: "low", title: t.flagEobTitle, detail: fill(t.flagEobDetail, map) });

    return {
      provider: bill.provider,
      billDate: bill.billDate,
      currency: bill.currency || "USD",
      patientOwes: owes,
      summary: fill(t.summary, map),
      lineItems: lineItems,
      flags: flags,
      nextSteps: t.nextSteps.map(function (s) { return fill(s, map); }),
      letter: {
        subject: fill(t.letterSubject, map),
        body: fill(t.letterBody, map)
      },
      language: lang
    };
  };

  /* ---------------- Mock-bill generator ---------------- */

  var PROVIDERS = [
    { name: "Riverside General Hospital", address: "1200 Main St, Richmond, VA 23219" },
    { name: "Lakeside Urgent Care", address: "45 Lakeview Dr, Henrico, VA 23229" },
    { name: "Quest Diagnostics Lab", address: "900 Lab Way, Richmond, VA 23220" },
    { name: "ClearView Imaging Center", address: "210 Scan Blvd, Glen Allen, VA 23060" },
    { name: "Mercy Community Clinic", address: "78 Mercy Ave, Richmond, VA 23224" },
    { name: "St. Anne's Medical Center", address: "1500 Anne St, Petersburg, VA 23803" }
  ];

  var PAYERS = ["BlueCross PPO", "Aetna HMO", "Cigna PPO", "UnitedHealthcare", "Medicare"];

  var ITEM_POOL = [
    { description: "Emergency Department Visit, Level 4", cpt: "99284", charge: 1850.00, explain: {
      en: "The doctor's fee for treating you in the emergency room; 'Level 4' means a moderately serious visit.",
      vi: "Tiền công bác sĩ khám cho quý vị tại phòng cấp cứu; 'Mức 4' nghĩa là ca khám ở mức khá nghiêm trọng.",
      es: "El honorario del médico por atenderle en la sala de emergencias; 'Nivel 4' significa una visita moderadamente grave." } },
    { description: "Urgent Care Visit", cpt: "99213", charge: 220.00, explain: {
      en: "A visit to an urgent care clinic for a problem that needs quick care but is not an emergency.",
      vi: "Lần khám tại phòng khám cấp cứu ngoại trú cho vấn đề cần khám nhanh nhưng không phải cấp cứu.",
      es: "Una visita a una clínica de atención urgente por un problema que necesita atención rápida pero no es una emergencia." } },
    { description: "CT Scan Head w/o contrast", cpt: "70450", charge: 1450.00, explain: {
      en: "A CT scan takes detailed pictures inside your head using X-rays; 'w/o contrast' means no special dye was used.",
      vi: "Chụp CT cho hình ảnh chi tiết bên trong đầu bằng tia X; 'w/o contrast' nghĩa là không dùng thuốc cản quang.",
      es: "Una tomografía computarizada toma imágenes detalladas del interior de la cabeza con rayos X; 'sin contraste' significa que no se usó tinte especial." } },
    { description: "CT Scan Abdomen/Pelvis w/ contrast", cpt: "74177", charge: 2100.00, explain: {
      en: "A detailed scan of your belly and pelvis using X-rays and a special dye to see organs clearly.",
      vi: "Chụp chi tiết vùng bụng và chậu bằng tia X kèm thuốc cản quang để thấy rõ các cơ quan.",
      es: "Un escáner detallado del abdomen y la pelvis con rayos X y un tinte especial para ver los órganos claramente." } },
    { description: "Basic Metabolic Panel", cpt: "80048", charge: 180.00, explain: {
      en: "A blood test that checks your kidneys, blood sugar, and salt and mineral levels.",
      vi: "Xét nghiệm máu kiểm tra thận, đường huyết và các chất muối/khoáng trong máu.",
      es: "Un análisis de sangre que revisa los riñones, el azúcar en sangre y los niveles de sales y minerales." } },
    { description: "Comprehensive Metabolic Panel", cpt: "80053", charge: 220.00, explain: {
      en: "A broader blood test that checks kidneys, liver, blood sugar, and protein levels.",
      vi: "Xét nghiệm máu tổng quát hơn, kiểm tra thận, gan, đường huyết và đạm trong máu.",
      es: "Un análisis de sangre más amplio que revisa riñones, hígado, azúcar en sangre y niveles de proteínas." } },
    { description: "Complete Blood Count (CBC)", cpt: "85025", charge: 120.00, explain: {
      en: "A common blood test that counts your red and white blood cells and platelets.",
      vi: "Xét nghiệm máu phổ biến đếm hồng cầu, bạch cầu và tiểu cầu.",
      es: "Un análisis de sangre común que cuenta los glóbulos rojos, los glóbulos blancos y las plaquetas." } },
    { description: "X-Ray Chest, 2 views", cpt: "71046", charge: 180.00, explain: {
      en: "Two X-ray pictures of your chest to check your lungs and heart.",
      vi: "Chụp 2 tấm X-quang ngực để kiểm tra phổi và tim.",
      es: "Dos radiografías del pecho para revisar los pulmones y el corazón." } },
    { description: "EKG / ECG", cpt: "93000", charge: 150.00, explain: {
      en: "A quick, painless test that records your heart's electrical activity.",
      vi: "Xét nghiệm nhanh, không đau, ghi lại hoạt động điện của tim.",
      es: "Una prueba rápida e indolora que registra la actividad eléctrica del corazón." } },
    { description: "Rapid Strep Test", cpt: "87880", charge: 65.00, explain: {
      en: "A quick throat swab test to check for strep throat infection.",
      vi: "Xét nghiệm phết họng nhanh để kiểm tra nhiễm liên cầu khuẩn.",
      es: "Una prueba rápida con hisopo de garganta para detectar la faringitis estreptocócica." } },
    { description: "MRI Brain w/o contrast", cpt: "70551", charge: 1800.00, explain: {
      en: "A detailed picture of your brain using magnets (no radiation); 'w/o contrast' means no dye was used.",
      vi: "Chụp hình chi tiết não bằng từ trường (không dùng tia X); không dùng thuốc cản quang.",
      es: "Una imagen detallada del cerebro usando imanes (sin radiación); 'sin contraste' significa que no se usó tinte." } },
    { description: "Facility Fee — Emergency", cpt: "—", charge: 2200.00, explain: {
      en: "Hospitals charge a 'facility fee' just for using the emergency room — separate from the doctor's fee. It covers the building, equipment, and nurses.",
      vi: "Bệnh viện tính 'phí cơ sở vật chất' chỉ vì quý vị dùng phòng cấp cứu — tách riêng với tiền công bác sĩ. Khoản này trả cho tòa nhà, thiết bị và y tá.",
      es: "Los hospitales cobran una 'tarifa de instalación' solo por usar la sala de emergencias, separada del honorario del médico. Cubre el edificio, el equipo y las enfermeras." } },
    { description: "IV Infusion Therapy", cpt: "96365", charge: 450.00, explain: {
      en: "Medicine or fluids given through a needle into your vein (an IV drip).",
      vi: "Thuốc hoặc dịch truyền qua kim vào tĩnh mạch (truyền dịch).",
      es: "Medicamentos o líquidos administrados por una aguja en la vena (suero intravenoso)." } },
    { description: "Wound Repair, Simple", cpt: "12001", charge: 380.00, explain: {
      en: "The fee for stitching or closing a simple cut or wound.",
      vi: "Tiền công khâu hoặc đóng vết cắt/vết thương đơn giản.",
      es: "El honorario por suturar o cerrar un corte o herida simple." } },
    { description: "Physical Therapy Session", cpt: "97110", charge: 140.00, explain: {
      en: "A guided exercise session with a therapist to help you recover movement and strength.",
      vi: "Buổi tập có hướng dẫn với chuyên viên vật lý trị liệu để phục hồi vận động và sức mạnh.",
      es: "Una sesión de ejercicios guiados con un terapeuta para ayudarle a recuperar movimiento y fuerza." } },
    { description: "Rapid Flu Test", cpt: "87804", charge: 55.00, explain: {
      en: "A quick nose swab test to check for the flu virus.",
      vi: "Xét nghiệm phết mũi nhanh để kiểm tra virus cúm.",
      es: "Una prueba rápida con hisopo nasal para detectar el virus de la gripe." } }
  ];

  function rnd(n) { return Math.floor(Math.random() * n); }
  function pick(arr) { return arr[rnd(arr.length)]; }
  function fmtDate(d) { return d.toISOString().slice(0, 10); }
  function r2(n) { return Math.round(n * 100) / 100; }

  /**
   * Generates a random but plausible mock bill (PRACTICE - NOT REAL).
   * 30% chance of one duplicated line item to demo the duplicate flag.
   */
  window.MC_generateMockBill = function () {
    var p = pick(PROVIDERS);
    var billDate = fmtDate(new Date(Date.now() - rnd(90) * 86400000));
    var dueDate = fmtDate(new Date(new Date(billDate + "T00:00:00Z").getTime() + 30 * 86400000));

    var n = 3 + rnd(4); // 3–6 line items
    var items = [];
    for (var i = 0; i < n; i++) {
      var it = pick(ITEM_POOL);
      items.push({
        description: it.description,
        cpt: it.cpt,
        date: billDate,
        charge: it.charge,
        adjustment: r2(it.charge * (0.35 + Math.random() * 0.25)),
        explain: it.explain
      });
    }
    if (Math.random() < 0.30 && items.length) {
      var d = pick(items);
      items.push({ description: d.description, cpt: d.cpt, date: d.date, charge: d.charge, adjustment: d.adjustment, explain: d.explain });
    }
    // shuffle so a duplicate is not always last
    for (var j = items.length - 1; j > 0; j--) {
      var k = rnd(j + 1);
      var tmp = items[j]; items[j] = items[k]; items[k] = tmp;
    }

    var charges = r2(items.reduce(function (s, it) { return s + it.charge; }, 0));
    var adjs = r2(items.reduce(function (s, it) { return s + it.adjustment; }, 0));
    var paid = Math.max(0, r2((charges - adjs) * (0.55 + Math.random() * 0.30)));
    var owes = Math.max(0, r2(charges - adjs - paid));

    return {
      id: "gen-" + Date.now(),
      title: p.name + " — Sample",
      provider: p.name,
      providerAddress: p.address,
      billDate: billDate,
      dueDate: dueDate,
      accountLast4: "XXXX",
      currency: "USD",
      lineItems: items,
      insurance: { payer: pick(PAYERS), paid: paid, note: "" },
      patientOwes: owes
    };
  };

  /**
   * Mock Q&A reply: picks a fallback template and fills provider/amount tokens.
   */
  window.MC_qaFallbackReply = function (lang, idx, bill) {
    var l = QA_FALLBACK[lang] ? lang : "en";
    var arr = QA_FALLBACK[l];
    var tpl = arr[(idx || 0) % arr.length];
    var b = bill || {};
    return tpl.split("{{provider}}").join(b.provider || "your provider")
              .split("{{patientOwes}}").join(money(b.patientOwes != null ? b.patientOwes : 0));
  };

})();
