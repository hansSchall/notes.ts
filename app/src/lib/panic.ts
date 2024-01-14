export class Panic {
    constructor(readonly message: string) {
        console.error(message);
        alert(message);
    }
}
