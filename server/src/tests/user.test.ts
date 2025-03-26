import request from 'supertest';
import app from "../config/express";
import router, {
  users,
  userProperties,
  noSortParamError,
  invalidSortError,
  invalidOrderError,
  sortNumber,
  sortString,
} from '../routes/user.route';

app.use(router);

describe('getUsers', () => {
  // No sorting
  it('should return users without sorting if sort parameter and order parameter are missing', async () => {
    const response = await request(app).get('/');
    expect(response.status).toEqual(200);
    expect(response.body).toEqual(users);
  });



  // 400 errors
  it('should return a 400 error if sort parameter is missing, but order parameter is valid', async () => {
    const response = await request(app).get('/?order=asc');
    expect(response.status).toEqual(400);
    expect(response.body.error).toEqual(noSortParamError);
  });

  it('should return a 400 error if sort parameter is invalid regardless of order parameter', async () => {
    const responseNoOrder = await request(app).get('/?sort=invalid');
    const responseValidOrder = await request(app).get('/?sort=invalid&order=asc');
    const responseInvalidOrder = await request(app).get('/?sort=invalid&order=invalid');

    expect(responseNoOrder.status).toEqual(400);
    expect(responseNoOrder.body.error).toEqual(invalidSortError);
    expect(responseValidOrder.status).toEqual(400);
    expect(responseValidOrder.body.error).toEqual(invalidSortError);
    expect(responseInvalidOrder.status).toEqual(400);
    expect(responseInvalidOrder.body.error).toEqual(invalidSortError);
  });

  it('should return a 400 error if sort parameter is valid, but order parameter is invalid', async () => {
    const response = await request(app).get('/?sort=name&order=invalid');
    expect(response.status).toEqual(400);
    expect(response.body.error).toEqual(invalidOrderError);
  });



  // Sorting by property
  userProperties.forEach((property) => {
    const sortedUsers = [...users];
    let comparator = sortNumber;
    if (typeof users[0][property] === 'string') {
        comparator = sortString;
    };

    it(`should return users sorted in descending order by ${property} if order parameter is 'desc'`, async () => {
      const response = await request(app).get(`/?sort=${property}&order=desc`);
      const sortedUsers = [...users];

      sortedUsers.sort((a, b) => {
        return comparator(a, b, property, 'desc');
      });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual(sortedUsers);
    });


    it(`should return users sorted in ascending order by ${property} if order parameter is 'asc' or is missing`, async () => {
      const responseAsc = await request(app).get(`/?sort=${property}&order=asc`);
      const responseMissing = await request(app).get(`/?sort=${property}`);

      sortedUsers.sort((a, b) => {
        return comparator(a, b, property, 'asc');
      });

      expect(responseAsc.status).toEqual(200);
      expect(responseAsc.body).toEqual(sortedUsers);
      expect(responseMissing.status).toEqual(200);
      expect(responseMissing.body).toEqual(sortedUsers);
    });
  });
});
