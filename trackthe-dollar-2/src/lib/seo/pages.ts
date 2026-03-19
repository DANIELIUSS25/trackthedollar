export type MetricKey = "debt" | "inflation" | "rates" | "dollar" | "m2" | "gas" | "none";
export type PageCategory = "debt" | "fed" | "inflation" | "dollar" | "rates" | "money" | "spending" | "economy";

export interface FAQ {
  q: string;
  a: string;
}

export interface SEOPage {
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string; // 2-3 sentences, keyword-rich
  body: string;  // 1-2 paragraphs of supporting content
  metric: MetricKey;
  category: PageCategory;
  faqs: FAQ[];
  relatedSlugs: string[];
  keywords: string[];
}

// ─── NATIONAL DEBT ──────────────────────────────────────────────────────────

const debtPages: SEOPage[] = [
  {
    slug: "national-debt-clock",
    title: "U.S. National Debt Clock — Live Real-Time Counter 2026",
    description: "The U.S. national debt clock is ticking past $39 trillion in real time. Watch every dollar added to the national debt live, sourced directly from U.S. Treasury Fiscal Data.",
    h1: "U.S. National Debt Clock",
    intro: "The U.S. national debt clock tracks every dollar of federal debt in real time — currently surpassing $39 trillion and rising by approximately $24 billion per day. TrackTheDollar.com is the most accurate live national debt tracker, pulling data directly from the U.S. Treasury's Fiscal Data API.",
    body: "The national debt clock represents the total outstanding public debt of the United States federal government. It includes debt held by the public (Treasury bills, notes, bonds, and TIPS) as well as intragovernmental debt held in trust funds like Social Security. The U.S. first crossed the $1 trillion mark in 1981, $10 trillion in 2008, $20 trillion in 2017, and $30 trillion in 2022. At the current trajectory, the debt will reach $40 trillion in 2026.",
    metric: "debt",
    category: "debt",
    keywords: ["national debt clock", "us debt clock", "live debt counter", "real time national debt", "national debt ticker", "debt clock 2026"],
    faqs: [
      { q: "How fast is the national debt growing?", a: "The U.S. national debt grows by approximately $24 billion per day, or roughly $1 million per minute. The exact rate depends on daily Treasury borrowing, tax receipts, and government expenditures." },
      { q: "What is the current U.S. national debt?", a: "The U.S. national debt currently exceeds $39 trillion and is rising in real time. You can track the exact live figure at the top of this page, sourced from the U.S. Treasury's Fiscal Data API." },
      { q: "Who does the U.S. owe money to?", a: "About 77% of U.S. debt is held by the public — including foreign governments, the Federal Reserve, mutual funds, and individual investors. The remaining 23% is intragovernmental debt held in government trust funds like Social Security." },
      { q: "Will the national debt ever be paid off?", a: "Most economists consider full repayment of the national debt unlikely. Instead, the goal is to keep debt sustainable relative to GDP. The U.S. debt-to-GDP ratio currently exceeds 120%, which is historically elevated." },
      { q: "How much is the national debt per person?", a: "With a U.S. population of approximately 336 million, the national debt amounts to roughly $116,000 per citizen, or over $240,000 per taxpayer." },
    ],
    relatedSlugs: ["current-national-debt", "national-debt-per-capita", "national-debt-to-gdp", "who-owns-the-us-debt", "debt-ceiling", "national-debt-interest-payments"],
  },
  {
    slug: "current-national-debt",
    title: "Current U.S. National Debt 2026 — Live Figure",
    description: "What is the current U.S. national debt? As of 2026, the national debt has surpassed $39 trillion. Track the live, up-to-the-minute total from official Treasury data.",
    h1: "Current U.S. National Debt",
    intro: "The current U.S. national debt stands above $39 trillion as of 2026, marking a historic high. Updated daily from the U.S. Treasury Department's Fiscal Data portal, TrackTheDollar.com shows you the exact live figure with second-by-second interpolation.",
    body: "The current national debt is the sum of all outstanding borrowing by the U.S. federal government since its founding. It is broken into two components: debt held by the public ($26+ trillion) and intragovernmental holdings ($7+ trillion). The public debt includes Treasury securities purchased by investors worldwide, including the Federal Reserve's portfolio of $4+ trillion accumulated through quantitative easing programs.",
    metric: "debt",
    category: "debt",
    keywords: ["current national debt", "current us debt", "national debt today", "how much is the national debt", "us debt 2026", "national debt figure"],
    faqs: [
      { q: "What is the current U.S. national debt in 2026?", a: "The current U.S. national debt exceeds $39 trillion in 2026. It is updated daily on TrackTheDollar.com from the U.S. Treasury's Fiscal Data API." },
      { q: "How has the national debt changed recently?", a: "The national debt has grown significantly in recent years, driven by COVID-19 stimulus spending, ongoing deficit spending, and rising interest payments on existing debt." },
      { q: "What is the difference between the deficit and the debt?", a: "The deficit is the annual shortfall between government spending and tax revenues. The debt is the accumulated total of all past deficits minus any surpluses. A deficit adds to the debt; a surplus would reduce it." },
    ],
    relatedSlugs: ["national-debt-clock", "national-debt-per-capita", "national-debt-by-year", "national-debt-to-gdp"],
  },
  {
    slug: "national-debt-per-capita",
    title: "U.S. National Debt Per Capita — Per Person & Per Taxpayer 2026",
    description: "The U.S. national debt per capita exceeds $116,000 per citizen and $240,000 per taxpayer in 2026. See the live breakdown of what every American owes on the federal debt.",
    h1: "U.S. National Debt Per Capita",
    intro: "The U.S. national debt per capita — the share of federal debt assigned to every American — exceeds $116,000 per citizen in 2026. On a per-taxpayer basis, this figure rises to over $240,000. These numbers update in real time as the debt clock ticks upward.",
    body: "National debt per capita is calculated by dividing the total outstanding federal debt by the U.S. population (approximately 336 million). While this metric is often used to illustrate the scale of the debt, it's important to note that the debt is not literally owed by individual citizens — it represents obligations of the federal government. However, these obligations ultimately affect future taxpayers through higher taxes, reduced government services, or inflation.",
    metric: "debt",
    category: "debt",
    keywords: ["national debt per capita", "national debt per person", "national debt per taxpayer", "us debt per citizen", "how much does each american owe"],
    faqs: [
      { q: "How much is the national debt per person in 2026?", a: "Each American's share of the national debt is approximately $116,000 in 2026, based on a total debt of $39+ trillion and a U.S. population of ~336 million." },
      { q: "How much is the national debt per taxpayer?", a: "On a per-taxpayer basis (approximately 160 million taxpayers), the national debt equals roughly $240,000 per taxpayer." },
      { q: "Does every American owe this money?", a: "No — individuals are not personally liable for the national debt. However, the debt affects all Americans indirectly through government services, tax policy, and inflation." },
    ],
    relatedSlugs: ["national-debt-clock", "current-national-debt", "national-debt-to-gdp", "national-debt-interest-payments"],
  },
  {
    slug: "national-debt-to-gdp",
    title: "U.S. National Debt to GDP Ratio 2026 — Live Tracker",
    description: "The U.S. debt-to-GDP ratio exceeds 120% in 2026 — one of the highest in U.S. history. Track the live ratio of national debt relative to gross domestic product.",
    h1: "U.S. Debt-to-GDP Ratio",
    intro: "The U.S. debt-to-GDP ratio — the national debt measured as a percentage of the total economy — has surpassed 120% in 2026. This is one of the highest readings in American history, exceeded only briefly during World War II. Economists watch this ratio closely as a measure of fiscal sustainability.",
    body: "A debt-to-GDP ratio above 100% means the country owes more than it produces in an entire year. While some economists argue that a high ratio is sustainable for a reserve currency nation like the U.S., others warn that ratios above 90-100% can slow economic growth and raise borrowing costs. The U.S. ratio was just 35% in 2000 and 60% before the 2008 financial crisis.",
    metric: "debt",
    category: "debt",
    keywords: ["debt to gdp ratio", "us debt to gdp", "national debt gdp ratio", "debt gdp 2026", "us debt percentage gdp"],
    faqs: [
      { q: "What is the U.S. debt-to-GDP ratio in 2026?", a: "The U.S. debt-to-GDP ratio exceeds 120% in 2026, meaning the total federal debt is greater than the entire annual economic output of the United States." },
      { q: "What is a dangerous debt-to-GDP ratio?", a: "Many economists consider ratios above 90-100% to be a concern, as research suggests high debt ratios correlate with slower economic growth. However, the U.S. benefits from issuing the world's reserve currency, which provides additional borrowing capacity." },
      { q: "Which country has the highest debt-to-GDP ratio?", a: "Japan has the highest debt-to-GDP ratio among major economies at over 250%. The U.S. at ~120% is among the highest for a large Western economy." },
    ],
    relatedSlugs: ["current-national-debt", "national-debt-clock", "us-gdp", "federal-budget-deficit"],
  },
  {
    slug: "who-owns-the-us-debt",
    title: "Who Owns the U.S. National Debt? 2026 Breakdown",
    description: "Who owns the U.S. national debt? Foreign governments hold $7+ trillion, the Federal Reserve holds $4+ trillion, and the rest is owned by domestic investors. Full 2026 breakdown.",
    h1: "Who Owns the U.S. National Debt?",
    intro: "The U.S. national debt of $39+ trillion is held by a diverse range of creditors — from foreign governments and the Federal Reserve to American households and pension funds. Understanding who owns the debt clarifies who America actually owes money to.",
    body: "The largest holders of U.S. debt include: intragovernmental holdings (Social Security trust funds, ~$7T), the Federal Reserve (~$4T from QE programs), foreign and international investors (~$7.8T, with Japan and China as the top holders), and domestic investors including mutual funds, banks, insurance companies, and state/local governments (~$10T+). Contrary to popular belief, China is the second-largest foreign holder, not the largest — Japan holds more.",
    metric: "debt",
    category: "debt",
    keywords: ["who owns the us debt", "who holds us debt", "us debt holders", "china us debt", "japan us debt", "foreign holders us debt", "federal reserve holds debt"],
    faqs: [
      { q: "Does China own most of the U.S. debt?", a: "No. China is the second-largest foreign holder of U.S. debt at approximately $800 billion, behind Japan at ~$1.1 trillion. However, foreign governments as a whole hold about $7.8 trillion of U.S. debt." },
      { q: "Does the Federal Reserve own U.S. debt?", a: "Yes. The Federal Reserve holds approximately $4 trillion in U.S. Treasury securities, accumulated through quantitative easing (QE) programs in 2008-2009, 2020-2021, and subsequent years. It is now reducing this portfolio through quantitative tightening (QT)." },
      { q: "What happens if a foreign country sells U.S. debt?", a: "If a major holder like China or Japan rapidly sold U.S. Treasuries, it could push up U.S. interest rates and weaken the dollar. However, large-scale selling would also hurt the seller by depressing the value of their remaining holdings." },
    ],
    relatedSlugs: ["national-debt-clock", "federal-reserve-balance-sheet", "national-debt-to-gdp", "quantitative-easing"],
  },
  {
    slug: "debt-ceiling",
    title: "U.S. Debt Ceiling — What It Is & Current Status 2026",
    description: "The U.S. debt ceiling is the legal limit on how much the federal government can borrow. Learn what it is, its history, and how debt ceiling crises affect markets.",
    h1: "U.S. Debt Ceiling",
    intro: "The U.S. debt ceiling is a statutory limit set by Congress on the total amount of money the federal government is authorized to borrow. When the debt approaches this limit, Congress must vote to raise or suspend it — or risk a government default. The debt ceiling has been raised or suspended over 100 times since it was established in 1917.",
    body: "The debt ceiling debate is one of Washington's most recurring political flashpoints. When the Treasury exhausts its borrowing authority, it employs 'extraordinary measures' — accounting maneuvers that temporarily delay a breach. If those measures run out without a congressional resolution, the U.S. could technically default on its obligations for the first time in history, which would be catastrophic for global financial markets.",
    metric: "debt",
    category: "debt",
    keywords: ["debt ceiling", "us debt ceiling", "debt ceiling 2026", "debt ceiling crisis", "debt ceiling limit", "debt ceiling suspension", "treasury extraordinary measures"],
    faqs: [
      { q: "What is the current debt ceiling?", a: "The U.S. debt ceiling has been suspended and raised multiple times in recent years. When suspended, the Treasury can borrow freely; when reinstated, it reverts to the actual debt level at the end of the suspension period plus some adjustment." },
      { q: "What happens if the U.S. hits the debt ceiling?", a: "If Congress does not raise or suspend the debt ceiling, the Treasury will eventually be unable to pay all its obligations. This could trigger a default on U.S. Treasury bonds, causing interest rates to spike and financial markets to plunge." },
      { q: "How many times has the debt ceiling been raised?", a: "Since 1960, Congress has acted 78 separate times to permanently raise, temporarily extend, or revise the definition of the debt limit. It has never been allowed to cause a formal default." },
    ],
    relatedSlugs: ["current-national-debt", "national-debt-clock", "federal-budget-deficit", "national-debt-interest-payments"],
  },
  {
    slug: "national-debt-interest-payments",
    title: "U.S. National Debt Interest Payments 2026 — $1 Trillion+",
    description: "Annual interest payments on the U.S. national debt have crossed $1 trillion — now the single largest line item in the federal budget. Track live interest expense data.",
    h1: "U.S. National Debt Interest Payments",
    intro: "Annual interest payments on the U.S. national debt have surpassed $1 trillion, making interest expense the single largest line item in the federal budget — exceeding defense spending, Medicare, and Social Security individually. This milestone reflects both the scale of the debt and the impact of higher interest rates since 2022.",
    body: "When the Federal Reserve raised interest rates from near zero to over 5% between 2022-2024, the cost of servicing the national debt exploded. As older low-rate debt matures and is refinanced at higher rates, the interest burden increases. By 2034, the Congressional Budget Office (CBO) projects interest payments could reach $1.7 trillion annually, consuming an ever-larger share of federal revenue.",
    metric: "debt",
    category: "debt",
    keywords: ["national debt interest payments", "interest on national debt", "us debt interest cost", "trillion dollar interest payment", "federal interest expense"],
    faqs: [
      { q: "How much does the U.S. pay in interest on the national debt?", a: "Annual interest payments on the U.S. national debt exceeded $1 trillion in fiscal year 2024, more than the entire defense budget. This figure continues to rise as higher-rate debt replaces maturing low-rate bonds." },
      { q: "What percentage of the budget is interest payments?", a: "Interest payments now account for approximately 15-18% of total federal spending and about 3.3% of GDP — ratios not seen since the early 1990s." },
      { q: "Could interest payments crowd out other spending?", a: "Yes. As interest payments grow, they consume a larger share of the budget, leaving less room for defense, social programs, and infrastructure — a phenomenon economists call 'crowding out'." },
    ],
    relatedSlugs: ["current-national-debt", "federal-reserve-interest-rates", "federal-budget-deficit", "national-debt-clock"],
  },
  {
    slug: "national-debt-by-year",
    title: "U.S. National Debt by Year — Historical Chart 1940–2026",
    description: "Track the growth of the U.S. national debt by year from 1940 to 2026. See how the debt grew under each administration and identify key inflection points.",
    h1: "U.S. National Debt by Year",
    intro: "The U.S. national debt has grown from $43 billion in 1940 to over $39 trillion today — a 900x increase over 85 years. Tracking the debt by year reveals the impact of wars, recessions, tax cuts, and stimulus programs on America's fiscal trajectory.",
    body: "Key milestones: $1 trillion (1981, under Reagan), $5 trillion (1996), $10 trillion (2008, after the financial crisis), $20 trillion (2017), $30 trillion (2022), and $39 trillion (2026). The steepest increases occurred during WWII, the 2008 financial crisis, and the COVID-19 pandemic. As a percentage of GDP, the debt peaked at 118% during WWII, fell to 31% in 1981, and has since risen to over 120% today.",
    metric: "debt",
    category: "debt",
    keywords: ["national debt by year", "national debt history", "us debt history chart", "national debt growth", "debt timeline", "debt milestones"],
    faqs: [
      { q: "When did the national debt first hit $1 trillion?", a: "The U.S. national debt first crossed $1 trillion in October 1981, during the Reagan administration — a milestone that took nearly 200 years to reach." },
      { q: "When did the national debt hit $30 trillion?", a: "The U.S. national debt crossed $30 trillion in February 2022, accelerated by COVID-19 pandemic stimulus spending." },
      { q: "Which president added the most to the national debt?", a: "In absolute dollar terms, recent presidents have added the most due to the larger base: Obama added ~$8.6T, Trump added ~$8.2T, and Biden added $7T+. As a percentage increase, FDR holds the record due to WWII spending." },
    ],
    relatedSlugs: ["national-debt-clock", "current-national-debt", "national-debt-by-president", "national-debt-to-gdp"],
  },
  {
    slug: "national-debt-by-president",
    title: "National Debt by President — How Much Each President Added",
    description: "How much did each U.S. president add to the national debt? From FDR to Biden, see the debt increases in dollars and percentages under every administration.",
    h1: "National Debt by President",
    intro: "Every U.S. president has added to the national debt since Calvin Coolidge. Some increased it by trillions in absolute terms; others by smaller amounts but larger percentages. Understanding the debt by president requires looking at both absolute dollar increases and percentage changes relative to the starting debt.",
    body: "In percentage terms, FDR increased the debt the most (1,048% due to WWII). In absolute dollar terms, recent presidents dominate: Barack Obama (+$8.6T), Donald Trump (+$8.2T over one term, driven by COVID), Joe Biden (+$7T+). Ronald Reagan tripled the debt during the 1980s. Important context: presidents don't control spending alone — Congress passes the budget, and crises like wars and recessions often force large expenditures regardless of political preference.",
    metric: "debt",
    category: "debt",
    keywords: ["national debt by president", "which president added most to debt", "presidential debt increase", "obama debt", "trump debt", "biden debt", "reagan debt"],
    faqs: [
      { q: "Which president increased the debt the most in dollar terms?", a: "Barack Obama added approximately $8.6 trillion to the national debt — the most in absolute dollar terms — driven primarily by the 2008 financial crisis response and subsequent recovery spending." },
      { q: "Which president increased the debt the least?", a: "In modern history, Bill Clinton came closest to a balanced budget, running surpluses from 1998-2001 — the only surpluses in the past 50 years. However, the total debt still grew during his presidency due to Social Security trust fund borrowing." },
      { q: "Did Trump or Biden add more to the debt?", a: "Trump added approximately $8.2 trillion in one term (including ~$4T in COVID relief), while Biden added $7T+ in one term. Both represent historically large increases driven by crisis spending and rising interest costs." },
    ],
    relatedSlugs: ["national-debt-by-year", "national-debt-clock", "federal-budget-deficit", "current-national-debt"],
  },
  {
    slug: "federal-budget-deficit",
    title: "U.S. Federal Budget Deficit 2026 — Live Tracker",
    description: "The U.S. federal budget deficit in 2026 is projected at $2+ trillion. Track the annual shortfall between government spending and tax revenues live.",
    h1: "U.S. Federal Budget Deficit",
    intro: "The U.S. federal budget deficit — the annual gap between what the government spends and what it collects in taxes — is projected to exceed $2 trillion in fiscal year 2026. Every dollar of deficit adds to the national debt. The U.S. has run deficits in 47 of the last 50 years.",
    body: "The deficit is driven by three main forces: mandatory spending (Social Security, Medicare, Medicaid), discretionary spending (defense, education, infrastructure), and interest payments on the existing debt. The last time the U.S. ran a budget surplus was 2001. Since then, deficits have widened significantly, particularly during the 2008 financial crisis ($1.4T), COVID-19 pandemic ($3.1T in 2020), and the current period of elevated interest costs.",
    metric: "debt",
    category: "debt",
    keywords: ["federal budget deficit", "us budget deficit 2026", "annual deficit", "government deficit spending", "deficit vs debt", "fiscal deficit"],
    faqs: [
      { q: "What is the 2026 federal budget deficit?", a: "The Congressional Budget Office projects the fiscal year 2026 deficit will exceed $2 trillion, reflecting mandatory spending growth, high interest payments, and a persistent gap between revenues and outlays." },
      { q: "What's the difference between the deficit and the debt?", a: "The deficit is this year's shortfall — spending minus revenues. The debt is the accumulated total of all past deficits. A $2T deficit in 2026 adds $2T to the ~$39T total debt." },
      { q: "Has the U.S. ever had a budget surplus?", a: "Yes. The U.S. ran budget surpluses from 1998-2001 during the Clinton administration, driven by strong economic growth (the dot-com boom) and fiscal discipline after the 1997 Balanced Budget Act." },
    ],
    relatedSlugs: ["current-national-debt", "national-debt-clock", "us-government-spending", "national-debt-interest-payments"],
  },
];

