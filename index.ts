import { chromium } from "playwright";

const URL =
  "https://cloak.pia.jp/resale/item/list?areaCd=21%2C22%2C23%2C24&prefectureCd=23&hideprefectures=01&perfFromDate=2025%2F02%2F15&perfToDate=2025%2F02%2F15&numSht=&priceFrom=&priceTo=&eventCd=2430763%2C2430765%2C2430766%2C2430767%2C2430768%2C2430769%2C2430770%2C2430771&perfCd=&rlsCd=&lotRlsCd=&eventPerfCdList=&stkStkndCd=&stkCliCd=&invalidCondition=&preAreaCd=&prePrefectureCd=&totalCount=97&beforeSearchCondition=%7B%22event_cd%22%3A%222430763%2C2430765%2C2430766%2C2430767%2C2430768%2C2430769%2C2430770%2C2430771%22%2C%22acpt_cli_cd%22%3A%5B%22ATM043%22%2C%22ATM053%22%2C%22ATM003%22%2C%22ATM013%22%2C%22ATM023%22%2C%22ATM033%22%2C%22ATM063%22%2C%22ATM073%22%5D%2C%22sort_condition%22%3A%22entry_date_time%2Cdesc%22%2C%22page%22%3A1%7D&ma_token=96r4j5mxIQ6JnHd&sortCondition=entry_date_time%2Cdesc&sortCondition-sp=entry_date_time%2Cdesc";

const main = async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ locale: "ja-JP" });
  const page = await context.newPage();

  await page.goto(URL);

  const ticketPriceDetails = await page.$$(".sl_ticketPriceDetail_name");
  for (const detail of ticketPriceDetails) {
    const text = await detail.textContent();
    const seat = text?.replace("全席指定", "");
    const seats = [];
    if (seat) {
      if (seat.startsWith("C")) {
        console.log(seat);
        seats.push(seat);
      } else {
        console.log("not C:", seat);
      }
    }
    if (seats.length > 0) {
      const res = await fetch(process.env.WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: `${seats.join(", ")}が空いています`,
        }),
      });
      console.log(await res.text());
    }
  }

  await browser.close();
};

main();
