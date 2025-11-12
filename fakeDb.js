const db = {
    users: [
        {
            id: 0,
            role: "admin",
            username: "virgil",
            password: "password",
        },
        {
            id: 1,
            role: "student",
            username: "a",
            password: "a",
        }
    ],
    students: [
        {
            id: 1,
            firstName: 'John',
            lastName: 'Appleseed',
            age: 21,
        },
        {
            id: 2,
            firstName: 'Mary',
            lastName: 'The lamb',
            age: 21,
        },
    ],
}

const findEntity = (entity, id) => {
    return db[entity].find(entity => entity.id === id);
};

const findUserByUsername = (username) => {
    return db.users.find(user => user.username === username);
}

const createEntity = (entity, data) => {
    data.id = db[entity].length + 1;
    db[entity].push({...data});
    console.log('db: createEntity', db);
    return data;
};

const updateEntity = (entity, id, data) => {
    const entityIndex = db[entity].findIndex(entity => entity.id === id);
    console.log('db: updateEntity: found Index', entityIndex);
    if (entityIndex === -1) return;

    db[entity][entityIndex] = { ...db[entity][entityIndex], ...data };
    console.log('db: updateEntity', db);
};

const deleteEntity = (entity, id) => {
    db[entity] = db[entity].filter(entity => entity.id !== id);
    console.log('db: deleteEntity', db);
};

const listEntities = (entity) => {
    console.log('db: listEntities', db);
    return db[entity];
};

module.exports = { db, findEntity, findUserByUsername, updateEntity, createEntity, deleteEntity, listEntities };