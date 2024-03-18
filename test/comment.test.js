import supertest from 'supertest';
import {server} from '../app.js';
import {expect} from 'chai';
import {closeDatabase, connect} from "./helperdb.js";

describe('Comment routes Tests', () => {
    let request;
    let response;
    let createdUser; // 'People who do log in and comment'
    let createdProfile; // 'Target comment'
    before(async () => {
        // Connect to in-memory database
        await connect();

        // Initialize supertest
        request = supertest(server);

        // Initialize create data profiles
        // 1st data
        const reqCreateUser =  {
            name: "John Doe",
            description: "Testing profile",
            mbti: "INTJ",
        }
        response = await request.post('/profile').send(reqCreateUser);
        expect(response.status).eq(201);
        createdUser = response.body;

        // 2nd data
        const reqCreateProfile =  {
            name: "John Ell",
            description: "Testing profile",
            mbti: "INTJ",
        }
        response = await request.post('/profile').send(reqCreateProfile);
        expect(response.status).eq(201);
        createdProfile = response.body;
    });

    after(async () => {
        await closeDatabase();

        await server.close();
    });


    describe('Successfully create, fetch and like a comment', () => {
        let firstComment;
        let secondComment;
        it('Create a new comments', async () => {
            expect(createdUser).not.empty
            expect(createdProfile).not.empty

            const firstReq = {
                text: 'First comment!',
                userId: createdUser._id,
                profileId: createdProfile._id,
                votes: {
                    mbti: 'INTJ',
                    enneagram: '6w5',
                    zodiac: 'Aries'
                }
            }
            const firstRes = await request.post('/comment').send(firstReq);
            expect(firstRes.status).eq(201);
            firstComment = firstRes.body;
            assertEqualComment(firstComment, firstReq)

            const secondReq = {
                text: 'Second comment!',
                userId: createdUser._id,
                profileId: createdProfile._id,
                votes: {
                    mbti: 'INTJ',
                    enneagram: '6w5',
                    zodiac: 'Aries'
                }
            }
            const secondRes = await request.post('/comment').send(secondReq);
            expect(secondRes.status).eq(201);
            secondComment = secondRes.body;
            assertEqualComment(secondComment, secondReq)
        });

        it('Fetch comments linked to a specific profile', async () => {
            const res = await request.get(`/comment?profileId=${createdProfile._id}`);
            expect(res.status).eq(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).eq(2);
        });

        it('Put like a comment', async () => {
            const reqBody = { commentId: firstComment._id, userId: createdUser._id };
            const res = await request.put('/comment/like').send(reqBody);
            expect(res.status).eq(200);
            expect(res.body['likes'].includes(createdUser._id)).to.true;
        });

        it('Fetch comments in order of likes', async () => {
            const res = await request.get(`/comment?profileId=${createdProfile._id}&sortBy=likes`);
            expect(res.status).eq(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).eq(2);
            expect(res.body[0].text).eq(firstComment.text);
            expect(res.body[1].text).eq(secondComment.text);
        });

        it('Fetch comments in order of recency', async () => {
            const res = await request.get(`/comment?profileId=${createdProfile._id}&sortBy=createdAt`);
            expect(res.status).eq(200);
            expect(res.body).to.be.an('array');
            expect(res.body.length).eq(2);
            expect(new Date(res.body[0].createdAt)).is.greaterThanOrEqual(new Date(res.body[1].createdAt));
        });

        it('Unlike a comment', async () => {
            const reqBody = { commentId: firstComment._id, userId: createdUser._id };
            const res = await request.put('/comment/like').send(reqBody);
            expect(res.status).eq(200);
            expect(res.body['likes'].includes(createdUser._id)).to.false;
        });
    });

    describe('Failed to create a new comment', () => {
        it('Create comment without text property', async () => {
            const reqBody = { profileId: createdProfile._id };
            const res = await request.post('/comment').send(reqBody);
            expect(res.status).eq(400);

            let errorText = JSON.parse(res.error.text);
            const resErrMessage = errorText.errors[0].message;
            expect(resErrMessage).eq('must have required property \'text\'');

            const resErrCode = errorText.errors[0].errorCode;
            expect(resErrCode).eq('required.openapi.validation');
        });

        it('Create comment with profileId that not exist in DB', async () => {
            const reqBody = { text: 'Hello World!', profileId: generateDummyId(), userId: generateDummyId() };
            const res = await request.post('/comment').send(reqBody);
            expect(res.status).eq(400);

            let errorText = JSON.parse(res.error.text);
            expect(errorText.message).eq("Invalid ProfileId or UserId.")
        });
        
        it('Create comment with non-existing parent comment Id', async () => {
            const reqBody = {
                text: 'Reply comment!',
                userId: createdUser._id,
                profileId: createdProfile._id,
                parent: generateDummyId(),
                votes: {
                    mbti: 'INTJ',
                    enneagram: '6w5',
                    zodiac: 'Aries'
                }
            };
            const res = await request.post('/comment').send(reqBody);
            expect(res.status).eq(400);

            let errorText = JSON.parse(res.error.text);
            expect(errorText.message).eq("You can't reply comment that doesn't exist.")
        });
    });
});

function generateDummyId() {
    return 'xxxxxxxxxxxxxxxxxxxxxxxx'.replace(/[x]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

function assertEqualComment(source, target){
    expect(source.text).eq(target.text)
    if (target.likes) {
        expect(source.likes).eq(target.likes)
    }
    expect(source.userId).eq(target.userId);
    expect(source.profileId).eq(target.profileId);
    if (target.parent)(
        expect(source.parent).eq(target.parent)
    )
    expect(source.votes).to.deep.equal(target.votes);
}