// ─── FEDERAL RESERVE ─────────────────────────────────────────────────────────

const fedPages: SEOPage[] = [
  {
    slug: "federal-reserve-balance-sheet",
    title: "Federal Reserve Balance Sheet 2026 — Live Tracker",
    description: "The Federal Reserve balance sheet peaked at $9 trillion and is being reduced through quantitative tightening. Track the live size of the Fed's asset holdings.",
    h1: "Federal Reserve Balance Sheet",
    intro: "The Federal Reserve balance sheet — the total assets held by the Fed — peaked at approximately $9 trillion in April 2022 and has since been reduced to around $7 trillion through quantitative tightening (QT). The balance sheet primarily consists of U.S. Treasury securities and mortgage-backed securities (MBS) acquired during QE programs.",
    body: "The Fed's balance sheet grew from under $1 trillion before the 2008 financial crisis to $4.5T by 2015 (QE1-3), then to $9T by 2022 (COVID QE). Under QT, the Fed is allowing up to $60B in Treasuries and $35B in MBS to roll off monthly. The size of the Fed balance sheet is considered a key measure of monetary policy accommodation — a larger balance sheet tends to suppress interest rates and support asset prices.",
    metric: "m2",
    category: "fed",
    keywords: ["federal reserve balance sheet", "fed balance sheet", "fed assets", "quantitative tightening", "fed qe", "fed qt 2026"],
    faqs: [
      { q: "What is the Federal Reserve balance sheet?", a: "The Fed balance sheet is the list of assets (primarily U.S. Treasuries and mortgage-backed securities) and liabilities (primarily bank reserves and currency in circulation) of the Federal Reserve System." },
      { q: "How large is the Fed balance sheet in 2026?", a: "After peaking at ~$9 trillion in 2022, the Fed balance sheet has been reduced to approximately $7 trillion through quantitative tightening (QT)." },
      { q: "What is quantitative tightening (QT)?", a: "QT is the process of reducing the Fed's balance sheet by allowing maturing securities to roll off without reinvestment. The Fed is currently running QT at a pace of up to $95B/month (combined Treasuries + MBS)." },
    ],
    relatedSlugs: ["quantitative-easing", "federal-reserve-interest-rates", "who-owns-the-us-debt", "m2-money-supply"],
  },
  {
    slug: "federal-reserve-interest-rates",
    title: "Federal Reserve Interest Rates 2026 — Current Fed Funds Rate",
    description: "What is the current Federal Reserve interest rate? Track the Fed funds rate live, including the target range, recent changes, and historical rate chart.",
    h1: "Federal Reserve Interest Rates",
    intro: "The Federal Reserve's federal funds rate is the benchmark interest rate that influences borrowing costs across the entire U.S. economy — from mortgages to credit cards to business loans. After aggressively hiking rates from near-zero to over 5% in 2022-2023 to combat inflation, the Fed has begun an easing cycle, with the current rate tracked live on this page.",
    body: "The federal funds rate is the rate at which banks lend reserve balances to each other overnight. The Fed's Federal Open Market Committee (FOMC) meets 8 times per year to set the target rate range. Rate decisions ripple through the economy: higher rates slow inflation but also slow growth; lower rates stimulate the economy but can fuel inflation. The Fed's dual mandate is to achieve maximum employment and stable prices (targeting 2% inflation).",
    metric: "rates",
    category: "fed",
    keywords: ["federal reserve interest rates", "fed funds rate", "current fed rate", "federal reserve rate 2026", "fed rate decision", "fomc rate"],
    faqs: [
      { q: "What is the current Federal Reserve interest rate?", a: "The current federal funds target rate is shown live on this page, sourced from the Federal Reserve's H.15 release data. The rate is updated after each FOMC meeting." },
      { q: "How does the Fed rate affect mortgages?", a: "While the Fed doesn't directly set mortgage rates, changes in the fed funds rate influence the 10-year Treasury yield, which closely tracks 30-year mortgage rates. Rate hikes typically push mortgage rates higher." },
      { q: "When is the next Fed meeting?", a: "The FOMC meets 8 times per year, approximately every 6 weeks. You can check the Federal Reserve's official calendar for scheduled meeting dates and planned rate announcements." },
    ],
    relatedSlugs: ["fed-funds-rate-history", "10-year-treasury-rate", "inflation-rate", "federal-reserve-balance-sheet"],
  },
  {
    slug: "fed-funds-rate-history",
    title: "Fed Funds Rate History 1954–2026 — Historical Chart",
    description: "Track the complete history of the federal funds rate from 1954 to 2026. See how the Fed has used interest rates to fight inflation, stimulate growth, and respond to crises.",
    h1: "Fed Funds Rate History",
    intro: "The federal funds rate has ranged from nearly 20% in 1981 (when Paul Volcker broke the back of inflation) to 0-0.25% in the aftermath of the 2008 and 2020 crises. Understanding this history reveals how the Fed uses monetary policy as its primary tool for managing the economy.",
    body: "Key historical moments: The rate hit 20% in June 1981 as Volcker aggressively fought double-digit inflation. It was cut to 1% after the dot-com bust (2001-2004), contributing to the housing bubble. After 2008, rates sat near zero for 7 years (ZIRP). COVID brought another zero-rate period in 2020-2022, before the most aggressive tightening cycle since Volcker: 525 basis points of hikes in just 14 months (2022-2023).",
    metric: "rates",
    category: "fed",
    keywords: ["fed funds rate history", "federal funds rate chart", "interest rate history", "fed rate historical data", "volcker rate 1981"],
    faqs: [
      { q: "What was the highest the fed funds rate has ever been?", a: "The federal funds rate peaked at 20% in June 1981 under Fed Chair Paul Volcker, who was determined to break inflation that had reached 14% in 1980." },
      { q: "How long did zero interest rates last?", a: "Near-zero rates (0-0.25%) were maintained for approximately 7 years after the 2008 crisis (2008-2015), and again from March 2020 to March 2022 during COVID." },
      { q: "How fast did the Fed raise rates in 2022-2023?", a: "The Fed raised rates by 525 basis points (5.25 percentage points) over 14 months — from 0-0.25% in March 2022 to 5.25-5.50% by July 2023 — the fastest tightening cycle since Volcker." },
    ],
    relatedSlugs: ["federal-reserve-interest-rates", "inflation-rate-history", "quantitative-easing", "10-year-treasury-rate"],
  },
  {
    slug: "quantitative-easing",
    title: "What Is Quantitative Easing (QE)? — How the Fed Creates Money",
    description: "Quantitative easing (QE) is how the Federal Reserve creates new money to buy Treasury bonds and MBS. Learn how QE works, its effects on inflation, and why the Fed is now doing QT.",
    h1: "Quantitative Easing (QE) Explained",
    intro: "Quantitative easing (QE) is an unconventional monetary policy tool in which the Federal Reserve purchases large quantities of government securities and other assets to inject money into the economy, lower long-term interest rates, and stimulate economic activity. The Fed has used QE three times since 2008, expanding its balance sheet to $9 trillion.",
    body: "In QE, the Fed creates new bank reserves (effectively 'printing money') and uses them to purchase Treasuries and MBS from banks and other investors. This pushes bond prices up (and yields down), making borrowing cheaper across the economy. Critics argue QE inflates asset prices and contributes to wealth inequality; proponents argue it prevented deeper recessions. The reverse process — quantitative tightening (QT) — involves shrinking the balance sheet by letting securities mature without reinvestment.",
    metric: "m2",
    category: "fed",
    keywords: ["quantitative easing", "what is qe", "federal reserve money printing", "qe explained", "quantitative tightening", "fed asset purchases"],
    faqs: [
      { q: "What is quantitative easing?", a: "Quantitative easing (QE) is when the Federal Reserve purchases securities (primarily U.S. Treasuries and mortgage-backed securities) to inject liquidity into the financial system, lower long-term interest rates, and stimulate economic growth." },
      { q: "Is QE the same as 'money printing'?", a: "Not exactly. QE creates bank reserves, not physical currency. Banks receive new reserves when they sell bonds to the Fed. This money doesn't automatically enter the broader economy unless banks lend it out. However, large-scale QE can contribute to asset price inflation and eventually consumer inflation." },
      { q: "What is quantitative tightening (QT)?", a: "QT is the opposite of QE — the Fed allows maturing bonds to roll off its balance sheet without replacement, reducing bank reserves and tightening financial conditions." },
    ],
    relatedSlugs: ["federal-reserve-balance-sheet", "m2-money-supply", "inflation-rate", "federal-reserve-interest-rates"],
  },
];

