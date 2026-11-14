// The verified library behind Ask Entri. Every entry was written from the
// official page named in `url`, which was opened and read on the date in
// `checked`. Ask Entri may answer only from these entries and from the
// listings in the Entri network. Nothing about parole or probation rules is
// in here on purpose. Those questions always go to a person.

export interface LibraryDoc {
  id: string;
  title: string;
  source: string;
  url: string;
  checked: string;
  // Extra words people use for this topic, to help the search.
  keywords: string[];
  text: string;
}

const CHECKED = "Nov 2026";

export const LIBRARY: LibraryDoc[] = [
  {
    id: "nys-id-apply",
    title: "New York State non-driver ID: how to apply",
    source: "NY DMV, dmv.ny.gov",
    url: "https://dmv.ny.gov/non-driver-id/get-a-non-driver-id",
    checked: CHECKED,
    keywords: ["state id", "non-driver", "dmv", "photo id", "identification", "id card", "documents"],
    text: "A person of any age with lawful status in the US can get a New York State non-driver ID card. First, use the DMV's online pre-screening tool. It tells you which forms and documents you need to bring. The DMV's document guide (form ID-44) lists every proof it accepts. Then gather your documents and the fee, and apply in person at a DMV office. You must apply at a DMV office. The office gives you a temporary paper document with no photo, which is valid for 60 days. The permanent card comes in the mail.",
  },
  {
    id: "nys-id-fees",
    title: "New York State non-driver ID: fees and no-fee cards",
    source: "NY DMV, dmv.ny.gov",
    url: "https://dmv.ny.gov/non-driver-id/non-driver-id-fees-and-refunds",
    checked: CHECKED,
    keywords: ["state id", "non-driver", "dmv", "fee", "cost", "price", "free", "how much"],
    text: "For people under 62, a standard non-driver ID costs between $9.50 and $14.00. The exact fee depends on your birthday and on whether the card lasts 4 or 8 years. People who are 62 or older, or who receive SSI, pay $6.50. There is no fee for a 4-year card if you receive public assistance, SNAP benefits or Medical Assistance, and you must bring proof that you receive it. To get a reduced-fee or no-fee card you must apply by mail or at a DMV office, not online. The DMV does not refund non-driver ID fees.",
  },
  {
    id: "idnyc-apply",
    title: "IDNYC: how to apply",
    source: "IDNYC, nyc.gov",
    url: "https://www.nyc.gov/site/idnyc/card/how-to-apply.page",
    checked: CHECKED,
    keywords: ["idnyc", "city id", "municipal id", "nyc id", "id card", "identification", "appointment", "documents"],
    text: "IDNYC is New York City's own ID card. It is separate from the New York State ID. To apply you need documents worth 3 identity points and 1 residency point, including a photo ID and a document that shows your date of birth. The IDNYC Document Calculator on the city website shows which documents count. You must have an appointment to apply at an Enrollment Center. You can book one online or by calling 311. Applications are not accepted by mail. Some centers also take walk-ins on set days, first come, first served. If you do not have an address, you can pick up your card at certain IDNYC locations instead of getting it by mail.",
  },
  {
    id: "idnyc-faq",
    title: "IDNYC: cost, who can get it and what it is for",
    source: "IDNYC, nyc.gov",
    url: "https://www.nyc.gov/site/idnyc/frequently-asked-questions/frequently-asked-questions.page",
    checked: CHECKED,
    keywords: ["idnyc", "city id", "municipal id", "free", "cost", "release", "released", "prison id", "no address", "homeless", "shelter"],
    text: "The IDNYC card is free for all New Yorkers who apply through December 31, 2026. You must be at least 10 years old and able to prove who you are and that you live in New York City. Past or present involvement with the justice system does not affect whether you can get one, and neither does immigration status. The identification card that the New York State prison system (DOCCS) gives people at release counts for three identity points for one year after it was issued. People without a home address can apply. A letter from a homeless shelter or a City agency can count as proof of where you live. The card is valid for five years for people 16 and older. It can be used to enter City buildings, as a library card, and to open an account at certain banks and credit unions.",
  },
  {
    id: "snap",
    title: "SNAP (food stamps): who can get it and how to apply",
    source: "ACCESS NYC, access.nyc.gov",
    url: "https://access.nyc.gov/programs/supplemental-nutrition-assistance-program-snap/",
    checked: CHECKED,
    keywords: ["snap", "food stamps", "food", "groceries", "ebt", "hungry", "benefits", "hra"],
    text: "SNAP, also called food stamps, gives you money on a card to buy groceries at stores and farmers markets. Whether you qualify is mainly based on how much you earn and how many people live in your household. You can apply online through ACCESS HRA, where one application can cover Cash Assistance, SNAP and Medicaid. You can also apply by mail, or in person at an HRA SNAP Center or with a community organization that helps people enroll. After you apply there is an interview, and you may be asked for documents such as a photo ID, pay stubs, utility bills or a lease. Sending your documents quickly speeds up the decision. It can take up to 30 days to hear back. If you are approved, you get your EBT card within 5 business days. For a paper application you can call HRA at 718-557-1399, or call 311 for SNAP information.",
  },
  {
    id: "cash-assistance",
    title: "Cash Assistance: who can get it and how to apply",
    source: "ACCESS NYC, access.nyc.gov",
    url: "https://access.nyc.gov/programs/cash-assistance/",
    checked: CHECKED,
    keywords: ["cash assistance", "public assistance", "welfare", "money", "cash", "rent", "benefits", "hra", "income"],
    text: "Cash Assistance is a monthly cash benefit from the NYC Human Resources Administration (HRA). Most people get it on a card that works at ATMs and at stores that take EBT. HRA looks at your income, other benefits, household size and savings. Adults who are able to work usually must work, study, train or take part in an assigned program. You can apply online through ACCESS HRA, by mail, or in person at an HRA Benefits Access Center. You will be asked to prove who you are (for example with a photo ID), where you live (for example with a lease or a statement from a landlord) and any income. The interview can be by phone or in person. For help, call 311 and ask for Cash Assistance, or call the HRA Infoline at 718-557-1399.",
  },
  {
    id: "medicaid",
    title: "Medicaid: free health coverage and how to apply",
    source: "ACCESS NYC, access.nyc.gov",
    url: "https://access.nyc.gov/programs/medicaid/",
    checked: CHECKED,
    keywords: ["medicaid", "health insurance", "health coverage", "doctor", "medical", "prescription", "medicine", "dental", "mental health", "clinic", "benefits"],
    text: "Medicaid is free health insurance for New Yorkers with low income. It covers doctor visits, hospital stays, mental health care, vision and dental care, and prescriptions. There is no monthly premium. To qualify you must live in New York State, meet the citizenship or immigration rules, and have income within the limit for your age and household size. Adults under 65 apply through NY State of Health, online or by phone at 855-355-5777. People 65 or older, and people with a disability, apply through ACCESS HRA or by calling HRA at 888-692-6116. You can also get free help in person at a Medicaid office or from a health insurance assistor. Have ready proof of identity and date of birth, proof of your address, and proof of income for the past four weeks if you have any.",
  },
  {
    id: "shelter-intake",
    title: "Shelter for single adults: where to apply",
    source: "NYC Department of Homeless Services, nyc.gov",
    url: "https://www.nyc.gov/site/dhs/shelter/singleadults/single-adults-applying.page",
    checked: CHECKED,
    keywords: ["shelter", "homeless", "nowhere to stay", "place to stay", "tonight", "sleep", "housing", "intake", "bed"],
    text: "Single adults apply for shelter in person at a City intake center. Single adult men apply at the Single Adult Intake Center, 8 E. 3rd Street, New York, NY 10003. Single adult women apply at Franklin Shelter, 1122 Franklin Avenue (near 166th Street) in the Bronx, or at Help Women's Center, 114 Snediker Avenue in Brooklyn. If you stayed in a shelter in the last 12 months, go back to that same shelter. It helps to bring a photo ID, your Social Security card, a Medicaid card if you have one, and your most recent pay stub if you are working. These are helpful but not required. An interpreter is available if you do not speak English.",
  },
  {
    id: "fair-chance-act",
    title: "NYC Fair Chance Act: when an employer can ask about a record",
    source: "NYC Commission on Human Rights, nyc.gov",
    url: "https://www.nyc.gov/site/cchr/law/fair-chance-act.page",
    checked: CHECKED,
    keywords: ["fair chance", "record", "conviction", "background check", "employer", "job application", "interview", "hire", "hiring", "discrimination", "tell", "disclose", "job", "work"],
    text: "Under New York City's Fair Chance Act, most employers may not ask about or consider a conviction record before they make a conditional job offer. Job ads may not mention a record, and interviewers may not ask about it. After a conditional offer, an employer may ask about convictions or pending cases and may run a background check. Employers may never ask about or act on cases that did not end in a conviction, such as sealed cases. If an employer wants to take back an offer because of a record, it must first give you a written copy of the record it relied on and a written Fair Chance Analysis, and give you at least five business days to respond. Some jobs are exceptions, such as police and peace officers and jobs where a law requires a background check. To report a problem, contact the NYC Commission on Human Rights at 311 or 212-416-0197.",
  },
  {
    id: "safestart-account",
    title: "NYC SafeStart Account: a basic savings account",
    source: "NYC Department of Consumer and Worker Protection, nyc.gov",
    url: "https://www.nyc.gov/site/dca/talk-money/open-savings-account.page",
    checked: CHECKED,
    keywords: ["bank", "bank account", "banking", "savings", "account", "credit union", "overdraft", "atm", "direct deposit"],
    text: "The NYC SafeStart Account is a savings account for all New Yorkers. It has no overdraft fees and no monthly fees as long as you keep the minimum balance, which is $25 or less. It comes with an ATM card and no debit card. You open it at a branch of a bank or credit union that takes part: Carver Federal Savings Bank, Lower East Side People's Federal Credit Union, Neighborhood Trust Federal Credit Union, Popular, Ridgewood Savings Bank or Spring Bank. Some institutions accept IDNYC as a main form of ID, so ask the branch before you go. A free NYC Financial Empowerment Center counselor can help you choose an account.",
  },
  {
    id: "lifeline",
    title: "Lifeline: a lower monthly bill for phone or internet",
    source: "Lifeline Support, lifelinesupport.org",
    url: "https://www.lifelinesupport.org/",
    checked: CHECKED,
    keywords: ["phone", "cell phone", "free phone", "lifeline", "internet", "phone bill", "service", "minutes", "data"],
    text: "Lifeline is a federal program that lowers the monthly cost of phone or internet service by up to $9.25 a month. You may qualify based on your income, or if you take part in a program such as SNAP or Medicaid. There are three steps. First, apply through the Lifeline website. Second, once you are approved, contact a phone or internet company that takes part in Lifeline. Third, the discount is taken off your monthly service. For help, call the Lifeline Support Center at (800) 234-9473, open every day from 9 a.m. to 9 p.m. Eastern time.",
  },
  {
    id: "entri-order",
    title: "Where to begin: the order of the first steps",
    source: "Entri starter guide",
    url: "/app/plan",
    checked: CHECKED,
    keywords: ["start", "begin", "first", "where do i start", "just got out", "released", "came home", "next", "order", "overwhelmed", "plan", "step"],
    text: "Entri's starter plan puts the first steps in an order where each one makes the next one easier. A photo ID comes first, because most other steps ask for one. A phone comes next, so employers and offices can reach you. Then a bank account, so pay and benefits have a safe place to go. Then benefits such as food assistance and health coverage. Then a housing application, which often asks for ID and proof of income or benefits. Then work. You only need to do one step at a time. Your own plan in Entri shows which step is open for you now.",
  },
];
