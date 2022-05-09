export default class BankCardNumberGenerator {
    private static _cardNumber: string;
    private static _expirationDate: string;
    private static _cvv: string;

    public static generate(): string[] {
        this._cardNumber = this._generateCardNumber();
        this._expirationDate = this._generateExpirationDate();
        this._cvv = this._generateCvv();
        return [`${this._cardNumber}`, `${this._expirationDate}`, `${this._cvv}`];
    }

    private static _generateCardNumber(): string {
        const cardNumber = [];
        for (let i = 0; i < 16; i++) {
            cardNumber.push(Math.floor(Math.random() * 10));
        }
        return cardNumber.join('');
    }

    private static _generateExpirationDate(): string {
        const month = Math.floor(Math.random() * 12) + 1;
        const year = Math.floor(Math.random() * 10) + 2024;
        return `${month}/${year}`;
    }

    private static _generateCvv(): string {
        const cvv = [];
        for (let i = 0; i < 3; i++) {
            cvv.push(Math.floor(Math.random() * 10));
        }
        return cvv.join('');
    }
}