// ─── INFLATION ───────────────────────────────────────────────────────────────

const inflationPages: SEOPage[] = [
  {
    slug: "current-inflation-rate",
    title: "Current U.S. Inflation Rate 2026 — Live CPI Tracker",
    description: "What is the current U.S. inflation rate? The CPI inflation rate is tracked live from the Bureau of Labor Statistics. See year-over-year and month-over-month changes.",
    h1: "Current U.S. Inflation Rate",
    intro: "The current U.S. inflation rate — as measured by the Consumer Price Index (CPI) — is tracked live on this page, sourced directly from the Bureau of Labor Statistics (BLS). After peaking at 9.1% in June 2022 (a 40-year high), inflation has moderated significantly, though it remains above the Federal Reserve's 2% target.",
    body: "The Consumer Price Index measures the average change in prices paid by urban consumers for a basket of goods and services. CPI covers housing, food, energy, apparel, medical care, transportation, and more. 'Core CPI' excludes volatile food and energy prices and is watched closely by the Fed as a guide for policy. The Fed's preferred measure is actually the PCE (Personal Consumption Expenditures) deflator, which tends to run slightly below CPI.",
    metric: "inflation",
    category: "inflation",
    keywords: ["current inflation rate", "inflation rate 2026", "cpi 2026", "us inflation today", "live inflation rate", "bls inflation"],
    faqs: [
      { q: "What is the current inflation rate in the U.S.?", a: "The current U.S. CPI inflation rate (year-over-year) is shown live on this page, updated monthly from the Bureau of Labor Statistics CPI release." },
      { q: "Is inflation still high in 2026?", a: "After peaking at 9.1% in 2022, U.S. inflation has declined significantly. The current rate is tracked live above, based on the latest BLS CPI report." },
      { q: "What is the Federal Reserve's inflation target?", a: "The Fed targets 2% inflation as measured by the PCE price index (not CPI, though the two are closely related). When inflation is above 2%, the Fed typically raises interest rates to cool the economy." },
    ],
    relatedSlugs: ["inflation-rate-history", "cpi-index", "core-inflation-rate", "federal-reserve-interest-rates"],
  },
  {
    slug: "inflation-rate-history",
    title: "U.S. Inflation Rate History 1913–2026 — Historical CPI Chart",
    description: "Track the complete history of U.S. inflation from 1913 to 2026. See how inflation changed during WWI, the Great Depression, WWII, the 1970s, and today.",
    h1: "U.S. Inflation Rate History",
    intro: "U.S. inflation history stretches back to 1913, when the Bureau of Labor Statistics began tracking the Consumer Price Index. Over more than a century, the U.S. has experienced hyperinflation during WWI, deflation during the Great Depression, wartime inflation during WWII, the Great Inflation of the 1970s, a long period of low inflation from 1983-2020, and the post-COVID inflation surge that peaked at 9.1% in 2022.",
    body: "Notable inflation episodes: The 1918 peak of 20.4% was driven by WWI spending. Deflation of -10.5% in 1921 followed. The Great Depression saw prices fall 10.3% in 1932. WWII brought rationing-suppressed inflation. The 1970s energy crises pushed inflation above 13% by 1979. Volcker's rate shock in 1981 broke the inflation cycle, ushering in 40 years of relative price stability until COVID-era stimulus and supply chain disruptions pushed CPI to 9.1% in June 2022.",
    metric: "inflation",
    category: "inflation",
    keywords: ["inflation rate history", "cpi history", "historical inflation rate", "inflation by year", "us inflation chart", "inflation 1970s"],
    faqs: [
      { q: "When was inflation highest in U.S. history?", a: "The highest single-year U.S. inflation rate was approximately 20% in 1918 during WWI. In modern history, the peak was 13.5% in 1980 during the second oil shock." },
      { q: "What caused the 2021-2022 inflation spike?", a: "Multiple factors converged: $5+ trillion in COVID stimulus flooded the economy; supply chains were severely disrupted; energy prices surged after Russia's Ukraine invasion; and years of near-zero interest rates had suppressed price discovery." },
      { q: "How did Volcker stop inflation in the 1980s?", a: "Fed Chair Paul Volcker raised the federal funds rate to 20% in 1981, causing a severe recession but ultimately breaking the inflation spiral. Inflation fell from 13.5% in 1980 to under 3% by 1983." },
    ],
    relatedSlugs: ["current-inflation-rate", "cpi-index", "fed-funds-rate-history", "federal-reserve-interest-rates"],
  },
  {
    slug: "cpi-index",
    title: "Consumer Price Index (CPI) — What It Is & How It Works",
    description: "The Consumer Price Index (CPI) is the most widely used measure of U.S. inflation. Learn how CPI is calculated, what it includes, and how it differs from core CPI and PCE.",
    h1: "Consumer Price Index (CPI) Explained",
    intro: "The Consumer Price Index (CPI) is the Bureau of Labor Statistics' measure of the average change in prices paid by urban consumers for a fixed basket of goods and services. It is the most widely cited inflation metric in the United States and is used to adjust Social Security benefits, tax brackets, and TIPS (Treasury Inflation-Protected Securities).",
    body: "The CPI basket includes eight major categories: housing (shelter), food, medical care, transportation, apparel, recreation, education/communication, and other goods/services. Housing (primarily 'owners' equivalent rent') is the single largest component at roughly 33% of the index. The BLS samples prices monthly from 23,000 retail establishments and 50,000 housing units across 75 urban areas.",
    metric: "inflation",
    category: "inflation",
    keywords: ["consumer price index", "cpi inflation", "what is cpi", "cpi calculation", "cpi components", "bls cpi"],
    faqs: [
      { q: "What does the CPI measure?", a: "The CPI measures the average price change for a fixed basket of goods and services purchased by urban consumers. It covers housing, food, energy, apparel, medical care, transportation, and other categories." },
      { q: "What is the difference between CPI and core CPI?", a: "Core CPI excludes food and energy prices, which are volatile, to give a clearer picture of underlying inflation trends. The Fed watches core CPI closely when making rate decisions." },
      { q: "What is the difference between CPI and PCE?", a: "The PCE (Personal Consumption Expenditures) deflator is the Fed's preferred inflation measure. It uses a broader basket, adjusts more dynamically for consumer substitution, and typically runs 0.3-0.5 percentage points below CPI." },
    ],
    relatedSlugs: ["current-inflation-rate", "inflation-rate-history", "core-inflation-rate", "federal-reserve-interest-rates"],
  },
  {
    slug: "core-inflation-rate",
    title: "Core Inflation Rate 2026 — U.S. Core CPI Live Tracker",
    description: "Core inflation (CPI excluding food and energy) is the Federal Reserve's key measure for setting interest rates. Track the current core inflation rate live from BLS data.",
    h1: "Core Inflation Rate",
    intro: "Core inflation — the Consumer Price Index excluding food and energy — is the measure most closely watched by the Federal Reserve when making interest rate decisions. By stripping out volatile food and energy prices, core CPI reveals the underlying inflation trend in the broader economy. The current core inflation rate is tracked live on this page.",
    body: "After peaking at 6.6% in September 2022, core CPI has declined but remains above the Fed's 2% inflation target. The stickiest components of core inflation include shelter costs (owner's equivalent rent), medical services, and services broadly. Services inflation has proven more persistent than goods inflation, which already fell back to near-zero as supply chains normalized.",
    metric: "inflation",
    category: "inflation",
    keywords: ["core inflation rate", "core cpi", "core inflation 2026", "us core cpi", "inflation ex food energy"],
    faqs: [
      { q: "What is core inflation?", a: "Core inflation is the CPI measure that excludes food and energy prices, which tend to be volatile and driven by temporary supply shocks. It provides a cleaner read on persistent inflation trends." },
      { q: "Why does the Fed use core inflation?", a: "The Fed uses core PCE (similar to core CPI) as its primary inflation gauge because food and energy prices can swing dramatically due to weather, geopolitical events, and commodity markets — factors monetary policy can't address." },
      { q: "What is 'supercore' inflation?", a: "Supercore inflation — services excluding housing — became a popular Fed focus in 2022-2023. It excludes both energy/food AND shelter costs, focusing on services where labor costs drive inflation, making it a good indicator of wage-driven price pressures." },
    ],
    relatedSlugs: ["current-inflation-rate", "cpi-index", "federal-reserve-interest-rates", "fed-funds-rate-history"],
  },
];

