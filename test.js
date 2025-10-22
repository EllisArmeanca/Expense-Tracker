// function myFunc(argA, argB) {
//     console.log(argA, argB);

//     return argA + argB;
// }

// const myFunc = (argA, argB) => {
//     return argA + argB;
// }

// const myFunc = (argA, argB) => argA + argB;

// const myFunc = function(argA, argB) {
//     return argA + argB;
// }

// const sayHello = name => "Hello, " + name;

// console.log('result:', sayHello('World'));



// const animal = {
//     name: 'Margotini',
//     type: 'cat',
//     color: 'black',
//     makeSound: function() {
//         console.log(this);
//         console.log(this.name + " said: ");
//         console.log("MIAU!");
//     }
// }

// animal.makeSound()

// function Animal(name) {
//     this.name = name;
// }

// Animal.prototype.makeSound = function() {
//     console.log(this.name + ' said: ');
//     console.log('Miauuuu');
// }

// const cat = new Animal('Margotini');
// console.log(cat.name);
// cat.makeSound();

// class Animal {
//     constructor(name) {
//         this.name = name;
//     }

//     makeSound() {
//         console.log(this.name + ' said: ');
//         console.log('Miauuuu');
//     }
// }

// const cat = new Animal('Margotini');
// console.log(cat.name);
// cat.makeSound();



// const a = myArray.forEach((item, index) => {
    //     console.log(index);
    //     return item;
    // });
    
    // const b = myArray.map((item, index) => {
        //     console.log(index);
        //     return 'altceva';
        // });
        
// const myArray = ['bar', 'ista', 'fee', 'fi', 'fo', 'fum'];



// const filteredArray = myArray.filter((item, index) => index % 2 === 0);

// const onlyFs = myArray.filter((item) => item[0] === 'f');

// const searchQuery = 'ista';

// const searchResult = myArray.find((item) => {
//     return item[0] === 'f';
// });

// const foo = ['bar', 'ista'];
// const fee = ['fi', 'fo', 'fu'];

// const [firstElement, secondElement, thirdElement] = fee;


// console.log(firstElement, secondElement, thirdElement);

// const fooFee = [
//     ...foo,
//     'altceva',
//     ...fee,
// ];

const employeeContactInfo = {
    phoneNumber: "123456",
}

const employee = {
	firstName: "Fee",
	lastName: "Fo",
    contactInfo: employeeContactInfo,
};


const employeeWithAge = {
    ...employee,
    contactInfo: {
        ...employee.contactInfo,
    },
    age: 21,
}

employeeContactInfo.email = 'test@test.com';
employee.status = 'married';

console.log(employeeWithAge);
console.log(employee);
// const { firstName, ...otherProperties } = employeeWithAge;

// console.log(firstName, otherProperties);
// console.log(employeeWithAge);
