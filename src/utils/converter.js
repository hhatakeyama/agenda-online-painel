export const currencyValue = value =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);

export const percentValue = value =>
  new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    maximumFractionDigits: 2,
  }).format(Number(value || 0) / 100);

export const decimalToPercent = value => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'percent',
    roundMode: 'trunc',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
    .format(Number(value))
    .replace('%', '');
  return Number(formatted);
};

export const percentToDecimal = value => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    roundMode: 'trunc',
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(Number(value || 0) / 100);
  return Number(formatted);
};

export const percentVariation = (value, prevValue) => {
  if (Number(value) && Number(prevValue)) {
    return (Number(value) - Number(prevValue)) / Number(prevValue);
  }
  if (Number(value) && Number(prevValue) === 0) {
    return Number(value);
  }
  return 0;
};

const fillZeroes = time => (time.toString().length === 1 ? `0${time}` : time);

export const toHoursMinutes = totalSeconds => {
  const totalMinutes = Math.floor(totalSeconds / 60);

  const seconds = totalSeconds % 60;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return { h: fillZeroes(hours), m: fillZeroes(minutes), s: fillZeroes(seconds) };
};

export const secondsToDaysHoursMinutes = totalSeconds => {
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalDays = Math.floor(totalHours / 24);

  const seconds = totalSeconds % 60;
  const minutes = totalMinutes % 60;
  const hours = totalHours % 24;

  return {
    d: totalDays,
    h: fillZeroes(hours),
    H: totalHours,
    m: fillZeroes(minutes),
    M: totalMinutes,
    s: fillZeroes(seconds),
  };
};

export const timeToSeconds = value => {
  const time = value.split(':');
  return Number(time[0]) * 3600 + Number(time[1]) * 60;
};
