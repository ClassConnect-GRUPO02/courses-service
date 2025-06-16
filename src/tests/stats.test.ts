import request from 'supertest';
import app from '../app';
import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import { userTypes } from '../lib/user_types';

describe('Integration Tests for Stats API', () => {

    const SECRET_KEY = Buffer.from(process.env.SECRET_KEY as string, "hex");

    const tokenProfessor = jwt.sign(
        {
            id: 'u1',
            userType: userTypes.INSTRUCTOR,
        },
        SECRET_KEY!,
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
        });
    });

    describe('GET /courses/:courseId/stats', () => {
        it('should retrieve historical course stats', async () => {
            const courseId = 'c1';
            const response = await request(app)
                .get(`/courses/${courseId}/stats`)
                .set('Authorization', `Bearer ${tokenProfessor}`)
                .send();
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.data).toBeDefined();
        });
    });

    describe('GET /courses/:courseId/stats/students', () => {
        it('should retrieve the stats of all students in the given course', async () => {
            const courseId = 'c1';
            const response = await request(app)
                .get(`/courses/${courseId}/stats/students`)
                .set('Authorization', `Bearer ${tokenProfessor}`)
                .send();
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.data).toBeDefined();
        });
    });

    describe('GET /courses/:courseId/stats/students/:studentId', () => {
        it('should retrieve the stats of the given student in the given course', async () => {
            const courseId = 'c1';
            const studentId = 'u3';
            const response = await request(app)
                .get(`/courses/${courseId}/stats/students/${studentId}`)
                .set('Authorization', `Bearer ${tokenProfessor}`)
                .send();
            expect(response.status).toBe(StatusCodes.OK);
            expect(response.body.data).toBeDefined();
        });
    });
})