// ─── DOLLAR STRENGTH ──────────────────────────────────────────────────────────

const dollarPages: SEOPage[] = [
  {
    slug: "us-dollar-index-dxy",
    title: "U.S. Dollar Index (DXY) — Live Chart & Current Value 2026",
    description: "The U.S. Dollar Index (DXY) measures the dollar against a basket of 6 major currencies. Track the live DXY value, chart history, and what it means for the economy.",
    h1: "U.S. Dollar Index (DXY)",
    intro: "The U.S. Dollar Index (DXY) measures the value of the U.S. dollar against a weighted basket of six major currencies: the euro (57.6%), Japanese yen (13.6%), British pound (11.9%), Canadian dollar (9.1%), Swedish krona (4.2%), and Swiss franc (3.6%). A higher DXY means a stronger dollar; a lower reading means a weaker dollar.",
    body: "The DXY was established in 1973 when the Bretton Woods system collapsed. It's used by traders, corporations, and policymakers as a benchmark for the dollar's global value. A strong dollar makes U.S. exports more expensive (hurting manufacturers) but lowers the cost of imports (reducing inflation). Emerging market countries with dollar-denominated debt suffer when the DXY rises, as their debts become more expensive in local currency terms.",
    metric: "dollar",
    category: "dollar",
    keywords: ["us dollar index", "dxy", "dollar index live", "dollar strength index", "dxy chart", "dollar index 2026"],
    faqs: [
      { q: "What is the DXY dollar index?", a: "DXY is the U.S. Dollar Index, which tracks the dollar's value against a basket of 6 major currencies, with the euro being the largest component at 57.6%. It's the benchmark measure of global dollar strength." },
      { q: "What does a high DXY mean?", a: "A high DXY means the dollar is strong relative to other currencies. This is generally negative for U.S. exporters (their products cost more abroad), positive for U.S. consumers (cheaper imports), and often negative for emerging market economies with dollar debt." },
      { q: "What is a normal DXY level?", a: "The DXY started at 100 in 1973. Values above 100 indicate the dollar is stronger than its 1973 baseline; values below 100 indicate weakness. The DXY reached 165 in 1985 (before the Plaza Accord) and 70 in 2008." },
    ],
    relatedSlugs: ["purchasing-power-of-dollar", "federal-reserve-interest-rates", "current-inflation-rate", "dollar-value-history"],
  },
  {
    slug: "purchasing-power-of-dollar",
    title: "Purchasing Power of the U.S. Dollar — Historical Decline Since 1913",
    description: "The U.S. dollar has lost over 96% of its purchasing power since 1913. See how inflation has eroded the dollar's value over time and what $1 in 1913 is worth today.",
    h1: "Purchasing Power of the U.S. Dollar",
    intro: "The purchasing power of the U.S. dollar has declined by over 96% since the Federal Reserve was established in 1913. What cost $1 in 1913 costs approximately $30 today. This erosion of purchasing power is primarily driven by inflation — the persistent rise in the general price level over time.",
    body: "The decline in purchasing power is not unique to the U.S. — all fiat currencies experience some inflation over time. The key question is the rate of decline. At 2% annual inflation (the Fed's target), prices double every 36 years. At 3%, every 24 years. At the 9.1% peak of 2022, prices would have doubled in just 8 years if sustained. The Federal Reserve's mandate to maintain price stability aims to preserve purchasing power.",
    metric: "inflation",
    category: "dollar",
    keywords: ["purchasing power of dollar", "dollar purchasing power", "inflation and purchasing power", "dollar value decline", "dollar worth less"],
    faqs: [
      { q: "How much has the dollar lost in purchasing power since 1913?", a: "Since the Federal Reserve was created in 1913, the U.S. dollar has lost approximately 96-97% of its purchasing power, as measured by the CPI." },
      { q: "What erodes the purchasing power of the dollar?", a: "Inflation is the primary driver of declining purchasing power. When prices rise faster than wages, the same amount of money buys fewer goods and services." },
      { q: "Is a stronger dollar better for Americans?", a: "It depends. A stronger dollar makes imports cheaper (good for consumers) but hurts exporters and tourism. A weaker dollar can boost exports and manufacturing jobs but raises import prices and contributes to inflation." },
    ],
    relatedSlugs: ["current-inflation-rate", "us-dollar-index-dxy", "inflation-rate-history", "federal-reserve-interest-rates"],
  },
  {
    slug: "dollar-value-history",
    title: "U.S. Dollar Value History — DXY Chart 1971–2026",
    description: "Track the complete history of the U.S. dollar's value from the end of Bretton Woods in 1971 to 2026. See dollar strength peaks, troughs, and key turning points.",
    h1: "U.S. Dollar Value History",
    intro: "The history of the U.S. dollar's value since the end of the Bretton Woods system in 1971 is a story of booms and busts. The dollar has swung from extreme strength (DXY 165 in 1985) to historic weakness (DXY 70 in 2008) and back. Understanding this history provides context for interpreting current dollar movements.",
    body: "Major milestones: The dollar surged in the early 1980s as Volcker's rate hikes attracted capital; the G5 Plaza Accord (1985) deliberately weakened the dollar to reduce trade deficits. The dollar declined through the 1990s, then surged again as the dot-com boom attracted capital to the U.S. After 9/11 and the Iraq War, the dollar weakened to record lows by 2008. COVID brought dollar strength (flight to safety), followed by weakness as the Fed printed money, then extreme strength in 2022 as the U.S. hiked rates faster than peers.",
    metric: "dollar",
    category: "dollar",
    keywords: ["dollar value history", "dollar strength history", "usd history", "dollar index history", "dxy history chart"],
    faqs: [
      { q: "When was the dollar at its strongest?", a: "The DXY peaked at approximately 165 in February 1985, driven by Paul Volcker's high interest rate policy which attracted massive capital inflows to the U.S." },
      { q: "When was the dollar at its weakest?", a: "The DXY fell to approximately 70 in March 2008, its weakest reading on record, as the housing bubble burst and the Fed began cutting rates aggressively." },
      { q: "What is the Plaza Accord?", a: "The Plaza Accord was a 1985 agreement between the U.S., Japan, West Germany, France, and the UK to intervene in currency markets to depreciate the U.S. dollar, which had become so strong it was devastating U.S. manufacturing exports." },
    ],
    relatedSlugs: ["us-dollar-index-dxy", "purchasing-power-of-dollar", "fed-funds-rate-history", "current-inflation-rate"],
  },
];

