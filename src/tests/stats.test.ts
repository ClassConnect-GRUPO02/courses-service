import request from 'supertest';
import app from '../app';
import { StatusCodes } from 'http-status-codes';
import { mockTaskRequestData } from './mocks/mock.task';
import { mockTaskSubmissionData } from './mocks/mock.task_sub';
import jwt from 'jsonwebtoken';
import { userTypes } from '../lib/user_types';

describe('Integration Tests for Stats API', () => {

    const SECRET_KEY = Buffer.from(process.env.SECRET_KEY as string, "hex");

    const tokenProfessor = jwt.sign(
        {
            id: 'u1',
            userType: userTypes.INSTRUCTOR,
        }, // payload
        SECRET_KEY!, // clave secreta
        { algorithm: 'HS256' }
    );

    describe('GET /stats/:instructorId', () => {
        it('should retrieve global stats from the instructor courses', async () => {
            const instructorId = 'u1';
            const response = await request(app)
                .get(`/stats/${instructorId}`)
                .set('Authorization', `Bearer ${tokenProfessor}`)
                .send();
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.data).toBeDefined();
            // expect(Array.isArray(response.body.data)).toBe(true);
        });
    });
})
