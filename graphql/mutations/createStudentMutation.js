const StudentType = require("../types/StudentType");
const CreateStudentInputType = require("../inputTypes/CreateStudentInputType");
const { createEntity } = require('../../fakeDb');

const createStudentMutation = {
            type: StudentType,
            args: {
                input: {
                    type: CreateStudentInputType,
                }
            },
            resolve: (_, args) => {
                console.log(args);
                const { firstName, lastName, age } = args.input;
                
                return createEntity('students', {
                    firstName,
                    lastName,
                    age,
                });
            }
        }

module.exports = createStudentMutation;