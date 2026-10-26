import { calcUnitPrice } from './pricing';

describe('calcUnitPrice', () => {
  it('size S không topping giữ nguyên giá gốc', () => {
    expect(calcUnitPrice(45000, 'S', [])).toBe(45000);
  });

  it('cộng phụ thu của size và từng topping', () => {
    expect(calcUnitPrice(45000, 'L', ['Kem'])).toBe(60000);
    expect(calcUnitPrice(45000, 'M', ['Kem', 'Trân châu'])).toBe(60000);
  });
});
