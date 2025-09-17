// src/math.test.ts

import { accessRightForPath } from "./filter-utilis";

describe('accessRightForPath with empty access rights', () => {
  test('empty access rights 1', () => {
    expect(accessRightForPath("name", [])).toBe(false);
  });

  test('empty access rights 2', () => {
    expect(accessRightForPath("address.zip", [])).toBe(false);
  });

})


describe('accessRightForPath with one path', () => {

  test('not matching access rights 1', () => {
    expect(accessRightForPath("address.zip", ["adress"])).toBe(false);
  });

  test('not matching access rights 2', () => {
    expect(accessRightForPath("address.zip", ["name"])).toBe(false);
  });

  test('not matching access rights 3', () => {
    expect(accessRightForPath("address.zip", ["*"])).toBe(false);
  });

  test('not matching access rights 4', () => {
    expect(accessRightForPath("address.zip", ["address.zip.n"])).toBe(false);
  });


  test('matching access rights 1', () => {
    expect(accessRightForPath("address.zip", ["**"])).toBe(true);
  });

  test('matching access rights 2', () => {
    expect(accessRightForPath("address.zip", ["address.*"])).toBe(true);
  });

  test('matching access rights 3', () => {
    expect(accessRightForPath("address.zip", ["address.**"])).toBe(true);
  });

  test('matching access rights 4', () => {
    expect(accessRightForPath("address.zip", ["address.zip"])).toBe(true);
  });
});

describe('accessRightForPath with multiple paths', () => {
  test('not matching access rights', () => {
    expect(accessRightForPath("address.zip", ["address", "name"])).toBe(false);
  });

  test('matching access rights 1', () => {
    expect(accessRightForPath("address.zip", ["**", "address.*", "name",])).toBe(true);
  });

  test('matching access rights 2', () => {
    expect(accessRightForPath("address.zip", ["name", "address.*"])).toBe(true);
  });

});