// ─── INTEREST RATES ──────────────────────────────────────────────────────────

const ratesPages: SEOPage[] = [
  {
    slug: "10-year-treasury-rate",
    title: "10-Year Treasury Rate — Live Yield & Historical Chart 2026",
    description: "The 10-year Treasury yield is the benchmark interest rate for the global economy. Track the current 10-year T-note yield live, with history and context.",
    h1: "10-Year Treasury Rate",
    intro: "The 10-year U.S. Treasury note yield is the most important interest rate in the world — it's the benchmark for mortgage rates, corporate bonds, and global capital flows. When investors fear inflation or fiscal problems, the 10-year yield rises; when they seek safety, it falls. The current yield is tracked live on this page from FRED data.",
    body: "The 10-year Treasury yield reflects market expectations for economic growth, inflation, and Federal Reserve policy over the next decade. It reached historic lows of 0.52% in August 2020 (COVID flight to safety) and climbed to 5% in October 2023 — the highest since 2007. A key concept is the 'real yield' — the 10-year yield minus expected inflation — which determines whether bonds are attractive in inflation-adjusted terms.",
    metric: "rates",
    category: "rates",
    keywords: ["10 year treasury rate", "10 year yield", "treasury yield 2026", "10 year t note", "bond yield", "10 year treasury live"],
    faqs: [
      { q: "What is the current 10-year Treasury rate?", a: "The current 10-year Treasury yield is shown live on this page, updated from the Federal Reserve's H.15 data series." },
      { q: "Why is the 10-year Treasury rate important?", a: "The 10-year Treasury yield serves as the benchmark for pricing many other financial instruments, including 30-year fixed mortgages, corporate bonds, and international lending. When it rises, borrowing costs increase across the economy." },
      { q: "What causes the 10-year yield to rise?", a: "The 10-year yield rises when investors expect higher inflation, stronger economic growth, or more government borrowing. Selling of Treasuries by the Fed or foreign governments also pushes yields up." },
    ],
    relatedSlugs: ["2-year-treasury-rate", "yield-curve", "federal-reserve-interest-rates", "inverted-yield-curve"],
  },
  {
    slug: "2-year-treasury-rate",
    title: "2-Year Treasury Rate — Live Yield & Historical Chart 2026",
    description: "The 2-year Treasury yield closely tracks Federal Reserve expectations. Track the current 2-year T-note yield live, its relationship to the Fed funds rate, and the yield curve.",
    h1: "2-Year Treasury Rate",
    intro: "The 2-year Treasury yield is the most sensitive point on the yield curve to Federal Reserve policy expectations. Because the 2-year note matures quickly, its yield closely reflects where markets expect the Fed funds rate to be over the next two years. When the Fed signals rate hikes, the 2-year yield rises sharply; when cuts are expected, it falls.",
    body: "The 2-year yield is often compared to the 10-year yield to gauge the shape of the yield curve. A normal, upward-sloping curve has the 10-year above the 2-year. An 'inverted' curve — when the 2-year exceeds the 10-year — has preceded every U.S. recession since the 1970s. The 2s10s spread (10Y minus 2Y) is one of the most watched recession indicators in economics.",
    metric: "rates",
    category: "rates",
    keywords: ["2 year treasury rate", "2 year yield", "2 year t note", "short term treasury yield", "2 year treasury live"],
    faqs: [
      { q: "What is the 2-year Treasury rate?", a: "The 2-year Treasury yield is the annualized return on a U.S. government note maturing in 2 years. It's the most sensitive point on the yield curve to Federal Reserve policy expectations." },
      { q: "Why does the 2-year yield track the Fed funds rate?", a: "Because the 2-year note matures relatively quickly, its price reflects investor expectations of where the Fed funds rate will average over the next two years." },
      { q: "What does a high 2-year yield mean?", a: "A high 2-year yield typically means markets expect the Fed to keep rates elevated for an extended period, often due to persistent inflation or strong economic growth." },
    ],
    relatedSlugs: ["10-year-treasury-rate", "yield-curve", "inverted-yield-curve", "federal-reserve-interest-rates"],
  },
  {
    slug: "yield-curve",
    title: "U.S. Treasury Yield Curve — What It Is & What It Means 2026",
    description: "The yield curve shows Treasury yields at different maturities. Learn what a normal, flat, and inverted yield curve means for the economy, and track the current shape live.",
    h1: "U.S. Treasury Yield Curve",
    intro: "The U.S. Treasury yield curve plots the interest rates on Treasury securities from 1 month to 30 years. Its shape — whether it slopes upward (normal), flat, or downward (inverted) — is one of the most powerful indicators of economic conditions and recession risk. The current yield curve shape is displayed live on the TrackTheDollar dashboard.",
    body: "A normal yield curve slopes upward: short-term rates are lower than long-term rates, reflecting that investors require higher compensation to lock up money for longer. A flat curve suggests uncertainty about future growth. An inverted curve — where short-term yields exceed long-term yields — has preceded every U.S. recession since the 1960s with a lead time of 6-24 months. The curve inverted deeply in 2022-2023 and is now in the process of 'dis-inverting'.",
    metric: "rates",
    category: "rates",
    keywords: ["yield curve", "treasury yield curve", "yield curve inversion", "normal yield curve", "flat yield curve", "2s10s spread"],
    faqs: [
      { q: "What is an inverted yield curve?", a: "An inverted yield curve occurs when short-term Treasury yields are higher than long-term yields. This is the opposite of normal and typically signals that investors expect a recession and subsequent rate cuts." },
      { q: "Does an inverted yield curve always mean recession?", a: "An inverted yield curve has preceded every U.S. recession since the 1960s, making it one of the most reliable recession indicators. However, the lead time varies from 6 to 24 months, and there have been brief inversions without recessions." },
      { q: "What is the 2s10s spread?", a: "The 2s10s spread is the difference between the 10-year Treasury yield and the 2-year yield. When negative (inverted), it historically signals recession risk. The spread inverted by nearly -100 basis points in 2023." },
    ],
    relatedSlugs: ["inverted-yield-curve", "10-year-treasury-rate", "2-year-treasury-rate", "federal-reserve-interest-rates"],
  },
  {
    slug: "inverted-yield-curve",
    title: "Inverted Yield Curve — Recession Signal Explained 2026",
    description: "An inverted yield curve has preceded every U.S. recession since the 1960s. Learn what it means, why it happens, and whether the current curve inversion signals a recession.",
    h1: "Inverted Yield Curve",
    intro: "An inverted yield curve — when short-term Treasury yields exceed long-term yields — is widely regarded as the most reliable leading indicator of recession. It has preceded every U.S. recession since the 1960s. The curve first inverted in 2022 and remained inverted for the longest continuous stretch in modern history before beginning to normalize.",
    body: "The inversion happens when the Fed raises short-term rates (2-year) to fight inflation while long-term rates (10-year) remain anchored by expectations of slower growth and future rate cuts. Essentially, the bond market is saying: 'The Fed is hiking into a slowdown.' Banks, which borrow short and lend long, see their margins compressed during inversions — reducing lending and slowing the economy.",
    metric: "rates",
    category: "rates",
    keywords: ["inverted yield curve", "yield curve inversion", "recession signal", "inverted yield curve 2026", "yield curve recession"],
    faqs: [
      { q: "Why does an inverted yield curve predict recession?", a: "Banks borrow at short-term rates and lend at long-term rates. An inverted curve crushes bank margins, reducing loan availability and slowing economic growth. Additionally, the inversion reflects market expectations of future rate cuts — which only happen when the economy weakens." },
      { q: "How long after inversion does recession typically occur?", a: "Historically, recessions have followed yield curve inversions by 6-24 months. The yield curve inverted in 2022; as of 2026, the economy has experienced a slowdown but avoided a formal recession." },
      { q: "Is the yield curve still inverted in 2026?", a: "The current yield curve shape is shown live on TrackTheDollar.com. After the deep inversion of 2022-2023, the curve has been normalizing as the Fed cuts rates and short-term yields decline faster than long-term yields." },
    ],
    relatedSlugs: ["yield-curve", "10-year-treasury-rate", "2-year-treasury-rate", "federal-reserve-interest-rates"],
  },
];

