import supertest from 'supertest';
import {server} from '../app.js';
import {expect} from 'chai';
import sinon from 'sinon';
import ProfileController from "../controllers/profile.js";
import { connect, closeDatabase } from './helperdb.js';

describe('Profile routes tests', () => {
    let request;
    before(async () => {
        // Connect to in-memory database
        await connect();

        // Initialize supertest
        request = supertest(server);
    });

    after(async () => {
        await closeDatabase();

        await server.close();
    });

    // Profile routes testing
    describe('Successfully create a new profile', () => {
        let createdProfile;
        it('Create a new profile', async () => {
            const reqBody =  {
                name: "John Doe",
                description: "Testing profile",
                mbti: "INTJ",
            }
            const res = await request.post('/profile').send(reqBody);
            expect(res.status).eq(201);
            createdProfile = res.body;
            assertEqualProfile(createdProfile, reqBody)
        });

        it('Successfully retrieves an existing profile', async () => {
            const res = await request.get(`/profile/${createdProfile._id}`);
            expect(res.status).eq(200);
        });

        it('Render the correct template', async () => {
            const req = { params: { id: createdProfile._id }};
            const res = { render: sinon.spy() }; //track calls res.render

            const controller = new ProfileController();
            await controller.getProfile(req, res);
            expect(res.render.calledWith('profile_template')).eq(true);
        });

        it('Render the correct profile data', async () => {
            const req = { params: { id: createdProfile._id }};
            const res = {
                render() {
                    if (arguments[0] === 'profile_template') {
                        // arguments[1] contains the object { profile: ...}
                        console.log(arguments)
                        const returnedProfile = arguments[1].profile;
                        expect(returnedProfile).to.deep.equal(createdProfile);
                    }
                }
            };

            const controller = new ProfileController();
            await controller.getProfile(req, res);
        });
    });


    // Profile routes testing
    describe('Failed to create a new profile', () => {
        it('Create profile without required property', async () => {
            const res = await request.post('/profile').send({
                // name: "John Doe", without required property 'name'
                description: "Testing profile",
                mbti: "INTJ",
            });
            expect(res.status).eq(400);

            let errorText = JSON.parse(res.error.text);
            const resErrMessage = errorText.errors[0].message;
            expect(resErrMessage).eq('must have required property \'name\'');

            const resErrCode = errorText.errors[0].errorCode;
            expect(resErrCode).eq('required.openapi.validation');
        });

        it('Create profile with invalid mbti value', async () => {
            const res = await request.post('/profile').send({
                name: "John Doe",
                description: "Testing profile",
                mbti: "INVALID",
            });
            expect(res.status).eq(400);

            let errorText = JSON.parse(res.error.text);
            const resErrCode = errorText.errors[0].errorCode;
            expect(resErrCode).eq('enum.openapi.validation');
        });

    });
});

function assertEqualProfile(source, target){
    expect(source.name).eq(target.name);
    expect(source.description).eq(target.description);
    expect(source.mbti).eq(target.mbti);
    expect(source.enneagram).eq(target.enneagram);
    expect(source.variant).eq(target.variant);
    expect(source.tritype).eq(target.tritype);
    expect(source.socionics).eq(target.socionics);
    expect(source.sloan).eq(target.sloan);
    expect(source.psyche).eq(target.psyche);
    expect(source.image).eq(target.image);
}