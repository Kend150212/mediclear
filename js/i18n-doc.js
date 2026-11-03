/* MediClear i18n supplement — generalized document support + PDF upload (Settings/Scan).
   Merges into window.MC_STRINGS. Document types + PDF upload strings. */
(function () {
  var extra = {
    en: {
      scanSubtitle: "Snap or upload: medical bill, insurance letter, contract, government letter…",
      btnPdf: "Upload PDF",
      btnSamplePdf: "or try our sample PDF",
      pdfTooMany: "This PDF has more than 10 pages. Please photograph the important pages instead.",
      pdfReading: "Reading your PDF…",
      docTypeBill: "Medical bill",
      docTypeInsurance: "Insurance letter",
      docTypeContract: "Contract",
      docTypeGov: "Government letter",
      docTypeOther: "Document",
      resClauses: "Key terms, explained"
    },
    es: {
      scanSubtitle: "Tome una foto o suba: factura médica, carta del seguro, contrato, carta del gobierno…",
      btnPdf: "Subir PDF",
      btnSamplePdf: "o pruebe nuestro PDF de ejemplo",
      pdfTooMany: "Este PDF tiene más de 10 páginas. Tome fotos de las páginas importantes.",
      pdfReading: "Leyendo su PDF…",
      docTypeBill: "Factura médica",
      docTypeInsurance: "Carta del seguro",
      docTypeContract: "Contrato",
      docTypeGov: "Carta del gobierno",
      docTypeOther: "Documento",
      resClauses: "Términos importantes, explicados"
    },
    zh: {
      scanSubtitle: "拍照或上传：医疗账单、保险信函、合同、政府来信…",
      btnPdf: "上传 PDF",
      btnSamplePdf: "或试用我们的示例 PDF",
      pdfTooMany: "这份 PDF 超过 10 页。请直接拍摄重要页面。",
      pdfReading: "正在读取您的 PDF…",
      docTypeBill: "医疗账单",
      docTypeInsurance: "保险信函",
      docTypeContract: "合同",
      docTypeGov: "政府来信",
      docTypeOther: "文件",
      resClauses: "重要条款，简单讲解"
    },
    vi: {
      scanSubtitle: "Chụp hoặc tải lên: hóa đơn y tế, thư bảo hiểm, hợp đồng, thư từ…",
      btnPdf: "Tải PDF lên",
      btnSamplePdf: "hoặc thử file PDF mẫu của chúng tôi",
      pdfTooMany: "File PDF này quá 10 trang. Vui lòng chụp hình những trang quan trọng.",
      pdfReading: "Đang đọc file PDF…",
      docTypeBill: "Hóa đơn y tế",
      docTypeInsurance: "Thư bảo hiểm",
      docTypeContract: "Hợp đồng",
      docTypeGov: "Thư chính phủ",
      docTypeOther: "Giấy tờ",
      resClauses: "Điều khoản chính, giải thích dễ hiểu"
    },
    ko: {
      scanSubtitle: "사진을 찍거나 올리세요: 병원 청구서, 보험 서류, 계약서, 정부 문서…",
      btnPdf: "PDF 올리기",
      btnSamplePdf: "또는 예시 PDF로 해보세요",
      pdfTooMany: "이 PDF는 10페이지를 넘습니다. 중요한 페이지를 직접 찍어 주세요.",
      pdfReading: "PDF를 읽고 있습니다…",
      docTypeBill: "병원 청구서",
      docTypeInsurance: "보험 서류",
      docTypeContract: "계약서",
      docTypeGov: "정부 문서",
      docTypeOther: "문서",
      resClauses: "중요 조항, 쉽게 설명"
    },
    tl: {
      scanSubtitle: "Kuhanan o i-upload: bill sa ospital, sulat ng insurance, kontrata, sulat ng gobyerno…",
      btnPdf: "Mag-upload ng PDF",
      btnSamplePdf: "o subukan ang sample PDF namin",
      pdfTooMany: "Mahigit 10 pahina ang PDF na ito. Kuhanan na lang po ng larawan ang mahahalagang pahina.",
      pdfReading: "Binabasa ang inyong PDF…",
      docTypeBill: "Bill sa ospital",
      docTypeInsurance: "Sulat ng insurance",
      docTypeContract: "Kontrata",
      docTypeGov: "Sulat ng gobyerno",
      docTypeOther: "Dokumento",
      resClauses: "Mahahalagang kondisyon, ipinaliwanag"
    },
    ar: {
      scanSubtitle: "التقط صورة أو ارفع: فاتورة طبية، رسالة تأمين، عقد، رسالة حكومية…",
      btnPdf: "رفع ملف PDF",
      btnSamplePdf: "أو جرّب ملف PDF التجريبي",
      pdfTooMany: "هذا الملف يحتوي على أكثر من ١٠ صفحات. التقط صورًا للصفحات المهمة بدلًا من ذلك.",
      pdfReading: "جارٍ قراءة ملف PDF…",
      docTypeBill: "فاتورة طبية",
      docTypeInsurance: "رسالة تأمين",
      docTypeContract: "عقد",
      docTypeGov: "رسالة حكومية",
      docTypeOther: "مستند",
      resClauses: "الشروط المهمة، مشروحة ببساطة"
    },
    ru: {
      scanSubtitle: "Сфотографируйте или загрузите: медицинский счёт, письмо страховой, договор, письмо из ведомства…",
      btnPdf: "Загрузить PDF",
      btnSamplePdf: "или попробуйте наш пример PDF",
      pdfTooMany: "В этом PDF больше 10 страниц. Лучше сфотографируйте важные страницы.",
      pdfReading: "Читаем ваш PDF…",
      docTypeBill: "Медицинский счёт",
      docTypeInsurance: "Письмо страховой",
      docTypeContract: "Договор",
      docTypeGov: "Письмо из ведомства",
      docTypeOther: "Документ",
      resClauses: "Важные условия — простым языком"
    },
    fr: {
      scanSubtitle: "Photographiez ou envoyez : facture médicale, courrier d'assurance, contrat, courrier officiel…",
      btnPdf: "Envoyer un PDF",
      btnSamplePdf: "ou essayez notre PDF d'exemple",
      pdfTooMany: "Ce PDF fait plus de 10 pages. Photographiez plutôt les pages importantes.",
      pdfReading: "Lecture de votre PDF…",
      docTypeBill: "Facture médicale",
      docTypeInsurance: "Courrier d'assurance",
      docTypeContract: "Contrat",
      docTypeGov: "Courrier officiel",
      docTypeOther: "Document",
      resClauses: "Points importants, expliqués simplement"
    },
    ht: {
      scanSubtitle: "Pran yon foto oswa voye: bòdwo lopital, lèt asirans, kontra, lèt gouvènman…",
      btnPdf: "Voye PDF",
      btnSamplePdf: "oswa eseye PDF egzanp nou an",
      pdfTooMany: "PDF sa a gen plis pase 10 paj. Pran foto paj ki enpòtan yo.",
      pdfReading: "N ap li PDF ou a…",
      docTypeBill: "Bòdwo lopital",
      docTypeInsurance: "Lèt asirans",
      docTypeContract: "Kontra",
      docTypeGov: "Lèt gouvènman",
      docTypeOther: "Dokiman",
      resClauses: "Pwen enpòtan yo, eksplike klè"
    },
    pt: {
      scanSubtitle: "Tire uma foto ou envie: conta médica, carta do seguro, contrato, carta do governo…",
      btnPdf: "Enviar PDF",
      btnSamplePdf: "ou teste nosso PDF de exemplo",
      pdfTooMany: "Este PDF tem mais de 10 páginas. Tire fotos das páginas importantes.",
      pdfReading: "Lendo seu PDF…",
      docTypeBill: "Conta médica",
      docTypeInsurance: "Carta do seguro",
      docTypeContract: "Contrato",
      docTypeGov: "Carta do governo",
      docTypeOther: "Documento",
      resClauses: "Termos importantes, explicados"
    },
    pl: {
      scanSubtitle: "Zrób zdjęcie lub wyślij: rachunek medyczny, pismo z ubezpieczenia, umowę, pismo urzędowe…",
      btnPdf: "Wyślij PDF",
      btnSamplePdf: "lub wypróbuj nasz przykładowy PDF",
      pdfTooMany: "Ten PDF ma ponad 10 stron. Zrób zdjęcia ważnych stron.",
      pdfReading: "Czytamy Twój PDF…",
      docTypeBill: "Rachunek medyczny",
      docTypeInsurance: "Pismo z ubezpieczenia",
      docTypeContract: "Umowa",
      docTypeGov: "Pismo urzędowe",
      docTypeOther: "Dokument",
      resClauses: "Ważne zapisy — prosto wyjaśnione"
    },
    ja: {
      scanSubtitle: "撮影またはアップロード：医療費の請求書、保険会社からの手紙、契約書、役所からの手紙…",
      btnPdf: "PDFをアップロード",
      btnSamplePdf: "またはサンプルPDFを試す",
      pdfTooMany: "このPDFは10ページを超えています。大事なページを撮影してください。",
      pdfReading: "PDFを読み込んでいます…",
      docTypeBill: "医療費の請求書",
      docTypeInsurance: "保険会社からの手紙",
      docTypeContract: "契約書",
      docTypeGov: "役所からの手紙",
      docTypeOther: "書類",
      resClauses: "大事な条項を、やさしく解説"
    }
  };
  if (window.MC_STRINGS) {
    Object.keys(extra).forEach(function (l) {
      if (window.MC_STRINGS[l]) Object.assign(window.MC_STRINGS[l], extra[l]);
    });
  }
})();
