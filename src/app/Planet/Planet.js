class Planet {
    constructor() {
    }

    async init(planetData) {
        this.name = planetData.name;
        this.gravity = planetData.gravity;
    }

    getName() {
        return this.name;
    }

    getGravity() {
        return this.gravity;
    }
}

module.exports = Planet;