export type UiLang = "uz" | "ru" | "en" | "tj";

export const UI_LANG_OPTIONS: Array<{ code: UiLang; short: string; label: string }> = [
  { code: "uz", short: "UZ", label: "O'zbekcha" },
  { code: "ru", short: "RU", label: "Русский" },
  { code: "en", short: "EN", label: "English" },
  { code: "tj", short: "TJ", label: "Тоҷикӣ" },
];

export interface UiDictionary {
  // Header & Nav
  navTranslator: string;
  navHistory: string;
  navPricing: string;
  navGuide: string;
  navCamera: string;
  uploadScreenshot: string;
  uploadShort: string;
  menuLangAria: string;

  // Toolbar
  sourceLangAria: string;
  targetLangAria: string;
  swapLangAria: string;
  viewOverlay: string;
  viewSplit: string;
  viewList: string;
  camera: string;
  screenShare: string;
  themeDarkAria: string;
  themeLightAria: string;
  nicheLabel: string;
  nicheGeneral: string;
  nicheEcommerce: string;
  nicheFinance: string;
  nicheTravel: string;
  proUnlimited: string;
  dailyLimitLabel: (remaining: number, limit: number) => string;
  adRewardBtn: string;
  adRewardLoading: string;
  adRewardWatchBtn: string;
  accountBtn: string;
  getProBtn: string;
  signInProBtn: string;
  closeBtn: string;
  retryBtn: string;
  replaceBtn: string;

  // Empty Stage & Hero
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  chooseScreenshot: string;
  heroSteps: string;
  pasteHint: string;
  compareOriginal: string;
  compareSplit: string;
  compareTranslated: string;
  samplesTitle: string;
  samplesSubtitle: string;
  tabTranslated: string;
  tabOriginal: string;

  // Active Stage
  peekOriginal: string;
  cropTranslate: string;
  cropDragging: string;
  retranslate: string;
  savePng: string;
  opacityLabel: string;
  clearScreenAria: string;
  translatedLangsLabel: string;
  originalScreenLabel: string;
  translatedScreenLabel: string;
  translatingOverlay: string;

  // Inspector Panel
  detectedTextsTitle: string;
  copyAllBtn: string;
  copiedBtn: string;
  blocksCount: (n: number) => string;
  analyzingStatus: string;
  inspectorEmptyHint: string;
  inspectorCapsTitle: string;
  inspectorCapsSubtitle: string;
  inspectorCap1Title: string;
  inspectorCap1Desc: string;
  inspectorCap2Title: string;
  inspectorCap2Desc: string;
  inspectorCap3Title: string;
  inspectorCap3Desc: string;
  selectedBlockLabel: string;
  originalTextLabel: string;
  editableTranslationLabel: string;
  listenBtn: string;
  copyBtn: string;
  alternativesBtn: string;
  alternativesLoading: string;
  alternativesHeading: string;
  searchPlaceholder: string;
  noSearchMatch: string;
  catAll: string;
  catHeading: string;
  catButton: string;
  catLabel: string;
  catBody: string;
  catStatus: string;

  // History
  historyTitle: string;
  historySubtitle: string;
  historyTranslatedThumb: string;
  historyOriginalThumb: string;
  clearHistoryBtn: string;
  historyEmptyTitle: string;
  historyEmptyDesc: string;
  historyOpenBtn: string;
  historyDeleteAria: string;

  // Guide
  guideTitle: string;
  guideSubtitle: string;
  guideSteps: Array<{ num: string; title: string; desc: string }>;
  guideBackBtn: string;
  guideSupport: string;

  // Capture Modal
  captureCameraTitle: string;
  captureScreenTitle: string;
  captureCameraStarting: string;
  captureScreenStarting: string;
  captureCameraHint: string;
  captureScreenHint: string;
  captureSwitchCamera: string;
  captureStreamHint: string;
  captureActionBtn: string;
  cancelBtn: string;

  // Language Selector
  langSearchPlaceholder: string;
  langPopularTitle: string;
  langAllTitle: (count: number) => string;
  langNotFound: (q: string) => string;

  // PWA & Offline
  pwaInstall: string;
  pwaAddHome: string;
  pwaIosTitle: string;
  pwaIosStep1: string;
  pwaIosStep2: string;
  pwaUnderstood: string;
  offlineBanner: string;

  // Pricing Modal key UI labels
  pricingModalTitle: string;
  pricingSubtitleGuest: string;
  pricingTabPlans: string;
  pricingTabAdmin: string;
  pricingSignInGoogle: string;
  pricingSigningIn: string;
  pricingSignOut: string;
  pricingFreeAdTitle: string;
  pricingWatchAdBtn: string;
  pricingInviteTitle: string;
  pricingInviteDesc: string;
  pricingCopyLink: string;
  pricingCopied: string;
  pricingShareTelegram: string;
  pricingShareGroup: string;
  pricingSelectPlan: string;
  pricingPayMethod: string;
  pricingPayNotePlaceholder: string;
  pricingSubmitRequest: string;
  pricingPayStarsBtn: string;
  pricingSupportLink: string;

  // Errors
  errLimitReached: string;
  errNoTextFound: string;
  errDefaultTranslate: string;
  errTooLarge: string;
  errServerWaking: string;
  errTimeout: string;
  errNetwork: string;
}