// ─── MONEY SUPPLY ────────────────────────────────────────────────────────────

const moneyPages: SEOPage[] = [
  {
    slug: "m2-money-supply",
    title: "M2 Money Supply — Live Chart & Current Level 2026",
    description: "M2 money supply is the broadest measure of money in the U.S. economy. Track the current M2 level live, its growth rate, and what changes in M2 mean for inflation.",
    h1: "M2 Money Supply",
    intro: "M2 is the Federal Reserve's broadest measure of the U.S. money supply, including cash, checking deposits, savings accounts, money market funds, and small-denomination CDs. It's closely watched by economists because rapid M2 growth often precedes inflation. M2 expanded by $6 trillion (40%) during the COVID pandemic, which many economists believe was a primary driver of the subsequent inflation surge.",
    body: "M2 peaked at approximately $21.7 trillion in April 2022 and has since contracted — the first sustained M2 decline since the Great Depression. This contraction reflects both the Fed's quantitative tightening (QT) program and a decline in bank deposits as higher yields attracted money into money market funds and Treasuries. Historically, sustained M2 growth above 10% year-over-year has reliably preceded inflationary periods.",
    metric: "m2",
    category: "money",
    keywords: ["m2 money supply", "m2 money supply live", "m2 growth rate", "money supply 2026", "m2 money supply chart"],
    faqs: [
      { q: "What is M2 money supply?", a: "M2 includes all of M1 (cash and checking deposits) plus savings deposits, money market deposit accounts, and small-denomination time deposits. It's the broadest commonly-used measure of the money supply." },
      { q: "Why did M2 grow so fast during COVID?", a: "The Federal Reserve purchased $4+ trillion in securities (QE), creating new bank reserves. Simultaneously, the Treasury issued $5+ trillion in stimulus payments directly to households, which flowed into bank deposits — massively expanding M2." },
      { q: "Does money supply growth cause inflation?", a: "The quantity theory of money suggests yes — more money chasing the same goods leads to higher prices. The COVID experience reinforced this: M2 grew 40% in two years, followed by peak CPI inflation of 9.1%." },
    ],
    relatedSlugs: ["federal-reserve-balance-sheet", "current-inflation-rate", "quantitative-easing", "monetary-expansion"],
  },
  {
    slug: "monetary-expansion",
    title: "Monetary Expansion — How Money Is Created in the U.S.",
    description: "Monetary expansion is the increase in the money supply through Federal Reserve policy and bank lending. Learn how money is created, the role of QE, and its effects on inflation.",
    h1: "Monetary Expansion",
    intro: "Monetary expansion refers to the growth of the money supply in an economy, primarily through Federal Reserve open market operations, fractional reserve banking, and government deficit spending. Understanding monetary expansion is key to understanding inflation, asset prices, and the long-term value of the dollar.",
    body: "Money is created in two primary ways: by the Federal Reserve (when it creates bank reserves through asset purchases) and by commercial banks (when they make loans). When a bank loans $100,000 for a mortgage, $100,000 in new money is created as a deposit. The Fed's reserve requirements and interest on reserves influence how aggressively banks create money. Excessive monetary expansion — as seen during COVID — can lead to inflation when the new money enters the real economy faster than production expands.",
    metric: "m2",
    category: "money",
    keywords: ["monetary expansion", "money creation", "how is money created", "money supply growth", "fed money printing"],
    faqs: [
      { q: "How is money created in the U.S.?", a: "Money is created through two primary channels: the Federal Reserve (which creates base money by purchasing assets) and commercial banks (which create money by making loans). About 90-95% of money in circulation was created by commercial bank lending, not the Fed." },
      { q: "What is the money multiplier?", a: "The money multiplier describes how initial bank reserves expand into a larger money supply through lending. If the reserve requirement is 10%, each $1 of reserves can theoretically support $10 in deposits. In practice, the multiplier varies based on bank willingness to lend and borrower demand." },
      { q: "Is monetary expansion always inflationary?", a: "Not necessarily. Monetary expansion that keeps pace with economic growth (productivity gains, population growth) won't cause inflation. Inflation results when money supply grows faster than the production of goods and services." },
    ],
    relatedSlugs: ["m2-money-supply", "quantitative-easing", "current-inflation-rate", "federal-reserve-balance-sheet"],
  },
];

