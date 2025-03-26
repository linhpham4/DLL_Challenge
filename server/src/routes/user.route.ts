import express, { Request, Response } from 'express';

const router = express.Router();

interface User {
  [key: string]: any;
}

export const users: User[] = [{
  name: 'Jorn',
  id: 0,
}, {
  name: 'Markus',
  id: 3,
}, {
  name: 'Andrew',
  id: 2,
}, {
  name: 'Ori',
  id: 4,
}, {
  name: 'Mike',
  id: 1,
}];

export const userProperties = Object.keys(users[0]);



// Error messages
export const noSortParamError = "Cannot have order parameter without sort parameter.";
export const invalidSortError = `Sort parameter must be one of these user properties: ${userProperties}`;
export const invalidOrderError = "Order parameter must be either asc or desc.";



// Sorting algorithms based on data type
export const sortNumber = (user1: User, user2: User, sort: keyof User, order: string) => {
  if (order === 'desc') {
    return user2[sort] - user1[sort];
  };
  return user1[sort] - user2[sort];
};

export const sortString = (user1: User, user2: User, sort: keyof User, order: string) => {
  if (order === 'desc') {
    return user2[sort].localeCompare(user1[sort]);
  };
  return user1[sort].localeCompare(user2[sort]);
};



// Sorting users
export const getUsers = (sort: string, order: string) => {
  const sortedUsers: User[] = [...users];

  // Validations
  if(sort && !order) {
    order = 'asc';
  };

  if (!sort && order) {
    throw new Error(noSortParamError);
  }

  if (!sort) {
    return sortedUsers;
  }

  if (sort && !userProperties.includes(sort)) {
    throw new Error(invalidSortError);
  }

  if (order !== '' && order !== "asc" && order !== "desc") {
    throw new Error(invalidOrderError);
  }

  if (sort) {
    // Determine which sorting algorithm to use before actually sorting
    let comparator = sortNumber;
    if (typeof users[0][sort] === 'string') {
      comparator = sortString;
    };

    sortedUsers.sort((a,b) => {
      return comparator(a, b, sort, order);
    });

    return sortedUsers;
  };
};



// Get request
router.get('/', (req: Request, res: Response) => {
  try {
    const sort = req.query.sort as string;
    let order = req.query.order as string;
    const usersList = getUsers(sort, order);
    res.status(200).send(usersList);

  } catch (error) {
    if (error.message === noSortParamError) {
      res.status(400).json({error: error.message});
    } else if (error.message === invalidSortError) {
      res.status(400).json({error: error.message});
    } else if (error.message === invalidOrderError) {
      res.status(400).json({error: error.message});
    } else {
      res.status(500).json({error: error.message});
    };
  };
});

export default router;