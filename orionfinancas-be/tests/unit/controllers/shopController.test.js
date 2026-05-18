const shopController = require('../../../controllers/shopController');
const { getDB } = require('../../../config/database');
const { ObjectId } = require('mongodb');

jest.mock('../../../config/database');

describe('Shop Controller Unit Tests', () => {
    let req, res, mockDb, mockShopCollection, mockUsersCollection;

    beforeEach(() => {
        mockShopCollection = {
            find: jest.fn().mockReturnThis(),
            toArray: jest.fn(),
            findOne: jest.fn(),
        };
        mockUsersCollection = {
            findOne: jest.fn(),
            updateOne: jest.fn(),
            findOneAndUpdate: jest.fn(),
        };
        mockDb = {
            collection: jest.fn((name) => {
                if (name === 'shop_items') return mockShopCollection;
                if (name === 'users') return mockUsersCollection;
                return {};
            }),
        };
        getDB.mockReturnValue(mockDb);

        req = { user: { id: new ObjectId().toString() }, body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe('getItems', () => {
        it('should return available shop items', async () => {
            const itemId = new ObjectId();
            const mockItems = [{ _id: itemId, name: 'Avatar 1', price: 100, isActive: true }];
            mockShopCollection.toArray.mockResolvedValue(mockItems);
            // Mock user with empty inventory
            mockUsersCollection.findOne.mockResolvedValue({ inventory: [] });

            await shopController.getItems(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'OK',
                data: mockItems
            }));
        });
    });

    describe('buyItem', () => {
        it('should return 400 if user has insufficient funds', async () => {
            const itemId = new ObjectId();
            req.body = { itemId: itemId.toString() };
            mockShopCollection.findOne.mockResolvedValue({ _id: itemId, price: 1000, isActive: true });
            // findOneAndUpdate retorna null (filtro não bateu — saldo insuficiente)
            mockUsersCollection.findOneAndUpdate.mockResolvedValue(null);
            // findOne (fallback diagnóstico) retorna user sem o item e com saldo baixo
            mockUsersCollection.findOne.mockResolvedValue({ wallet: { coins: 100 }, inventory: [] });

            await shopController.buyItem(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Moedas insuficientes'
            }));
        });
    });
});