// ─── GOVERNMENT SPENDING ──────────────────────────────────────────────────────

const spendingPages: SEOPage[] = [
  {
    slug: "us-government-spending",
    title: "U.S. Government Spending 2026 — Live Federal Budget Tracker",
    description: "The U.S. federal government spends over $7 trillion per year. Track total government spending, mandatory vs discretionary breakdown, and key categories live.",
    h1: "U.S. Government Spending",
    intro: "The U.S. federal government spends over $7 trillion per year — approximately 25-27% of GDP — making it one of the largest economic actors in the world. Federal spending encompasses everything from Social Security and Medicare to defense, infrastructure, and foreign aid. Understanding where the money goes is essential to understanding the national debt.",
    body: "Federal spending is divided into mandatory spending (programs governed by law, primarily Social Security, Medicare, and Medicaid, ~60% of total), discretionary spending (set annually by Congress, including defense and all other programs, ~30%), and interest payments (~10%, but rapidly growing). The single largest mandatory program is Social Security (~$1.4T/year), followed by Medicare (~$1T/year) and Medicaid (~$600B/year). Defense is the largest discretionary item (~$900B/year).",
    metric: "none",
    category: "spending",
    keywords: ["us government spending", "federal spending 2026", "federal budget breakdown", "mandatory spending", "discretionary spending", "government budget"],
    faqs: [
      { q: "How much does the U.S. government spend per year?", a: "The federal government spends approximately $7-7.5 trillion per year in fiscal year 2026, compared to revenues of approximately $5-5.5 trillion — creating a $2+ trillion annual deficit." },
      { q: "What is mandatory vs. discretionary spending?", a: "Mandatory spending (Social Security, Medicare, Medicaid, interest payments) is set by law and occurs automatically regardless of the annual budget process. Discretionary spending (defense, education, transportation) is set by Congress each year through appropriations bills." },
      { q: "What is the largest item in the U.S. budget?", a: "Social Security is the largest single program at ~$1.4 trillion per year, followed by Medicare (~$1T), Medicaid (~$600B), defense (~$900B), and interest payments (~$1T+)." },
    ],
    relatedSlugs: ["federal-budget-deficit", "defense-spending-by-year", "national-debt-interest-payments", "foreign-aid-spending"],
  },
  {
    slug: "defense-spending-by-year",
    title: "U.S. Defense Spending by Year — Historical Military Budget Chart",
    description: "Track U.S. defense spending by year from WWII to 2026. The U.S. military budget exceeds $900 billion — the largest in the world. See the historical trend and how it compares to GDP.",
    h1: "U.S. Defense Spending by Year",
    intro: "U.S. defense spending has exceeded $900 billion in fiscal year 2026, accounting for approximately 3.5% of GDP and making the United States by far the world's largest military spender. Tracking defense spending by year reveals the impact of wars, geopolitical shifts, and budget pressures on America's military investment.",
    body: "U.S. defense spending peaked as a percentage of GDP during WWII (~40%) and the Korean War (~15%). It fell to about 3% of GDP by the late 1990s ('peace dividend' after the Cold War) before rising sharply after 9/11. Today at ~$900B, the U.S. spends more on defense than the next 10 countries combined. Recent spending growth reflects the Ukraine war, China's military buildup, and modernization of nuclear forces.",
    metric: "none",
    category: "spending",
    keywords: ["defense spending by year", "military budget history", "us defense budget 2026", "military spending chart", "defense budget gdp"],
    faqs: [
      { q: "How much does the U.S. spend on defense?", a: "The U.S. defense budget for fiscal year 2026 exceeds $900 billion, including the base defense budget plus overseas contingency operations and other defense-related spending." },
      { q: "What percentage of GDP is defense spending?", a: "U.S. defense spending amounts to approximately 3-3.5% of GDP, down from over 6% during the Cold War peak but still the highest absolute dollar amount of any nation." },
      { q: "How does U.S. defense spending compare to other countries?", a: "The U.S. spends more on defense than the next 10 countries combined, including China (~$300B), Russia (~$100B), India (~$85B), Saudi Arabia (~$80B), and others." },
    ],
    relatedSlugs: ["us-government-spending", "foreign-aid-spending", "federal-budget-deficit", "national-debt-clock"],
  },
  {
    slug: "foreign-aid-spending",
    title: "U.S. Foreign Aid Spending 2026 — Where Does the Money Go?",
    description: "The U.S. spends approximately $60-70 billion per year on foreign aid. Track where U.S. foreign assistance goes by country and category with live data from official sources.",
    h1: "U.S. Foreign Aid Spending",
    intro: "The United States is the world's largest provider of foreign aid, distributing approximately $60-70 billion annually across security assistance, economic development, humanitarian relief, and global health programs. Despite its large absolute size, foreign aid represents less than 1% of the federal budget and under 0.3% of GDP.",
    body: "Major recipients of U.S. foreign aid include Ukraine (emergency military and economic assistance), Israel (military aid under MOU agreements), Jordan, Egypt, and various African nations for health and development programs. The largest U.S. foreign aid programs include PEPFAR (HIV/AIDS), the Global Fund, USAID development programs, Foreign Military Financing (FMF), and economic support funds. A persistent myth is that foreign aid is a huge portion of the budget; in reality, it's less than 1%.",
    metric: "none",
    category: "spending",
    keywords: ["foreign aid spending", "us foreign aid 2026", "foreign assistance budget", "where does us foreign aid go", "foreign aid by country"],
    faqs: [
      { q: "How much foreign aid does the U.S. give?", a: "The U.S. provides approximately $60-70 billion per year in foreign assistance, covering military aid, economic development, humanitarian assistance, and global health programs." },
      { q: "What percentage of the budget is foreign aid?", a: "Foreign aid represents less than 1% of total federal spending — a figure that surprises many Americans who poll suggesting they believe it's 20-25% of the budget." },
      { q: "Who are the largest recipients of U.S. foreign aid?", a: "In recent years, Ukraine has received the most in emergency assistance. Regular large recipients include Israel, Jordan, Egypt, Afghanistan (historically), and numerous sub-Saharan African countries for health and development programs." },
    ],
    relatedSlugs: ["us-government-spending", "defense-spending-by-year", "federal-budget-deficit", "national-debt-clock"],
  },
];

