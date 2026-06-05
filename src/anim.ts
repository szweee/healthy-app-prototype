// ?static=1 时让所有入场动画直接落到终态(用于无头截图);真机正常播放动画。
export const STATIC =
  typeof window !== "undefined" &&
  new URLSearchParams(window.location.search).get("static") === "1";
