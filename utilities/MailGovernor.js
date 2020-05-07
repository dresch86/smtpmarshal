export default class MailGovernor {
    dbResource = null;

    constructor(dbResource) {
        this.dbResource = dbResource;
    }

    async increment(fromEmail) {
        // TODO Implement throttle counter incrementing on successful send
    }

    async throttled(fromEmail) {
        try {
            let aEmailParts = fromEmail.split('@');
            // TODO Add throttle functionality to avoid loosing emails due to heavy sending...
            return false;
        } catch (err) {
            throw(err);
        }
    }
}