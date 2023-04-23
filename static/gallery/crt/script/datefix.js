const basedate = new Date(1899, 11, 30, 0, 0, 0);
const dnthresh =
  basedate.getTime() +
  (new Date().getTimezoneOffset() - basedate.getTimezoneOffset()) * 60000;

const day_ms = 24 * 60 * 60 * 1000;
const days_1462_ms = 1461 * day_ms;

function datenum(v, date1904) {
  // let epoch = v.getTime();
  if (date1904) {
    v -= days_1462_ms;
  }
  return (v - dnthresh) / day_ms;
}
// -------------------------------------------------

function fixImportedDate(date, isDate1904) {
  const parsed = XLSX.SSF.parse_date_code(datenum(date, isDate1904), {
    date1904: isDate1904,
  });
  console.log(parsed);
  // return `${parsed.y}-${parsed.m}-${parsed.d}`;
  return new Date(
    parsed.y,
    parsed.m - 1,
    parsed.d,
    parsed.H,
    parsed.M,
    parsed.S
  );
}

function fixImportedDate2(date_num, isDate1904) {
  const parsed = XLSX.SSF.parse_date_code(date_num, { date1904: isDate1904 });
  return new Date(
    parsed.y,
    parsed.m - 1,
    parsed.d,
    parsed.H,
    parsed.M,
    parsed.S
  );
}

function fixOldDate(date, isDate1904) {
  dn = datenum(date, isDate1904);
  d400 = 0;
  while (dn < 1) {
    dn += 146097;
    d400++;
  }
  const parsed = XLSX.SSF.parse_date_code(dn, { date1904: isDate1904 });
  console.log(`${parsed.y - d400 * 400}-${parsed.m}-${parsed.d}`);
  // return `${parsed.y}-${parsed.m}-${parsed.d}`;
  return new Date(
    parsed.y - d400 * 400,
    parsed.m - 1,
    parsed.d,
    parsed.H,
    parsed.M,
    parsed.S
  );
}

function testFixOldDate(a) {
  for (let i = 0; i < 10; i++) {
    for (let j = 1; j < 13; j++) {
      fixOldDate(Date.parse(`${a + i}-${j}-${j}`), 0);
    }
  }
}
