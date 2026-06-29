import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "關於計劃",
  description:
    "相機漂流計劃 台大Ver. — 一個讓相機在台大校園中流傳的共享計劃。發起緣由、參加條件、進行方式與聯絡資訊。",
};

type Section = {
  label: string;
  body: () => React.ReactNode;
};

const contacts: { label: string; value: string; href: string }[] = [
  {
    label: "官方 IG",
    value: "@camerafloat_ntu.version",
    href: "https://www.instagram.com/camerafloat_ntu.version/",
  },
  {
    label: "個人 IG",
    value: "@waiting_941208",
    href: "https://www.instagram.com/waiting_941208/",
  },
  {
    label: "Gmail",
    value: "b13705036@g.ntu.edu.tw",
    href: "mailto:b13705036@g.ntu.edu.tw",
  },
];

const notes = [
  "請小心呵護這台相機",
  "請注意不要用丟相機，並請自行負起保管責任",
  "在挑選照片時請不要誤刪其中的內容",
];

export default function AboutPage() {
  const sections: Section[] = [
    {
      label: "發起緣由",
      body: () => (
        <p className="max-w-[560px] text-sm leading-[1.85] text-muted-foreground">
          我是一個很愛拍照的人，平時的習慣就是在台大走走拍拍。我某天看了參考資料的那個影片後，一直想知道他人對於世界的理解是什麼樣的。加上防潮箱中有台較少使用但仍頭好壯壯的單眼相機，於是想要發起這個計劃。
        </p>
      ),
    },
    {
      label: "參加條件",
      body: () => (
        <p className="max-w-[560px] text-sm leading-[1.85] text-muted-foreground">
          不限系所、年紀以及相機操作經驗，只要現在是台大的一員就可以。
        </p>
      ),
    },
    {
      label: "進行方式",
      body: () => (
        <div className="max-w-[560px] space-y-4">
          <p className="text-sm leading-[1.85] text-muted-foreground">
            每個參加者會從禮拜一開始持有相機一周，在此期間你可以隨意地使用這台相機拍照，題材完全不限，想拍什麼都可以（但請自重不要犯法）。至於要不要將記憶卡中的照片調色與修圖，Depends on you，但請記得將成果一並放在記憶卡中。
          </p>
          <p className="text-sm leading-[1.85] text-muted-foreground">
            與此同時，在相機包中我會放入一本筆記本，這本筆記本會隨著相機傳給下一個參加者。請每個參加者可以在此筆記本中留下自己想說的話，可能是你的觀察或是心得感想，想要寫什麼都可以！
          </p>
        </div>
      ),
    },
    {
      label: "交接相機的方式",
      body: () => (
        <div className="max-w-[560px] space-y-4">
          <p className="text-sm leading-[1.85] text-muted-foreground">
            目前的規劃是每個禮拜一的早上會當面和我與下個參加者交接相機。（前後兩名參加者不用同時出現，但我希望能在早上完成）
          </p>
          <p className="text-sm leading-[1.85] text-muted-foreground">
            我會帶一顆我的硬碟，當場讀卡並請上個持有者協助備份（因為我不想看到內容），備份完後再由我交給下個持有者。
          </p>
          <p className="text-sm leading-[1.85] text-muted-foreground">
            預計所有照片會在活動結束後上傳至網站讓所有人看。
          </p>
        </div>
      ),
    },
    {
      label: "注意事項",
      body: () => (
        <ul className="flex max-w-[560px] flex-col gap-2 border-l border-border pl-3 list-none">
          {notes.map((note) => (
            <li
              key={note}
              className="pl-3 text-sm leading-[1.7] text-muted-foreground"
            >
              {note}
            </li>
          ))}
        </ul>
      ),
    },
    {
      label: "聯絡資訊",
      body: () => (
        <ul className="flex max-w-[560px] flex-col gap-2 border-l border-border pl-3 list-none">
          {contacts.map((c) => (
            <li
              key={c.label}
              className="pl-3 text-sm leading-[1.7] text-muted-foreground"
            >
              <span className="text-foreground">{c.label}：</span>
              <a
                href={c.href}
                target={c.href.startsWith("mailto") ? undefined : "_blank"}
                rel={c.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                className="break-all text-foreground border-b border-foreground/40 hover:border-foreground transition-colors"
              >
                {c.value}
                {!c.href.startsWith("mailto") && " ↗"}
              </a>
            </li>
          ))}
        </ul>
      ),
    },
    {
      label: "靈感來源",
      body: () => (
        <p className="max-w-[560px] text-sm leading-[1.85] text-muted-foreground">
          <a
            href="https://youtu.be/pbb1n0Y_ERQ?si=046y-pJZOJ26qDps"
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-foreground border-b border-foreground/40 hover:border-foreground transition-colors"
          >
            YouTube 影片連結 ↗
          </a>
        </p>
      ),
    },
  ];

  return (
    <>
      <section className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 pb-12">
        <div className="tracking-[0.2em] uppercase text-xs font-medium text-muted-foreground mb-4">
          相機漂流計劃 台大Ver.
        </div>
        <h1 className="text-[40px] sm:text-[48px] font-bold leading-[1.05] tracking-[-0.025em] text-foreground">
          關於計劃
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          發起人：台大資管二 劉威廷
        </p>
      </section>

      {sections.map((section, i) => {
        const num = String(i).padStart(2, "0");
        return (
          <section
            key={section.label}
            className="max-w-3xl mx-auto px-6 sm:px-8 lg:px-12 pb-12"
          >
            <div className="flex items-baseline mb-6 pb-3 gap-3 border-b border-border">
              <span className="text-xs font-light text-muted-foreground/70 tabular-nums">
                {num}
              </span>
              <span className="tracking-[0.18em] uppercase text-xs font-semibold text-muted-foreground">
                {section.label}
              </span>
            </div>
            {section.body()}
          </section>
        );
      })}

      <div className="pb-24" />
    </>
  );
}
