declare module 'intersects' {
  /**
   * Simple 2-box intersection
   * @param x1 Top-left x coordinate of first box
   * @param y1 Top-left y coordinate of first box
   * @param w1 Width of first box
   * @param h1 Height of first box
   * @param x2 Top-left x coordinate of second box
   * @param y2 Top-left y coordinate of second box
   * @param w2 Width of second box
   * @param h2 Height of second box
   */
  function boxBox(
    x1: number,
    y1: number,
    w1: number,
    h1: number,
    x2: number,
    y2: number,
    w2: number,
    h2: number): boolean;
}