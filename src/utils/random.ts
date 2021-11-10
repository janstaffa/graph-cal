export const randomIntInc = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1) + min);

export const randomRGBColor = () => {
  const r = randomIntInc(0, 255);
  const g = randomIntInc(0, 255);
  const b = randomIntInc(0, 255);
  return `rgb(${r}, ${g}, ${b})`;
};
