/* MediClear i18n supplement — "Connection mode" block (Settings). Merges into window.MC_STRINGS. */
(function () {
  var extra = {
    en: {
      setConnTitle: "Connection mode",
      setConnAuto: "Automatic (recommended)",
      setConnAutoDesc: "No key needed. The app connects through our secure server.",
      setConnByok: "Use my own key",
      setConnByokDesc: "Call Meta directly with your own key.",
      needKeyMsg: "Please enter your API key below, or switch back to Automatic mode."
    },
    es: {
      setConnTitle: "Modo de conexión",
      setConnAuto: "Automático (recomendado)",
      setConnAutoDesc: "No necesita clave. La aplicación se conecta por nuestro servidor seguro.",
      setConnByok: "Usar mi propia clave",
      setConnByokDesc: "Llame a Meta directamente con su propia clave.",
      needKeyMsg: "Escriba su clave en el casillero de abajo, o vuelva al modo Automático."
    },
    zh: {
      setConnTitle: "连接模式",
      setConnAuto: "自动（推荐）",
      setConnAutoDesc: "不需要密钥。应用通过我们的安全服务器连接。",
      setConnByok: "使用我自己的密钥",
      setConnByokDesc: "用您自己的密钥直接连接 Meta。",
      needKeyMsg: "请在下面的输入框中输入密钥，或切换回自动模式。"
    },
    vi: {
      setConnTitle: "Chế độ kết nối",
      setConnAuto: "Tự động (khuyên dùng)",
      setConnAutoDesc: "Không cần key. App kết nối qua máy chủ bảo mật của chúng tôi.",
      setConnByok: "Nhập key của tôi",
      setConnByokDesc: "Gọi thẳng tới Meta bằng key của bạn.",
      needKeyMsg: "Vui lòng nhập key vào ô bên dưới, hoặc chuyển lại chế độ Tự động."
    },
    ko: {
      setConnTitle: "연결 방식",
      setConnAuto: "자동 (권장)",
      setConnAutoDesc: "키가 필요 없습니다. 앱이 보안 서버를 통해 연결됩니다.",
      setConnByok: "내 키 사용",
      setConnByokDesc: "본인의 키로 Meta에 직접 연결합니다.",
      needKeyMsg: "아래 칸에 키를 입력하시거나 자동 방식으로 다시 바꿔 주세요."
    },
    tl: {
      setConnTitle: "Paraan ng koneksyon",
      setConnAuto: "Awtomatiko (inirerekomenda)",
      setConnAutoDesc: "Hindi kailangan ng key. Kumokonekta ang app sa pamamagitan ng aming secure server.",
      setConnByok: "Gamitin ang sarili kong key",
      setConnByokDesc: "Direktang kumonekta sa Meta gamit ang sarili ninyong key.",
      needKeyMsg: "Ilagay po ang inyong key sa kahon sa ibaba, o bumalik sa Awtomatikong paraan."
    },
    ar: {
      setConnTitle: "وضع الاتصال",
      setConnAuto: "تلقائي (مُوصى به)",
      setConnAutoDesc: "لا حاجة لمفتاح. يتصل التطبيق عبر خادمنا الآمن.",
      setConnByok: "استخدام مفتاحي الخاص",
      setConnByokDesc: "اتصل بـ Meta مباشرة باستخدام مفتاحك الخاص.",
      needKeyMsg: "يرجى إدخال مفتاحك في المربع أدناه، أو العودة إلى الوضع التلقائي."
    },
    ru: {
      setConnTitle: "Режим подключения",
      setConnAuto: "Автоматический (рекомендуется)",
      setConnAutoDesc: "Ключ не нужен. Приложение подключается через наш безопасный сервер.",
      setConnByok: "Использовать свой ключ",
      setConnByokDesc: "Подключаться к Meta напрямую со своим ключом.",
      needKeyMsg: "Введите ваш ключ в поле ниже или вернитесь в автоматический режим."
    },
    fr: {
      setConnTitle: "Mode de connexion",
      setConnAuto: "Automatique (recommandé)",
      setConnAutoDesc: "Aucune clé nécessaire. L'appli se connecte via notre serveur sécurisé.",
      setConnByok: "Utiliser ma propre clé",
      setConnByokDesc: "Appelez Meta directement avec votre propre clé.",
      needKeyMsg: "Veuillez saisir votre clé dans le champ ci-dessous, ou revenez au mode Automatique."
    },
    ht: {
      setConnTitle: "Mòd koneksyon",
      setConnAuto: "Otomatik (rekomande)",
      setConnAutoDesc: "Pa bezwen kle. Aplikasyon an konekte nan sèvè sekirite nou an.",
      setConnByok: "Sèvi ak pwòp kle mwen",
      setConnByokDesc: "Rele Meta dirèk ak pwòp kle ou.",
      needKeyMsg: "Tanpri mete kle ou nan kazye ki anba a, oswa tounen nan mòd Otomatik."
    },
    pt: {
      setConnTitle: "Modo de conexão",
      setConnAuto: "Automático (recomendado)",
      setConnAutoDesc: "Não precisa de chave. O aplicativo se conecta pelo nosso servidor seguro.",
      setConnByok: "Usar minha própria chave",
      setConnByokDesc: "Ligue para a Meta diretamente com a sua própria chave.",
      needKeyMsg: "Digite a sua chave no campo abaixo ou volte para o modo Automático."
    },
    pl: {
      setConnTitle: "Tryb połączenia",
      setConnAuto: "Automatyczny (zalecany)",
      setConnAutoDesc: "Klucz nie jest potrzebny. Aplikacja łączy się przez nasz bezpieczny serwer.",
      setConnByok: "Użyj własnego klucza",
      setConnByokDesc: "Łącz się z Meta bezpośrednio, używając własnego klucza.",
      needKeyMsg: "Wpisz swój klucz w polu poniżej albo wróć do trybu automatycznego."
    },
    ja: {
      setConnTitle: "接続方式",
      setConnAuto: "自動（おすすめ）",
      setConnAutoDesc: "キーは不要です。アプリは安全なサーバーを経由して接続します。",
      setConnByok: "自分のキーを使う",
      setConnByokDesc: "ご自分のキーでMetaに直接接続します。",
      needKeyMsg: "下の欄にキーを入力するか、自動方式に戻してください。"
    }
  };
  if (window.MC_STRINGS) {
    Object.keys(extra).forEach(function (l) {
      if (window.MC_STRINGS[l]) Object.assign(window.MC_STRINGS[l], extra[l]);
    });
  }
})();
