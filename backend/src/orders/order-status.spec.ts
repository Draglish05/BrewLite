import { BadRequestException } from '@nestjs/common';
import { assertTransition, canTransition, OrderStatus, TRANSITIONS } from './order-status';

// Test (a): chặn chuyển trạng thái sai theo state machine
describe('Order state machine', () => {
  // 9 chuyển tiếp hợp lệ theo sơ đồ mục 9.1 của đề
  const VALID: string[][] = [
    ['PENDING', 'PAID'],
    ['PAID', 'PREPARING'],
    ['PREPARING', 'READY'],
    ['READY', 'COMPLETED'],
    ['PENDING', 'PAYMENT_FAILED'],
    ['PAYMENT_FAILED', 'PENDING'],
    ['PENDING', 'CANCELLED'],
    ['PAID', 'CANCELLED'],
    ['PAYMENT_FAILED', 'CANCELLED'],
  ];

  const ALL = Object.values(OrderStatus);

  it('có đúng 9 chuyển tiếp hợp lệ', () => {
    let count = 0;
    for (const from of ALL) {
      count = count + TRANSITIONS[from].length;
    }
    expect(count).toBe(9);
  });

  it('cho phép cả 9 chuyển tiếp hợp lệ', () => {
    for (const pair of VALID) {
      expect(canTransition(pair[0], pair[1])).toBe(true);
      expect(() => assertTransition(pair[0], pair[1])).not.toThrow();
    }
  });

  it('chặn MỌI chuyển tiếp khác (ném lỗi)', () => {
    for (const from of ALL) {
      for (const to of ALL) {
        let isValid = false;
        for (const pair of VALID) {
          if (pair[0] === from && pair[1] === to) {
            isValid = true;
          }
        }
        if (!isValid) {
          expect(() => assertTransition(from, to)).toThrow(BadRequestException);
        }
      }
    }
  });

  it('một số ca sai tiêu biểu bị chặn', () => {
    expect(() => assertTransition('PENDING', 'COMPLETED')).toThrow();
    expect(() => assertTransition('PREPARING', 'CANCELLED')).toThrow(); // đang pha không được hủy
    expect(() => assertTransition('READY', 'CANCELLED')).toThrow();
    expect(() => assertTransition('COMPLETED', 'PENDING')).toThrow(); // trạng thái kết thúc
    expect(() => assertTransition('CANCELLED', 'PAID')).toThrow();
  });
});
