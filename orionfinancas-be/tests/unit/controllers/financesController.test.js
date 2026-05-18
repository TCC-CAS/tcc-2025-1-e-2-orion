const financesController = require('../../../controllers/financesController');
const { getDB } = require('../../../config/database');
const { ObjectId } = require('mongodb');

jest.mock('../../../config/database');

describe('Finances Controller Unit Tests', () => {
    let req, res, mockDb, mockFinancesCollection;

    beforeEach(() => {
        mockFinancesCollection = {
            find: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            toArray: jest.fn(),
            insertOne: jest.fn(),
            findOne: jest.fn(),
            deleteOne: jest.fn(),
        };
        mockDb = {
            collection: jest.fn().mockReturnValue(mockFinancesCollection),
        };
        getDB.mockReturnValue(mockDb);

        req = { user: { id: new ObjectId().toString() }, body: {}, params: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        jest.clearAllMocks();
    });

    describe('getDashboard', () => {
        it('should return 200 and dashboard data with default insight', async () => {
            const mockTransactions = [{ _id: new ObjectId(), amount: 1000, type: 'ganho', date: '01/05/2026', category: 'Salary' }];
            mockFinancesCollection.toArray.mockResolvedValue(mockTransactions);
            mockDb.collection.mockImplementation((name) => {
                if (name === 'transactions') return mockFinancesCollection;
                if (name === 'user_financial_goals') return { find: jest.fn().mockReturnThis(), toArray: jest.fn().mockResolvedValue([{ goalName: 'Goal' }]) };
                return {};
            });

            await financesController.getDashboard(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                status: 'OK',
                data: expect.objectContaining({ insight: expect.stringContaining('Mantenha o foco') })
            }));
        });

        it('should show alert insight if expenses > income', async () => {
            const mockTransactions = [
                { _id: new ObjectId(), amount: 100, type: 'ganho', date: '01/05/2026', category: 'Salary' },
                { _id: new ObjectId(), amount: 500, type: 'gasto', date: '02/05/2026', category: 'Rent' }
            ];
            mockFinancesCollection.toArray.mockResolvedValue(mockTransactions);
            mockDb.collection.mockImplementation((name) => {
                if (name === 'transactions') return mockFinancesCollection;
                if (name === 'user_financial_goals') return { find: jest.fn().mockReturnThis(), toArray: jest.fn().mockResolvedValue([]) };
                return {};
            });

            await financesController.getDashboard(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ insight: expect.stringContaining('superaram suas entradas') })
            }));
        });

        it('should show "no goals" insight if goals array is empty', async () => {
            mockFinancesCollection.toArray.mockResolvedValue([]);
            mockDb.collection.mockImplementation((name) => {
                if (name === 'transactions') return mockFinancesCollection;
                if (name === 'user_financial_goals') return { find: jest.fn().mockReturnThis(), toArray: jest.fn().mockResolvedValue([]) };
                return {};
            });

            await financesController.getDashboard(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ insight: expect.stringContaining('não tem metas ativas') })
            }));
        });

        it('should show "goal reached" insight if reserva goal is attained', async () => {
            mockFinancesCollection.toArray.mockResolvedValue([]);
            mockDb.collection.mockImplementation((name) => {
                if (name === 'transactions') return mockFinancesCollection;
                if (name === 'user_financial_goals') return { 
                    find: jest.fn().mockReturnThis(), 
                    toArray: jest.fn().mockResolvedValue([{ goalName: 'Reserva de Emergência', targetAmount: 1000, currentAmount: 1200 }]) 
                };
                return {};
            });

            await financesController.getDashboard(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ insight: expect.stringContaining('alcançada') })
            }));
        });

        it('should show "pending goal" insight if reserva goal is not attained', async () => {
            mockFinancesCollection.toArray.mockResolvedValue([]);
            mockDb.collection.mockImplementation((name) => {
                if (name === 'transactions') return mockFinancesCollection;
                if (name === 'user_financial_goals') return { 
                    find: jest.fn().mockReturnThis(), 
                    toArray: jest.fn().mockResolvedValue([{ goalName: 'Reserva de Emergência', targetAmount: 1000, currentAmount: 500 }]) 
                };
                return {};
            });

            await financesController.getDashboard(req, res);

            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
                data: expect.objectContaining({ insight: expect.stringContaining('Faltam R$ 500,00') })
            }));
        });
    });

    describe('createTransaction', () => {
        it('should return 400 if fields are missing', async () => {
            req.body = { title: 'Test' }; // missing amount
            await financesController.createTransaction(req, res);
            expect(res.status).toHaveBeenCalledWith(400);
        });

        it('should add recurring transaction successfully', async () => {
            req.body = { title: 'Rent', amount: 1200, type: 'gasto', category: 'Fixa', isRecurring: true };
            mockFinancesCollection.insertOne.mockResolvedValue({ insertedId: new ObjectId() });

            await financesController.createTransaction(req, res);

            expect(mockFinancesCollection.insertOne).toHaveBeenCalledWith(expect.objectContaining({
                isRecurring: true,
                title: 'Rent'
            }));
        });
    });
});
