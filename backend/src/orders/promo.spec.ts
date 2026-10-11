import { calcDiscount } from './promo';

describe('Mã giảm giá', () => {
  it('không nhập mã: giảm 0đ', () => {
    expect(calcDiscount('', 100000)).toBe(0);
  });

  it('BREW10: giảm 10%', () => {
    expect(calcDiscount('BREW10', 135000)).toBe(13500);
  });

  it('gõ chữ thường, thừa dấu cách vẫn nhận', () => {
    expect(calcDiscount(' brew10 ', 100000)).toBe(10000);
  });

  it('GIAM20K: giảm 20.000đ cho đơn từ 100.000đ', () => {
    expect(calcDiscount('GIAM20K', 100000)).toBe(20000);
  });

  it('GIAM20K: đơn dưới 100.000đ bị từ chối', () => {
    expect(() => calcDiscount('GIAM20K', 99000)).toThrow('chỉ áp dụng cho đơn từ');
  });

  it('mã không có trong bảng: bị từ chối', () => {
    expect(() => calcDiscount('ABCXYZ', 100000)).toThrow('Mã giảm giá không hợp lệ');
  });
});
