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
export const sortNumber = (user1: User, user2: User, property: keyof User, order: string) => {
  if (order === 'desc') {
    return user2[property] - user1[property];
  };
  return user1[property] - user2[property];
};

export const sortString = (user1: User, user2: User, property: keyof User, order: string) => {
  if (order === 'desc') {
    return user2[property].localeCompare(user1[property]);
  };
  return user1[property].localeCompare(user2[property]);
};



// Sorting users
export const getUsers = (property: string, order: string) => {
  const sortedUsers: User[] = [...users];

  // Validations
  if(property && !order) {
    order = 'asc';
  };

  if (!property && order) {
    throw new Error(noSortParamError);
  }

  if (!property) {
    return sortedUsers;
  }

  if (property && !userProperties.includes(property)) {
    throw new Error(invalidSortError);
  }

  if (order !== '' && order !== "asc" && order !== "desc") {
    throw new Error(invalidOrderError);
  }

  if (property) {
    // Determine which sorting algorithm to use before actually sorting
    let comparator = sortNumber;
    if (typeof users[0][property] === 'string') {
      comparator = sortString;
    };

    sortedUsers.sort((a,b) => {
      return comparator(a, b, property, order);
    });

    return sortedUsers;
  };
};



// Get request
router.get('/', (req: Request, res: Response) => {
  try {
    const property = req.query.sort as string;
    let order = req.query.order as string;
    const usersList = getUsers(property, order);
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