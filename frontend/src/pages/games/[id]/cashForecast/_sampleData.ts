

// eventually this will be a hash of the forecast items
const sources = {
  "f-1": { name: "Bank Balance" },
  "f-2": { name: "Bank Loan" },
  "p-1": { name: "Sam" },
  "p-2": { name: "Contract art" },
  "t-1": { name: "Some License" },
  "s-1": { name: "Email Service" },
  "s-2": { name: "Website Host" },
  "s-3": { name: "Social Media Tool" },
  "r-1": { name: "Sales Revenue (Gross)" },
};

// this is the projected results of the forecast items
type monthSummary = {
  month: Date;
  beginningCash: number;
  endingCash: number;
  lowestCash: number;
  highestCash: number;
  lines: lineSummary[];
};
type lineSummary = {
  name: string;
  direction: number; // 1 | -1;
  amount: number;
  details: lineDetail[];
};
type lineDetail = {
  sourceId: string;
  amount: number;
};

const sampleData: monthSummary[] = [
  {
    month: new Date("1/1/2020"),
    beginningCash: 1234.56,
    lowestCash: 0,
    highestCash: 0,
    endingCash: 0,
    lines: [
      {
        name: "Funding",
        amount: 45000.0,
        direction: 1,
        details: [
          { sourceId: "f-1", amount: 25000.0 },
          { sourceId: "f-2", amount: 36000.0 },
        ],
      },
      {
        name: "People",
        amount: 15000.0,
        direction: -1,
        details: [
          { sourceId: "p-1", amount: 10000 },
          { sourceId: "p-2", amount: 5000 },
        ],
      },
      {
        name: "Tools & Licenses",
        amount: 100.0,
        direction: -1,
        details: [{ sourceId: "t-1", amount: 100 }],
      },
      {
        name: "Services",
        amount: 42.0,
        direction: -1,
        details: [
          { sourceId: "s-1", amount: 5 },
          { sourceId: "s-2", amount: 7 },
          { sourceId: "s-3", amount: 30 },
        ],
      },
      {
        name: "Revenue",
        amount: 0.0,
        direction: 1,
        details: [],
      },
    ],
  },
  ...[
    new Date("2/1/2020"),
    new Date("3/1/2020"),
    new Date("4/1/2020"),
    new Date("5/1/2020"),
    new Date("6/1/2020"),
    new Date("7/1/2020"),
  ].map((d) => ({
    month: d,
    beginningCash: 0,
    endingCash: 0,
    lowestCash: 0,
    highestCash: 0,
    lines: [
      {
        name: "Funding",
        amount: -1000.0,
        direction: 1,
        details:
          d.getMonth() == 4
            ? [
              { sourceId: "f-1", amount: 19000.0 },
              { sourceId: "f-2", amount: -1000.0 },
            ]
            : [{ sourceId: "f-2", amount: -1000.0 }],
      },
      {
        name: "People",
        amount: 10000.0,
        direction: -1,
        details: [{ sourceId: "p-1", amount: 10000 }],
      },
      {
        name: "Tools & Licenses",
        amount: 100.0,
        direction: -1,
        details: [{ sourceId: "t-1", amount: 100 }],
      },
      {
        name: "Services",
        amount: 42.0,
        direction: -1,
        details: [
          { sourceId: "s-1", amount: 5 },
          { sourceId: "s-2", amount: 7 },
          { sourceId: "s-3", amount: 30 },
        ],
      },
      {
        name: "Revenue",
        amount: 0.0,
        direction: 1,
        details: [],
      },
    ],
  })),
  ...[new Date("8/1/2020"), new Date("9/1/2020"), new Date("10/1/2020")].map(
    (d) => ({
      month: d,
      beginningCash: 0,
      endingCash: 0,
      lowestCash: 0,
      highestCash: 0,
      lines: [
        {
          name: "Funding",
          amount: -1000.0,
          direction: 1,
          details: [{ sourceId: "f-2", amount: -1000.0 }],
        },
        {
          name: "People",
          amount: 10000.0,
          direction: -1,
          details: [{ sourceId: "p-1", amount: 10000 }],
        },
        {
          name: "Tools & Licenses",
          amount: 100.0,
          direction: -1,
          details: [{ sourceId: "t-1", amount: 100 }],
        },
        {
          name: "Services",
          amount: 42.0,
          direction: -1,
          details: [
            { sourceId: "s-1", amount: 5 },
            { sourceId: "s-2", amount: 7 },
            { sourceId: "s-3", amount: 30 },
            { sourceId: "s-4", amount: 16500 * 0.3 },
          ],
        },
        {
          name: "Revenue",
          amount: 0.0,
          direction: 1,
          details: [{ sourceId: "r-1", amount: 16500.0 }],
        },
      ],
    })
  ),
];
sampleData.forEach((d, index) => {
  if (index > 0) {
    d.beginningCash = sampleData[index - 1].endingCash;
  }
  d.lines.forEach((line) => {
    line.amount = line.details.reduce(
      (total, detail) => total + line.direction * detail.amount,
      0
    );
  });
  d.endingCash =
    d.beginningCash + d.lines.reduce((total, line) => total + line.amount, 0);
  d.lowestCash = Math.min(d.beginningCash, d.endingCash);
  d.highestCash = Math.max(d.beginningCash, d.endingCash);
});

export { sampleData, sources };
