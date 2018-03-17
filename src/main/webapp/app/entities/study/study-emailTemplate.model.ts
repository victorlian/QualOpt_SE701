export class EmailTemplate {
    constructor(
        public id?: number,
        public name?: string,
        public emailSubject?: string,
        public emailBody?: any,
    ) {
    }
}