// ─── ECONOMY ─────────────────────────────────────────────────────────────────

const economyPages: SEOPage[] = [
  {
    slug: "us-gdp",
    title: "U.S. GDP — Gross Domestic Product Live Tracker 2026",
    description: "U.S. GDP exceeds $29 trillion, making it the world's largest economy. Track U.S. GDP growth, quarterly changes, and how GDP compares to the national debt.",
    h1: "U.S. Gross Domestic Product (GDP)",
    intro: "The U.S. Gross Domestic Product (GDP) — the total value of all goods and services produced in the United States — exceeds $29 trillion, making the U.S. the world's largest economy by nominal GDP. GDP growth is the primary measure of economic health, and its relationship to the national debt determines fiscal sustainability.",
    body: "U.S. GDP is measured quarterly by the Bureau of Economic Analysis (BEA) using three approaches: expenditure (C+I+G+NX), income, and production. The expenditure approach dominates: consumer spending (C) accounts for ~70% of GDP, government spending (G) ~17%, investment (I) ~18%, and net exports (NX) are typically negative (the U.S. imports more than it exports). Real GDP growth of 2-3% is considered healthy; recessions are defined as two consecutive quarters of negative real GDP growth.",
    metric: "none",
    category: "economy",
    keywords: ["us gdp", "us gross domestic product", "gdp 2026", "us economy size", "gdp growth rate", "us gdp live"],
    faqs: [
      { q: "What is U.S. GDP in 2026?", a: "U.S. nominal GDP exceeds $29 trillion in 2026, making the U.S. the world's largest economy. Real GDP (inflation-adjusted) growth has averaged 2-2.5% in recent years." },
      { q: "What is the difference between nominal and real GDP?", a: "Nominal GDP is measured in current prices; real GDP adjusts for inflation. Real GDP is the better measure of actual economic growth because it removes the effect of price increases." },
      { q: "Is the U.S. the world's largest economy?", a: "Yes, by nominal GDP. The U.S. at $29T+ is the world's largest economy, ahead of China (~$19T), Japan (~$4.2T), and Germany (~$4.5T). On a purchasing power parity (PPP) basis, China may be comparable or larger." },
    ],
    relatedSlugs: ["national-debt-to-gdp", "current-inflation-rate", "federal-budget-deficit", "us-economy-outlook"],
  },
  {
    slug: "recession-indicators",
    title: "U.S. Recession Indicators 2026 — Is a Recession Coming?",
    description: "Track the key recession indicators in real time: inverted yield curve, unemployment, PMI, consumer sentiment, and the Sahm Rule. Is the U.S. heading toward recession?",
    h1: "U.S. Recession Indicators",
    intro: "Recession indicators are economic signals that have historically preceded downturns. The most reliable include the inverted yield curve (10Y-2Y), the Sahm Rule (unemployment rate rise), PMI below 50, declining consumer sentiment, and credit spreads widening. TrackTheDollar.com tracks these signals live alongside the government financial data they depend on.",
    body: "The NBER (National Bureau of Economic Research) officially declares recessions in the U.S. based on a broad set of economic indicators. Common recession signals include: yield curve inversion (has preceded every recession since the 1960s), the Sahm Rule (0.5% rise in the 3-month average unemployment rate from its 12-month low), manufacturing PMI below 50 for multiple months, falling retail sales, and tightening credit conditions. No single indicator is perfect; recession calls require a confluence of signals.",
    metric: "rates",
    category: "economy",
    keywords: ["recession indicators", "is a recession coming", "recession 2026", "economic indicators", "recession warning signs", "recession signals"],
    faqs: [
      { q: "What are the main recession indicators?", a: "Key recession indicators include: inverted yield curve (2Y-10Y), Sahm Rule (unemployment rise), PMI below 50, declining consumer confidence, widening credit spreads, and falling leading economic indicators (LEI)." },
      { q: "Is the U.S. in a recession in 2026?", a: "The current economic status is reflected in the live data on TrackTheDollar.com. A recession is officially defined by the NBER based on a broad decline in economic activity." },
      { q: "What is the Sahm Rule?", a: "The Sahm Rule, developed by economist Claudia Sahm, states that when the 3-month moving average of the national unemployment rate rises by 0.5 percentage points above its 12-month low, the economy is in recession. It has accurately identified every recession since 1970." },
    ],
    relatedSlugs: ["inverted-yield-curve", "yield-curve", "federal-reserve-interest-rates", "us-gdp"],
  },
  {
    slug: "us-economy-outlook",
    title: "U.S. Economic Outlook 2026 — Growth, Inflation & Fiscal Risks",
    description: "What is the outlook for the U.S. economy in 2026? Track GDP growth, inflation, the debt trajectory, and key risks facing the economy in the year ahead.",
    h1: "U.S. Economic Outlook 2026",
    intro: "The U.S. economic outlook for 2026 is shaped by three major forces: the Federal Reserve's monetary easing cycle (cutting rates from the 5.25-5.50% peak), the persistence of fiscal deficits ($2T+ per year), and the trajectory of inflation (declining but sticky above the 2% target). Understanding these dynamics is essential for investors, businesses, and policymakers.",
    body: "The Congressional Budget Office (CBO) projects GDP growth of 1.5-2.5% in 2026, slower than the 2022-2023 period but not recessionary. Key risks include: the 'higher for longer' interest rate environment slowing the housing market and business investment; escalating interest costs consuming a growing share of federal revenue; and geopolitical risks (Ukraine, Taiwan, Middle East) that could disrupt energy prices and supply chains. The dollar's reserve currency status remains a significant strength.",
    metric: "none",
    category: "economy",
    keywords: ["us economic outlook 2026", "us economy forecast", "economic outlook", "gdp forecast 2026", "us economy risks"],
    faqs: [
      { q: "What is the U.S. GDP growth forecast for 2026?", a: "The CBO and major forecasters project U.S. real GDP growth of approximately 1.5-2.5% for 2026, reflecting a moderation from the strong post-COVID recovery." },
      { q: "What are the biggest risks to the U.S. economy in 2026?", a: "Key risks include: persistent inflation delaying Fed rate cuts, the $2T+ federal deficit crowding out private investment, commercial real estate stress, geopolitical shocks, and the long-term sustainability of $1T+ in annual interest payments." },
      { q: "Is the U.S. dollar losing its reserve currency status?", a: "The dollar maintains its dominant reserve currency status, accounting for ~58% of global FX reserves. While de-dollarization discussions have increased, the lack of a credible alternative (the euro and yuan both have significant limitations) means the dollar's status is not at immediate risk." },
    ],
    relatedSlugs: ["us-gdp", "current-inflation-rate", "federal-reserve-interest-rates", "national-debt-clock"],
  },
];

// ─── MASTER EXPORT ───────────────────────────────────────────────────────────

export const ALL_SEO_PAGES: SEOPage[] = [
  ...debtPages,
  ...fedPages,
  ...inflationPages,
  ...dollarPages,
  ...ratesPages,
  ...moneyPages,
  ...spendingPages,
  ...economyPages,
];

export const SEO_PAGE_MAP = new Map(ALL_SEO_PAGES.map((p) => [p.slug, p]));

export const CATEGORY_LABELS: Record<PageCategory, string> = {
  debt: "National Debt",
  fed: "Federal Reserve",
  inflation: "Inflation",
  dollar: "Dollar Strength",
  rates: "Interest Rates",
  money: "Money Supply",
  spending: "Government Spending",
  economy: "Economy",
};
