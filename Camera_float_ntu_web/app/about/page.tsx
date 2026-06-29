import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-3 sm:space-y-4">
        <Link href="/">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">相機漂流計劃 台大Ver.</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">發起人：台大資管二劉威廷</p>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* 發起緣由 */}
        <div className="prose prose-sm sm:prose-lg max-w-none bg-card border rounded-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">發起緣由</h2>
          <div className="text-sm sm:text-base text-muted-foreground leading-relaxed space-y-3">
            <p>
              我是一個很愛拍照的人，平時的習慣就是在台大走走拍拍。
              我某天看了參考資料的那個影片後，一直想知道他人對於世界的理解是什麼樣的。
              加上防潮箱中有台較少使用但仍頭好壯壯的單眼相機，於是想要發起這個計劃。
            </p>
          </div>
        </div>

        {/* 參加條件 */}
        <div className="prose prose-sm sm:prose-lg max-w-none bg-card border rounded-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">參加條件</h2>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            不限系所、年紀以及相機操作經驗，只要現在是台大的一員就可以。
          </p>
        </div>

        {/* 進行方式 */}
        <div className="prose prose-sm sm:prose-lg max-w-none bg-card border rounded-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">進行方式</h2>
          <div className="text-sm sm:text-base text-muted-foreground leading-relaxed space-y-3">
            <p>
              每個參加者會從禮拜一開始持有相機一周，在此期間你可以隨意地使用這台相機拍照，
              題材完全不限，想拍什麼都可以（但請自重不要犯法）。至於要不要將記憶卡中的照片調
              色與修圖，Depends on you，但請記得將成果一並放在記憶卡中。
            </p>
            <p>
              與此同時，在相機包中我會放入一本筆記本，這本筆記本會隨著相機傳給下一個參加
              者。請每個參加者可以在此筆記本中留下自己想說的話，可能是你的觀察或是心得感想
              ，想要寫什麼都可以！
            </p>
          </div>
        </div>

        {/* 交接相機的方式 */}
        <div className="prose prose-sm sm:prose-lg max-w-none bg-card border rounded-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">交接相機的方式</h2>
          <div className="text-sm sm:text-base text-muted-foreground leading-relaxed space-y-3">
            <p>
              目前的規劃是每個禮拜一的早上會當面和我與下個參加者交接相機。
              （前後兩名參加者不用同時出現，但我希望能在早上完成）
            </p>
            <p>
              我會帶一顆我的硬碟，當場讀卡並請上個持有者協助備份（因為我不想看到內容），備份
              完後再由我交給下個持有者。
            </p>
            <p>
              預計所有照片會在活動結束後上傳至網站讓所有人看。
            </p>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="prose prose-sm sm:prose-lg max-w-none bg-card border rounded-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">注意事項</h2>
          <ul className="list-disc list-inside space-y-2 text-sm sm:text-base text-muted-foreground ml-2 sm:ml-4">
            <li>請小心呵護這台相機</li>
            <li>請注意不要用丟相機，並請自行負起保管責任</li>
            <li>在挑選照片時請不要誤刪其中的內容</li>
          </ul>
        </div>

        {/* 聯絡資訊 */}
        <div className="prose prose-sm sm:prose-lg max-w-none bg-card border rounded-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">聯絡資訊</h2>
          <div className="space-y-2 text-sm sm:text-base text-muted-foreground">
            <p>
              <strong>官方IG：</strong>
              <a
                href="https://www.instagram.com/camerafloat_ntu.version/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline ml-2 inline-flex items-center gap-1 break-all"
              >
                @camerafloat_ntu.version
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </a>
            </p>
            <p>
              <strong>個人IG：</strong>
              <a
                href="https://www.instagram.com/waiting_941208/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline ml-2 inline-flex items-center gap-1 break-all"
              >
                @waiting_941208
                <ExternalLink className="h-3 w-3 flex-shrink-0" />
              </a>
            </p>
            <p>
              <strong>Gmail：</strong>
              <a
                href="mailto:b13705036@g.ntu.edu.tw"
                className="text-primary hover:underline ml-2 break-all"
              >
                b13705036@g.ntu.edu.tw
              </a>
            </p>
          </div>
        </div>

        {/* 靈感來源 */}
        <div className="prose prose-sm sm:prose-lg max-w-none bg-card border rounded-lg p-4 sm:p-6">
          <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4">靈感來源（參考資料）</h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            <a
              href="https://youtu.be/pbb1n0Y_ERQ?si=046y-pJZOJ26qDps"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline inline-flex items-center gap-1 break-all"
            >
              YouTube 影片連結
              <ExternalLink className="h-3 w-3 flex-shrink-0" />
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

