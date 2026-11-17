import React from "react";

interface GuideViewProps {
  onStartTranslating: () => void;
}

export const GuideView: React.FC<GuideViewProps> = ({ onStartTranslating }) => {
  const steps = [
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
      desc: "Telefoningizni kompyuterga (scrcpy, Phone Link yoki brauzer oynasi orqali) ulagan bo'lsangiz, «Ekran ulashish» tugmasini bosing va kerakli oynadan istalgan lahzada kadr oling. Shuningdek Ctrl+V bilan nusxalangan rasmni ham joylashingiz mumkin.",
    },
    {
      num: "04",
      title: "Hududni belgilash va matnni tahrirlash",
      desc: "Agar ekranning faqat bir qismi kerak bo'lsa, «Hududni kesib tarjima» tugmasini yoqib kerakli joyni tortib belgilang. Istalgan tarjima blokini bosib uni tahrirlash, nusxalash yoki ovozli eshitish mumkin.",
    },
  ];

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      <div className="space-y-2 border-b border-slate-200 dark:border-slate-800 pb-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-balance">
          EkranTarjimondan qanday foydalaniladi
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Ilova telefon ekranidagi tugmalar, menyular, xabarlar va maqolalarning aniq joylashuvini saqlagan holda ustma-ust tarjima qiladi.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {steps.map((step) => (
          <div
            key={step.num}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#131B2B] p-6 space-y-2.5"
          >
            <span className="font-mono text-xs font-medium text-[#2563EB] dark:text-[#60A5FA]">
              {step.num}
            </span>
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              {step.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {step.desc}
            </p>
          </div>
        ))}
      </div>

      <div className="pt-2 flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={onStartTranslating}
          className="px-6 py-3 min-h-[44px] rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-sm font-semibold transition-colors cursor-pointer"
        >
          Tarjimonga qaytish
        </button>
        <a
          href="https://t.me/Admiin_0571"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-[#2563EB] dark:hover:text-[#60A5FA] transition-colors"
        >
          Qo'llab-quvvatlash: @Admiin_0571
        </a>
      </div>
    </section>
  );
};