export const UI_TRANSLATIONS: Record<UiLang, UiDictionary> = {
  uz: {
    navTranslator: "Tarjimon",
    navHistory: "Tarix",
    navPricing: "Tariflar",
    navGuide: "Qo'llanma",
    navCamera: "Kamera",
    uploadScreenshot: "Skrinshot yuklash",
    uploadShort: "Yuklash",
    menuLangAria: "Menyu tili",

    sourceLangAria: "Manba tili",
    targetLangAria: "Tarjima tili",
    swapLangAria: "Tillarni almashtirish",
    viewOverlay: "Ustma-ust",
    viewSplit: "Yonma-yon",
    viewList: "Ro'yxat",
    camera: "Kamera",
    screenShare: "Ekran ulashish",
    themeDarkAria: "Tungi rejim",
    themeLightAria: "Yorug' rejim",
    nicheLabel: "Uslub:",
    nicheGeneral: "Umumiy",
    nicheEcommerce: "1688 / Taobao / Trendyol",
    nicheFinance: "Bank va Rasmiy",
    nicheTravel: "Sayohat va Menyu",
    proUnlimited: "Pro tarif · Cheksiz",
    dailyLimitLabel: (r, l) => `Bugungi limit: ${r} / ${l}`,
    adRewardBtn: "+2 (Reklama)",
    adRewardLoading: "Yuklanmoqda...",
    adRewardWatchBtn: "Reklama ko'rish (+2)",
    accountBtn: "Akkaunt",
    getProBtn: "Pro olish",
    signInProBtn: "Kirish / Pro",
    closeBtn: "Yopish",
    retryBtn: "Qayta urinish",
    replaceBtn: "Almashtirish",

    heroEyebrow: "120+ til · Rasmning o'zida aniq tarjima",
    heroTitle: "Chet tilidagi ekranni 1 soniyada o'zbekcha o'qing",
    heroSubtitle:
      "1688, Taobao, Trendyol, Telegram chatlar yoki chet ilovalari — skrinshot yuklang, tugma va narxlar o'z joyida tushunarli bo'ladi.",
    chooseScreenshot: "Skrinshot tanlash",
    heroSteps: "1. Skrinshot oling · 2. Yuklang · 3. PNG sifatida saqlang",
    pasteHint: "Kompyuterda Ctrl+V bilan ham skrinshotni joylash mumkin",
    compareOriginal: "Asl rasm",
    compareSplit: "Solishtirish",
    compareTranslated: "Tarjima",
    samplesTitle: "Boshqa tillarning tarjima qilingan rasmlari",
    samplesSubtitle: "Istalgan namunani bosing — rasm ustidagi tarjima darhol ochiladi",
    tabTranslated: "Tarjima",
    tabOriginal: "Asl rasm",

    peekOriginal: "Original (bosib turing)",
    cropTranslate: "Hududni kesib tarjima",
    cropDragging: "Hududni tortib belgilang...",
    retranslate: "Qayta tarjima",
    savePng: "Rasmni saqlash",
    opacityLabel: "Qoplama",
    clearScreenAria: "Ekranni tozalash",
    translatedLangsLabel: "Tarjima tillari:",
    originalScreenLabel: "Asl ekran",
    translatedScreenLabel: "Tarjima qilingan ekran",
    translatingOverlay: "Ekrandagi matnlar aniqlanib tarjima qilinmoqda...",

    detectedTextsTitle: "Aniqlangan matnlar",
    copyAllBtn: "Barchasi",
    copiedBtn: "Nusxalandi",
    blocksCount: (n) => `${n} ta blok`,
    analyzingStatus: "Ekran tahlil qilinmoqda...",
    inspectorEmptyHint: "Skrinshot yuklanganda barcha matn bloklari shu yerda ko'rinadi.",
    inspectorCapsTitle: "Nimalarni aniq tarjima qiladi?",
    inspectorCapsSubtitle:
      "Skrinshot yoki tayyor namuna tanlaganingizda barcha yozuvlar bu yerda ro'yxat sifatida ham chiqadi.",
    inspectorCap1Title: "1688, Taobao, Pinduoduo va Trendyol",
    inspectorCap1Desc: "Mahsulot narxi, o'lchamlar, chegirma va sotib olish tugmalari.",
    inspectorCap2Title: "Yozishmalar va chet ilovalar",
    inspectorCap2Desc: "Telegram, WhatsApp, bank va davlat ilovalari menyulari.",
    inspectorCap3Title: "Tahrirlash, ovoz va PNG saqlash",
    inspectorCap3Desc:
      "Istalgan matnni bosib talaffuzini eshiting yoki tayyor rasmni yuklab oling.",
    selectedBlockLabel: "Tanlangan blok",
    originalTextLabel: "Asl matn",
    editableTranslationLabel: "Tarjima (tahrirlash mumkin)",
    listenBtn: "Eshitish",
    copyBtn: "Nusxalash",
    alternativesBtn: "Muqobil variantlar",
    alternativesLoading: "Yuklanmoqda...",
    alternativesHeading: "Muqobil tarjima takliflari:",
    searchPlaceholder: "Matn bo'yicha qidirish...",
    noSearchMatch: "Qidiruv bo'yicha mos matn topilmadi.",
    catAll: "Hammasi",
    catHeading: "Sarlavha",
    catButton: "Tugma",
    catLabel: "Yorliq",
    catBody: "Matn",
    catStatus: "Holat",

    historyTitle: "Tarjima tarixi",
    historySubtitle: "Avval tarjima qilingan telefon ekranlari qurilmangizda saqlanadi.",
    historyTranslatedThumb: "Tarjima rasmi",
    historyOriginalThumb: "Asl rasm",
    clearHistoryBtn: "Barcha tarixni tozalash",
    historyEmptyTitle: "Saqlangan ekranlar hali yo'q",
    historyEmptyDesc:
      "Tarjima qilgan har bir telefon skrinshotingiz avtomatik ravishda shu yerda saqlanadi.",
    historyOpenBtn: "Ochish",
    historyDeleteAria: "Tarixdan o'chirish",

    guideTitle: "EkranTarjimondan qanday foydalaniladi",
    guideSubtitle:
      "Ilova telefon ekranidagi tugmalar, menyular, xabarlar va maqolalarning aniq joylashuvini saqlagan holda ustma-ust tarjima qiladi.",
    guideSteps: [
      {
        num: "01",
        title: "Telefondan skrinshot yuklash",
        desc: "Android yoki iPhone qurilmangizda tarjima qilmoqchi bo'lgan ilova ekranini skrinshotga oling. Keyin «Skrinshot yuklash» tugmasi orqali tanlang — barcha tugma va matnlar o'z joyida ustma-ust tarjima qilinadi.",
      },
      {
        num: "02",
        title: "Kamera orqali boshqa ekranni o'qish",
        desc: "Boshqa telefon, planshet, bankomat yoki monitor ekranini «Kamera» rejimi orqali suratga oling. Kadr olinishi bilan ekrandagi barcha matnlar avtomatik ajratilib tarjima qilinadi.",
      },
      {
        num: "03",
        title: "Kompyuterda jonli ekran ulashish",
        desc: "Telefoningizni kompyuterga ulagan bo'lsangiz, «Ekran ulashish» tugmasini bosing va kerakli oynadan kadr oling. Shuningdek Ctrl+V bilan nusxalangan rasmni ham joylashingiz mumkin.",
      },
      {
        num: "04",
        title: "Hududni belgilash va matnni tahrirlash",
        desc: "Agar ekranning faqat bir qismi kerak bo'lsa, «Hududni kesib tarjima» tugmasini yoqib kerakli joyni belgilang. Istalgan tarjima blokini bosib uni tahrirlash, nusxalash yoki ovozli eshitish mumkin.",
      },
    ],
    guideBackBtn: "Tarjimonga qaytish",
    guideSupport: "Qo'llab-quvvatlash: @Admiin_0571",

    captureCameraTitle: "Kamera orqali ekranni skanerlash",
    captureScreenTitle: "Jonli ekran oynasidan kadr olish",
    captureCameraStarting: "Kamera ishga tushmoqda...",
    captureScreenStarting: "Ekran tanlanmoqda...",
    captureCameraHint:
      "Boshqa telefon yoki monitor ekranini kadrga to'g'rilang va «Kadrni tarjima qilish» tugmasini bosing.",
    captureScreenHint:
      "Telefon aks ettirilgan oyna yoki brauzer tabini tanlab, kerakli paytda kadr oling.",
    captureSwitchCamera: "Kamerani almashtirish",
    captureStreamHint: "Jonli oqim tayyor bo'lgach kadr oling",
    captureActionBtn: "Kadrni tarjima qilish",
    cancelBtn: "Bekor qilish",

    langSearchPlaceholder: "Tilni qidiring (masalan: uzbek, russian, english)...",
    langPopularTitle: "Ko'p ishlatiladigan tillar",
    langAllTitle: (n) => `Barcha jahon tillari (${n})`,
    langNotFound: (q) => `«${q}» bo'yicha til topilmadi`,

    pwaInstall: "Ilovani o'rnatish",
    pwaAddHome: "Ekranga qo'shish",
    pwaIosTitle: "iPhone / iPad ekraniga o'rnatish",
    pwaIosStep1: "Safari pastki panelidagi Ulashish (Share) tugmasini bosing.",
    pwaIosStep2: "Pastga tushib Asosiy ekranga qo'shish (Add to Home Screen) bandini tanlang.",
    pwaUnderstood: "Tushunarli",
    offlineBanner: "Oflayn rejim · Saqlangan tarix ko'rsatilmoqda",

    pricingModalTitle: "Tariflar, Bonuslar va Akkaunt",
    pricingSubtitleGuest: "Ko'proq bepul limit va tarixni saqlash uchun kiring",
    pricingTabPlans: "Tariflar va Bonus",
    pricingTabAdmin: "Buyurtmalar",
    pricingSignInGoogle: "Google bilan kirish",
    pricingSigningIn: "Kirilmoqda...",
    pricingSignOut: "Chiqish",
    pricingFreeAdTitle: "Bepul kredit olish",
    pricingWatchAdBtn: "Reklama ko'rish (+2)",
    pricingInviteTitle: "Do'stlarni taklif qilib +5 kredit oling",
    pricingInviteDesc: "Har bir taklif qilingan do'stingiz uchun sizga +5, do'stingizga +3 bonus kredit beriladi.",
    pricingCopyLink: "Taklif havolasini nusxalash",
    pricingCopied: "Nusxalandi!",
    pricingShareTelegram: "Telegramda ulashish",
    pricingShareGroup: "Guruhga ulashish",
    pricingSelectPlan: "Tarifni tanlang",
    pricingPayMethod: "To'lov usuli",
    pricingPayNotePlaceholder: "Chek raqami, karta oxirgi 4 raqami yoki Telegram @username...",
    pricingSubmitRequest: "To'lov so'rovini yuborish",
    pricingPayStarsBtn: "Telegram Stars bilan to'lash",
    pricingSupportLink: "Admin bilan bog'lanish (@Admiin_0571)",

    errLimitReached:
      "Bugungi bepul tarjima limitingiz tugadi. Davom etish uchun Google bilan kiring yoki Pro tarifga o'ting.",
    errNoTextFound:
      "Ushbu tasvirda o'qiladigan matn topilmadi. Aniqroq skrinshot yuklab ko'ring.",
    errDefaultTranslate: "Tarjima jarayonida xatolik yuz berdi. Qayta urinib ko'ring.",
    errTooLarge: "Rasm hajmi juda katta. Qisqaroq yoki kesilgan skrinshot yuklang.",
    errServerWaking: "Server uyg'onmoqda, biroz kuting va qayta bosing.",
    errTimeout: "Internet sekinligi sababli so'rov vaqti tugadi. Qayta urinib ko'ring.",
    errNetwork: "Server bilan aloqa uzildi. Internetni tekshirib qayta urinib ko'ring.",
  },

  ru: {
    navTranslator: "Переводчик",
    navHistory: "История",
    navPricing: "Тарифы",
    navGuide: "Инструкция",
    navCamera: "Камера",
    uploadScreenshot: "Загрузить скрин",
    uploadShort: "Загрузить",
    menuLangAria: "Язык меню",

    sourceLangAria: "Язык оригинала",
    targetLangAria: "Язык перевода",
    swapLangAria: "Поменять языки местами",
    viewOverlay: "Наложение",
    viewSplit: "Рядом",
    viewList: "Список",
    camera: "Камера",
    screenShare: "Захват экрана",
    themeDarkAria: "Тёмная тема",
    themeLightAria: "Светлая тема",
    nicheLabel: "Режим:",
    nicheGeneral: "Обычный",
    nicheEcommerce: "1688 / Taobao / Trendyol",
    nicheFinance: "Банки и документы",
    nicheTravel: "Поездки и меню",
    proUnlimited: "Pro тариф · Безлимит",
    dailyLimitLabel: (r, l) => `Лимит сегодня: ${r} / ${l}`,
    adRewardBtn: "+2 (Реклама)",
    adRewardLoading: "Загрузка...",
    adRewardWatchBtn: "Смотреть рекламу (+2)",
    accountBtn: "Аккаунт",
    getProBtn: "Получить Pro",
    signInProBtn: "Войти / Pro",
    closeBtn: "Закрыть",
    retryBtn: "Повторить",
    replaceBtn: "Заменить",

    heroEyebrow: "120+ языков · Точный перевод прямо поверх изображения",
    heroTitle: "Читайте любой экран на родном языке за 1 секунду",
    heroSubtitle:
      "1688, Taobao, Trendyol, чаты Telegram или зарубежные приложения — загрузите скриншот, и все кнопки и цены переведутся прямо на картинке.",
    chooseScreenshot: "Выбрать скриншот",
    heroSteps: "1. Сделайте скрин · 2. Загрузите · 3. Сохраните PNG",
    pasteHint: "На компьютере можно вставить скриншот через Ctrl+V",
    compareOriginal: "Оригинал",
    compareSplit: "Сравнить",
    compareTranslated: "Перевод",
    samplesTitle: "Примеры переведённых экранов на других языках",
    samplesSubtitle: "Нажмите на любой пример — перевод откроется мгновенно",
    tabTranslated: "Перевод",
    tabOriginal: "Оригинал",

    peekOriginal: "Оригинал (удерживайте)",
    cropTranslate: "Выделить область",
    cropDragging: "Выделите нужную область...",
    retranslate: "Перевести снова",
    savePng: "Сохранить фото",
    opacityLabel: "Фон",
    clearScreenAria: "Очистить экран",
    translatedLangsLabel: "Языки перевода:",
    originalScreenLabel: "Оригинальный экран",
    translatedScreenLabel: "Переведённый экран",
    translatingOverlay: "Распознаём и переводим текст на экране...",

    detectedTextsTitle: "Найденный текст",
    copyAllBtn: "Копировать всё",
    copiedBtn: "Скопировано",
    blocksCount: (n) => `${n} блоков`,
    analyzingStatus: "Анализируем экран...",
    inspectorEmptyHint: "После загрузки скриншота все текстовые блоки появятся здесь.",
    inspectorCapsTitle: "Что переводит приложение?",
    inspectorCapsSubtitle:
      "Загрузите скриншот или выберите пример — список всех надписей появится здесь.",
    inspectorCap1Title: "1688, Taobao, Pinduoduo и Trendyol",
    inspectorCap1Desc: "Цены, размеры, скидки, доставка и кнопки заказа.",
    inspectorCap2Title: "Переписки и зарубежные приложения",
    inspectorCap2Desc: "Меню Telegram, WhatsApp, банковских и госсервисов.",
    inspectorCap3Title: "Правка, озвучка и сохранение PNG",
    inspectorCap3Desc: "Нажмите на любой текст для озвучки или скачайте готовое фото.",
    selectedBlockLabel: "Выбранный блок",
    originalTextLabel: "Оригинал",
    editableTranslationLabel: "Перевод (можно изменить)",
    listenBtn: "Озвучить",
    copyBtn: "Копировать",
    alternativesBtn: "Другие варианты",
    alternativesLoading: "Загрузка...",
    alternativesHeading: "Альтернативные переводы:",
    searchPlaceholder: "Поиск по тексту...",
    noSearchMatch: "Ничего не найдено по вашему запросу.",
    catAll: "Все",
    catHeading: "Заголовки",
    catButton: "Кнопки",
    catLabel: "Метки",
    catBody: "Текст",
    catStatus: "Статус",

    historyTitle: "История переводов",
    historySubtitle: "Ранее переведённые экраны сохраняются на вашем устройстве.",
    historyTranslatedThumb: "С переводом",
    historyOriginalThumb: "Оригинал",
    clearHistoryBtn: "Очистить историю",
    historyEmptyTitle: "Сохранённых экранов пока нет",
    historyEmptyDesc: "Каждый переведённый скриншот автоматически сохраняется здесь.",
    historyOpenBtn: "Открыть",
    historyDeleteAria: "Удалить из истории",

    guideTitle: "Как пользоваться EkranTarjimon",
    guideSubtitle:
      "Приложение переводит кнопки, меню, сообщения и статьи прямо поверх скриншота, сохраняя их точное расположение.",
    guideSteps: [
      {
        num: "01",
        title: "Загрузка скриншота с телефона",
        desc: "Сделайте скриншот нужного приложения на Android или iPhone и выберите его кнопкой «Загрузить скрин» — все надписи переведутся прямо на местах.",
      },
      {
        num: "02",
        title: "Перевод другого экрана через камеру",
        desc: "Откройте «Камеру» и наведите на экран другого телефона, банкомата или монитора. После снимка весь текст сразу переведётся.",
      },
      {
        num: "03",
        title: "Захват экрана на компьютере",
        desc: "На компьютере используйте «Захват экрана» для любого окна или просто вставьте скриншот из буфера через Ctrl+V.",
      },
      {
        num: "04",
        title: "Выделение области и правка текста",
        desc: "Если нужна только часть экрана, нажмите «Выделить область». Нажмите на любой блок, чтобы изменить перевод, озвучить или скопировать его.",
      },
    ],
    guideBackBtn: "Вернуться в переводчик",
    guideSupport: "Поддержка: @Admiin_0571",

    captureCameraTitle: "Сканирование экрана через камеру",
    captureScreenTitle: "Снимок окна экрана",
    captureCameraStarting: "Запуск камеры...",
    captureScreenStarting: "Выбор экрана...",
    captureCameraHint: "Наведите камеру на другой экран и нажмите «Перевести кадр».",
    captureScreenHint: "Выберите окно или вкладку браузера и сделайте снимок.",
    captureSwitchCamera: "Сменить камеру",
    captureStreamHint: "Дождитесь изображения и нажмите кнопку",
    captureActionBtn: "Перевести кадр",
    cancelBtn: "Отмена",

    langSearchPlaceholder: "Поиск языка (например: russian, english, tajik)...",
    langPopularTitle: "Популярные языки",
    langAllTitle: (n) => `Все языки мира (${n})`,
    langNotFound: (q) => `Язык «${q}» не найден`,

    pwaInstall: "Установить",
    pwaAddHome: "На экран домой",
    pwaIosTitle: "Установка на iPhone / iPad",
    pwaIosStep1: "Нажмите «Поделиться» (Share) в нижней панели Safari.",
    pwaIosStep2: "Выберите «На экран «Домой»» (Add to Home Screen).",
    pwaUnderstood: "Понятно",
    offlineBanner: "Офлайн-режим · Показана сохранённая история",

    pricingModalTitle: "Тарифы, Бонусы и Аккаунт",
    pricingSubtitleGuest: "Войдите, чтобы получить больше лимитов и облачную историю",
    pricingTabPlans: "Тарифы и Бонусы",
    pricingTabAdmin: "Заявки",
    pricingSignInGoogle: "Войти через Google",
    pricingSigningIn: "Вход...",
    pricingSignOut: "Выйти",
    pricingFreeAdTitle: "Получить бесплатные кредиты",
    pricingWatchAdBtn: "Смотреть рекламу (+2)",
    pricingInviteTitle: "Пригласите друзей и получите +5 кредитов",
    pricingInviteDesc: "За каждого приглашённого друга вы получаете +5 кредитов, а друг +3.",
    pricingCopyLink: "Копировать ссылку",
    pricingCopied: "Скопировано!",
    pricingShareTelegram: "Поделиться в Telegram",
    pricingShareGroup: "Поделиться в группу",
    pricingSelectPlan: "Выберите тариф",
    pricingPayMethod: "Способ оплаты",
    pricingPayNotePlaceholder: "Номер чека, последние 4 цифры карты или @username...",
    pricingSubmitRequest: "Отправить заявку",
    pricingPayStarsBtn: "Оплатить через Telegram Stars",
    pricingSupportLink: "Связаться с админом (@Admiin_0571)",

    errLimitReached:
      "Дневной бесплатный лимит исчерпан. Войдите через Google, посмотрите рекламу (+2) или выберите Pro.",
    errNoTextFound:
      "На этом изображении не найден читаемый текст. Попробуйте более чёткий скриншот.",
    errDefaultTranslate: "Произошла ошибка при переводе. Попробуйте ещё раз.",
    errTooLarge: "Изображение слишком большое. Загрузите скриншот меньшего размера.",
    errServerWaking: "Сервер запускается, подождите немного и нажмите «Повторить».",
    errTimeout: "Время ожидания истекло из-за медленного интернета. Попробуйте снова.",
    errNetwork: "Нет связи с сервером. Проверьте интернет и повторите попытку.",
  },

  en: {
    navTranslator: "Translator",
    navHistory: "History",
    navPricing: "Plans",
    navGuide: "Guide",
    navCamera: "Camera",
    uploadScreenshot: "Upload Screen",
    uploadShort: "Upload",
    menuLangAria: "Interface language",

    sourceLangAria: "Source language",
    targetLangAria: "Target language",
    swapLangAria: "Swap languages",
    viewOverlay: "Overlay",
    viewSplit: "Side-by-side",
    viewList: "List",
    camera: "Camera",
    screenShare: "Share screen",
    themeDarkAria: "Dark mode",
    themeLightAria: "Light mode",
    nicheLabel: "Mode:",
    nicheGeneral: "General",
    nicheEcommerce: "1688 / Taobao / Trendyol",
    nicheFinance: "Bank & Official",
    nicheTravel: "Travel & Menu",
    proUnlimited: "Pro Plan · Unlimited",
    dailyLimitLabel: (r, l) => `Daily limit: ${r} / ${l}`,
    adRewardBtn: "+2 (Watch Ad)",
    adRewardLoading: "Loading...",
    adRewardWatchBtn: "Watch Ad (+2)",
    accountBtn: "Account",
    getProBtn: "Get Pro",
    signInProBtn: "Sign in / Pro",
    closeBtn: "Close",
    retryBtn: "Retry",
    replaceBtn: "Replace",

    heroEyebrow: "120+ languages · Instant in-place image translation",
    heroTitle: "Read any foreign phone screen in seconds",
    heroSubtitle:
      "1688, Taobao, Trendyol, Telegram chats, or foreign apps — upload a screenshot and every button, label, and price is translated right on the image.",
    chooseScreenshot: "Choose Screenshot",
    heroSteps: "1. Take screenshot · 2. Upload · 3. Save as PNG",
    pasteHint: "On desktop, you can also paste screenshots with Ctrl+V",
    compareOriginal: "Original",
    compareSplit: "Compare",
    compareTranslated: "Translated",
    samplesTitle: "Translated screen samples in other languages",
    samplesSubtitle: "Tap any sample to open its interactive overlay immediately",
    tabTranslated: "Translated",
    tabOriginal: "Original",

    peekOriginal: "Original (hold)",
    cropTranslate: "Crop & translate",
    cropDragging: "Drag to select region...",
    retranslate: "Retranslate",
    savePng: "Save image",
    opacityLabel: "Overlay",
    clearScreenAria: "Clear screen",
    translatedLangsLabel: "Translated versions:",
    originalScreenLabel: "Original screen",
    translatedScreenLabel: "Translated screen",
    translatingOverlay: "Detecting and translating screen text...",

    detectedTextsTitle: "Detected text",
    copyAllBtn: "Copy all",
    copiedBtn: "Copied",
    blocksCount: (n) => `${n} blocks`,
    analyzingStatus: "Analyzing screen...",
    inspectorEmptyHint: "Upload a screenshot to inspect all translated text blocks here.",
    inspectorCapsTitle: "What can it translate?",
    inspectorCapsSubtitle:
      "Once you upload a screenshot or open a sample, every block appears here for quick editing.",
    inspectorCap1Title: "1688, Taobao, Pinduoduo & Trendyol",
    inspectorCap1Desc: "Prices, sizes, shipping terms, discounts, and order buttons.",
    inspectorCap2Title: "Chats & foreign mobile apps",
    inspectorCap2Desc: "Telegram messages, banking apps, menus, and system settings.",
    inspectorCap3Title: "Edit, pronounce & export PNG",
    inspectorCap3Desc: "Tap any block to listen, refine wording, or download the translated photo.",
    selectedBlockLabel: "Selected block",
    originalTextLabel: "Original text",
    editableTranslationLabel: "Translation (editable)",
    listenBtn: "Listen",
    copyBtn: "Copy",
    alternativesBtn: "Alternatives",
    alternativesLoading: "Loading...",
    alternativesHeading: "Alternative phrasings:",
    searchPlaceholder: "Search detected text...",
    noSearchMatch: "No matching text blocks found.",
    catAll: "All",
    catHeading: "Heading",
    catButton: "Button",
    catLabel: "Label",
    catBody: "Text",
    catStatus: "Status",

    historyTitle: "Translation History",
    historySubtitle: "Previously translated phone screens are saved locally on your device.",
    historyTranslatedThumb: "Translated",
    historyOriginalThumb: "Original",
    clearHistoryBtn: "Clear all history",
    historyEmptyTitle: "No saved screens yet",
    historyEmptyDesc: "Every screenshot you translate will automatically appear here.",
    historyOpenBtn: "Open",
    historyDeleteAria: "Delete from history",

    guideTitle: "How to use EkranTarjimon",
    guideSubtitle:
      "Translate buttons, menus, messages, and product pages directly over the screenshot while keeping layout intact.",
    guideSteps: [
      {
        num: "01",
        title: "Upload a phone screenshot",
        desc: "Take a screenshot on Android or iPhone and tap «Upload Screen» — every button and label is translated cleanly in place.",
      },
      {
        num: "02",
        title: "Scan another screen with Camera",
        desc: "Use Camera mode to snap another phone, ATM, tablet, or monitor screen and translate all visible text immediately.",
      },
      {
        num: "03",
        title: "Live screen capture on desktop",
        desc: "Use «Share screen» to grab frames from any mirrored phone window or paste directly with Ctrl+V.",
      },
      {
        num: "04",
        title: "Crop region & edit translations",
        desc: "Use «Crop & translate» to focus on a specific area, and tap any block to edit text, copy, or hear pronunciation.",
      },
    ],
    guideBackBtn: "Back to Translator",
    guideSupport: "Support: @Admiin_0571",

    captureCameraTitle: "Scan screen with Camera",
    captureScreenTitle: "Capture live window frame",
    captureCameraStarting: "Starting camera...",
    captureScreenStarting: "Selecting screen...",
    captureCameraHint: "Point your camera at another screen and tap «Translate Frame».",
    captureScreenHint: "Choose a mirrored phone window or browser tab to capture.",
    captureSwitchCamera: "Switch camera",
    captureStreamHint: "Capture once the live preview appears",
    captureActionBtn: "Translate Frame",
    cancelBtn: "Cancel",

    langSearchPlaceholder: "Search language (e.g. russian, tajik, chinese)...",
    langPopularTitle: "Popular languages",
    langAllTitle: (n) => `All world languages (${n})`,
    langNotFound: (q) => `No language matching "${q}"`,

    pwaInstall: "Install App",
    pwaAddHome: "Add to Home",
    pwaIosTitle: "Install on iPhone / iPad",
    pwaIosStep1: "Tap the Share button at the bottom of Safari.",
    pwaIosStep2: "Scroll down and choose Add to Home Screen.",
    pwaUnderstood: "Got it",
    offlineBanner: "Offline mode · Viewing saved history",

    pricingModalTitle: "Plans, Rewards & Account",
    pricingSubtitleGuest: "Sign in for higher limits and synced account access",
    pricingTabPlans: "Plans & Bonuses",
    pricingTabAdmin: "Orders",
    pricingSignInGoogle: "Sign in with Google",
    pricingSigningIn: "Signing in...",
    pricingSignOut: "Sign out",
    pricingFreeAdTitle: "Get free translation credits",
    pricingWatchAdBtn: "Watch Ad (+2)",
    pricingInviteTitle: "Invite friends & earn +5 credits",
    pricingInviteDesc: "You get +5 credits and your friend gets +3 credits when they join.",
    pricingCopyLink: "Copy invite link",
    pricingCopied: "Copied!",
    pricingShareTelegram: "Share on Telegram",
    pricingShareGroup: "Share to Group",
    pricingSelectPlan: "Choose a plan",
    pricingPayMethod: "Payment method",
    pricingPayNotePlaceholder: "Receipt ID, last 4 card digits, or @username...",
    pricingSubmitRequest: "Submit payment request",
    pricingPayStarsBtn: "Pay with Telegram Stars",
    pricingSupportLink: "Contact Admin (@Admiin_0571)",

    errLimitReached:
      "Daily free limit reached. Sign in with Google, watch an ad (+2), or upgrade to Pro.",
    errNoTextFound:
      "No readable text was detected in this image. Please try a clearer screenshot.",
    errDefaultTranslate: "Translation failed. Please try again.",
    errTooLarge: "Image is too large. Please upload a smaller or cropped screenshot.",
    errServerWaking: "Server is waking up, please wait a moment and tap Retry.",
    errTimeout: "Request timed out on a slow connection. Please try again.",
    errNetwork: "Connection lost. Check your internet and try again.",
  },

  tj: {
    navTranslator: "Тарҷумон",
    navHistory: "Таърих",
    navPricing: "Тарифҳо",
    navGuide: "Дастур",
    navCamera: "Камера",
    uploadScreenshot: "Боргирии скрин",
    uploadShort: "Боргирӣ",
    menuLangAria: "Забони меню",

    sourceLangAria: "Забони аслӣ",
    targetLangAria: "Забони тарҷума",
    swapLangAria: "Иваз кардани забонҳо",
    viewOverlay: "Болои расм",
    viewSplit: "Паҳлу ба паҳлу",
    viewList: "Рӯйхат",
    camera: "Камера",
    screenShare: "Мубодилаи экран",
    themeDarkAria: "Ҳолати шабона",
    themeLightAria: "Ҳолати рӯзона",
    nicheLabel: "Услуб:",
    nicheGeneral: "Умумӣ",
    nicheEcommerce: "1688 / Taobao / Trendyol",
    nicheFinance: "Бонк ва расмӣ",
    nicheTravel: "Сафар ва мену",
    proUnlimited: "Тарифи Pro · Бемаҳдуд",
    dailyLimitLabel: (r, l) => `Лимити имрӯза: ${r} / ${l}`,
    adRewardBtn: "+2 (Реклама)",
    adRewardLoading: "Бор мешавад...",
    adRewardWatchBtn: "Тамошои реклама (+2)",
    accountBtn: "Аккаунт",
    getProBtn: "Гирифтани Pro",
    signInProBtn: "Ворид / Pro",
    closeBtn: "Пӯшидан",
    retryBtn: "Аз нав кӯшиш",
    replaceBtn: "Иваз кардан",

    heroEyebrow: "120+ забон · Тарҷумаи дақиқ дар худи расм",
    heroTitle: "Ҳар гуна экрани хориҷиро дар 1 сония бо тоҷикӣ хонед",
    heroSubtitle:
      "1688, Taobao, Trendyol, чатҳои Telegram ё барномаҳои хориҷӣ — скриншот бор кунед, тугмаҳо ва нархҳо дар ҷойи худашон фаҳмо мешаванд.",
    chooseScreenshot: "Интихоби скриншот",
    heroSteps: "1. Скриншот гиред · 2. Бор кунед · 3. PNG захира кунед",
    pasteHint: "Дар компютер метавонед бо Ctrl+V низ расмро гузоред",
    compareOriginal: "Аслӣ",
    compareSplit: "Муқоиса",
    compareTranslated: "Тарҷума",
    samplesTitle: "Намунаи расмҳои тарҷумашуда ба забонҳои дигар",
    samplesSubtitle: "Ҳар намунаро пахш кунед — тарҷума дарҳол кушода мешавад",
    tabTranslated: "Тарҷума",
    tabOriginal: "Расми аслӣ",

    peekOriginal: "Аслӣ (пахш доред)",
    cropTranslate: "Бурида тарҷума кардан",
    cropDragging: "Қисми лозимаро кашед...",
    retranslate: "Аз нав тарҷума",
    savePng: "Захираи расм",
    opacityLabel: "Шаффофӣ",
    clearScreenAria: "Тоза кардани экран",
    translatedLangsLabel: "Забонҳои тарҷума:",
    originalScreenLabel: "Экрани аслӣ",
    translatedScreenLabel: "Экрани тарҷумашуда",
    translatingOverlay: "Матнҳои экран муайян ва тарҷума мешаванд...",

    detectedTextsTitle: "Матнҳои ёфтшуда",
    copyAllBtn: "Нусхаи ҳама",
    copiedBtn: "Нусха шуд",
    blocksCount: (n) => `${n} блок`,
    analyzingStatus: "Экран таҳлил мешавад...",
    inspectorEmptyHint: "Пас аз боргирии скриншот ҳамаи блокҳои матн ин ҷо намоён мешаванд.",
    inspectorCapsTitle: "Чиҳоро дақиқ тарҷума мекунад?",
    inspectorCapsSubtitle:
      "Ҳангоми боркунии скриншот ё интихоби намуна ҳамаи навиштаҷот дар ин рӯйхат низ мебарояд.",
    inspectorCap1Title: "1688, Taobao, Pinduoduo ва Trendyol",
    inspectorCap1Desc: "Нархи мол, андозаҳо, тахфиф ва тугмаҳои фармоиш.",
    inspectorCap2Title: "Мукотиба ва барномаҳои хориҷӣ",
    inspectorCap2Desc: "Паёмҳои Telegram, WhatsApp, бонкҳо ва хизматрасониҳо.",
    inspectorCap3Title: "Таҳрир, овоз ва захираи PNG",
    inspectorCap3Desc: "Ба ҳар матн пахш карда талаффузро гӯш кунед ё расмро зеркашӣ намоед.",
    selectedBlockLabel: "Блоки интихобшуда",
    originalTextLabel: "Матни аслӣ",
    editableTranslationLabel: "Тарҷума (таҳриршаванда)",
    listenBtn: "Гӯш кардан",
    copyBtn: "Нусха",
    alternativesBtn: "Вариантҳои дигар",
    alternativesLoading: "Бор мешавад...",
    alternativesHeading: "Пешниҳодҳои дигар:",
    searchPlaceholder: "Ҷустуҷӯи матн...",
    noSearchMatch: "Матни мувофиқ ёфт нашуд.",
    catAll: "Ҳама",
    catHeading: "Сарлавҳа",
    catButton: "Тугма",
    catLabel: "Нишона",
    catBody: "Матн",
    catStatus: "Ҳолат",

    historyTitle: "Таърихи тарҷума",
    historySubtitle: "Экранҳои пештар тарҷумашуда дар дастгоҳи шумо захира мешаванд.",
    historyTranslatedThumb: "Бо тарҷума",
    historyOriginalThumb: "Расми аслӣ",
    clearHistoryBtn: "Тоза кардани таърих",
    historyEmptyTitle: "Ҳанӯз экранҳои захирашуда нест",
    historyEmptyDesc: "Ҳар як скриншоти тарҷумашуда худкор дар ин ҷо захира мешавад.",
    historyOpenBtn: "Кушодан",
    historyDeleteAria: "Нест кардан аз таърих",

    guideTitle: "Чӣ тавр аз EkranTarjimon истифода барем",
    guideSubtitle:
      "Барнома тугмаҳо, мену, паёмҳо ва мақолаҳоро бо нигоҳ доштани ҷойгиршавиашон болои скриншот тарҷума мекунад.",
    guideSteps: [
      {
        num: "01",
        title: "Боргирии скриншот аз телефон",
        desc: "Дар Android ё iPhone скриншоти барномаи лозимаро гиред ва бо тугмаи «Боргирии скрин» интихоб кунед — ҳамаи тугмаву матнҳо дар ҷойи худ тарҷума мешаванд.",
      },
      {
        num: "02",
        title: "Хондани экрани дигар тавассути камера",
        desc: "Тавассути «Камера» телефони дигар, банкомат ё мониторро акс гиред. Дарҳол тамоми матн тарҷума мешавад.",
      },
      {
        num: "03",
        title: "Мубодилаи экран дар компютер",
        desc: "Дар компютер тугмаи «Мубодилаи экран»-ро пахш кунед ё скриншотро бо Ctrl+V гузоред.",
      },
      {
        num: "04",
        title: "Интихоби қисми экран ва таҳрир",
        desc: "Агар танҳо як қисми экран лозим бошад, «Бурида тарҷума кардан»-ро истифода баред. Ба ҳар блок пахш карда матнро иваз ё гӯш кардан мумкин аст.",
      },
    ],
    guideBackBtn: "Бозгашт ба тарҷумон",
    guideSupport: "Дастгирӣ: @Admiin_0571",

    captureCameraTitle: "Скан тавассути камера",
    captureScreenTitle: "Гирифтани кадр аз экран",
    captureCameraStarting: "Камера фаъол мешавад...",
    captureScreenStarting: "Экран интихоб мешавад...",
    captureCameraHint: "Камераро ба экрани дигар равона карда «Тарҷумаи кадр»-ро пахш кунед.",
    captureScreenHint: "Равзана ё саҳифаи браузерро интихоб намоед.",
    captureSwitchCamera: "Ивази камера",
    captureStreamHint: "Пас аз пайдо шудани тасвир кадр гиред",
    captureActionBtn: "Тарҷумаи кадр",
    cancelBtn: "Бекор кардан",

    langSearchPlaceholder: "Ҷустуҷӯи забон (масалан: тоҷикӣ, русӣ, англисӣ)...",
    langPopularTitle: "Забонҳои маъмул",
    langAllTitle: (n) => `Ҳамаи забонҳои ҷаҳон (${n})`,
    langNotFound: (q) => `Забони «${q}» ёфт нашуд`,

    pwaInstall: "Насби барнома",
    pwaAddHome: "Ба экран илова кардан",
    pwaIosTitle: "Насб дар iPhone / iPad",
    pwaIosStep1: "Дар поёни Safari тугмаи Share (Мубодила)-ро пахш кунед.",
    pwaIosStep2: "Поён фаромада Add to Home Screen-ро интихоб кунед.",
    pwaUnderstood: "Фаҳмо",
    offlineBanner: "Ҳолати офлайн · Таърихи захирашуда",

    pricingModalTitle: "Тарифҳо, Бонусҳо ва Аккаунт",
    pricingSubtitleGuest: "Барои лимити бештар ва захираи таърих ворид шавед",
    pricingTabPlans: "Тарифҳо ва Бонус",
    pricingTabAdmin: "Дархостҳо",
    pricingSignInGoogle: "Воридшавӣ бо Google",
    pricingSigningIn: "Ворид мешавад...",
    pricingSignOut: "Баромадан",
    pricingFreeAdTitle: "Гирифтани кредитҳои ройгон",
    pricingWatchAdBtn: "Тамошои реклама (+2)",
    pricingInviteTitle: "Дӯстонро даъват карда +5 кредит гиред",
    pricingInviteDesc: "Барои ҳар як дӯсти даъватшуда ба шумо +5 ва ба дӯстатон +3 кредит дода мешавад.",
    pricingCopyLink: "Нусхаи пайванд",
    pricingCopied: "Нусха шуд!",
    pricingShareTelegram: "Мубодила дар Telegram",
    pricingShareGroup: "Ба гурӯҳ фиристодан",
    pricingSelectPlan: "Тарифро интихоб кунед",
    pricingPayMethod: "Усули пардохт",
    pricingPayNotePlaceholder: "Рақами чек, 4 рақами охири корт ё @username...",
    pricingSubmitRequest: "Фиристодани дархост",
    pricingPayStarsBtn: "Пардохт бо Telegram Stars",
    pricingSupportLink: "Тамос бо админ (@Admiin_0571)",

    errLimitReached:
      "Лимити ройгони имрӯза тамом шуд. Барои идома бо Google ворид шавед, реклама бинед (+2) ё Pro гиред.",
    errNoTextFound:
      "Дар ин расм матни хоно ёфт нашуд. Скриншоти равшантар бор кунед.",
    errDefaultTranslate: "Ҳангоми тарҷума хатогӣ рӯй дод. Боз кӯшиш кунед.",
    errTooLarge: "Андозаи расм хеле калон аст. Скриншоти хурдтар бор кунед.",
    errServerWaking: "Сервер фаъол шуда истодааст, каме интизор шавед ва аз нав пахш кунед.",
    errTimeout: "Ба сабаби сустии интернет вақти дархост гузашт. Боз кӯшиш кунед.",
    errNetwork: "Алоқа бо сервер қатъ шуд. Интернетро санҷида боз кӯшиш кунед.",
  },
};
