import test from 'node:test';
import assert from 'node:assert/strict';
import { checkGroupSize, checkAge, checkDeadline, summarize, MAX_GROUP, DEADLINE_HOURS } from '../src/utils/rules.js';

test('Rule 1 (Capacity) - Valid ordinary group size is accepted', () => {
  const result = checkGroupSize(4, 12);
  assert.equal(result.ok, true);
  assert.equal(result.message, '');
});

test('Rule 1 (Capacity) - Group size exactly at boundary limit (10 travellers) is accepted', () => {
  const result = checkGroupSize(10, 15);
  assert.equal(result.ok, true);
  assert.equal(result.max, MAX_GROUP);
});

test('Rule 1 (Capacity) - Group size breaking upper limit (11 travellers) is rejected', () => {
  const result = checkGroupSize(11, 20);
  assert.equal(result.ok, false);
  assert.match(result.message, /Maximum booking capacity is 10/);
});

test('Rule 1 (Capacity) - Exceeding available remaining seats is rejected', () => {
  const result = checkGroupSize(6, 4);
  assert.equal(result.ok, false);
  assert.match(result.message, /Only 4 seats remaining/);
});

test('Rule 1 (Capacity) - Zero or negative input is rejected', () => {
  const resultZero = checkGroupSize(0, 10);
  assert.equal(resultZero.ok, false);
  const resultNeg = checkGroupSize(-2, 10);
  assert.equal(resultNeg.ok, false);
});

test('Rule 2 (Eligibility) - Valid age meeting or exceeding minimum is accepted', () => {
  const alpineTrip = { title: 'Fairy Meadows Trek', minAge: 16 };
  assert.equal(checkAge(16, alpineTrip).ok, true);
  assert.equal(checkAge(24, alpineTrip).ok, true);
});

test('Rule 2 (Eligibility) - Age below trip requirement is rejected with specific message', () => {
  const alpineTrip = { title: 'Fairy Meadows Trek', minAge: 16 };
  const result = checkAge(14, alpineTrip);
  assert.equal(result.ok, false);
  assert.match(result.message, /at least 16 years old/);
});

test('Rule 3 (Fulfilment) - Departure outside 72h cutoff is accepted', () => {
  const now = '2026-11-13T09:00';
  const dep = '2026-11-20T06:00'; // ~165 hours away
  const result = checkDeadline(dep, now);
  assert.equal(result.ok, true);
});

test('Rule 3 (Fulfilment) - Departure within 72h cutoff is rejected', () => {
  const now = '2026-11-13T09:00';
  const dep = '2026-11-15T09:00'; // exactly 48 hours away (< 72h)
  const result = checkDeadline(dep, now);
  assert.equal(result.ok, false);
  assert.match(result.message, /Booking closed/);
});

test('Summary Calculation - 10% group discount applied for 5 or more travellers', () => {
  const singleLine = [{ travellers: 4, trip: { price: 5000 } }];
  const singleSum = summarize(singleLine);
  assert.equal(singleSum.discount, 0);
  assert.equal(singleSum.total, 20000);
  assert.equal(singleSum.deposit, 6000);

  const groupLine = [{ travellers: 5, trip: { price: 5000 } }];
  const groupSum = summarize(groupLine);
  assert.equal(groupSum.subtotal, 25000);
  assert.equal(groupSum.discount, 2500); // 10% off
  assert.equal(groupSum.total, 22500);
  assert.equal(groupSum.deposit, 6750); // 30% of 22500
});
