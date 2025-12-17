const StudentType = require("../types/StudentType");
const CreateStudentInputType = require("../inputTypes/CreateStudentInputType");
const db = require("../../models");
const { pubsub, STUDENT_CREATED } = require('../../websocket/pubsub');

const createStudentMutation = {
            type: StudentType,
            args: {
                input: {
                    type: CreateStudentInputType,
                }
            },
            resolve: async (_, args) => {
                const { firstName, lastName, age } = args.input;
                
                const student = await db.Student.create({
                    firstName,
                    lastName,
                    age,
                });

                pubsub.publish(STUDENT_CREATED, { student });

                return student;

            }
        }

module.exports = createStudentMutation;